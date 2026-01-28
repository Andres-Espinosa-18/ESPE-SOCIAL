import React, { useState } from 'react';
import { ViewState, StudyGroup, ForumPost } from '../../types';
import { Search, Plus, MoreHorizontal, ArrowLeft, Image as ImageIcon, Mic, Smile, MapPin, Users, User, Heart, MessageCircle, Share2, Bookmark, Calendar, Clock, BookOpen, X } from 'lucide-react';

/* --- FORUM SCREEN --- */
export const ForumsScreen: React.FC<{ onNavigate: (v: ViewState) => void }> = ({ onNavigate }) => {
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);

  const toggleLike = (id: string) => {
    setLikedPosts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedPosts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const posts: ForumPost[] = [
    {
      id: '1',
      author: 'Helena',
      timeAgo: 'Hace 3 minutos',
      avatar: 'https://i.pravatar.cc/150?u=1',
      content: '¿Alguien tiene los apuntes de Ecuaciones Diferenciales de hoy? No pude asistir a la primera hora.',
      image: 'https://picsum.photos/400/200?random=10',
      commentsCount: 2,
      likesCount: 5,
      sharesCount: 0
    },
    {
       id: '2',
       author: 'Daniel',
       timeAgo: 'Hace 2 horas',
       avatar: 'https://i.pravatar.cc/150?u=2',
       content: 'Opinión impopular: La comida del bar principal ha mejorado mucho este semestre. 🍔',
       commentsCount: 15,
       likesCount: 42,
       sharesCount: 3
    },
    {
       id: '3',
       author: 'Roberto',
       timeAgo: 'Hace 5 horas',
       avatar: 'https://i.pravatar.cc/150?u=3',
       content: 'Se busca equipo para el Hackathon de la próxima semana. Necesitamos un diseñador UX/UI.',
       commentsCount: 8,
       likesCount: 12,
       sharesCount: 5
    }
  ];

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-gray-800">Foros de Discusión</h2>
         <div className="flex gap-2">
            <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><Search size={20} className="text-gray-600"/></button>
         </div>
      </div>

      <div className="space-y-6 pb-20 max-w-2xl mx-auto w-full">
         {posts.map(post => {
            const isLiked = likedPosts.includes(post.id);
            const isSaved = bookmarkedPosts.includes(post.id);
            
            return (
            <div key={post.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
               <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <img src={post.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="avatar" />
                     <div>
                        <p className="text-sm font-bold text-gray-900">{post.author}</p>
                        <p className="text-xs text-gray-400 font-medium">{post.timeAgo}</p>
                     </div>
                  </div>
                  <button className="text-gray-400 hover:bg-gray-100 p-1 rounded-full"><MoreHorizontal size={20} /></button>
               </div>

               {post.content && (
                  <p className="text-gray-700 mb-4 leading-relaxed">
                     {post.content}
                  </p>
               )}
               
               {post.image && (
                  <div className="rounded-2xl overflow-hidden mb-4 border border-gray-100">
                     <img src={post.image} alt="post content" className="w-full object-cover max-h-80" />
                  </div>
               )}

               <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2">
                  <div className="flex gap-6">
                     <button 
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-2 text-sm font-bold transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                     >
                        <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                        <span>{post.likesCount + (isLiked ? 1 : 0)}</span>
                     </button>
                     <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-500 transition-colors">
                        <MessageCircle size={20} />
                        <span>{post.commentsCount}</span>
                     </button>
                     <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-green-500 transition-colors">
                        <Share2 size={20} />
                        <span>{post.sharesCount}</span>
                     </button>
                  </div>
                  <button onClick={() => toggleBookmark(post.id)} className={`transition-colors ${isSaved ? 'text-espe-green' : 'text-gray-400 hover:text-espe-green'}`}>
                     <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} />
                  </button>
               </div>
            </div>
         )})}
      </div>

      <button 
        onClick={() => onNavigate(ViewState.CREATE_FORUM)}
        className="fixed bottom-8 right-8 z-30 bg-espe-green text-white p-4 rounded-full shadow-lg hover:bg-espe-darkGreen transition-transform hover:scale-110 flex items-center justify-center"
      >
         <Plus size={28} />
      </button>
    </div>
  );
};

/* --- CREATE FORUM SCREEN --- */
export const CreateForumScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
   return (
      <div className="h-full flex flex-col bg-white rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
         <div className="flex justify-between items-center mb-6">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={24} className="text-gray-800"/></button>
            <button className="bg-espe-green text-white px-6 py-2 rounded-full font-bold text-sm shadow-md hover:brightness-105">Publicar</button>
         </div>

         <input 
            type="text" 
            placeholder="Título de la discusión" 
            className="text-2xl font-bold placeholder-gray-400 border-none outline-none mb-4 w-full bg-transparent"
         />
         
         <textarea 
            className="flex-1 resize-none border-none outline-none text-lg text-gray-600 placeholder-gray-300 w-full bg-transparent"
            placeholder="¿Qué estás pensando?"
         ></textarea>

         <div className="mt-auto border-t pt-4">
             <div className="flex gap-4 text-espe-green mb-4">
                <button className="p-2 hover:bg-green-50 rounded-lg"><ImageIcon size={24} /></button>
                <button className="p-2 hover:bg-green-50 rounded-lg"><MapPin size={24} /></button>
                <button className="p-2 hover:bg-green-50 rounded-lg"><Smile size={24} /></button>
             </div>
         </div>
      </div>
   );
}

