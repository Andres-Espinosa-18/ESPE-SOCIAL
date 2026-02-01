import React, { useState, useEffect } from 'react';
import { ViewState, NewsItem, Club, NotificationItem, User } from '../../types';
import { ArrowLeft, Search, Bell, Calendar, MessageSquare, Info, Flag, Dumbbell, Code, Music, Cpu, CheckCircle, X, Send, Save, User as UserIcon, Mail, Phone, Book } from 'lucide-react';

/* --- NOTIFICATIONS --- */
export const NotificationsScreen: React.FC = () => {
   const [activeFilter, setActiveFilter] = useState<'ALL' | 'AVISOS' | 'EVENTOS' | 'FOROS'>('ALL');
   const [notifications, setNotifications] = useState<NotificationItem[]>([]);
   const [loading, setLoading] = useState(true);

   // Dynamic API URL
   const API_URL = `http://${window.location.hostname}:3000/api`;

   useEffect(() => {
       const userString = localStorage.getItem('user');
       if (!userString) return;
       const user: User = JSON.parse(userString);

       fetch(`${API_URL}/notifications?user_id=${user.id}`)
           .then(res => res.json())
           .then(data => {
               setNotifications(data);
               setLoading(false);
           })
           .catch(err => setLoading(false));
   }, []);

   const handleRead = async (id: number) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        
        await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PUT' });
   };

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
               <div 
                  key={item.id} 
                  onClick={() => handleRead(item.id)}
                  className={`rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all border cursor-pointer
                     ${item.is_read ? 'bg-white border-gray-100 opacity-70' : 'bg-blue-50/50 border-blue-100'}
                  `}
               >
                  <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color_class || 'bg-gray-100 text-gray-600'}`}>
                        {getIcon(item.type)}
                     </div>
                     <div>
                        <p className={`text-sm md:text-base ${item.is_read ? 'font-medium text-gray-600' : 'font-bold text-gray-900'}`}>{item.title}</p>
                        <p className="text-xs text-gray-400 font-medium">{item.time_ago}</p>
                     </div>
                  </div>
                  {!item.is_read && <div className="w-2 h-2 rounded-full bg-espe-green shadow-sm shadow-green-200"></div>}
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
   const [selectedClub, setSelectedClub] = useState<any | null>(null); // State for modal
   
   // Dynamic API URL
   const API_URL = `http://${window.location.hostname}:3000/api`;

   const loadClubs = () => {
       const userString = localStorage.getItem('user');
       const user: User | null = userString ? JSON.parse(userString) : null;
       const userId = user ? user.id : 0;

       fetch(`${API_URL}/clubs?user_id=${userId}`)
         .then(res => res.json())
         .then(data => setClubs(data));
   };

   useEffect(() => {
       loadClubs();
   }, []);

   const handleJoin = async (e: React.MouseEvent, clubId: number) => {
      e.stopPropagation(); // Prevent modal opening
      const userString = localStorage.getItem('user');
      if (!userString) return;
      const user: User = JSON.parse(userString);

      const res = await fetch(`${API_URL}/clubs/join`, {
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
                  <div key={club.id} onClick={() => setSelectedClub(club)} className="cursor-pointer bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all group flex flex-col h-full">
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
                        <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                           {club.description}
                        </p>
                        
                        <button 
                           onClick={(e) => handleJoin(e, club.id)}
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

         {/* CLUB DETAIL MODAL */}
         {selectedClub && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                 <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedClub(null)}></div>
                 <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl animate-fade-in-up overflow-hidden">
                     <div className="relative h-48">
                         <img src={selectedClub.image} className="w-full h-full object-cover" />
                         <button onClick={() => setSelectedClub(null)} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
                             <X size={20}/>
                         </button>
                     </div>
                     <div className="p-8">
                         <div className="flex items-center gap-3 mb-4">
                             <div className={`p-2 rounded-xl ${selectedClub.color_class}`}>
                                {getClubIcon(selectedClub.icon_name)}
                             </div>
                             <h2 className="text-2xl font-bold text-gray-900">{selectedClub.title}</h2>
                         </div>
                         <p className="text-gray-700 leading-relaxed mb-6">
                             {selectedClub.description}
                         </p>
                         <button 
                            onClick={(e) => {
                                handleJoin(e, selectedClub.id);
                                setSelectedClub(null);
                            }}
                            disabled={selectedClub.is_joined === 1}
                            className="w-full bg-espe-green text-white font-bold py-3 rounded-xl hover:bg-espe-darkGreen disabled:opacity-50"
                         >
                             {selectedClub.is_joined === 1 ? 'Ya eres miembro' : 'Unirse al Club'}
                         </button>
                     </div>
                 </div>
             </div>
         )}
      </div>
   );
};

