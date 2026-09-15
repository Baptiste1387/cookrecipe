const express = require('express');
const path = require('path');
const cors = require('cors');
const recipeController = require('./controllers/recipe.controller');
const uploadController = require('./controllers/upload.controller');

const app = express();

// CORS middleware (enable for development)
app.use(cors());

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Endpoints REST API
app.get('/api/recipes', (req, res) => recipeController.getAll(req, res));
app.get('/api/recipes/:id', (req, res) => recipeController.getOne(req, res));
app.post('/api/recipes', (req, res) => recipeController.create(req, res));
app.put('/api/recipes/:id', (req, res) => recipeController.update(req, res));
app.delete('/api/recipes/:id', (req, res) => recipeController.delete(req, res));
// Upload endpoint (multipart/form-data)
app.post('/api/uploads', (req, res) => uploadController.upload(req, res));

module.exports = app;