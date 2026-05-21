import type { Subscription } from '../types';

/** Convertit un montant en équivalent mensuel */
export function toMonthlyAmount(sub: Subscription): number {
  if (!sub.active) return 0;

  const now = new Date();
  const start = new Date(sub.startDate);
  if (now < start) return 0;

  if (sub.endDate) {
    const end = new Date(sub.endDate);
    if (now > end) return 0;
  }

  switch (sub.recurrence) {
    case 'monthly':
      return sub.amount;
    case 'yearly':
      return sub.amount / 12;
    case 'bimonthly':
      return sub.amount / 2;
    case 'custom':
      if (!sub.customRecurrenceDays || sub.customRecurrenceDays <= 0) return 0;
      return sub.amount * (30.44 / sub.customRecurrenceDays);
    default:
      return 0;
  }
}

/** Calcule le total mensuel de tous les abonnements actifs */
export function calculateMonthlyTotal(subscriptions: Subscription[]): number {
  return subscriptions.reduce((total, sub) => total + toMonthlyAmount(sub), 0);
}

/** Formate un montant en devise */
export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Label lisible pour la récurrence */
export function getRecurrenceLabel(sub: Subscription): string {
  switch (sub.recurrence) {
    case 'monthly':   return 'Mensuel';
    case 'yearly':    return 'Annuel';
    case 'bimonthly': return 'Bimestriel';
    case 'custom':    return `Tous les ${sub.customRecurrenceDays ?? '?'} jours`;
    default:          return '';
  }
}

/** Formate une date ISO en format français */
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/** Vérifie si un abonnement est expiré */
export function isExpired(sub: Subscription): boolean {
  if (!sub.endDate) return false;
  return new Date(sub.endDate) < new Date();
}
