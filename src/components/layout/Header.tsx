import { LogOut, TrendingUp } from 'lucide-react';
import { formatCurrency, calculateMonthlyTotal } from '../../utils/calculations';
import type { Subscription } from '../../types';

interface Props {
  subscriptions: Subscription[];
  defaultCurrency: string;
  onLogout: () => void;
}

export default function Header({ subscriptions, defaultCurrency, onLogout }: Props) {
  const monthly = calculateMonthlyTotal(subscriptions);
  const yearly = monthly * 12;

  return (
    <header className="bg-indigo-700 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center font-bold text-lg">
          A
        </div>
        <span className="font-bold text-xl tracking-tight">AboGest</span>
      </div>

      {/* Totaux */}
      <div className="flex items-center gap-8">
        <div className="text-center hidden sm:block">
          <div className="flex items-center gap-1.5 text-indigo-200 text-xs mb-0.5">
            <TrendingUp className="w-3 h-3" />
            Mensuel
          </div>
          <div className="font-bold text-lg leading-none">
            {formatCurrency(monthly, defaultCurrency)}
          </div>
        </div>
        <div className="text-center hidden sm:block">
          <div className="text-indigo-200 text-xs mb-0.5">Annuel</div>
          <div className="font-semibold text-base leading-none">
            {formatCurrency(yearly, defaultCurrency)}
          </div>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="flex items-center gap-2 text-sm text-indigo-200 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Déconnexion</span>
      </button>
    </header>
  );
}
