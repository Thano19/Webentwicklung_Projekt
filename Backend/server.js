const http = require('http');
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const { URL } = require('url');
require('dotenv').config();

const MONGO_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'tictactoe';

const client = new MongoClient(MONGO_URL);
let db, ranglisteCollection;

async function startServer() {
  try {
    await client.connect();
    console.log('✅ MongoDB verbunden');
    db = client.db(DB_NAME);
    ranglisteCollection = db.collection('rangliste');

    const server = http.createServer(async (req, res) => {
      const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
      const pathname = parsedUrl.pathname;

      console.log(`${req.method} ${pathname}`);

      // API: Rangliste abrufen
      if (req.method === 'GET' && pathname === '/api/rangliste') {
        const daten = await ranglisteCollection.find()
          .sort({ sekunden: 1 })
          .limit(10)
          .toArray();
        const umgewandelt = daten.map(umwandelnMongoId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(umgewandelt));
      }

      // API: Rangliste speichern
      else if (req.method === 'POST' && pathname === '/api/rangliste') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          const data = JSON.parse(body);
          const neuerEintrag = { name: data.name, sekunden: data.sekunden };
          const result = await ranglisteCollection.insertOne(neuerEintrag);
          const gespeicherterEintrag = { ...neuerEintrag, id: result.insertedId };
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(gespeicherterEintrag));
        });
      }

      // API: Rangliste löschen
      else if (req.method === 'DELETE' && pathname === '/api/rangliste') {
        await ranglisteCollection.deleteMany({});
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Rangliste wurde zurückgesetzt' }));
      }

      // Statische Dateien aus Frontend/
      else if (req.method === 'GET') {
        const publicPath = path.join(__dirname, '..', 'Frontend');
        const dateiPfad = path.join(publicPath, pathname === '/' ? 'index.html' : pathname.slice(1));
        const ext = path.extname(dateiPfad);
        const mime = {
          '.html': 'text/html; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.js': 'text/javascript; charset=utf-8',
          '.png': 'image/png'
        };

        fs.readFile(dateiPfad, (err, data) => {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
            res.end(data);
          }
        });
      }

      // Unbekannte Route
      else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Nicht gefunden' }));
      }
    });

    const PORT = process.env.PORT || 3001;
    server.listen(PORT, '0.0.0.0', () =>
      console.log(`🚀 Server läuft auf http://localhost:${PORT}`)
    );

  } catch (error) {
    console.error('❌ MongoDB Verbindungsfehler:', error);
    process.exit(1);
  }
}

startServer().catch(err => {
  console.error("Fehler beim Starten des Servers:", err);
  process.exit(1);
});

function umwandelnMongoId(eintrag) {
  return { ...eintrag, id: eintrag._id };
}

process.on('SIGINT', async () => {
  console.log('\n🛑 Server wird beendet...');
  await client.close();
  console.log('✅ MongoDB-Verbindung geschlossen');
  process.exit(0);
});