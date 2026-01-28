import React, { useState } from 'react';
import { ViewState } from '../types';
import { Menu, Home, Calendar, MessageSquare, Users, Bell, MessageCircle, X, LogOut, User, Flag } from 'lucide-react';

interface LayoutProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onNavigate, children, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { view: ViewState.HOME, label: 'Página de Inicio', icon: Home },
    { view: ViewState.CALENDAR, label: 'Calendario', icon: Calendar },
    { view: ViewState.FORUMS, label: 'Foros', icon: MessageSquare },
    { view: ViewState.STUDY_GROUPS, label: 'Grupo de estudio', icon: Users },
    { view: ViewState.CLUBS, label: 'Clubes', icon: Flag },
    { view: ViewState.NOTIFICATIONS, label: 'Notificaciones', icon: Bell },
    { view: ViewState.SUGGESTIONS, label: 'Sugerencias', icon: MessageCircle },
  ];

  const handleNav = (view: ViewState) => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Universal Top Bar */}
      <div className="bg-white px-6 py-4 shadow-sm flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 text-espe-green hover:bg-green-50 rounded-full transition-colors">
            <Menu size={28} />
          </button>
          <div className="flex flex-col">
            <span className="font-bold text-xl text-espe-green tracking-wider leading-none">ESPE</span>
            <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Social Network</span>
          </div>
        </div>
        <div className="p-2 bg-purple-100 rounded-full text-purple-600 cursor-pointer hover:bg-purple-200 transition-colors">
           <User size={24} />
        </div>
      </div>

      {/* Navigation Drawer (Overlay) */}
      <div className={`
        fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
        
        <div className="relative bg-white h-full w-80 shadow-2xl flex flex-col p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
             <span className="text-gray-500 text-sm font-semibold uppercase">Navegación</span>
             <button onClick={() => setIsMenuOpen(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={24} className="text-espe-green" /></button>
          </div>

          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 border-4 border-espe-green rounded-full flex items-center justify-center mb-3">
              <User size={40} className="text-espe-green" />
            </div>
            <h3 className="font-bold text-gray-800">Estudiante ESPE</h3>
            <p className="text-xs text-gray-500">L00392929</p>
          </div>

          <nav className="flex-1 space-y-3">
            {menuItems.map((item) => (
              <button
                key={item.view}
                onClick={() => handleNav(item.view)}
                className={`w-full flex items-center space-x-4 px-6 py-3.5 rounded-xl transition-all duration-200
                  ${currentView === item.view || (currentView === ViewState.STUDY_GROUP_DETAIL && item.view === ViewState.STUDY_GROUPS) || (currentView === ViewState.NEWS_DETAIL && item.view === ViewState.HOME)
                    ? 'bg-espe-green text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 border-t pt-6 flex flex-col items-center">
             <button onClick={onLogout} className="w-full flex items-center justify-center space-x-2 text-red-500 hover:bg-red-50 py-3 rounded-xl transition-colors font-medium">
                <LogOut size={18} />
                <span>Cerrar Sesión</span>
             </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
           {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;