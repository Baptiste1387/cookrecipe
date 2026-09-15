export class RecipeCard extends HTMLElement {
    constructor() {
        super();
        this._recipe = null;
    }

    set recipe(data) {
        this._recipe = data;
        this.render();
    }

    get recipe() {
        return this._recipe;
    }

    render() {
        if (!this._recipe) return;
        const data = this._recipe;
        
        const totalTime = (data.prep_time_min || 0) + (data.cook_time_min || 0) + (data.rest_time_min || 0);
        const tagsHtml = (data.tags || []).slice(0, 3).map(t => 
            `<span class="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-medium rounded-md">${t}</span>`
        ).join('');

        this.innerHTML = `
            <div class="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col h-full">
                <div class="relative h-48 bg-slate-100 overflow-hidden">
                    ${data.image_path ? 
                        `<img src="${data.image_path}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="${data.title}">` : 
                        `<div class="w-full h-full flex flex-col items-center justify-center text-slate-300"><i class="ph-bold ph-image text-4xl"></i></div>`
                    }
                    ${data.category ? `<span class="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold rounded-full uppercase tracking-wider">${data.category}</span>` : ''}
                </div>
                <div class="p-5 flex flex-col flex-1 justify-between space-y-4">
                    <div>
                        <h2 class="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition-colors line-clamp-1">${data.title}</h2>
                        <p class="text-xs text-slate-500 mt-1 line-clamp-2">${data.description || 'Aucune description disponible.'}</p>
                    </div>
                    <div class="space-y-3 pt-2 border-t border-slate-100">
                        <div class="flex items-center justify-between text-xs text-slate-500 font-medium">
                            <span class="flex items-center gap-1"><i class="ph-bold ph-clock text-emerald-600"></i> ${totalTime > 0 ? `${totalTime} min` : 'N/A'}</span>
                            <span class="flex items-center gap-1"><i class="ph-bold ph-users text-emerald-600"></i> ${data.default_servings} pers.</span>
                        </div>
                        <div class="flex flex-wrap gap-1">${tagsHtml}</div>
                    </div>
                </div>
            </div>
        `;

        this.onclick = () => {
            this.dispatchEvent(new CustomEvent('select-recipe', { detail: { recipeId: data.id }, bubbles: true }));
        };
    }
}
if (!customElements.get('recipe-card')) {
    customElements.define('recipe-card', RecipeCard);
}