const db = require('../../config/database');

class RecipeRepository {
  findById(id) {
    const recipe = db.prepare(`SELECT * FROM recipes WHERE id = ?`).get(id);
    if (!recipe) return null;

    const tags = db.prepare(`SELECT tag FROM recipe_tags WHERE recipe_id = ?`).all(id).map(t => t.tag);
    const ingredients = db.prepare(`SELECT section_name, quantity, unit, name, display_order FROM ingredients WHERE recipe_id = ? ORDER BY display_order ASC`).all(id);
    const steps = db.prepare(`SELECT section_name, step_number, instruction FROM steps WHERE recipe_id = ? ORDER BY step_number ASC`).all(id);

    return { ...recipe, tags, ingredients, steps };
  }

  create(data) {
    const transaction = db.transaction(() => {
      const insertRecipe = db.prepare(`
        INSERT INTO recipes (title, description, image_path, default_servings, prep_time_min, cook_time_min, rest_time_min, category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = insertRecipe.run(
        data.title, data.description, data.image_path,
        data.default_servings, data.prep_time_min, data.cook_time_min,
        data.rest_time_min, data.category
      );
      const recipeId = info.lastInsertRowid;

      const insertTag = db.prepare(`INSERT INTO recipe_tags (recipe_id, tag) VALUES (?, ?)`);
      data.tags.forEach(t => insertTag.run(recipeId, t));

      const insertIng = db.prepare(`
        INSERT INTO ingredients (recipe_id, section_name, quantity, unit, name, display_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      data.ingredients.forEach(ing => {
        insertIng.run(recipeId, ing.section_name, ing.quantity, ing.unit, ing.name, ing.display_order);
      });

      const insertStep = db.prepare(`
        INSERT INTO steps (recipe_id, section_name, step_number, instruction)
        VALUES (?, ?, ?, ?)
      `);
      data.steps.forEach(step => {
        insertStep.run(recipeId, step.section_name, step.step_number, step.instruction);
      });

      return recipeId;
    });

    return transaction();
  }

  update(id, data) {
    const transaction = db.transaction(() => {
      db.prepare(`
        UPDATE recipes 
        SET title = ?, description = ?, image_path = ?, default_servings = ?,
            prep_time_min = ?, cook_time_min = ?, rest_time_min = ?, category = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        data.title, data.description, data.image_path,
        data.default_servings, data.prep_time_min, data.cook_time_min,
        data.rest_time_min, data.category, id
      );

      db.prepare(`DELETE FROM recipe_tags WHERE recipe_id = ?`).run(id);
      db.prepare(`DELETE FROM ingredients WHERE recipe_id = ?`).run(id);
      db.prepare(`DELETE FROM steps WHERE recipe_id = ?`).run(id);

      const insertTag = db.prepare(`INSERT INTO recipe_tags (recipe_id, tag) VALUES (?, ?)`);
      data.tags.forEach(t => insertTag.run(id, t));

      const insertIng = db.prepare(`INSERT INTO ingredients (recipe_id, section_name, quantity, unit, name, display_order) VALUES (?, ?, ?, ?, ?, ?)`);
      data.ingredients.forEach(ing => insertIng.run(id, ing.section_name, ing.quantity, ing.unit, ing.name, ing.display_order));

      const insertStep = db.prepare(`INSERT INTO steps (recipe_id, section_name, step_number, instruction) VALUES (?, ?, ?, ?)`);
      data.steps.forEach(step => insertStep.run(id, step.section_name, step.step_number, step.instruction));
    });

    transaction();
  }

  delete(id) {
    const info = db.prepare(`DELETE FROM recipes WHERE id = ?`).run(id);
    return info.changes > 0;
  }

  findAll() {
    const rows = db.prepare(`
      SELECT id, title, description, image_path, default_servings, category, created_at, updated_at
      FROM recipes
      ORDER BY title COLLATE NOCASE ASC
    `).all();

    return rows.map(r => {
      const tags = db.prepare(`SELECT tag FROM recipe_tags WHERE recipe_id = ?`).all(r.id).map(t => t.tag);
      return { ...r, tags };
    });
  }
}

module.exports = new RecipeRepository();