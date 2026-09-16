import { store } from '../store.js';

export class RecipeList extends HTMLElement {
    constructor() {
        super();
        this.currentPage = 1;
        this.pageSize = 9;
    }

    connectedCallback() {
        this.render();
        store.addEventListener('recipes-changed', () => {
            this.updateCategories();
            this.updateGrid();
        });
        
        // Attendre que le DOM soit complètement inséré avant d'injecter la grille
        requestAnimationFrame(() => {
            this.updateCategories();
            this.updateGrid();
        });
    }

    render() {
        this.innerHTML = `
            <section class="space-y-6">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div>
                        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Mes Recettes</h1>
                        <p class="text-sm text-slate-500">Gérez et consultez toutes vos recettes en local.</p>
                    </div>
                    <button id="addBtn" class="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm transition-colors text-sm">
                        <i class="ph-bold ph-plus"></i> Nouvelle recette
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="md:col-span-2 relative">
                        <i class="ph-bold ph-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
                        <input type="text" id="searchInput" placeholder="Rechercher une recette par titre ou tag..." class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all shadow-sm">
                    </div>
                    <div>
                        <select id="categoryFilter" class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all shadow-sm">
                            <option value="">Toutes les catégories</option>
                        </select>
                    </div>
                </div>

                <div id="grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"></div>
                <nav id="pagination" class="flex justify-center gap-2" aria-label="Pagination"></nav>
                <div id="emptyState" class="hidden text-center py-16 bg-white rounded-2xl border border-slate-200/80">
                    <i class="ph-bold ph-bowl-food text-5xl text-slate-300 mb-3"></i>
                    <h3 class="text-lg font-bold text-slate-700">Aucune recette trouvée</h3>
                </div>
            </section>
        `;

        const addBtn = this.querySelector('#addBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('open-modal', { detail: { recipeId: null }, bubbles: true }));
            });
        }

        const searchInput = this.querySelector('#searchInput');
        if (searchInput) searchInput.addEventListener('input', () => {
            this.currentPage = 1;
            this.updateGrid();
        });

        const categoryFilter = this.querySelector('#categoryFilter');
        if (categoryFilter) categoryFilter.addEventListener('change', () => {
            this.currentPage = 1;
            this.updateGrid();
        });
    }

    updateCategories() {
        const select = this.querySelector('#categoryFilter');
        if (!select) return;
        const categories = store.getCategories();
        select.innerHTML = '<option value="">Toutes les catégories</option>' + categories.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    updateGrid() {
        const grid = this.querySelector('#grid');
        const emptyState = this.querySelector('#emptyState');
        const pagination = this.querySelector('#pagination');
        if (!grid || !emptyState) return;

        const searchInput = this.querySelector('#searchInput');
        const categoryFilter = this.querySelector('#categoryFilter');

        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const category = categoryFilter ? categoryFilter.value : '';

        const filtered = store.getRecipes().filter(r => {
            const matchesSearch = r.title.toLowerCase().includes(query) || (r.tags && r.tags.some(t => t.toLowerCase().includes(query)));
            const matchesCat = category === '' || r.category === category;
            return matchesSearch && matchesCat;
        });
        console.log('recipe-list.updateGrid: total', store.getRecipes().length, 'filtered', filtered.length);

        const pageCount = Math.ceil(filtered.length / this.pageSize);
        this.currentPage = Math.min(Math.max(this.currentPage, 1), Math.max(pageCount, 1));
        const start = (this.currentPage - 1) * this.pageSize;
        const visibleRecipes = filtered.slice(start, start + this.pageSize);

        grid.innerHTML = '';
        if (filtered.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            visibleRecipes.forEach(recipe => {
                const card = document.createElement('recipe-card');
                grid.appendChild(card);
                // On passe la recette APRÈS l'avoir ajouté au DOM pour déclencher le render
                card.recipe = recipe;
            });
        }

        if (pagination) {
            pagination.innerHTML = '';
            for (let page = 1; page <= pageCount; page++) {
                const button = document.createElement('button');
                button.type = 'button';
                button.textContent = page;
                button.className = `px-3 py-1 rounded border text-sm ${page === this.currentPage ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'}`;
                button.setAttribute('aria-label', `Page ${page}`);
                button.setAttribute('aria-current', page === this.currentPage ? 'page' : 'false');
                button.addEventListener('click', () => {
                    this.currentPage = page;
                    this.updateGrid();
                });
                pagination.appendChild(button);
            }
        }
    }
}
if (!customElements.get('recipe-list')) {
    customElements.define('recipe-list', RecipeList);
}