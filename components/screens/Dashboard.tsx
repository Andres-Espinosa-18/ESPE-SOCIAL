import React, { useState, useEffect } from 'react';
import { ViewState, NewsItem } from '../../types';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
  onSelectNews: (news: NewsItem) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectNews }) => {
  const [alertTab, setAlertTab] = useState<'ACADEMICO' | 'ADMIN' | 'EVENTOS'>('ACADEMICO');
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch News from Backend
  useEffect(() => {
    fetch('http://localhost:3000/api/news')
      .then(res => res.json())
      .then(data => {
        // Map database fields if necessary or assume they match NewsItem interface
        // The SQL uses string for date, so it maps directly
        setNewsData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch news:', err);
        setLoading(false);
      });
  }, []);

  const alerts = {
    'ACADEMICO': {
      title: 'Recordatorio Académico',
      date: '22 de Dic.',
      content: 'El periodo de inscripción para materias de suficiencia termina este viernes. No olvides revisar tu carga horaria.',
      color: 'bg-espe-green'
    },
    'ADMIN': {
      title: 'Mantenimiento de Sistemas',
      date: '23 de Dic.',
      content: 'La plataforma Banner estará en mantenimiento desde las 22:00 hasta las 04:00 por actualizaciones de seguridad.',
      color: 'bg-blue-600'
    },
    'EVENTOS': {
      title: 'Fiesta de Navidad',
      date: '24 de Dic.',
      content: 'Te invitamos al programa de navidad en el coliseo principal. Habrá música en vivo y premios.',
      color: 'bg-espe-red'
    }
  };

  const currentAlert = alerts[alertTab];

  const weekDays = [
    { name: 'LUN', date: 22, active: false },
    { name: 'MAR', date: 23, active: true, label: 'Calificaciones', color: 'border-espe-red', text: 'text-espe-red' },
    { name: 'MIÉ', date: 24, active: true, label: 'Feriado', color: 'border-blue-500', text: 'text-blue-500' },
    { name: 'JUE', date: 25, active: true, label: 'Navidad', color: 'border-green-500', text: 'text-green-500' },
    { name: 'VIE', date: 26, active: false },
    { name: 'SÁB', date: 27, active: false },
    { name: 'DOM', date: 28, active: false },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-bold text-gray-800">Hola, Estudiante</h2>
            <p className="text-gray-500">Bienvenido a tu panel principal</p>
         </div>
         <span className="text-sm font-bold text-espe-green bg-green-50 px-3 py-1 rounded-full">SII - 2025</span>
      </div>

      {/* Mini Calendar - Full Week */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 text-lg">Esta Semana</h3>
          <button onClick={() => onNavigate(ViewState.CALENDAR)} className="text-espe-green text-sm font-bold hover:underline">Ver calendario completo</button>
        </div>
        <div className="grid grid-cols-7 gap-2">
           {weekDays.map((day, idx) => (
             <div key={idx} className={`relative flex flex-col items-center p-2 rounded-xl transition-all ${day.active ? 'bg-gray-50' : ''}`}>
                <span className="text-[10px] font-bold text-gray-400 mb-1">{day.name}</span>
                <span className={`text-xl font-bold ${day.active ? 'text-gray-800' : 'text-gray-400'}`}>{day.date}</span>
                {day.label && (
                  <div className={`mt-2 w-full text-center border-t-4 ${day.color} pt-1`}>
                     <span className={`hidden md:block text-[9px] font-bold uppercase ${day.text}`}>{day.label}</span>
                     <div className={`md:hidden mx-auto w-1.5 h-1.5 rounded-full ${day.color.replace('border-', 'bg-')}`}></div>
                  </div>
                )}
             </div>
           ))}
        </div>
      </div>

      {/* Functional Alerts/Avisos */}
      <div>
         <h3 className="font-bold text-gray-800 text-lg mb-3">Avisos y Comunicados</h3>
         <div className={`${currentAlert.color} rounded-3xl p-6 text-white shadow-lg transition-colors duration-300 relative overflow-hidden min-h-[180px]`}>
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            
            <div className="flex space-x-6 mb-6 relative z-10 border-b border-white/20 pb-2">
               <button 
                  onClick={() => setAlertTab('ACADEMICO')}
                  className={`font-bold text-sm transition-opacity ${alertTab === 'ACADEMICO' ? 'opacity-100 border-b-2 border-white pb-2 -mb-2.5' : 'opacity-60 hover:opacity-80'}`}
               >
                  Académico
               </button>
               <button 
                  onClick={() => setAlertTab('ADMIN')}
                  className={`font-bold text-sm transition-opacity ${alertTab === 'ADMIN' ? 'opacity-100 border-b-2 border-white pb-2 -mb-2.5' : 'opacity-60 hover:opacity-80'}`}
               >
                  Administrativo
               </button>
               <button 
                  onClick={() => setAlertTab('EVENTOS')}
                  className={`font-bold text-sm transition-opacity ${alertTab === 'EVENTOS' ? 'opacity-100 border-b-2 border-white pb-2 -mb-2.5' : 'opacity-60 hover:opacity-80'}`}
               >
                  Eventos
               </button>
            </div>
            
            <div className="animate-fade-in relative z-10">
               <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-xl">{currentAlert.title}</h4>
                  <div className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium whitespace-nowrap backdrop-blur-sm">{currentAlert.date}</div>
               </div>
               <p className="text-sm md:text-base opacity-90 leading-relaxed max-w-2xl">
                  {currentAlert.content}
               </p>
            </div>
         </div>
      </div>

      {/* News Feed from Database */}
      <div>
         <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-lg">Noticias Destacadas</h3>
         </div>
         {loading ? (
           <div className="text-center py-10 text-gray-400">Cargando noticias de la base de datos...</div>
         ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {newsData.length > 0 ? newsData.map(news => (
                 <div key={news.id} onClick={() => onSelectNews(news)} className="cursor-pointer group bg-white rounded-2xl p-3 hover:shadow-lg transition-all duration-300 border border-gray-100">
                    <div className="rounded-xl overflow-hidden aspect-video mb-3 shadow-sm relative">
                       <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <span className="text-white text-xs font-bold">Leer más</span>
                       </div>
                    </div>
                    <div className="px-1">
                       <span className="text-[10px] font-bold text-espe-green uppercase tracking-wider">{news.author}</span>
                       <p className="text-sm font-bold text-gray-800 leading-tight mt-1 line-clamp-2">{news.summary}</p>
                       <p className="text-xs text-gray-400 mt-2">{news.date}</p>
                    </div>
                 </div>
              )) : (
                <div className="col-span-3 text-center text-gray-500">No hay noticias registradas.</div>
              )}
           </div>
         )}
      </div>
    </div>
  );
};

export default Dashboard;