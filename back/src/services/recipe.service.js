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
    // RG-101 & RG-102
    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
      throw new Error("Le champ 'title' est obligatoire.");
    }

    const servings = parseInt(data.default_servings || 4, 10);
    if (isNaN(servings) || servings < 1) {
      throw new Error("'default_servings' doit être un entier >= 1.");
    }

    // RG-103, RG-104, RG-105, RG-106
    const ingredients = (data.ingredients || []).map((ing, idx) => ({
      section_name: ing.section_name && ing.section_name.trim() ? ing.section_name.trim() : 'Ingrédients',
      quantity: parseQuantity(ing.quantity),
      unit: ing.unit ? ing.unit.trim() : null,
      name: ing.name.trim(),
      display_order: ing.display_order || (idx + 1)
    }));

    const steps = (data.steps || []).map((step, idx) => ({
      section_name: step.section_name ? step.section_name.trim() : null,
      step_number: step.step_number || (idx + 1),
      instruction: step.instruction.trim()
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
}

module.exports = new RecipeService();