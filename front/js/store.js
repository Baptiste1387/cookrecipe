import { parseQuantityInput } from './utils.js';
import { API_BASE_URL } from './config.js';

class Store extends EventTarget {
    constructor() {
        super();
        // initial fallback data while backend loads
        this.recipes = [];
        this.activeView = 'list';
        this.selectedRecipeId = null;
    }

    // Load recipes list from backend
    async loadRecipes() {
        try {
            const res = await fetch(`${API_BASE_URL}/api/recipes`);
            if (!res.ok) throw new Error('Erreur chargement recettes');
            const data = await res.json();
            console.log('store.loadRecipes: received', data.length, 'recipes');
            console.log('titles:', data.map(r => r.title));
            // backend returns minimal recipes (without ingredients); keep as-is
            this.recipes = data;
            this.notify('recipes-changed');
            return this.recipes;
        } catch (err) {
            console.warn('loadRecipes failed', err);
            return this.recipes;
        }
    }

    // Fetch single full recipe (with ingredients & steps)
    async fetchRecipeById(id) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/recipes/${id}`);
            if (!res.ok) return null;
            const recipe = await res.json();
            // update or insert
            const idx = this.recipes.findIndex(r => r.id === recipe.id);
            if (idx === -1) this.recipes.unshift(recipe);
            else this.recipes[idx] = recipe;
            this.notify('recipes-changed');
            return recipe;
        } catch (err) {
            console.warn('fetchRecipeById failed', err);
            return null;
        }
    }

    // Upload an image file to the backend and return image_path
    async uploadImage(file) {
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await fetch(`${API_BASE_URL}/api/uploads`, { method: 'POST', body: fd });
            if (!res.ok) throw new Error('Échec upload image');
            const body = await res.json();
            return body.image_path;
        } catch (err) {
            console.error('uploadImage error', err);
            throw err;
        }
    }

    getRecipes() {
        return this.recipes;
    }

    getRecipeById(id) {
        return this.recipes.find(r => r.id === parseInt(id, 10));
    }

    getCategories() {
        return [...new Set(this.recipes.map(r => r.category).filter(Boolean))];
    }

    async saveRecipe(payload, id = null) {
        try {
            if (id) {
                const res = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error('Échec mise à jour');
                const recipe = await this.fetchRecipeById(id);
                return recipe ? recipe.id : parseInt(id, 10);
            } else {
                const res = await fetch(`${API_BASE_URL}/api/recipes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error('Échec création');
                const body = await res.json();
                const newId = body.id;
                // optimistic: fetch full recipe
                await this.fetchRecipeById(newId);
                return newId;
            }
        } catch (err) {
            console.error('saveRecipe error', err);
            throw err;
        }
    }

    async deleteRecipe(id) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/recipes/${id}`, { method: 'DELETE' });
            if (!res.ok && res.status !== 204) throw new Error('Échec suppression');
            this.recipes = this.recipes.filter(r => r.id !== parseInt(id, 10));
            this.notify('recipes-changed');
            return true;
        } catch (err) {
            console.error('deleteRecipe error', err);
            throw err;
        }
    }

    notify(eventName) {
        this.dispatchEvent(new CustomEvent(eventName));
    }
}

export const store = new Store();