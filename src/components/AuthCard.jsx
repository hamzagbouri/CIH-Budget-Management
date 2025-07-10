import InputField from './InputField';
import { useState } from 'react';

export default function AuthCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="w-[400px] rounded-2xl p-10 bg-gradient-to-br from-[#1a2236]/90 via-blue-900/80 to-[#2d1a1a]/80 border border-white/20 backdrop-blur-2xl shadow-2xl">
      <h2 className="text-white text-2xl font-semibold mb-10 text-center">Authentification</h2>
      <form className="flex flex-col gap-7">
        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder=""
          icon={<span className="material-icons text-gray-400 mr-2">mail</span>}
          borderColor={error ? 'border-red-500' : 'border-blue-500'}
        />
        <InputField
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder=""
          icon={<span className="material-icons text-gray-400 mr-2">lock</span>}
          borderColor={error ? 'border-red-500' : 'border-blue-500'}
          rightIcon={
            <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)} className="focus:outline-none">
              <span className="material-icons text-gray-400">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          }
        />
        {error && <div className="text-red-400 text-sm -mt-4">{error}</div>}
        <div className="flex items-center justify-between -mt-2">
          <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer">
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="accent-blue-500" />
            Se souvenir de moi
          </label>
          <a href="#" className="text-sm text-gray-300 hover:underline">Mot de passe oublié ?</a>
        </div>
        <button type="submit" className="mt-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors">Se connecter</button>
      </form>
    </div>
  );
} 