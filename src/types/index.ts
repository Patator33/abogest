export type Recurrence = 'monthly' | 'yearly' | 'bimonthly' | 'custom';

export type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF' | 'CAD';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: Currency;
  recurrence: Recurrence;
  customRecurrenceDays?: number;
  categoryId: string;
  startDate: string; // ISO date YYYY-MM-DD
  endDate?: string;  // ISO date YYYY-MM-DD (optionnel)
  notes?: string;
  active: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string; // hex color
}

export interface AuthData {
  isSetup: boolean;
  passwordHash: string;
  passwordSalt: string;
  webauthnCredentialId?: string;
  webauthnEnabled: boolean;
}

export interface AppData {
  subscriptions: Subscription[];
  categories: Category[];
  auth: AuthData;
  settings: {
    defaultCurrency: Currency;
  };
}

export type AppScreen = 'loading' | 'setup' | 'login' | 'app';
export type AppView = 'subscriptions' | 'categories' | 'settings';
