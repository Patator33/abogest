import type { AppData, Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Streaming vidéo', color: '#e11d48' },
  { id: 'cat-2', name: 'Musique', color: '#16a34a' },
  { id: 'cat-3', name: 'Logiciels', color: '#7c3aed' },
  { id: 'cat-4', name: 'Cloud & Stockage', color: '#2563eb' },
  { id: 'cat-5', name: 'Jeux', color: '#d97706' },
  { id: 'cat-6', name: 'Santé & Sport', color: '#0891b2' },
  { id: 'cat-7', name: 'Presse & Actualité', color: '#65a30d' },
  { id: 'cat-8', name: 'Autre', color: '#6b7280' },
];

const DEFAULT_DATA: AppData = {
  subscriptions: [],
  categories: DEFAULT_CATEGORIES,
  auth: {
    isSetup: false,
    passwordHash: '',
    passwordSalt: '',
    webauthnEnabled: false,
  },
  settings: {
    defaultCurrency: 'EUR',
  },
};

function mergeWithDefaults(parsed: Partial<AppData>): AppData {
  return {
    ...DEFAULT_DATA,
    ...parsed,
    auth: { ...DEFAULT_DATA.auth, ...parsed.auth },
    settings: { ...DEFAULT_DATA.settings, ...parsed.settings },
    subscriptions: parsed.subscriptions ?? [],
    categories: parsed.categories ?? DEFAULT_CATEGORIES,
  };
}

export async function loadData(): Promise<AppData> {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) return structuredClone(DEFAULT_DATA);
    const parsed = await res.json() as Partial<AppData> | null;
    if (!parsed) return structuredClone(DEFAULT_DATA);
    return mergeWithDefaults(parsed);
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

export async function saveData(data: AppData): Promise<void> {
  await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function clearData(): Promise<void> {
  await fetch('/api/data', { method: 'DELETE' });
}

export function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant RFC 4122
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
