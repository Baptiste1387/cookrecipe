import { store } from '../store.js';
import { calculateQuantity, resolveImageUrl } from '../utils.js';

export class RecipeDetail extends HTMLElement {
    set recipeId(id) {
        this._recipeId = id;
        const cached = store.getRecipeById(id);
        if (cached && cached.ingredients && cached.steps) {
            this.recipe = cached;
            this.currentServings = this.recipe.default_servings;
            this.render();
        } else {
            // fetch full recipe from backend
            store.fetchRecipeById(id).then(recipe => {
                if (!recipe) return;
                this.recipe = recipe;
                this.currentServings = this.recipe.default_servings;
                this.render();
            });
        }
    }

    render() {
        const r = this.recipe;
        const imageUrl = resolveImageUrl(r.image_path);
        this.innerHTML = `
            <article class="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div class="relative h-64 md:h-80 w-full bg-slate-100">
                    ${imageUrl ? `<img src="${imageUrl}" class="w-full h-full object-cover">` : ''}
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div class="absolute bottom-6 left-6 right-6 text-white">
                        <span class="px-3 py-1 bg-emerald-500/90 text-white text-xs font-semibold rounded-full uppercase mb-2 inline-block">${r.category || 'Général'}</span>
                        <h1 class="text-3xl md:text-4xl font-extrabold">${r.title}</h1>
                    </div>
                </div>

                <div class="p-6 md:p-8 border-b border-slate-100">
                    <p class="text-slate-600 mb-6">${r.description || ''}</p>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl">
                        <div><span class="text-xs text-slate-500 block">Préparation</span><span class="font-semibold">${r.prep_time_min || 0} min</span></div>
                        <div><span class="text-xs text-slate-500 block">Cuisson</span><span class="font-semibold">${r.cook_time_min || 0} min</span></div>
                        <div><span class="text-xs text-slate-500 block">Repos</span><span class="font-semibold">${r.rest_time_min || 0} min</span></div>
                        <div><span class="text-xs text-slate-500 block">Portion de base</span><span class="font-semibold">${r.default_servings} pers.</span></div>
                    </div>
                </div>

                <div class="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <!-- Dynamic Servings Calculator -->
                    <section class="lg:col-span-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                        <h2 class="text-lg font-bold mb-4 flex items-center gap-2"><i class="ph-bold ph-basket text-emerald-600"></i> Ingrédients</h2>
                        
                        <div class="bg-white p-3.5 rounded-xl border border-slate-200 mb-6">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs font-bold text-slate-500 uppercase">Convives</span>
                                <button id="resetServings" class="hidden text-xs text-emerald-600 font-semibold">Réinitialiser</button>
                            </div>
                            <div class="flex justify-between items-center">
                                <button id="decServings" class="w-10 h-10 bg-slate-100 font-bold rounded-lg">-</button>
                                <span id="servingsNum" class="text-2xl font-black">${this.currentServings}</span>
                                <button id="incServings" class="w-10 h-10 bg-slate-100 font-bold rounded-lg">+</button>
                            </div>
                        </div>

                        <div id="ingredientsContainer"></div>
                    </section>

                    <section class="lg:col-span-7">
                        <h2 class="text-lg font-bold mb-6 flex items-center gap-2"><i class="ph-bold ph-list-numbers text-emerald-600"></i> Préparation</h2>
                        <div id="stepsContainer" class="space-y-4"></div>
                    </section>
                </div>
            </article>
        `;

        this.bindEvents();
        this.renderIngredients();
        this.renderSteps();
    }

    bindEvents() {
        this.querySelector('#decServings').addEventListener('click', () => {
            if (this.currentServings > 1) { this.currentServings--; this.updateServingsUI(); }
        });
        this.querySelector('#incServings').addEventListener('click', () => {
            if (this.currentServings < 99) { this.currentServings++; this.updateServingsUI(); }
        });
        this.querySelector('#resetServings').addEventListener('click', () => {
            this.currentServings = this.recipe.default_servings;
            this.updateServingsUI();
        });
    }

    updateServingsUI() {
        this.querySelector('#servingsNum').textContent = this.currentServings;
        const resetBtn = this.querySelector('#resetServings');
        if (this.currentServings !== this.recipe.default_servings) resetBtn.classList.remove('hidden');
        else resetBtn.classList.add('hidden');
        this.renderIngredients();
    }

    renderIngredients() {
        const container = this.querySelector('#ingredientsContainer');
        container.innerHTML = '';
        const sections = {};
        this.recipe.ingredients.forEach(ing => {
            const sec = ing.section_name || 'Ingrédients';
            if (!sections[sec]) sections[sec] = [];
            sections[sec].push(ing);
        });

        Object.keys(sections).forEach(title => {
            let html = `<h3 class="text-xs font-bold text-slate-400 uppercase mb-2 border-b pb-1">${title}</h3><ul class="space-y-2 mb-4">`;
            sections[title].forEach(ing => {
                const qty = calculateQuantity(ing.quantity, this.currentServings, this.recipe.default_servings);
                html += `
                    <li class="flex justify-between text-sm py-1 border-b border-slate-100">
                        <span>${ing.name}</span>
                        <span class="font-bold">${qty ? qty : ''} ${ing.unit || ''}</span>
                    </li>`;
            });
            html += '</ul>';
            container.innerHTML += html;
        });
    }

    renderSteps() {
        const container = this.querySelector('#stepsContainer');
        const sorted = [...this.recipe.steps].sort((a,b) => a.step_number - b.step_number);
        container.innerHTML = sorted.map(st => `
            <div class="flex gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center flex-shrink-0">${st.step_number}</div>
                <div><p class="text-slate-700 text-sm">${st.instruction}</p></div>
            </div>
        `).join('');
    }
}
customElements.define('recipe-detail', RecipeDetail);