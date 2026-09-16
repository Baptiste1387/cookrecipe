import { store } from '../store.js';
import { parseQuantityInput } from '../utils.js';

export class RecipeFormModal extends HTMLElement {
    open(recipeId = null) {
        this.recipeId = recipeId;
        this.recipe = recipeId ? store.getRecipeById(recipeId) : null;
        this.render();
        this.querySelector('#modal').classList.remove('hidden');
        setTimeout(() => this.querySelector('#modal').classList.remove('opacity-0'), 10);
    }

    close() {
        const m = this.querySelector('#modal');
        if (m) {
            m.classList.add('opacity-0');
            setTimeout(() => m.classList.add('hidden'), 200);
        }
    }

    render() {
        const r = this.recipe || {};
        this.innerHTML = `
            <div id="modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center hidden opacity-0 transition-opacity duration-200">
                <div class="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl m-4">
                    <div class="p-6 border-b flex justify-between items-center">
                        <h2 class="text-xl font-bold">${this.recipeId ? 'Modifier la recette' : 'Nouvelle recette'}</h2>
                        <button id="closeBtn" class="text-slate-400 hover:text-slate-600"><i class="ph-bold ph-x text-lg"></i></button>
                    </div>

                    <form id="recipeForm" class="p-6 overflow-y-auto space-y-6 flex-1">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="col-span-2"><label class="text-xs font-semibold">Titre *</label><input type="text" id="title" required value="${r.title || ''}" class="w-full border p-2 rounded text-sm"></div>
                            <div class="col-span-2"><label class="text-xs font-semibold">Description</label><textarea id="description" rows="2" class="w-full border p-2 rounded text-sm">${r.description || ''}</textarea></div>
                            <div><label class="text-xs font-semibold">Catégorie</label><input type="text" id="category" value="${r.category || ''}" class="w-full border p-2 rounded text-sm"></div>
                            <div><label class="text-xs font-semibold">Tags</label><input type="text" id="tags" value="${(r.tags || []).join(', ')}" placeholder="ex. rapide, végétarien" class="w-full border p-2 rounded text-sm"></div>
                            <div>
                                <label class="text-xs font-semibold">Image URL</label>
                                <input type="text" id="image_path" value="${r.image_path || ''}" class="w-full border p-2 rounded text-sm">
                                <label class="text-xs font-semibold mt-2 block">Ou téléverser</label>
                                <input type="file" id="image_file" accept="image/*" class="mt-1 text-sm" />
                                <div id="imagePreview" class="mt-2"></div>
                            </div>
                            <div><label class="text-xs font-semibold">Portions de base *</label><input type="number" id="default_servings" required value="${r.default_servings || 4}" min="1" class="w-full border p-2 rounded text-sm"></div>
                            <div><label class="text-xs font-semibold">Préparation (min)</label><input type="number" id="prep_time_min" min="0" value="${r.prep_time_min ?? ''}" class="w-full border p-2 rounded text-sm"></div>
                            <div><label class="text-xs font-semibold">Cuisson (min)</label><input type="number" id="cook_time_min" min="0" value="${r.cook_time_min ?? ''}" class="w-full border p-2 rounded text-sm"></div>
                            <div><label class="text-xs font-semibold">Repos (min)</label><input type="number" id="rest_time_min" min="0" value="${r.rest_time_min ?? ''}" class="w-full border p-2 rounded text-sm"></div>
                        </div>

                        <div>
                            <div class="flex justify-between mb-2">
                                <label class="text-xs font-bold text-slate-400 uppercase">Ingrédients</label>
                                <button type="button" id="addIngBtn" class="text-xs bg-slate-100 px-2 py-1 rounded">+ Ajouter</button>
                            </div>
                            <div id="ingRows" class="space-y-2"></div>
                        </div>

                        <div>
                            <div class="flex justify-between mb-2">
                                <label class="text-xs font-bold text-slate-400 uppercase">Préparation</label>
                                <button type="button" id="addStepBtn" class="text-xs bg-slate-100 px-2 py-1 rounded">+ Ajouter</button>
                            </div>
                            <div id="stepRows" class="space-y-2"></div>
                        </div>
                    </form>

                    <div class="p-4 border-t flex justify-end gap-2 bg-slate-50 flex-shrink-0">
                        <button id="cancelBtn" class="px-4 py-2 text-sm">Annuler</button>
                        <button id="saveBtn" class="px-5 py-2 text-sm bg-emerald-600 text-white rounded">Enregistrer</button>
                    </div>
                </div>
            </div>
        `;

        this.querySelector('#closeBtn').addEventListener('click', () => this.close());
        this.querySelector('#cancelBtn').addEventListener('click', () => this.close());
        this.querySelector('#addIngBtn').addEventListener('click', () => this.addIngredientRow());
        this.querySelector('#addStepBtn').addEventListener('click', () => this.addStepRow());
        this.querySelector('#saveBtn').addEventListener('click', () => this.save());

        const fileInput = this.querySelector('#image_file');
        if (fileInput) fileInput.addEventListener('change', (e) => this.onFileSelected(e));

        const ingContainer = this.querySelector('#ingRows');
        if (r.ingredients && r.ingredients.length) {
            r.ingredients.forEach(i => this.addIngredientRow(i));
        } else {
            this.addIngredientRow();
        }

        if (r.steps && r.steps.length) {
            r.steps.forEach(step => this.addStepRow(step));
        } else {
            this.addStepRow();
        }
    }

