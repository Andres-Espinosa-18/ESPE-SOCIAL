import React, { useState, useEffect } from 'react';
import { ViewState, NewsItem, Club, NotificationItem, User } from '../../types';
import { ArrowLeft, Search, Bell, Calendar, MessageSquare, Info, Flag, Dumbbell, Code, Music, Cpu, CheckCircle } from 'lucide-react';

/* --- NOTIFICATIONS --- */
export const NotificationsScreen: React.FC = () => {
   const [activeFilter, setActiveFilter] = useState<'ALL' | 'AVISOS' | 'EVENTOS' | 'FOROS'>('ALL');
   const [notifications, setNotifications] = useState<NotificationItem[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
       const userString = localStorage.getItem('user');
       if (!userString) return;
       const user: User = JSON.parse(userString);

       fetch(`http://localhost:3000/api/notifications?user_id=${user.id}`)
           .then(res => res.json())
           .then(data => {
               setNotifications(data);
               setLoading(false);
           })
           .catch(err => setLoading(false));
   }, []);

   const filteredNotifs = activeFilter === 'ALL' ? notifications : notifications.filter(n => n.type === activeFilter);

   const filters = [
      { id: 'ALL', label: 'Todas' },
      { id: 'AVISOS', label: 'Avisos' },
      { id: 'EVENTOS', label: 'Calendario' },
      { id: 'FOROS', label: 'Interacción' },
   ];

   const getIcon = (type: string) => {
       switch(type) {
           case 'AVISOS': return <Info size={16}/>;
           case 'FOROS': return <MessageSquare size={16}/>;
           case 'EVENTOS': return <Calendar size={16}/>;
           default: return <Bell size={16}/>;
       }
   };

   return (
      <div className="space-y-6 max-w-2xl mx-auto">
         <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="text-espe-green" /> Notificaciones
         </h2>
         
         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {filters.map(f => (
               <button 
                  key={f.id} 
                  onClick={() => setActiveFilter(f.id as any)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap
                     ${activeFilter === f.id 
                        ? 'bg-espe-green text-white shadow-md' 
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`
                  }
               >
                  {f.label}
               </button>
            ))}
         </div>

         <div className="space-y-3">
            {loading ? <p className="text-center text-gray-400">Cargando...</p> : 
             filteredNotifs.length > 0 ? filteredNotifs.map((item) => (
               <div key={item.id} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow border border-gray-50">
                  <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color_class || 'bg-gray-100 text-gray-600'}`}>
                        {getIcon(item.type)}
                     </div>
                     <div>
                        <p className="font-bold text-gray-800 text-sm md:text-base">{item.title}</p>
                        <p className="text-xs text-gray-400 font-medium">{item.time_ago}</p>
                     </div>
                  </div>
                  {!item.is_read && <div className="w-2 h-2 rounded-full bg-espe-green"></div>}
               </div>
            )) : (
               <div className="text-center py-10 text-gray-400">
                  No hay notificaciones en esta categoría.
               </div>
            )}
         </div>
      </div>
   );
};

/* --- CLUBS SCREEN --- */
export const ClubsScreen: React.FC = () => {
   const [clubs, setClubs] = useState<any[]>([]);
   
   const loadClubs = () => {
       const userString = localStorage.getItem('user');
       const user: User | null = userString ? JSON.parse(userString) : null;
       const userId = user ? user.id : 0;

       fetch(`http://localhost:3000/api/clubs?user_id=${userId}`)
         .then(res => res.json())
         .then(data => setClubs(data));
   };

   useEffect(() => {
       loadClubs();
   }, []);

   const handleJoin = async (clubId: number) => {
      const userString = localStorage.getItem('user');
      if (!userString) return;
      const user: User = JSON.parse(userString);

      const res = await fetch('http://localhost:3000/api/clubs/join', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ user_id: user.id, club_id: clubId })
      });
      const data = await res.json();
      if(data.success) {
          alert('¡Inscripción exitosa!');
          loadClubs(); // Recargar estado
      } else {
          alert('Error al inscribirse');
      }
   };

   // Helper to render icon dynamically
   const getClubIcon = (name: string) => {
       switch(name) {
           case 'Code': return <Code size={24}/>;
           case 'Music': return <Music size={24}/>;
           case 'Dumbbell': return <Dumbbell size={24}/>;
           case 'Cpu': return <Cpu size={24}/>;
           default: return <Flag size={24}/>;
       }
   };

   return (
      <div className="space-y-8">
         <div className="flex items-center gap-3">
            <div className="bg-espe-green p-3 rounded-2xl text-white shadow-lg">
               <Flag size={28} />
            </div>
            <div>
               <h2 className="text-2xl font-bold text-gray-800">Clubes Universitarios</h2>
               <p className="text-gray-500">Únete a una comunidad y desarrolla nuevas habilidades</p>
            </div>
         </div>

         <div className="grid md:grid-cols-2 gap-6">
            {clubs.map(club => {
               const isJoined = club.is_joined === 1;
               return (
                  <div key={club.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all group flex flex-col h-full">
                     <div className="h-40 overflow-hidden relative">
                        <img src={club.image} alt={club.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-4 left-4 p-2 bg-white rounded-xl shadow-md">
                           <div className={club.color_class + " p-1 rounded-lg"}>
                              {getClubIcon(club.icon_name)}
                           </div>
                        </div>
                     </div>
                     <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{club.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">
                           {club.description}
                        </p>
                        
                        <button 
                           onClick={() => handleJoin(club.id)}
                           disabled={isJoined}
                           className={`w-full font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2
                              ${isJoined 
                                 ? 'bg-green-100 text-espe-green cursor-default' 
                                 : 'bg-gray-900 text-white hover:bg-espe-green shadow-md hover:shadow-lg'
                              }`}
                        >
                           {isJoined ? (
                              <>
                                 <CheckCircle size={20} />
                                 <span>Inscrito</span>
                              </>
                           ) : (
                              'Inscribirse'
                           )}
                        </button>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
   );
};

/* --- SUGGESTIONS (Static for now) --- */
export const SuggestionsScreen: React.FC = () => {
   return (
      <div className="space-y-6 max-w-2xl mx-auto">
         <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Centro de Ayuda y Sugerencias</h2>
            <p className="text-gray-500 text-sm mt-1">Tu opinión nos ayuda a mejorar</p>
         </div>
         {/* ... (Same as existing static content) ... */}
         <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
             <p className="text-gray-400">Funcionalidad en mantenimiento.</p>
         </div>
      </div>
   );
};

export const NewsDetailScreen: React.FC<{ news: NewsItem, onBack: () => void }> = ({ news, onBack }) => {
   return (
      <div className="bg-white min-h-screen md:min-h-0 rounded-none md:rounded-3xl p-8 shadow-none md:shadow-md max-w-4xl mx-auto">
         <div className="flex items-center mb-6">
            <button onClick={onBack} className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 mr-4 transition-colors">
               <ArrowLeft size={24} />
            </button>
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Volver a noticias</span>
         </div>
         <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">{news.title}</h1>
         <div className="rounded-3xl overflow-hidden mb-8 shadow-lg">
            <img src={news.image} alt={news.title} className="w-full object-cover max-h-[400px]" />
         </div>
         <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p className="font-bold text-xl text-gray-900 mb-4">{news.summary}</p>
            <p>{news.content}</p>
         </div>
      </div>
   );
};