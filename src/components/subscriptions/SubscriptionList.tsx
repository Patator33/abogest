import { useState } from 'react';
import { Plus, Search, SlidersHorizontal, TrendingUp } from 'lucide-react';
import SubscriptionCard from './SubscriptionCard';
import { calculateMonthlyTotal, formatCurrency } from '../../utils/calculations';
import type { Subscription, Category } from '../../types';

interface Props {
  subscriptions: Subscription[];
  categories: Category[];
  defaultCurrency: string;
  onAdd: () => void;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

type FilterStatus = 'all' | 'active' | 'inactive';

export default function SubscriptionList({
  subscriptions,
  categories,
  defaultCurrency,
  onAdd,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = subscriptions.filter(sub => {
    const matchSearch = sub.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'all' || sub.categoryId === filterCategory;
    const matchStatus =
      filterStatus === 'all' ? true :
      filterStatus === 'active' ? sub.active :
      !sub.active;
    return matchSearch && matchCat && matchStatus;
  });

  const activeCount = subscriptions.filter(s => s.active).length;
  const monthly = calculateMonthlyTotal(subscriptions);

  // Répartition par catégorie pour le récap
  const byCategory = categories.map(cat => {
    const subs = subscriptions.filter(s => s.categoryId === cat.id && s.active);
    const total = calculateMonthlyTotal(subs);
    return { cat, total, count: subs.length };
  }).filter(x => x.count > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="flex flex-col gap-5 h-full overflow-auto">
      {/* Résumé mensuel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-indigo-600 text-white rounded-xl p-4">
          <div className="flex items-center gap-2 text-indigo-200 text-xs mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Coût mensuel total
          </div>
          <div className="text-2xl font-bold">{formatCurrency(monthly, defaultCurrency)}</div>
          <div className="text-indigo-200 text-xs mt-0.5">
            {formatCurrency(monthly * 12, defaultCurrency)} / an
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-500 mb-1">Abonnements actifs</div>
          <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
          <div className="text-xs text-gray-400 mt-0.5">sur {subscriptions.length} au total</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-500 mb-1">Top catégorie</div>
          {byCategory[0] ? (
            <>
              <div className="text-base font-bold text-gray-900">{byCategory[0].cat.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {formatCurrency(byCategory[0].total, defaultCurrency)}/mois
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-400">—</div>
          )}
        </div>
      </div>

      {/* Barre d'outils */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un abonnement..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          />
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${
            showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtres
        </button>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex-wrap">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Catégorie</label>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              <option value="all">Toutes</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Statut</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as FilterStatus)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            >
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
          </div>
        </div>
      )}

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {subscriptions.length === 0 ? (
            <>
              <div className="text-4xl mb-3">📋</div>
              <p className="font-medium text-gray-600">Aucun abonnement encore</p>
              <p className="text-sm mt-1">Cliquez sur « Ajouter » pour commencer</p>
            </>
          ) : (
            <>
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-medium text-gray-600">Aucun résultat</p>
              <p className="text-sm mt-1">Essayez de modifier vos critères</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map(sub => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              categories={categories}
              defaultCurrency={defaultCurrency}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      )}

      {/* Répartition par catégorie */}
      {byCategory.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mt-2">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Répartition mensuelle par catégorie</h3>
          <div className="space-y-2">
            {byCategory.map(({ cat, total }) => (
              <div key={cat.id} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-sm text-gray-600 flex-1">{cat.name}</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(total, defaultCurrency)}
                </span>
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${monthly > 0 ? (total / monthly) * 100 : 0}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
