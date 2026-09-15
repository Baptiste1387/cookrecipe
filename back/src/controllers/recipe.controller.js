const recipeService = require('../services/recipe.service');

class RecipeController {
  getOne(req, res) {
    try {
      const recipe = recipeService.getRecipeById(req.params.id);
      if (!recipe) return res.status(404).json({ error: "Recette non trouvée." });
      return res.json(recipe);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  getAll(req, res) {
    try {
      const recipes = recipeService.getAllRecipes();
      return res.json(recipes);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  create(req, res) {
    try {
      const id = recipeService.createRecipe(req.body);
      return res.status(201).json({ id, message: "Recette créée avec succès." });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  update(req, res) {
    try {
      const success = recipeService.updateRecipe(req.params.id, req.body);
      if (!success) return res.status(404).json({ error: "Recette non trouvée." });
      return res.json({ message: "Recette mise à jour avec succès." });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  delete(req, res) {
    try {
      const success = recipeService.deleteRecipe(req.params.id);
      if (!success) return res.status(404).json({ error: "Recette non trouvée." });
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new RecipeController();