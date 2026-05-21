import { useState, useEffect, useCallback } from 'react';
import SetupScreen from './components/auth/SetupScreen';
import LoginScreen from './components/auth/LoginScreen';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import SubscriptionList from './components/subscriptions/SubscriptionList';
import SubscriptionForm from './components/subscriptions/SubscriptionForm';
import CategoryManager from './components/categories/CategoryManager';
import Settings from './components/settings/Settings';
import { loadData, saveData } from './utils/storage';
import type { AppScreen, AppView, AppData, Subscription, Category } from './types';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('loading');
  const [view, setView] = useState<AppView>('subscriptions');
  const [data, setData] = useState<AppData | null>(null);

  // État du formulaire abonnement
  const [formOpen, setFormOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  // Chargement initial
  useEffect(() => {
    const d = loadData();
    setData(d);
    if (!d.auth.isSetup) {
      setScreen('setup');
    } else {
      setScreen('login');
    }
  }, []);

  const updateData = useCallback((updated: AppData) => {
    setData(updated);
    saveData(updated);
  }, []);

  const handleSetupComplete = () => {
    setData(loadData());
    setScreen('login');
  };

  const handleLoginSuccess = () => {
    setScreen('app');
  };

  const handleLogout = () => {
    setScreen('login');
  };

  // --- ABONNEMENTS ---
  const handleAddSub = () => {
    setEditingSub(null);
    setFormOpen(true);
  };

  const handleEditSub = (sub: Subscription) => {
    setEditingSub(sub);
    setFormOpen(true);
  };

  const handleSaveSub = (sub: Subscription) => {
    if (!data) return;
    const exists = data.subscriptions.some(s => s.id === sub.id);
    const updated: AppData = {
      ...data,
      subscriptions: exists
        ? data.subscriptions.map(s => s.id === sub.id ? sub : s)
        : [...data.subscriptions, sub],
    };
    updateData(updated);
    setFormOpen(false);
    setEditingSub(null);
  };

  const handleDeleteSub = (id: string) => {
    if (!data) return;
    if (!confirm('Supprimer cet abonnement ?')) return;
    updateData({ ...data, subscriptions: data.subscriptions.filter(s => s.id !== id) });
  };

  const handleToggleActive = (id: string) => {
    if (!data) return;
    updateData({
      ...data,
      subscriptions: data.subscriptions.map(s =>
        s.id === id ? { ...s, active: !s.active } : s
      ),
    });
  };

  // --- CATÉGORIES ---
  const handleUpdateCategories = (categories: Category[]) => {
    if (!data) return;
    updateData({ ...data, categories });
  };

  // --- RENDU ---
  if (screen === 'loading' || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (screen === 'setup') {
    return <SetupScreen onSetupComplete={handleSetupComplete} />;
  }

  if (screen === 'login') {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header
        subscriptions={data.subscriptions}
        defaultCurrency={data.settings.defaultCurrency}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar current={view} onChange={setView} />

        <main className="flex-1 overflow-auto p-6">
          {view === 'subscriptions' && (
            <SubscriptionList
              subscriptions={data.subscriptions}
              categories={data.categories}
              defaultCurrency={data.settings.defaultCurrency}
              onAdd={handleAddSub}
              onEdit={handleEditSub}
              onDelete={handleDeleteSub}
              onToggleActive={handleToggleActive}
            />
          )}

          {view === 'categories' && (
            <CategoryManager
              categories={data.categories}
              subscriptions={data.subscriptions}
              onUpdate={handleUpdateCategories}
            />
          )}

          {view === 'settings' && (
            <Settings data={data} onDataChange={updateData} />
          )}
        </main>
      </div>

      {/* Modal formulaire abonnement */}
      {formOpen && (
        <SubscriptionForm
          subscription={editingSub}
          categories={data.categories}
          defaultCurrency={data.settings.defaultCurrency}
          onSave={handleSaveSub}
          onCancel={() => { setFormOpen(false); setEditingSub(null); }}
        />
      )}
    </div>
  );
}
