import { useState, useEffect } from 'react';
import { Key, Fingerprint, Download, Upload, Trash2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { generateSalt, hashPassword, verifyPassword } from '../../utils/crypto';
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  registerWebAuthn,
} from '../../utils/webauthn';
import { saveData, clearData } from '../../utils/storage';
import type { Currency, AppData } from '../../types';

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'EUR', label: '€ Euro' },
  { value: 'USD', label: '$ Dollar US' },
  { value: 'GBP', label: '£ Livre sterling' },
  { value: 'CHF', label: 'CHF Franc suisse' },
  { value: 'CAD', label: 'CAD Dollar canadien' },
];

interface Props {
  data: AppData;
  onDataChange: (data: AppData) => void;
}

export default function Settings({ data, onDataChange }: Props) {
  const [helloAvailable, setHelloAvailable] = useState(false);

  // Changement de mot de passe
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [loadingPwd, setLoadingPwd] = useState(false);

  // Windows Hello
  const [helloMsg, setHelloMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [loadingHello, setLoadingHello] = useState(false);

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then(setHelloAvailable);
  }, []);

  const handleChangePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (newPwd.length < 6) { setPwdMsg({ type: 'error', text: 'Minimum 6 caractères.' }); return; }
    if (newPwd !== confirmPwd) { setPwdMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas.' }); return; }

    setLoadingPwd(true);
    try {
      const ok = await verifyPassword(oldPwd, data.auth.passwordSalt, data.auth.passwordHash);
      if (!ok) { setPwdMsg({ type: 'error', text: 'Ancien mot de passe incorrect.' }); return; }

      const salt = await generateSalt();
      const hash = await hashPassword(newPwd, salt);
      const updated = { ...data, auth: { ...data.auth, passwordHash: hash, passwordSalt: salt } };
      await saveData(updated);
      onDataChange(updated);
      setOldPwd(''); setNewPwd(''); setConfirmPwd('');
      setPwdMsg({ type: 'ok', text: 'Mot de passe modifié avec succès !' });
    } finally {
      setLoadingPwd(false);
    }
  };

  const handleEnableHello = async () => {
    setHelloMsg(null);
    setLoadingHello(true);
    try {
      const id = await registerWebAuthn();
      if (!id) { setHelloMsg({ type: 'error', text: "L'enregistrement a échoué." }); return; }
      const updated = { ...data, auth: { ...data.auth, webauthnEnabled: true, webauthnCredentialId: id } };
      await saveData(updated);
      onDataChange(updated);
      setHelloMsg({ type: 'ok', text: 'Windows Hello activé avec succès !' });
    } finally {
      setLoadingHello(false);
    }
  };

  const handleDisableHello = () => {
    const updated = { ...data, auth: { ...data.auth, webauthnEnabled: false, webauthnCredentialId: undefined } };
    void saveData(updated);
    onDataChange(updated);
    setHelloMsg({ type: 'ok', text: 'Windows Hello désactivé.' });
  };

  const handleCurrencyChange = (currency: Currency) => {
    const updated = { ...data, settings: { ...data.settings, defaultCurrency: currency } };
    void saveData(updated);
    onDataChange(updated);
  };

  const handleExport = () => {
    const json = JSON.stringify({ subscriptions: data.subscriptions, categories: data.categories }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `abogest-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed.subscriptions)) throw new Error();
        const updated = {
          ...data,
          subscriptions: parsed.subscriptions,
          categories: parsed.categories ?? data.categories,
        };
        void saveData(updated);
        onDataChange(updated);
        alert('Import réussi !');
      } catch {
        alert('Fichier invalide.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = async () => {
    if (!confirm('Voulez-vous vraiment supprimer TOUTES les données ? Cette action est irréversible.')) return;
    await clearData();
    window.location.reload();
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Paramètres</h2>
        <p className="text-sm text-gray-500 mt-0.5">Gérez votre compte et vos préférences</p>
      </div>

      {/* Devise par défaut */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          💱 Devise d'affichage
        </h3>
        <div className="flex flex-wrap gap-2">
          {CURRENCIES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleCurrencyChange(value)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                data.settings.defaultCurrency === value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Changement de mot de passe */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Key className="w-4 h-4 text-gray-500" />
          Changer le mot de passe
        </h3>
        <form onSubmit={handleChangePwd} className="space-y-3">
          {[
            { label: 'Mot de passe actuel', value: oldPwd, setter: setOldPwd, show: showOld, toggle: () => setShowOld(v => !v) },
            { label: 'Nouveau mot de passe', value: newPwd, setter: setNewPwd, show: showNew, toggle: () => setShowNew(v => !v) },
            { label: 'Confirmer le nouveau', value: confirmPwd, setter: setConfirmPwd, show: showNew, toggle: () => setShowNew(v => !v) },
          ].map(({ label, value, setter, show, toggle }, i) => (
            <div key={i}>
              <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={value}
                  onChange={e => setter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-9 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <button type="button" onClick={toggle} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          {pwdMsg && (
            <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${pwdMsg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {pwdMsg.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {pwdMsg.text}
            </div>
          )}
          <button
            type="submit"
            disabled={loadingPwd}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
          >
            {loadingPwd ? 'Vérification...' : 'Modifier le mot de passe'}
          </button>
        </form>
      </div>

      {/* Windows Hello */}
      {(helloAvailable || data.auth.webauthnEnabled) && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-gray-500" />
            Windows Hello
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {data.auth.webauthnEnabled
              ? 'Windows Hello est activé. Vous pouvez vous connecter avec votre empreinte, visage ou PIN Windows.'
              : "Activez Windows Hello pour une connexion rapide et sécurisée."}
          </p>
          {helloMsg && (
            <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg mb-3 ${helloMsg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {helloMsg.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {helloMsg.text}
            </div>
          )}
          {data.auth.webauthnEnabled ? (
            <button
              onClick={handleDisableHello}
              className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors"
            >
              Désactiver Windows Hello
            </button>
          ) : (
            <button
              onClick={handleEnableHello}
              disabled={loadingHello}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
            >
              <Fingerprint className="w-4 h-4" />
              {loadingHello ? 'Enregistrement...' : 'Activer Windows Hello'}
            </button>
          )}
        </div>
      )}

      {/* Import / Export */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Import / Export</h3>
        <p className="text-sm text-gray-500 mb-4">Sauvegardez ou restaurez vos données (hors mot de passe).</p>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exporter (.json)
          </button>
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Importer (.json)
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Zone dangereuse */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Zone dangereuse
        </h3>
        <p className="text-sm text-red-600 mb-4">Supprime définitivement toutes les données et la configuration.</p>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Réinitialiser toutes les données
        </button>
      </div>
    </div>
  );
}
