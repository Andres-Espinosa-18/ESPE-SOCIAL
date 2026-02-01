import React, { useState, useEffect } from 'react';
import { ViewState, NewsItem, User, Announcement, UserEvent } from '../../types';
import { PlusCircle, X } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
  onSelectNews: (news: NewsItem) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onSelectNews }) => {
  const [alertTab, setAlertTab] = useState<'ACADEMICO' | 'ADMIN' | 'EVENTOS'>('ACADEMICO');
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [currentAlert, setCurrentAlert] = useState<Announcement | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Admin Modal State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminTitle, setAdminTitle] = useState('');
  const [adminContent, setAdminContent] = useState('');
  
  const userString = localStorage.getItem('user');
  const user: User | null = userString ? JSON.parse(userString) : null;
  const isAdmin = user?.role === 'admin';

  // Fetch Data
  useEffect(() => {
    setLoading(true);
    // 1. Fetch News
    fetch('http://localhost:3000/api/news')
      .then(res => res.json())
      .then(data => setNewsData(data))
      .catch(err => console.error(err));

    // 2. Fetch Default Announcement (Academico)
    fetchAnnouncement('ACADEMICO');

    // 3. Fetch Calendar Events for Mini Calendar
    if (user) {
        fetch(`http://localhost:3000/api/calendar?user_id=${user.id}`)
            .then(res => res.json())
            .then(data => setCalendarEvents(data))
            .catch(err => console.error(err));
    }
  }, []);

  const fetchAnnouncement = (type: string) => {
      fetch(`http://localhost:3000/api/announcements?type=${type}`)
        .then(res => res.json())
        .then(data => {
            if (data && data.length > 0) {
                setCurrentAlert(data[0]);
            } else {
                setCurrentAlert({
                    id: 0,
                    type: type as any,
                    title: 'Sin avisos recientes',
                    date: 'Hoy',
                    content: `No hay avisos registrados en la categoría ${type.toLowerCase()}.`
                });
            }
            setLoading(false);
        });
  };

  const handleTabChange = (tab: 'ACADEMICO' | 'ADMIN' | 'EVENTOS') => {
      setAlertTab(tab);
      fetchAnnouncement(tab);
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      if (!isAdmin) {
          alert('No tienes permisos de administrador.');
          return;
      }

      try {
          const res = await fetch('http://localhost:3000/api/announcements', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  user_id: user.id,
                  type: alertTab, // Publish to current tab
                  title: adminTitle,
                  date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
                  content: adminContent
              })
          });
          const data = await res.json();
          if (data.success) {
              alert('Aviso publicado correctamente');
              setShowAdminModal(false);
              setAdminTitle('');
              setAdminContent('');
              fetchAnnouncement(alertTab); // Refresh
          } else {
              alert(data.message || 'Error al publicar');
          }
      } catch (err) {
          alert('Error de conexión');
      }
  };

  // --- Dynamic Week Logic ---
  const getWeekDays = () => {
    const curr = new Date();
    const days = [];
    // Start from Monday (1) to Sunday (7). Adjust logic so array is Mon-Sun
    // getDay() returns 0 for Sunday.
    const currentDay = curr.getDay() === 0 ? 7 : curr.getDay(); 
    
    // Set to Monday
    curr.setDate(curr.getDate() - currentDay + 1);

    for (let i = 0; i < 7; i++) {
        const d = new Date(curr);
        days.push(d);
        curr.setDate(curr.getDate() + 1);
    }
    return days;
  };

  const weekDays = getWeekDays().map(dateObj => {
      const dateStr = dateObj.toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];
      const dayName = new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(dateObj).toUpperCase().replace('.', '');
      const dayNum = dateObj.getDate();
      
      // Find events for this day
      const dayEvents = calendarEvents.filter(e => e.event_date === dateStr);
      const hasEvent = dayEvents.length > 0;
      const firstEvent = hasEvent ? dayEvents[0] : null;

      return {
          name: dayName,
          date: dayNum,
          active: dateStr === todayStr,
          hasEvent: hasEvent,
          eventLabel: firstEvent?.type_label,
          eventColor: firstEvent?.color.replace('bg-', 'border-').replace('text-', '') || 'border-gray-300',
          eventText: firstEvent?.color.replace('bg-', 'text-') || 'text-gray-500',
          dateObj: dateObj
      };
  });

  // Helper for colors based on current tab
  const getAlertColor = () => {
      switch(alertTab) {
          case 'ACADEMICO': return 'bg-espe-green';
          case 'ADMIN': return 'bg-blue-600';
          case 'EVENTOS': return 'bg-espe-red';
          default: return 'bg-gray-600';
      }
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-bold text-gray-800">Hola, {user?.name.split(' ')[0]}</h2>
            <p className="text-gray-500">
                {isAdmin ? 'Panel de Administrador' : 'Bienvenido a tu panel principal'}
            </p>
         </div>
         <span className="text-sm font-bold text-espe-green bg-green-50 px-3 py-1 rounded-full">SII - 2025</span>
      </div>

      {/* Mini Calendar (Dynamic) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 text-lg">Esta Semana</h3>
          <button onClick={() => onNavigate(ViewState.CALENDAR)} className="text-espe-green text-sm font-bold hover:underline">Ver calendario completo</button>
        </div>
        <div className="grid grid-cols-7 gap-2">
           {weekDays.map((day, idx) => (
             <div key={idx} className={`relative flex flex-col items-center p-2 rounded-xl transition-all ${day.active ? 'bg-gray-50 ring-1 ring-gray-200' : ''}`}>
                <span className={`text-[10px] font-bold mb-1 ${day.active ? 'text-espe-green' : 'text-gray-400'}`}>{day.name}</span>
                <span className={`text-xl font-bold ${day.active ? 'text-gray-800' : 'text-gray-400'}`}>{day.date}</span>
                {day.hasEvent ? (
                  <div className={`mt-2 w-full text-center border-t-4 ${day.eventColor} pt-1`}>
                     <span className={`hidden md:block text-[9px] font-bold uppercase ${day.eventText} truncate px-1`}>{day.eventLabel}</span>
                     <div className={`md:hidden mx-auto w-1.5 h-1.5 rounded-full ${day.eventColor.replace('border-', 'bg-')}`}></div>
                  </div>
                ) : (
                    <div className="mt-2 w-full h-4"></div> /* Spacer */
                )}
             </div>
           ))}
        </div>
      </div>

      {/* Avisos Section */}
      <div>
         <div className="flex justify-between items-center mb-3">
             <h3 className="font-bold text-gray-800 text-lg">Avisos y Comunicados</h3>
             {isAdmin && (
                 <button 
                    onClick={() => setShowAdminModal(true)} 
                    className="flex items-center gap-1 text-xs font-bold bg-gray-800 text-white px-3 py-1 rounded-lg hover:bg-black"
                 >
                    <PlusCircle size={14}/> Publicar Aviso
                 </button>
             )}
         </div>

         <div className={`${getAlertColor()} rounded-3xl p-6 text-white shadow-lg transition-colors duration-300 relative overflow-hidden min-h-[180px]`}>
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            
            <div className="flex space-x-6 mb-6 relative z-10 border-b border-white/20 pb-2">
               {['ACADEMICO', 'ADMIN', 'EVENTOS'].map((tab) => (
                   <button 
                        key={tab}
                        onClick={() => handleTabChange(tab as any)}
                        className={`font-bold text-sm transition-opacity ${alertTab === tab ? 'opacity-100 border-b-2 border-white pb-2 -mb-2.5' : 'opacity-60 hover:opacity-80'}`}
                   >
                      {tab.charAt(0) + tab.slice(1).toLowerCase()}
                   </button>
               ))}
            </div>
            
            <div className="animate-fade-in relative z-10">
               {currentAlert ? (
                   <>
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-xl">{currentAlert.title}</h4>
                        <div className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium whitespace-nowrap backdrop-blur-sm">{currentAlert.date}</div>
                    </div>
                    <p className="text-sm md:text-base opacity-90 leading-relaxed max-w-2xl">
                        {currentAlert.content}
                    </p>
                   </>
               ) : (
                   <p className="opacity-70">Cargando aviso...</p>
               )}
            </div>
         </div>
      </div>

      {/* News Feed */}
      <div>
         <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-lg">Noticias Destacadas</h3>
         </div>
         {loading && newsData.length === 0 ? (
           <div className="text-center py-10 text-gray-400">Cargando...</div>
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

      {/* ADMIN MODAL */}
      {showAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAdminModal(false)}></div>
             <div className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in-up">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-gray-800">Publicar Aviso ({alertTab})</h3>
                     <button onClick={() => setShowAdminModal(false)}><X size={20}/></button>
                 </div>
                 <form onSubmit={handlePublishAnnouncement} className="space-y-4">
                     <input 
                        type="text" 
                        placeholder="Título del aviso" 
                        className="w-full bg-gray-50 border p-3 rounded-xl"
                        value={adminTitle}
                        onChange={e => setAdminTitle(e.target.value)}
                        required
                     />
                     <textarea 
                        placeholder="Contenido del mensaje..." 
                        className="w-full bg-gray-50 border p-3 rounded-xl h-32 resize-none"
                        value={adminContent}
                        onChange={e => setAdminContent(e.target.value)}
                        required
                     ></textarea>
                     <button className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black">
                         Publicar Ahora
                     </button>
                 </form>
             </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;