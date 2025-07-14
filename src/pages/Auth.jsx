import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        // Redirect based on user role
        if (result.user.role === 'ADMIN') {
          navigate('/admin/stats');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex bg-[#0B1926] bg-gradient-to-br from-[#0B1926] via-[#0B1926] to-[#2d1a1a]">
      {/* Left Side */}
      <div className="flex flex-col h-full flex-1 p-12 min-w-0">
      <Logo />
        <div className="flex flex-col flex-1 justify-center mt-[-150px] items-start">
         
          <h1 className="text-white text-4xl font-semibold mt-16 mb-8 leading-tight">
            La rigueur budgétaire,<br />au service des fonctions CIH.
          </h1>
        </div>
        <p className="text-gray-400 text-sm">Usage réservé aux fonctionnaires CIH</p>
      </div>
      {/* Right Side */}
      <div className="flex items-center justify-center flex-1 min-w-0">
        <div
          className="w-[400px] rounded-2xl p-10 shadow-2xl border border-white/20 backdrop-blur-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(10,20,40,0.7) 60%, rgba(0,174,239,0.3) 80%, rgba(241,90,41,0.3) 100%)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
          }}
        >
          <h2 className="text-white text-2xl font-semibold mb-8">Authentification</h2>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1">
              <label className="text-white text-base mb-1 flex items-center gap-1">
                <span className="material-icons text-white mr-2">mail</span>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full px-4 py-2 rounded-md bg-transparent border ${error ? 'border-red-500' : 'border-blue-400'} text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                placeholder=""
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-white text-base mb-1 flex items-center gap-1">
                <span className="material-icons text-white mr-2">lock</span>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`w-full px-4 py-2 rounded-md bg-transparent border ${error ? 'border-red-500' : 'border-blue-400'} text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                placeholder=""
                required
                disabled={isLoading}
              />
            </div>
            <a href="#" className="text-sm text-blue-200 hover:underline self-start">Mot de passe oublié ?</a>
            {error && <div className="text-red-400 text-sm -mt-4 text-center">{error}</div>}
            <div className="relative flex items-center justify-center mt-2 group">
              {/* Sparkles (only on hover) */}
              <span className="absolute -left-4 -top-2 w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <span className="absolute -left-3 top-5 w-1 h-1 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <span className="absolute -right-4 -top-2 w-1.5 h-1.5 rounded-full bg-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <span className="absolute -right-3 top-5 w-1 h-1 rounded-full bg-pink-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <button
                type="submit"
                disabled={isLoading}
                className="relative px-8 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-blue-700 to-indigo-500 shadow-md border border-transparent transition-all duration-300 text-xl focus:outline-none focus:ring-2 focus:ring-orange-400 group-hover:bg-transparent group-hover:border-orange-500 group-hover:shadow-none group-hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 