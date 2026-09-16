import './components/navbar.js';
import './components/recipe-card.js';
import './components/recipe-list.js';
import './components/recipe-detail.js';
import './components/recipe-form-modal.js';
import { store } from './store.js';

class App {
    init() {
        console.log('App.init starting');
        this.navbar = document.querySelector('app-navbar');
        this.listEl = document.querySelector('recipe-list');
        this.detailEl = document.querySelector('recipe-detail');
        this.modalEl = document.querySelector('recipe-form-modal');

        this.bindEvents();
        // load recipes from backend then show list
        store.loadRecipes().then(() => this.navigate('list'));
    }

    bindEvents() {
        document.addEventListener('navigate', (e) => this.navigate(e.detail.view));
        document.addEventListener('select-recipe', (e) => this.navigate('detail', e.detail.recipeId));
        document.addEventListener('open-modal', (e) => this.modalEl.open(e.detail.recipeId));
        document.addEventListener('recipe-saved', (e) => this.navigate('detail', e.detail.recipeId));
    }

    navigate(view, recipeId = null) {
        if (view === 'list') {
            this.listEl.classList.remove('hidden');
            this.detailEl.classList.add('hidden');
            this.navbar.setActions(`
                <button id="quickAdd" class="px-3 py-2 bg-emerald-50 text-emerald-700 font-medium rounded-lg text-sm border border-emerald-200">+ Créer</button>
            `, {
                quickAdd: () => this.modalEl.open()
            });
        } else if (view === 'detail') {
            this.listEl.classList.add('hidden');
            this.detailEl.classList.remove('hidden');
            this.detailEl.recipeId = recipeId;

            this.navbar.setActions(`
                <button id="backBtn" class="px-3 py-2 text-slate-600 text-sm">← Retour</button>
                <button id="editBtn" class="px-3 py-2 bg-emerald-50 text-emerald-700 text-sm rounded border border-emerald-200">Modifier</button>
                <button id="deleteBtn" class="px-3 py-2 text-rose-600 text-sm">Supprimer</button>
            `, {
                backBtn: () => this.navigate('list'),
                editBtn: () => this.modalEl.open(recipeId),
                deleteBtn: () => {
                    if (confirm("Supprimer cette recette ?")) {
                        store.deleteRecipe(recipeId).then(() => this.navigate('list')).catch(err => alert('Erreur suppression'));
                    }
                }
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new App().init());

if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}