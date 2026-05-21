import { CreditCard, Tag, Settings } from 'lucide-react';
import type { AppView } from '../../types';

interface Props {
  current: AppView;
  onChange: (view: AppView) => void;
}

const NAV_ITEMS: { view: AppView; label: string; icon: React.ReactNode }[] = [
  { view: 'subscriptions', label: 'Abonnements', icon: <CreditCard className="w-5 h-5" /> },
  { view: 'categories',    label: 'Catégories',  icon: <Tag className="w-5 h-5" /> },
  { view: 'settings',      label: 'Paramètres',  icon: <Settings className="w-5 h-5" /> },
];

export default function Sidebar({ current, onChange }: Props) {
  return (
    <aside className="w-56 bg-gray-50 border-r border-gray-200 flex flex-col py-4 px-3">
      <nav className="space-y-1">
        {NAV_ITEMS.map(({ view, label, icon }) => (
          <button
            key={view}
            onClick={() => onChange(view)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
              current === view
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span className={current === view ? 'text-indigo-600' : 'text-gray-400'}>
              {icon}
            </span>
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
