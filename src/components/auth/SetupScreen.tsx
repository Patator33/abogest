import { useState, useEffect } from 'react';
import { Shield, Fingerprint, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { generateSalt, hashPassword } from '../../utils/crypto';
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  registerWebAuthn,
} from '../../utils/webauthn';
import { loadData, saveData } from '../../utils/storage';

interface Props {
  onSetupComplete: () => void;
}

export default function SetupScreen({ onSetupComplete }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [helloAvailable, setHelloAvailable] = useState(false);
  const [enableHello, setEnableHello] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then(setHelloAvailable);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const salt = await generateSalt();
      const hash = await hashPassword(password, salt);

      let credentialId: string | undefined;
      if (enableHello) {
        const id = await registerWebAuthn();
        if (!id) {
          setError("L'enregistrement Windows Hello a échoué. Continuez sans.");
          setLoading(false);
          return;
        }
        credentialId = id;
      }

      const data = await loadData();
      data.auth = {
        isSetup: true,
        passwordHash: hash,
        passwordSalt: salt,
        webauthnEnabled: enableHello,
        webauthnCredentialId: credentialId,
      };
      await saveData(data);
      onSetupComplete();
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenue sur AboGest</h1>
          <p className="text-gray-500 mt-1 text-sm">Créez votre mot de passe pour protéger vos données</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Jauge de force */}
            {password.length > 0 && (
              <div className="flex gap-1 mt-2">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= strength
                        ? strength === 1 ? 'bg-red-400'
                          : strength === 2 ? 'bg-yellow-400'
                          : 'bg-green-400'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Confirmation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Répétez votre mot de passe"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirm.length > 0 && password === confirm && (
              <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Les mots de passe correspondent
              </p>
            )}
          </div>

          {/* Windows Hello */}
          {helloAvailable && (
            <div
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                enableHello ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setEnableHello(v => !v)}
            >
              <Fingerprint className={`w-6 h-6 ${enableHello ? 'text-indigo-600' : 'text-gray-400'}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Activer Windows Hello</p>
                <p className="text-xs text-gray-500">Connectez-vous avec votre empreinte, visage ou PIN</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                enableHello ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
              }`}>
                {enableHello && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Configuration en cours...' : 'Créer mon espace'}
          </button>
        </form>
      </div>
    </div>
  );
}
