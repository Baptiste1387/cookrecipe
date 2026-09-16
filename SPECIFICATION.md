Cookmate — Spécification mise à jour
=================================

Ce document rassemble la spécification actuelle dérivée du code (backend + frontend) et du schéma de base de données. Il est destiné à servir de source de vérité pour l'IA ou pour la documentation technique.

1) Vue d'ensemble
- Backend: Node.js (Express) dans `back/`, base SQLite (fichier `back/recipes.db`, schéma `back/config/schema.sql`).
- Frontend: pages statiques dans `front/`, composants Web (Web Components) en `front/js/components`.
- API: REST JSON sur `/api/recipes`.

2) Schéma de base de données (extrait)
Le schéma complet se trouve dans `back/config/schema.sql`. Principales tables:
- `recipes` (id, title, description, image_path, default_servings, prep_time_min, cook_time_min, rest_time_min, category, created_at, updated_at)
- `recipe_tags` (recipe_id, tag) — PK (recipe_id, tag), FK -> recipes(id) ON DELETE CASCADE
- `ingredients` (id, recipe_id, section_name DEFAULT 'Ingrédients', quantity REAL, unit, name, display_order) — FK -> recipes(id) ON DELETE CASCADE
- `steps` (id, recipe_id, section_name, step_number, instruction) — FK -> recipes(id) ON DELETE CASCADE

3) Endpoints API et contrats

- GET /api/recipes
  - Description: renvoie la liste de toutes les recettes (écran d'accueil).
  - Réponse: 200 OK, JSON: tableau d'objets minimalistes: `{ id, title, description, image_path, default_servings, category, created_at, updated_at, tags: string[] }`.

- GET /api/recipes/:id
  - Description: renvoie la recette complète (incl. `ingredients` et `steps` structuré).
  - Réponse: 200 OK, JSON: `{ id, title, description, image_path, default_servings, prep_time_min, cook_time_min, rest_time_min, category, created_at, updated_at, tags: string[], ingredients: [{ section_name, quantity, unit, name, display_order }], steps: [{ section_name, step_number, instruction }] }`.

- POST /api/recipes
  - Description: création complète d'une recette (transactionnelle).
  - Corps: JSON identique au payload utilisé côté frontend (voir section Contrats / Validation).
  - Réponse: 201 Created, JSON: `{ id, message }` (backend retourne `id` de la recette créée).

- POST /api/uploads
  - Description: téléversement d'une image. Endpoint multipart/form-data attendu avec le champ `image`.
  - Réponse: 201 Created, JSON: `{ image_path: "/uploads/<filename>" }`.
  - Validation: types autorisés `image/jpeg`, `image/png`, `image/webp`, taille max 5MB. Les images sont redimensionnées côté serveur (max width 1200px).

- PUT /api/recipes/:id
  - Description: mise à jour complète; remplace/tag/ingredients/steps dans une transaction.
  - Corps: même format que POST.
  - Réponse: 200 OK sur succès, 404 si l'id inexistant.

- DELETE /api/recipes/:id
  - Description: suppression de la recette (cascade sur tags/ingredients/steps).
  - Réponse: 204 No Content sur succès, 404 si l'id inexistant.

4) Contrat JSON (Payload POST/PUT)
Exemple représentatif (voir `back/src/services/recipe.service.js` pour la validation et formatage):

{
  "title": "Tarte aux pommes",
  "description": "...",
  "image_path": "/uploads/tarte.jpg",
  "default_servings": 4,
  "prep_time_min": 20,
  "cook_time_min": 30,
  "rest_time_min": 0,
  "category": "Dessert",
  "tags": ["Tarte","Sucre"],
  "ingredients": [
    { "section_name": "Pour la pâte", "quantity": 250, "unit": "g", "name": "Farine", "display_order": 1 }
  ],
  "steps": [
    { "section_name": "Préparation", "step_number": 1, "instruction": "Mélanger..." }
  ]
}

Validation et règles (implémentées côté serveur dans `recipe.service._formatAndValidate`):
- `title` requis et non vide.
- `default_servings` entier >= 1 (par défaut 4).
- `quantity` peut être null; l'UI et le backend acceptent les fractions (ex. "1/2") et les convertissent en nombre.
- `section_name` par défaut 'Ingrédients' si vide.
- `display_order` et `step_number` doivent être séquentiels ; lorsqu'absents, le backend auto-assigne `idx+1` et rejette une valeur non séquentielle.

5) Backend — détails techniques
- Entrée du serveur: `back/server.js` importe `back/src/app.js` et écoute par défaut `PORT=8000`.
- Base: `better-sqlite3` via `back/config/database.js` qui lit et exécute `schema.sql` au démarrage.
- Repository pattern: `back/src/repositories/recipe.repository.js` gère transactions pour create/update et assemble l'objet complet pour `findById`.
- CORS: middleware `cors()` activé pour développement (autorise appels depuis le front local).

6) Frontend — composants et comportement
- Entrée: `front/index.html` → `front/js/app.js` (module)
- Composants principaux (`front/js/components`):
  - `app-navbar` (navbar.js)
  - `recipe-list` (liste + recherche + filtres)
  - `recipe-card` (présentation d'une recette en grille)
  - `recipe-detail` (vue détaillée + calcul dynamique des portions)
  - `recipe-form-modal` (formulaire de création / édition)
- Store: `front/js/store.js` expose méthodes asynchrones:
  - `loadRecipes()` — GET /api/recipes et met à jour `recipes`
  - `fetchRecipeById(id)` — GET /api/recipes/:id
  - `saveRecipe(payload, id?)` — POST ou PUT selon présence d'un `id`
  - `deleteRecipe(id)` — DELETE
- Fonctionnalités front implémentées:
  - Liste paginée par 9 éléments et filtrée (search input, category filter)
  - Détail: calcul dynamique des quantités par convive (règle de trois), boutons [+]/[-], bouton Réinitialiser
  - Création / modification via modal qui poste vers l'API, avec titre, description, catégorie, tags, image, durées, ingrédients et étapes

7) Contrats d'affichage et formatage
- Format des quantités: entiers sans décimales ; décimaux arrondis au centième et séparateur décimal à la virgule côté UI (implementation: `front/js/utils.js`).
- Bornes `current_servings`: 1 à 99.

8) Scripts & exécution
- Backend:
  - `cd back`
  - `npm install` (installer les dépendances listées)
  - `npm start` ou `npm run dev` (nodemon)
- Frontend: ouvrir `front/index.html` directement ou servir `front/` via `npx http-server .` ou `python -m http.server`.

9) Suggestions / points d'amélioration (optionnel)
- Ajouter tests automatisés pour les endpoints (ex: Jest + supertest) — fichier de tests dans `back/test`.
- Ajouter un script `seed` pour initialiser la base (`back/scripts/seed.js`) et une commande npm `seed`.
- Documenter la licence et ajouter un `CHANGELOG.md` si besoin.

---

Fichier généré automatiquement en comparant le code source actuel. Mettre à jour manuellement si de nouvelles routes ou comportements sont ajoutés.