/* --- STUDY GROUPS LIST --- */
export const StudyGroupsScreen: React.FC<{ onSelect: (g: StudyGroup) => void, onCreate: () => void }> = ({ onSelect, onCreate }) => {
   const groups: StudyGroup[] = [1,2,3,4].map(i => ({
      id: `g${i}`,
      title: i % 2 === 0 ? 'Repaso Cálculo Vectorial' : 'Proyecto Estructura de Datos',
      description: 'Grupo dedicado a resolver ejercicios del capítulo 4 y 5 para el examen del martes.',
      date: '10-12-2025',
      createdBy: `Estudiante ${i}`,
      members: 3 + i
   }));

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
               <Users className="text-espe-green" size={28}/> Grupos de Estudio
            </h2>
            <button 
               onClick={onCreate}
               className="bg-espe-green text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-espe-darkGreen transition-colors flex items-center gap-2"
            >
               <Plus size={18} /> Crear Grupo
            </button>
         </div>

         <div className="relative">
             <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
             <input type="text" placeholder="Buscar materia o tema..." className="w-full pl-12 pr-4 py-3 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-espe-green" />
         </div>

         <div className="grid md:grid-cols-2 gap-4">
            {groups.map(group => (
               <div key={group.id} onClick={() => onSelect(group)} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-espe-green cursor-pointer transition-all hover:shadow-md group">
                  <div className="flex justify-between items-start mb-3">
                     <div className="w-12 h-12 rounded-xl bg-green-50 text-espe-green flex items-center justify-center">
                        <BookOpen size={24} />
                     </div>
                     <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                        <Users size={12}/> {group.members} Miembros
                     </span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-espe-green transition-colors">{group.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{group.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400 border-t pt-3">
                     <span className="flex items-center gap-1"><Calendar size={14}/> {group.date}</span>
                     <span className="flex items-center gap-1"><User size={14}/> {group.createdBy}</span>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}

/* --- CREATE STUDY GROUP SCREEN --- */
export const CreateStudyGroupScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
   return (
      <div className="bg-white rounded-3xl p-8 shadow-md max-w-2xl mx-auto">
         <div className="flex items-center justify-between mb-8 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">Crear Grupo de Estudio</h2>
            <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
               <X size={20} className="text-gray-600"/>
            </button>
         </div>

         <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onBack(); }}>
            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">Tema o Título del Grupo</label>
               <input type="text" placeholder="Ej: Repaso para Examen de Física" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-espe-green" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Materia</label>
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-espe-green">
                     <option>Seleccionar...</option>
                     <option>Cálculo</option>
                     <option>Física</option>
                     <option>Programación</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Ubicación</label>
                  <input type="text" placeholder="Ej: Biblioteca, Lab 1" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-espe-green" />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Fecha</label>
                  <div className="relative">
                     <Calendar className="absolute left-3 top-3.5 text-gray-400" size={18} />
                     <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-espe-green" />
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Hora</label>
                  <div className="relative">
                     <Clock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                     <input type="time" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-espe-green" />
                  </div>
               </div>
            </div>

            <div>
               <label className="block text-sm font-bold text-gray-700 mb-2">Descripción</label>
               <textarea rows={4} placeholder="Describe los objetivos de la sesión de estudio..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-espe-green resize-none"></textarea>
            </div>

            <div className="pt-4">
               <button type="submit" className="w-full bg-espe-green text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-espe-darkGreen transition-colors">
                  Crear Grupo
               </button>
            </div>
         </form>
      </div>
   );
}

/* --- STUDY GROUP DETAIL --- */
export const StudyGroupDetailScreen: React.FC<{ group: StudyGroup | null, onBack: () => void }> = ({ group, onBack }) => {
   if (!group) return null;

   return (
      <div className="bg-white min-h-[500px] rounded-3xl p-8 relative shadow-sm border border-gray-100 max-w-3xl mx-auto">
         <div className="flex items-center gap-4 mb-8">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={24} /></button>
            <h2 className="text-xl font-bold flex-1 text-center flex items-center justify-center gap-2">
               Detalle del Grupo
            </h2>
            <div className="w-6"></div> 
         </div>

         <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-espe-green to-espe-lime flex items-center justify-center mb-4 shadow-lg text-white">
               <BookOpen size={48} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">{group.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
               <User size={14} />
               <span className="font-medium">Organizado por: {group.createdBy}</span>
            </div>
         </div>

         <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Acerca de la sesión</h3>
            <p className="text-gray-700 leading-relaxed text-justify">
               {group.description}
            </p>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-xl text-center">
               <Calendar className="mx-auto text-blue-500 mb-2" size={20}/>
               <p className="text-xs font-bold text-gray-500 uppercase">Fecha</p>
               <p className="font-bold text-gray-800">{group.date}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl text-center">
               <Clock className="mx-auto text-purple-500 mb-2" size={20}/>
               <p className="text-xs font-bold text-gray-500 uppercase">Hora</p>
               <p className="font-bold text-gray-800">14:00 PM</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl text-center">
               <MapPin className="mx-auto text-orange-500 mb-2" size={20}/>
               <p className="text-xs font-bold text-gray-500 uppercase">Lugar</p>
               <p className="font-bold text-gray-800">Biblioteca</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl text-center">
               <Users className="mx-auto text-espe-green mb-2" size={20}/>
               <p className="text-xs font-bold text-gray-500 uppercase">Cupos</p>
               <p className="font-bold text-gray-800">{group.members} / 10</p>
            </div>
         </div>

         <button className="w-full bg-espe-green text-white font-bold py-4 rounded-xl shadow-lg hover:bg-espe-darkGreen transition-all transform hover:-translate-y-1">
            Unirse al Grupo
         </button>
      </div>
   );
}