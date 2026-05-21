import { useState } from 'react';
import { Shield, Eye, EyeOff, Fingerprint, AlertCircle } from 'lucide-react';
import { verifyPassword } from '../../utils/crypto';
import { authenticateWebAuthn } from '../../utils/webauthn';
import { loadData } from '../../utils/storage';

interface Props {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: Props) {
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loadingPwd, setLoadingPwd] = useState(false);
  const [loadingHello, setLoadingHello] = useState(false);

  const data = loadData();
  const { auth } = data;

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoadingPwd(true);
    try {
      const ok = await verifyPassword(password, auth.passwordSalt, auth.passwordHash);
      if (ok) {
        onLoginSuccess();
      } else {
        setError('Mot de passe incorrect.');
      }
    } catch {
      setError('Une erreur est survenue.');
    } finally {
      setLoadingPwd(false);
    }
  };

  const handleWindowsHello = async () => {
    if (!auth.webauthnCredentialId) return;
    setError('');
    setLoadingHello(true);
    try {
      const ok = await authenticateWebAuthn(auth.webauthnCredentialId);
      if (ok) {
        onLoginSuccess();
      } else {
        setError('Authentification Windows Hello échouée.');
      }
    } catch {
      setError('Authentification Windows Hello échouée.');
    } finally {
      setLoadingHello(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AboGest</h1>
          <p className="text-gray-500 mt-1 text-sm">Connectez-vous pour accéder à vos abonnements</p>
        </div>

        {/* Windows Hello en premier si disponible */}
        {auth.webauthnEnabled && auth.webauthnCredentialId && (
          <div className="mb-6">
            <button
              onClick={handleWindowsHello}
              disabled={loadingHello || loadingPwd}
              className="w-full flex items-center justify-center gap-3 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Fingerprint className="w-5 h-5" />
              {loadingHello ? 'Authentification...' : 'Se connecter avec Windows Hello'}
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-3 text-gray-400">ou</span>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire mot de passe */}
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                autoFocus={!auth.webauthnEnabled}
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
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loadingPwd || loadingHello}
            className="w-full py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingPwd ? 'Vérification...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
