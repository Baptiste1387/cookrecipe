const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../recipes.db');
const db = new Database(dbPath);

// Activation des clés étrangères (CASCADE)
db.pragma('foreign_keys = ON');

// Exécution automatique du schéma SQL
const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);

module.exports = db;