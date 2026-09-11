const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const seedDatabase = require('./seed');

const dbPath = path.join(__dirname, 'ecoquest.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initDatabase();
  }
});

function initDatabase() {
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql, (err) => {
    if (err) {
      console.error('Error executing schema.sql:', err);
    } else {
      console.log('Database tables created/verified successfully.');
      seedDatabase(db);
    }
  });
}

// Promise wrapper helper functions for database queries
db.query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

db.getOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.execute = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

module.exports = db;
