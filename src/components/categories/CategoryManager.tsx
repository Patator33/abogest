import { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Tag } from 'lucide-react';
import { generateId } from '../../utils/storage';
import type { Category, Subscription } from '../../types';

interface Props {
  categories: Category[];
  subscriptions: Subscription[];
  onUpdate: (categories: Category[]) => void;
}

const PRESET_COLORS = [
  '#e11d48', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#2563eb', '#7c3aed', '#ec4899', '#0891b2', '#6b7280',
];

interface EditState {
  id: string | null; // null = nouvelle catégorie
  name: string;
  color: string;
}

export default function CategoryManager({ categories, subscriptions, onUpdate }: Props) {
  const [editing, setEditing] = useState<EditState | null>(null);
  const [error, setError] = useState('');

  const usageCounts = Object.fromEntries(
    categories.map(cat => [
      cat.id,
      subscriptions.filter(s => s.categoryId === cat.id).length,
    ])
  );

  const startAdd = () => {
    setEditing({ id: null, name: '', color: PRESET_COLORS[0] });
    setError('');
  };

  const startEdit = (cat: Category) => {
    setEditing({ id: cat.id, name: cat.name, color: cat.color });
    setError('');
  };

  const cancelEdit = () => {
    setEditing(null);
    setError('');
  };

  const handleSave = () => {
    if (!editing) return;
    const trimmed = editing.name.trim();
    if (!trimmed) { setError('Le nom est requis.'); return; }

    const duplicate = categories.some(
      c => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== editing.id
    );
    if (duplicate) { setError('Une catégorie avec ce nom existe déjà.'); return; }

    if (editing.id === null) {
      // Nouvelle catégorie
      const newCat: Category = { id: generateId(), name: trimmed, color: editing.color };
      onUpdate([...categories, newCat]);
    } else {
      // Modification
      onUpdate(categories.map(c => c.id === editing.id ? { ...c, name: trimmed, color: editing.color } : c));
    }
    setEditing(null);
    setError('');
  };

  const handleDelete = (id: string) => {
    if ((usageCounts[id] ?? 0) > 0) {
      if (!confirm(`Cette catégorie est utilisée par ${usageCounts[id]} abonnement(s). Continuer ?`)) return;
    }
    onUpdate(categories.filter(c => c.id !== id));
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Catégories</h2>
          <p className="text-sm text-gray-500 mt-0.5">Organisez vos abonnements par catégorie</p>
        </div>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvelle catégorie
        </button>
      </div>

      {/* Formulaire d'ajout/édition */}
      {editing !== null && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-indigo-800 mb-3">
            {editing.id === null ? 'Nouvelle catégorie' : 'Modifier la catégorie'}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Nom</label>
              <input
                type="text"
                value={editing.name}
                onChange={e => setEditing(prev => prev ? { ...prev, name: e.target.value } : null)}
                placeholder="Ex: Streaming, Jeux..."
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') cancelEdit(); }}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-2 block">Couleur</label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setEditing(prev => prev ? { ...prev, color } : null)}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                      editing.color === color ? 'ring-2 ring-offset-2 ring-gray-800 scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input
                  type="color"
                  value={editing.color}
                  onChange={e => setEditing(prev => prev ? { ...prev, color: e.target.value } : null)}
                  className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-300"
                  title="Couleur personnalisée"
                />
              </div>
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Enregistrer
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des catégories */}
      <div className="space-y-2">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:shadow-sm transition-shadow"
          >
            {/* Pastille couleur */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: cat.color + '20' }}
            >
              <Tag className="w-5 h-5" style={{ color: cat.color }} />
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="font-medium text-gray-900">{cat.name}</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {usageCounts[cat.id] ?? 0} abonnement{(usageCounts[cat.id] ?? 0) > 1 ? 's' : ''}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => startEdit(cat)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Modifier"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-3xl mb-2">🏷️</div>
            <p className="font-medium text-gray-600">Aucune catégorie</p>
            <p className="text-sm mt-1">Créez votre première catégorie</p>
          </div>
        )}
      </div>
    </div>
  );
}
