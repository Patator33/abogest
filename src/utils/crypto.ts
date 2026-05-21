// Hachage côté serveur via l'API (PBKDF2-SHA256, 100k itérations)
// Évite la dépendance à crypto.subtle qui exige HTTPS

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const res = await fetch('/api/auth/hash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error('Erreur de hachage');
  return res.json();
}

export async function verifyPassword(
  password: string,
  salt: string,
  hash: string
): Promise<boolean> {
  const res = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, salt, hash }),
  });
  if (!res.ok) throw new Error('Erreur de vérification');
  const data = await res.json() as { ok: boolean };
  return data.ok;
}
