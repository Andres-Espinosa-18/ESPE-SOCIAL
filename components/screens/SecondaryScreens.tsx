import React, { useState } from 'react';
import { ViewState, NewsItem } from '../../types';
import { ArrowLeft, Search, Bell, Calendar, MessageSquare, Info, Flag, Dumbbell, Code, Music, Cpu, CheckCircle } from 'lucide-react';

/* --- NOTIFICATIONS --- */
export const NotificationsScreen: React.FC = () => {
   const [activeFilter, setActiveFilter] = useState<'ALL' | 'AVISOS' | 'EVENTOS' | 'FOROS'>('ALL');

   const notifications = [
      { id: 1, type: 'AVISOS', title: 'Mantenimiento Sistema', time: 'Hace 1 hora', icon: <Info size={16}/>, color: 'bg-red-100 text-red-600' },
      { id: 2, type: 'FOROS', title: 'Juan comentó en tu post', time: 'Hace 2 horas', icon: <MessageSquare size={16}/>, color: 'bg-blue-100 text-blue-600' },
      { id: 3, type: 'EVENTOS', title: 'Mañana: Fiestas de Quito', time: 'Hace 5 horas', icon: <Calendar size={16}/>, color: 'bg-green-100 text-green-600' },
      { id: 4, type: 'FOROS', title: 'Nuevo like en tu respuesta', time: 'Ayer', icon: <MessageSquare size={16}/>, color: 'bg-blue-100 text-blue-600' },
      { id: 5, type: 'AVISOS', title: 'Carga de notas parcial 2', time: 'Ayer', icon: <Info size={16}/>, color: 'bg-red-100 text-red-600' },
      { id: 6, type: 'EVENTOS', title: 'Recordatorio Examen', time: 'Hace 2 días', icon: <Calendar size={16}/>, color: 'bg-green-100 text-green-600' },
   ];

   const filteredNotifs = activeFilter === 'ALL' ? notifications : notifications.filter(n => n.type === activeFilter);

   const filters = [
      { id: 'ALL', label: 'Todas' },
      { id: 'AVISOS', label: 'Avisos' },
      { id: 'EVENTOS', label: 'Calendario' },
      { id: 'FOROS', label: 'Interacción' },
   ];

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
            {filteredNotifs.map((item) => (
               <div key={item.id} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow border border-gray-50">
                  <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                        {item.icon}
                     </div>
                     <div>
                        <p className="font-bold text-gray-800 text-sm md:text-base">{item.title}</p>
                        <p className="text-xs text-gray-400 font-medium">{item.time}</p>
                     </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-espe-green"></div>
               </div>
            ))}
            {filteredNotifs.length === 0 && (
               <div className="text-center py-10 text-gray-400">
                  No hay notificaciones en esta categoría.
               </div>
            )}
         </div>
      </div>
   );
};

/* --- SUGGESTIONS --- */
export const SuggestionsScreen: React.FC = () => {
   return (
      <div className="space-y-6 max-w-2xl mx-auto">
         <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Centro de Ayuda y Sugerencias</h2>
            <p className="text-gray-500 text-sm mt-1">Tu opinión nos ayuda a mejorar</p>
         </div>

         <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
            <h3 className="font-bold text-gray-800 mb-4">Envíanos tu sugerencia</h3>
            <textarea 
               className="w-full h-32 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-espe-green text-gray-800 placeholder-gray-400"
               placeholder="Describe tu problema o sugerencia aquí..."
            ></textarea>
            <button className="w-full bg-espe-red text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-red-600 transition-all">
               Enviar Mensaje
            </button>
         </div>

         <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-center text-sm font-bold text-gray-500 mb-6 uppercase tracking-widest">Preguntas Frecuentes</h3>
            <div className="space-y-3">
               {[
                  '¿Cómo cambio mi correo institucional?',
                  '¿Qué debo hacer si olvido mi contraseña?',
                  '¿Mis foros y respuestas son anónimos?',
                  '¿Dónde veo mi horario de clases?',
               ].map((q, i) => (
                  <button key={i} className="w-full text-left py-4 px-6 rounded-2xl text-sm font-bold bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors flex justify-between items-center group">
                     {q}
                     <span className="text-gray-300 group-hover:text-gray-600 transition-colors">→</span>
                  </button>
               ))}
            </div>
         </div>
      </div>
   );
};

/* --- CLUBS SCREEN --- */
export const ClubsScreen: React.FC = () => {
   const [joinedClubs, setJoinedClubs] = useState<string[]>([]);

   const handleJoin = (id: string) => {
      if (!joinedClubs.includes(id)) {
         setJoinedClubs([...joinedClubs, id]);
         alert('¡Te has inscrito correctamente al club!');
      }
   };

   const clubs = [
      {
         id: 'soft',
         title: 'Club de Software',
         description: 'Desarrollo web, móvil, hackathons y proyectos open source.',
         image: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?q=80&w=3540&auto=format&fit=crop',
         icon: <Code size={24} />,
         color: 'bg-blue-100 text-blue-600'
      },
      {
         id: 'danza',
         title: 'Club de Danza',
         description: 'Expresión corporal, ritmos latinos, modernos y folclor.',
         image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?q=80&w=3540&auto=format&fit=crop',
         icon: <Music size={24} />,
         color: 'bg-pink-100 text-pink-600'
      },
      {
         id: 'gym',
         title: 'Fisicoculturismo',
         description: 'Entrenamiento de fuerza, nutrición deportiva y bienestar físico.',
         image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=3540&auto=format&fit=crop',
         icon: <Dumbbell size={24} />,
         color: 'bg-orange-100 text-orange-600'
      },
      {
         id: 'meca',
         title: 'Club de Mecatrónica',
         description: 'Robótica, automatización, diseño 3D y circuitos electrónicos.',
         image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=3540&auto=format&fit=crop',
         icon: <Cpu size={24} />,
         color: 'bg-purple-100 text-purple-600'
      }
   ];

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
               const isJoined = joinedClubs.includes(club.id);
               return (
                  <div key={club.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all group flex flex-col h-full">
                     <div className="h-40 overflow-hidden relative">
                        <img src={club.image} alt={club.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-4 left-4 p-2 bg-white rounded-xl shadow-md">
                           <div className={club.color + " p-1 rounded-lg"}>
                              {club.icon}
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

/* --- NEWS DETAIL --- */
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

         <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
            <div className="w-10 h-10 rounded-full bg-espe-green text-white flex items-center justify-center font-bold">
               {news.author.charAt(0)}
            </div>
            <div>
               <p className="font-bold text-gray-800 text-sm">{news.author}</p>
               <p className="text-gray-400 text-xs">{news.date}</p>
            </div>
         </div>

         <div className="rounded-3xl overflow-hidden mb-8 shadow-lg">
            <img src={news.image} alt={news.title} className="w-full object-cover max-h-[400px]" />
         </div>

         <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p className="font-bold text-xl text-gray-900 mb-4">{news.summary}</p>
            <p className="mb-4">
               {news.content}
            </p>
            <p className="mb-4">
               Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
            <p>
               Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
         </div>
      </div>
   );
};