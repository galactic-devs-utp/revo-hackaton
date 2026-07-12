import React, { useState } from 'react';

interface LoginProps {
  onLogin: (role: 'user' | 'admin', email: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, complete todos los campos.');
      return;
    }

    // Simple demo validation
    if (role === 'admin') {
      if (email === 'admin@revolink.com' && password === 'admin123') {
        onLogin('admin', email);
      } else {
        setError('Credenciales de administrador incorrectas (admin@revolink.com / admin123).');
      }
    } else {
      if (email === 'cliente@revolink.com' && password === 'cliente123') {
        onLogin('user', email);
      } else {
        setError('Credenciales de usuario incorrectas (cliente@revolink.com / cliente123).');
      }
    }
  };

  const fillCredentials = (selectedRole: 'user' | 'admin') => {
    setRole(selectedRole);
    if (selectedRole === 'admin') {
      setEmail('admin@revolink.com');
      setPassword('admin123');
    } else {
      setEmail('cliente@revolink.com');
      setPassword('cliente123');
    }
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#123524] via-[#0f2d1e] to-[#0b2217] p-6">
      {/* CENTRED LOGO */}
      <div className="flex flex-col items-center gap-2 mb-8 animate-fadeIn">
        <span className="text-[#C6E24C] text-5xl font-bold">♻</span>
        <span className="text-3xl font-black text-white tracking-tight">RevoLink</span>
      </div>

      {/* LOGIN CARD */}
      <div className="w-full max-w-md bg-white border border-[#E7E7E1] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8 animate-fadeIn">
        {/* HEADER LOGIN */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-extrabold text-[#14181A] tracking-tight">Iniciar Sesión</h1>
          <p className="text-xs text-[#5B6570]">
            Acceso al portal de logística circular
          </p>
        </div>

        {/* TOGGLE DE ROLES */}
        <div className="grid grid-cols-2 p-1 bg-[#F7F7F2] rounded-xl border border-[#E7E7E1]">
          <button
            type="button"
            onClick={() => { setRole('user'); setError(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              role === 'user'
                ? 'bg-[#123524] text-white shadow-sm'
                : 'text-[#5B6570] hover:text-[#14181A]'
            }`}
          >
            Cliente
          </button>
          <button
            type="button"
            onClick={() => { setRole('admin'); setError(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              role === 'admin'
                ? 'bg-[#123524] text-white shadow-sm'
                : 'text-[#5B6570] hover:text-[#14181A]'
            }`}
          >
            Administrador
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-[#5B6570] uppercase tracking-wider mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              placeholder="ejemplo@revolink.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F7F7F2] border border-[#E7E7E1] rounded-xl p-3 text-xs font-medium text-[#14181A] focus:border-[#123524] focus:bg-white outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#5B6570] uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F7F7F2] border border-[#E7E7E1] rounded-xl p-3 text-xs font-medium text-[#14181A] focus:border-[#123524] focus:bg-white outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#123524] hover:bg-[#0b2217] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md mt-6"
          >
            Ingresar al Portal ➔
          </button>
        </form>

        {/* CREDENCIALES DE DEMO */}
        <div className="border-t border-slate-100 pt-6 space-y-3">
          <span className="block text-[10px] font-bold text-[#96A0A8] uppercase tracking-wider text-center">
            Credenciales rápidas para la demo
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('user')}
              className="flex-1 border border-[#E7E7E1] hover:bg-[#F7F7F2] py-2 px-3 rounded-lg text-[10px] font-bold text-[#123524] transition-all"
            >
              Cargar Cliente
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin')}
              className="flex-1 border border-[#E7E7E1] hover:bg-[#F7F7F2] py-2 px-3 rounded-lg text-[10px] font-bold text-[#123524] transition-all"
            >
              Cargar Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
