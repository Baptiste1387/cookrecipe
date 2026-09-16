Cookmate
=======

Cookmate est une webapp de gestion de recettes conçue pour l'auto‑hébergement. Le backend utilise Node.js + SQLite (Express) et le frontend est une application statique légère.

Fonctionnalités principales
- CRUD complet pour les recettes (tags, ingrédients, étapes)
- Ingrédients structurés par sections et ordonnés
- Étapes ordonnées et sections personnalisables
- Ajustement dynamique des quantités selon le nombre de convives (front-end)

Extrait de l'arborescence

- back/
  - server.js
  - package.json
  - config/
    - database.js
    - schema.sql
- front/
  - index.html
  - js/

Prérequis
- Node.js 14+
- SQLite (optionnel si initialisation automatique par le backend)

Installation & exécution

Backend

1. Aller dans le dossier `back` :

```bash
cd back
npm install
npm start
```

Le script `start` exécute `node server.js` (voir `back/package.json`).

Frontend

Le frontend est statique : ouvrir `front/index.html` dans un navigateur ou servir le dossier avec un serveur HTTP simple :

```bash
cd front
npx http-server .
# ou
python -m http.server 8080
```

Base de données

Le schéma SQL se trouve dans `back/config/schema.sql`. Pour initialiser manuellement :

```bash
sqlite3 cookmate.db < back/config/schema.sql
```

API (résumé)

- `POST /api/recipes` — créer une recette complète (tags, ingrédients, étapes)
- `GET /api/recipes/:id` — récupérer une recette structurée
 - `GET /api/recipes` — récupérer la liste de toutes les recettes (id, title, description, image_path, default_servings, category, tags)
- `PUT /api/recipes/:id` — mettre à jour une recette (transactionnel)
- `DELETE /api/recipes/:id` — supprimer une recette

Uploads d'images

- `POST /api/uploads` — téléversement d'une image via `multipart/form-data` (champ `image`).
  - Réponse: `{ image_path: "/uploads/<filename>" }`.
  - Types autorisés: `jpeg`, `png`, `webp`. Taille maximale: 5MB. Images redimensionnées côté serveur (max width 1200px).
  - Le dossier `back/uploads/` est créé automatiquement lors du premier téléversement.

Bonnes pratiques et notes rapides
- `default_servings` doit être >= 1.
- Les quantités peuvent être saisies en fraction côté UI et converties en flottant avant insertion.
- L'ajustement des portions s'effectue côté client sans modifier la base de données.

Contribuer

Proposez une issue ou une PR en décrivant la fonctionnalité ou le bug.

Licence

À préciser (ajouter un fichier LICENSE si nécessaire).

---

Fichier mis à jour : readme.md — contenu restructuré et condensé pour une prise en main rapide.
