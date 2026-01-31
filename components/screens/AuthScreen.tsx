import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, CreditCard } from 'lucide-react';

interface AuthScreenProps {
  onLogin: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regId, setRegId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Guardar usuario en localStorage si deseas persistencia básica
            localStorage.setItem('user', JSON.stringify(data.user));
            onLogin();
        } else {
            setError(data.message || 'Error al iniciar sesión');
        }
    } catch (err) {
        setError('Error de conexión con el servidor. Asegúrate que XAMPP y el Backend estén corriendo.');
    } finally {
        setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (regPass !== regConfirmPass) {
        setError('Las contraseñas no coinciden');
        return;
    }

    setLoading(true);
    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: regName, 
                student_id: regId, 
                email: regEmail, 
                password: regPass 
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('Registro exitoso. Por favor inicia sesión.');
            setIsRegistering(false);
        } else {
            setError('Error al registrarse. Verifique los datos.');
        }
    } catch (err) {
        setError('Error de conexión con el servidor.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl text-center relative overflow-hidden transition-all duration-500">
        
        {/* Header / Logo */}
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 tracking-wide mb-6">RED SOCIAL ESPE</h1>
            <div className="flex justify-center">
            <div className="w-24 h-24 border-4 border-espe-green rounded-2xl flex flex-col items-center justify-center bg-white shadow-inner">
                <span className="text-3xl font-bold text-espe-green">U</span>
                <span className="text-xs font-bold text-espe-green mt-1">ESPE</span>
            </div>
            </div>
        </div>

        {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm font-bold">
                {error}
            </div>
        )}

        {/* --- LOGIN FORM --- */}
        {!isRegistering ? (
            <div className="animate-fade-in-up">
                <h2 className="text-xl font-bold text-gray-700 mb-6">Iniciar Sesión</h2>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        <input 
                            type="email" 
                            placeholder="Correo Institucional" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-espe-green transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        <input 
                            type="password" 
                            placeholder="Contraseña" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-espe-green transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-espe-lime text-espe-darkGreen font-bold py-3.5 rounded-xl shadow-md hover:brightness-105 transition-all mt-4 disabled:opacity-50"
                    >
                        {loading ? 'CARGANDO...' : 'INGRESAR'}
                    </button>
                </form>

                <div className="mt-8 border-t border-gray-100 pt-6">
                    <p className="text-gray-500 text-sm mb-3">¿No tienes una cuenta?</p>
                    <button 
                        type="button"
                        onClick={() => setIsRegistering(true)}
                        className="w-full bg-espe-red text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-red-600 transition-all"
                    >
                        CREAR CUENTA
                    </button>
                </div>
            </div>
        ) : (
            /* --- REGISTER FORM --- */
            <div className="animate-fade-in-up">
                <div className="flex items-center justify-start mb-4">
                    <button onClick={() => setIsRegistering(false)} className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm font-bold">
                        <ArrowLeft size={16} /> Volver
                    </button>
                </div>
                <h2 className="text-xl font-bold text-gray-700 mb-6">Registro Estudiantil</h2>
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Nombre Completo" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-espe-green"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="ID / Matrícula" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-espe-green"
                            value={regId}
                            onChange={(e) => setRegId(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        <input 
                            type="email" 
                            placeholder="Correo Institucional" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-espe-green"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        <input 
                            type="password" 
                            placeholder="Contraseña" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-espe-green"
                            value={regPass}
                            onChange={(e) => setRegPass(e.target.value)}
                            required
                        />
                    </div>
                     <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        <input 
                            type="password" 
                            placeholder="Confirmar Contraseña" 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-espe-green"
                            value={regConfirmPass}
                            onChange={(e) => setRegConfirmPass(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-espe-green text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-espe-darkGreen transition-all mt-4 disabled:opacity-50"
                    >
                        {loading ? 'REGISTRANDO...' : 'REGISTRARSE'}
                    </button>
                </form>
            </div>
        )}

        <p className="mt-8 text-[10px] text-gray-400 leading-tight">
          Al hacer clic en continuar, aceptas nuestros <span className="font-bold text-gray-600">Términos de servicio</span> y <span className="font-bold text-gray-600">Política de privacidad</span>
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;