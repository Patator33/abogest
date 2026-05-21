import express from 'express';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { randomBytes, pbkdf2 } from 'crypto';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const pbkdf2Async = promisify(pbkdf2);

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

// POST /api/auth/hash — hache un mot de passe (PBKDF2-SHA256, 100k itérations)
app.post('/api/auth/hash', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Mot de passe requis' });
    }
    const saltBuf = randomBytes(32);
    const key = await pbkdf2Async(password, saltBuf, 100000, 32, 'sha256');
    res.json({ hash: key.toString('base64'), salt: saltBuf.toString('base64') });
  } catch {
    res.status(500).json({ error: 'Erreur de hachage' });
  }
});

// POST /api/auth/verify — vérifie un mot de passe
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { password, salt, hash } = req.body;
    if (!password || !salt || !hash) {
      return res.status(400).json({ error: 'Champs manquants' });
    }
    const key = await pbkdf2Async(password, Buffer.from(salt, 'base64'), 100000, 32, 'sha256');
    res.json({ ok: key.toString('base64') === hash });
  } catch {
    res.status(500).json({ error: 'Erreur de vérification' });
  }
});

// Fallback SPA
app.get('/{*splat}', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`AboGest server running on http://localhost:${PORT}`);
});