/* --- SUGGESTIONS (Fully Functional) --- */
export const SuggestionsScreen: React.FC = () => {
   const [category, setCategory] = useState('General');
   const [subject, setSubject] = useState('');
   const [message, setMessage] = useState('');
   const [loading, setLoading] = useState(false);

   // Dynamic API URL
   const API_URL = `http://${window.location.hostname}:3000/api`;

   const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       const userString = localStorage.getItem('user');
       if (!userString) return;
       const user: User = JSON.parse(userString);

       setLoading(true);
       try {
           const res = await fetch(`${API_URL}/suggestions`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                   user_id: user.id,
                   category,
                   subject,
                   message
               })
           });
           const data = await res.json();
           if(data.success) {
               alert('¡Sugerencia enviada! Gracias por tu opinión.');
               setSubject('');
               setMessage('');
           } else {
               alert('Error al enviar la sugerencia.');
           }
       } catch(err) {
           alert('Error de conexión.');
       } finally {
           setLoading(false);
       }
   };

   return (
      <div className="space-y-6 max-w-2xl mx-auto">
         <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Centro de Ayuda y Sugerencias</h2>
            <p className="text-gray-500 text-sm mt-1">¿Tienes problemas o ideas? Cuéntanos.</p>
         </div>
         
         <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
             <form onSubmit={handleSubmit} className="space-y-5">
                 <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Categoría</label>
                     <div className="flex flex-wrap gap-2">
                         {['General', 'Bug', 'Mejora', 'Reclamo'].map(cat => (
                             <button
                                type="button"
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${category === cat ? 'bg-espe-green text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                             >
                                 {cat}
                             </button>
                         ))}
                     </div>
                 </div>

                 <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Asunto</label>
                     <input 
                        type="text" 
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-espe-green outline-none"
                        placeholder="Resumen breve..."
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                     />
                 </div>

                 <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mensaje</label>
                     <textarea 
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-espe-green outline-none h-32 resize-none"
                        placeholder="Describe tu situación en detalle..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                     ></textarea>
                 </div>

                 <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                 >
                     <Send size={18} />
                     {loading ? 'Enviando...' : 'Enviar Sugerencia'}
                 </button>
             </form>
         </div>
      </div>
   );
};

/* --- PROFILE SCREEN (New) --- */
export const ProfileScreen: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editBio, setEditBio] = useState('');
    const [editPhone, setEditPhone] = useState('');

    // Dynamic API URL
    const API_URL = `http://${window.location.hostname}:3000/api`;

    useEffect(() => {
        const localUser = localStorage.getItem('user');
        if (localUser) {
            const u = JSON.parse(localUser);
            fetchUser(u.id);
        }
    }, []);

    const fetchUser = (id: number) => {
        fetch(`${API_URL}/users/${id}`)
            .then(res => res.json())
            .then(data => {
                setUser(data);
                setEditBio(data.bio || '');
                setEditPhone(data.phone || '');
            });
    };

    const handleSave = async () => {
        if (!user) return;
        const res = await fetch(`${API_URL}/users/${user.id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ bio: editBio, phone: editPhone })
        });
        if (res.ok) {
            setIsEditing(false);
            fetchUser(user.id);
            // Update local storage for basic info persistence
            localStorage.setItem('user', JSON.stringify({ ...user, bio: editBio, phone: editPhone }));
        } else {
            alert('Error al actualizar perfil');
        }
    };

    if (!user) return <div className="text-center p-10">Cargando perfil...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                <div className="h-40 bg-gradient-to-r from-espe-green to-espe-lime relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center shadow-lg">
                            <UserIcon size={50} className="text-gray-300"/>
                        </div>
                    </div>
                </div>
                <div className="pt-16 pb-8 px-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">{user.role}</span>
                        </div>
                        <button 
                            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${isEditing ? 'bg-espe-green text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            {isEditing ? <><Save size={16}/> Guardar</> : 'Editar Perfil'}
                        </button>
                    </div>

                    <div className="mt-8 grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-800 border-b pb-2">Información Académica</h3>
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Book size={20}/></div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">ID Estudiante</p>
                                    <p className="font-semibold text-gray-800">{user.student_id}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><Mail size={20}/></div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Correo Institucional</p>
                                    <p className="font-semibold text-gray-800">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-800 border-b pb-2">Sobre mí</h3>
                            
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Biografía</p>
                                {isEditing ? (
                                    <textarea 
                                        className="w-full border rounded-lg p-2 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-espe-green"
                                        rows={3}
                                        value={editBio}
                                        onChange={e => setEditBio(e.target.value)}
                                        placeholder="Cuéntanos algo sobre ti..."
                                    />
                                ) : (
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {user.bio || 'Sin biografía.'}
                                    </p>
                                )}
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Teléfono / Contacto</p>
                                {isEditing ? (
                                    <input 
                                        type="text"
                                        className="w-full border rounded-lg p-2 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-espe-green"
                                        value={editPhone}
                                        onChange={e => setEditPhone(e.target.value)}
                                        placeholder="+593 ..."
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <Phone size={14} className="text-gray-400"/> {user.phone || 'No registrado'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
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