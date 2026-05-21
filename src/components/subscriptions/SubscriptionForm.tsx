import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { generateId } from '../../utils/storage';
import type { Subscription, Category, Recurrence, Currency } from '../../types';

interface Props {
  subscription?: Subscription | null;
  categories: Category[];
  defaultCurrency: Currency;
  onSave: (sub: Subscription) => void;
  onCancel: () => void;
}

const CURRENCIES: Currency[] = ['EUR', 'USD', 'GBP', 'CHF', 'CAD'];
const RECURRENCES: { value: Recurrence; label: string }[] = [
  { value: 'monthly',   label: 'Mensuel'   },
  { value: 'yearly',    label: 'Annuel'    },
  { value: 'bimonthly', label: 'Bimestriel (tous les 2 mois)' },
  { value: 'custom',    label: 'Personnalisé' },
];

const today = () => new Date().toISOString().slice(0, 10);

export default function SubscriptionForm({
  subscription,
  categories,
  defaultCurrency,
  onSave,
  onCancel,
}: Props) {
  const isEdit = !!subscription;

  const [name, setName] = useState(subscription?.name ?? '');
  const [amount, setAmount] = useState(subscription?.amount.toString() ?? '');
  const [currency, setCurrency] = useState<Currency>(subscription?.currency ?? defaultCurrency);
  const [recurrence, setRecurrence] = useState<Recurrence>(subscription?.recurrence ?? 'monthly');
  const [customDays, setCustomDays] = useState(subscription?.customRecurrenceDays?.toString() ?? '30');
  const [categoryId, setCategoryId] = useState(subscription?.categoryId ?? categories[0]?.id ?? '');
  const [startDate, setStartDate] = useState(subscription?.startDate ?? today());
  const [endDate, setEndDate] = useState(subscription?.endDate ?? '');
  const [notes, setNotes] = useState(subscription?.notes ?? '');
  const [active, setActive] = useState(subscription?.active ?? true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!name.trim()) { setError('Le nom est requis.'); return; }
    if (isNaN(parsedAmount) || parsedAmount <= 0) { setError('Le montant doit être positif.'); return; }
    if (!categoryId) { setError('Veuillez choisir une catégorie.'); return; }
    if (recurrence === 'custom' && (!customDays || parseInt(customDays) <= 0)) {
      setError('Précisez un nombre de jours valide pour la récurrence personnalisée.');
      return;
    }
    if (endDate && endDate < startDate) {
      setError('La date de fin doit être après la date de début.');
      return;
    }

    const sub: Subscription = {
      id: subscription?.id ?? generateId(),
      name: name.trim(),
      amount: parsedAmount,
      currency,
      recurrence,
      customRecurrenceDays: recurrence === 'custom' ? parseInt(customDays) : undefined,
      categoryId,
      startDate,
      endDate: endDate || undefined,
      notes: notes.trim() || undefined,
      active,
      createdAt: subscription?.createdAt ?? new Date().toISOString(),
    };

    onSave(sub);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? 'Modifier l\'abonnement' : 'Nouvel abonnement'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Netflix, Spotify, Adobe..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Montant + Devise */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant *</label>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0,00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as Currency)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Récurrence */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Récurrence *</label>
            <select
              value={recurrence}
              onChange={e => setRecurrence(e.target.value as Recurrence)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {RECURRENCES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Jours personnalisés */}
          {recurrence === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tous les N jours *
              </label>
              <input
                type="number"
                min="1"
                value={customDays}
                onChange={e => setCustomDays(e.target.value)}
                placeholder="Ex: 90 pour trimestriel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                    categoryId === cat.id
                      ? 'border-indigo-500 bg-indigo-50 font-medium'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin <span className="text-gray-400">(optionnel)</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-400">(optionnel)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Informations complémentaires..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Actif */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`relative w-10 h-5 rounded-full transition-colors ${active ? 'bg-indigo-600' : 'bg-gray-300'}`}
              onClick={() => setActive(v => !v)}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${active ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">Abonnement actif</span>
          </label>

          {/* Erreur */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors text-sm"
          >
            <Save className="w-4 h-4" />
            {isEdit ? 'Enregistrer' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );
}
