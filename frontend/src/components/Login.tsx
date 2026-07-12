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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#F7F7F2]">
      {/* SECCIÓN IZQUIERDA: Banner Informativo Estilo RevoLink */}
      <div 
        className="hidden lg:flex lg:col-span-6 text-white p-12 flex-col justify-between relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1590102422319-6a836190a60a?auto=format&fit=crop&w=1200&q=80')" }}
      >
        {/* Filtro Oscuro de Superposición */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#123524]/92 via-[#0b2217]/96 to-[#0b2217]/98 z-0"></div>
        
        {/* LOGO */}
        <div className="flex items-center gap-2 z-10">
          <span className="text-[#C6E24C] text-2xl font-bold">♻</span>
          <span className="text-xl font-extrabold tracking-tight">RevoLink</span>
        </div>

        {/* CONTENIDO CENTRAL */}
        <div className="space-y-6 z-10 max-w-md">
          <div className="flex items-center gap-1.5 text-[#C6E24C] font-bold text-xs uppercase tracking-wider">
            <span>⚠</span> EL PROBLEMA
          </div>
          <h2 className="text-4xl font-black tracking-tight leading-none text-[#F7F7F2]">
            De Residuos a Riqueza.
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Millones de toneladas de caucho industrial se desechan anualmente. El Círculo Revo transforma esta carga ecológica en materiales sostenibles de alta calidad para el sector de la industria pesada.
          </p>
        </div>

        {/* FOOTER */}
        <div className="text-[10px] text-slate-400 z-10">
          © 2026 RevoLink Inc. Todos los derechos reservados.
        </div>
      </div>

      {/* SECCIÓN DERECHA: Formulario de Login */}
      <div 
        className="col-span-1 lg:col-span-6 flex items-center justify-center p-6 sm:p-12 bg-cover bg-center relative"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80')" }}
      >
        {/* Filtro suave con desenfoque de fondo */}
        <div className="absolute inset-0 bg-[#F7F7F2]/80 backdrop-blur-sm z-0"></div>

        <div className="w-full max-w-md bg-white border border-[#E7E7E1] rounded-3xl p-8 sm:p-10 shadow-lg space-y-8 animate-fadeIn z-10">
          {/* HEADER LOGIN */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 lg:hidden">
              <span className="text-[#123524] text-3xl font-bold">♻</span>
              <span className="text-xl font-extrabold text-[#123524] tracking-tight">RevoLink</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#14181A] tracking-tight">Iniciar Sesión</h1>
            <p className="text-xs text-[#5B6570]">
              Acceda a la plataforma de suministro y logística circular
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
              Usuario (Cliente)
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
    </div>
  );
};
