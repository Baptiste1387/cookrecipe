const recipeRepository = require('../repositories/recipe.repository');
const { parseQuantity } = require('../utils/fraction');

class RecipeService {
  getRecipeById(id) {
    return recipeRepository.findById(id);
  }

  createRecipe(payload) {
    const formattedData = this._formatAndValidate(payload);
    return recipeRepository.create(formattedData);
  }

  updateRecipe(id, payload) {
    const existing = recipeRepository.findById(id);
    if (!existing) return false;

    const formattedData = this._formatAndValidate(payload);
    recipeRepository.update(id, formattedData);
    return true;
  }

  deleteRecipe(id) {
    return recipeRepository.delete(id);
  }

  getAllRecipes() {
    return recipeRepository.findAll();
  }

  _formatAndValidate(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Le payload doit être un objet JSON.');
    }

    // RG-101 & RG-102
    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
      throw new Error("Le champ 'title' est obligatoire.");
    }

    const servings = data.default_servings === undefined || data.default_servings === null || data.default_servings === ''
      ? 4
      : Number(data.default_servings);
    if (!Number.isInteger(servings) || servings < 1) {
      throw new Error("'default_servings' doit être un entier >= 1.");
    }

    // RG-103, RG-104, RG-105, RG-106
    const ingredients = (data.ingredients || []).map((ing, idx) => ({
      section_name: ing.section_name && ing.section_name.trim() ? ing.section_name.trim() : 'Ingrédients',
      quantity: parseQuantity(ing.quantity),
      unit: ing.unit ? ing.unit.trim() : null,
      name: this._requiredText(ing.name, `ingredients[${idx}].name`),
      display_order: this._sequentialNumber(ing.display_order, idx + 1, `ingredients[${idx}].display_order`)
    }));

    const steps = (data.steps || []).map((step, idx) => ({
      section_name: step.section_name ? step.section_name.trim() : null,
      step_number: this._sequentialNumber(step.step_number, idx + 1, `steps[${idx}].step_number`),
      instruction: this._requiredText(step.instruction, `steps[${idx}].instruction`)
    }));

    return {
      title: data.title.trim(),
      description: data.description ? data.description.trim() : null,
      image_path: data.image_path || null,
      default_servings: servings,
      prep_time_min: data.prep_time_min || null,
      cook_time_min: data.cook_time_min || null,
      rest_time_min: data.rest_time_min || null,
      category: data.category ? data.category.trim() : null,
      tags: (data.tags || []).filter(t => t && t.trim()).map(t => t.trim()),
      ingredients,
      steps
    };
  }

  _requiredText(value, field) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`'${field}' est obligatoire.`);
    }
    return value.trim();
  }

  _sequentialNumber(value, expected, field) {
    if (value === undefined || value === null || value === '') return expected;
    if (Number(value) !== expected) {
      throw new Error(`'${field}' doit être égal à ${expected}.`);
    }
    return expected;
  }
}

module.exports = new RecipeService();