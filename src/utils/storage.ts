import type { AppData, Category } from '../types';

const STORAGE_KEY = 'abogest_data';

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

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_DATA);
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      ...DEFAULT_DATA,
      ...parsed,
      auth: { ...DEFAULT_DATA.auth, ...parsed.auth },
      settings: { ...DEFAULT_DATA.settings, ...parsed.settings },
      subscriptions: parsed.subscriptions ?? [],
      categories: parsed.categories ?? DEFAULT_CATEGORIES,
    };
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function generateId(): string {
  return crypto.randomUUID();
}
