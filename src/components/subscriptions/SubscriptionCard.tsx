import { Edit2, Trash2, AlertCircle, Calendar } from 'lucide-react';
import {
  toMonthlyAmount,
  formatCurrency,
  getRecurrenceLabel,
  formatDate,
  isExpired,
} from '../../utils/calculations';
import type { Subscription, Category } from '../../types';

interface Props {
  subscription: Subscription;
  categories: Category[];
  defaultCurrency: string;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export default function SubscriptionCard({
  subscription: sub,
  categories,
  defaultCurrency,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  const category = categories.find(c => c.id === sub.categoryId);
  const monthlyEq = toMonthlyAmount(sub);
  const expired = isExpired(sub);

  return (
    <div
      className={`bg-white rounded-xl border transition-all ${
        !sub.active || expired
          ? 'border-gray-200 opacity-60'
          : 'border-gray-200 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          {/* Infos principales */}
          <div className="flex items-start gap-3 min-w-0">
            {/* Pastille catégorie */}
            <div
              className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: category?.color ?? '#6b7280' }}
            >
              {sub.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 truncate">{sub.name}</h3>
                {expired && (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    <AlertCircle className="w-3 h-3" /> Expiré
                  </span>
                )}
                {!sub.active && !expired && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    Inactif
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {category && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: category.color + '20', color: category.color }}
                  >
                    {category.name}
                  </span>
                )}
                <span className="text-xs text-gray-400">{getRecurrenceLabel(sub)}</span>
              </div>
              {/* Dates */}
              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Depuis {formatDate(sub.startDate)}
                </span>
                {sub.endDate && (
                  <span>→ {formatDate(sub.endDate)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Montants */}
          <div className="text-right flex-shrink-0">
            <div className="font-bold text-gray-900">
              {formatCurrency(sub.amount, sub.currency)}
            </div>
            <div className="text-xs text-gray-400">/{sub.recurrence === 'monthly' ? 'mois' : sub.recurrence === 'yearly' ? 'an' : sub.recurrence === 'bimonthly' ? '2 mois' : `${sub.customRecurrenceDays}j`}</div>
            {sub.recurrence !== 'monthly' && (
              <div className="text-xs text-indigo-600 font-medium mt-0.5">
                ≈ {formatCurrency(monthlyEq, defaultCurrency)}/mois
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {sub.notes && (
          <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 italic">
            {sub.notes}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          {/* Toggle actif */}
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              className={`relative w-10 h-5 rounded-full transition-colors ${
                sub.active ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
              onClick={() => onToggleActive(sub.id)}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  sub.active ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="text-xs text-gray-500">{sub.active ? 'Actif' : 'Inactif'}</span>
          </label>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(sub)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Modifier"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(sub.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