    addIngredientRow(data = {}) {
        const row = document.createElement('div');
        row.className = 'ing-row grid grid-cols-12 gap-2 items-center';
        row.innerHTML = `
            <input type="text" placeholder="Section" value="${data.section_name || ''}" class="ing-sec col-span-3 border p-1 text-xs rounded">
            <input type="text" placeholder="Qté" value="${data.quantity || ''}" class="ing-qty col-span-2 border p-1 text-xs rounded">
            <input type="text" placeholder="Unité" value="${data.unit || ''}" class="ing-unit col-span-2 border p-1 text-xs rounded">
            <input type="text" placeholder="Nom *" required value="${data.name || ''}" class="ing-name col-span-4 border p-1 text-xs rounded">
            <button type="button" class="del-btn text-rose-500 col-span-1">x</button>
        `;
        row.querySelector('.del-btn').addEventListener('click', () => row.remove());
        this.querySelector('#ingRows').appendChild(row);
    }

    addStepRow(data = {}) {
        const row = document.createElement('div');
        row.className = 'step-row grid grid-cols-12 gap-2 items-center';
        row.innerHTML = `
            <input type="text" placeholder="Section" value="${data.section_name || ''}" class="step-sec col-span-3 border p-1 text-xs rounded">
            <textarea placeholder="Instruction" rows="2" class="step-instruction col-span-8 border p-1 text-xs rounded">${data.instruction || ''}</textarea>
            <button type="button" class="del-btn text-rose-500 col-span-1">x</button>
        `;
        row.querySelector('.del-btn').addEventListener('click', () => row.remove());
        this.querySelector('#stepRows').appendChild(row);
    }

    onFileSelected(e) {
        const file = e.target.files[0];
        const preview = this.querySelector('#imagePreview');
        if (!file || !preview) return;
        const url = URL.createObjectURL(file);
        preview.innerHTML = `<img src="${url}" class="w-32 h-20 object-cover rounded-md">`;
    }

    save() {
        const form = this.querySelector('#recipeForm');
        if (!form.checkValidity()) return form.reportValidity();

        const ingRows = this.querySelectorAll('.ing-row');
        const ingredients = [];
        ingRows.forEach((row, idx) => {
            const name = row.querySelector('.ing-name').value.trim();
            if (name) {
                ingredients.push({
                    section_name: row.querySelector('.ing-sec').value.trim() || 'Ingrédients', // RG-105
                    quantity: parseQuantityInput(row.querySelector('.ing-qty').value),          // RG-104
                    unit: row.querySelector('.ing-unit').value.trim() || null,
                    name: name,
                    display_order: idx + 1                                                     // RG-106
                });
            }
        });

        const steps = [...this.querySelectorAll('.step-row')].map((row, idx) => ({
            section_name: row.querySelector('.step-sec').value.trim() || null,
            step_number: idx + 1,
            instruction: row.querySelector('.step-instruction').value.trim()
        })).filter(step => step.instruction);

        const payload = {
            title: this.querySelector('#title').value.trim(),
            description: this.querySelector('#description').value.trim() || null,
            category: this.querySelector('#category').value.trim() || null,
            tags: this.querySelector('#tags').value.split(',').map(tag => tag.trim()).filter(Boolean),
            image_path: this.querySelector('#image_path').value.trim() || null,
            default_servings: parseInt(this.querySelector('#default_servings').value, 10),
            prep_time_min: this.numberOrNull('#prep_time_min'),
            cook_time_min: this.numberOrNull('#cook_time_min'),
            rest_time_min: this.numberOrNull('#rest_time_min'),
            ingredients: ingredients,
            steps: steps
        };

        const fileInput = this.querySelector('#image_file');
        const file = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;

        const doSave = async () => {
            try {
                if (file) {
                    const imagePath = await store.uploadImage(file);
                    payload.image_path = imagePath;
                }
                const savedId = await store.saveRecipe(payload, this.recipeId);
                this.close();
                this.dispatchEvent(new CustomEvent('recipe-saved', { detail: { recipeId: savedId }, bubbles: true }));
            } catch (err) {
                alert('Erreur en sauvegarde');
            }
        };

        doSave();
    }

    numberOrNull(selector) {
        const value = this.querySelector(selector).value;
        return value === '' ? null : Number(value);
    }
}
customElements.define('recipe-form-modal', RecipeFormModal);