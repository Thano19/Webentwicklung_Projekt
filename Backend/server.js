// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// 🗂️ Statische Dateien aus "public"-Ordner ausliefern
app.use(express.static(path.join(__dirname, 'public')));

// 🗃️ SQLite-Datenbank vorbereiten
const db = new sqlite3.Database('./rangliste.db');

// 📦 Tabelle erstellen, falls noch nicht vorhanden
db.run(`
  CREATE TABLE IF NOT EXISTS rangliste (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    sekunden INTEGER
  )
`);

// ➕ Ranglisteneintrag hinzufügen
app.post('/api/rangliste', (req, res) => {
  const { name, sekunden } = req.body;
  if (!name || typeof sekunden !== 'number') {
    return res.status(400).json({ error: 'Ungültige Eingabe' });
  }

  db.run(
    'INSERT INTO rangliste (name, sekunden) VALUES (?, ?)',
    [name, sekunden],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

// 📄 Rangliste abrufen (Top 10)
app.get('/api/rangliste', (req, res) => {
  db.all(
    'SELECT name, sekunden FROM rangliste ORDER BY sekunden ASC LIMIT 10',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Server starten
app.listen(PORT, () => {
  console.log(`✅ Server läuft auf http://localhost:${PORT}`);
});
