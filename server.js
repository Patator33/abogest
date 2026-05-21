import express from 'express';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = process.env.DATA_FILE ?? join(__dirname, 'data', 'abogest.json');
const PORT = process.env.PORT ?? 3000;

// Garantit que le répertoire de données existe
const dataDir = dirname(DATA_FILE);
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const app = express();
app.use(express.json({ limit: '10mb' }));

// Fichiers statiques du build React
app.use(express.static(join(__dirname, 'dist')));

// GET /api/data — lire les données
app.get('/api/data', (_req, res) => {
  try {
    if (!existsSync(DATA_FILE)) return res.json(null);
    const raw = readFileSync(DATA_FILE, 'utf-8');
    res.json(JSON.parse(raw));
  } catch {
    res.status(500).json({ error: 'Erreur de lecture' });
  }
});

// POST /api/data — sauvegarder les données
app.post('/api/data', (req, res) => {
  try {
    writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2), 'utf-8');
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Erreur d\'écriture' });
  }
});

// DELETE /api/data — réinitialiser
app.delete('/api/data', (_req, res) => {
  try {
    writeFileSync(DATA_FILE, 'null', 'utf-8');
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Erreur de suppression' });
  }
});

// Fallback SPA
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AboGest server running on http://localhost:${PORT}`);
});
