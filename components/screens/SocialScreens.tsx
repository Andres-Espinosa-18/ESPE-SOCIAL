import React, { useState, useEffect } from 'react';
import { ViewState, StudyGroup, ForumPost, User } from '../../types';
import { Search, Plus, MoreHorizontal, ArrowLeft, Image as ImageIcon, Mic, Smile, MapPin, Users, User as UserIcon, Heart, MessageCircle, Share2, Bookmark, Calendar, Clock, BookOpen, X } from 'lucide-react';

/* --- FORUM SCREEN --- */
export const ForumsScreen: React.FC<{ onNavigate: (v: ViewState) => void }> = ({ onNavigate }) => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  
  const fetchPosts = () => {
      fetch('http://localhost:3000/api/forums')
      .then(res => res.json())
      .then(data => {
          setPosts(data);
          setLoading(false);
      })
      .catch(err => setLoading(false));
  };

  useEffect(() => {
      fetchPosts();
  }, []);

  const toggleLike = (id: string) => {
    setLikedPosts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-gray-800">Foros de Discusión</h2>
         <div className="flex gap-2">
            <button onClick={fetchPosts} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 text-gray-600 text-xs font-bold px-4">Actualizar</button>
         </div>
      </div>

      <div className="space-y-6 pb-20 max-w-2xl mx-auto w-full">
         {loading ? (
             <div className="text-center text-gray-400">Cargando discusiones...</div>
         ) : posts.length === 0 ? (
             <div className="text-center text-gray-400">Aún no hay discusiones. ¡Sé el primero!</div>
         ) : (
             posts.map(post => {
            const isLiked = likedPosts.includes(post.id);
            
            return (
            <div key={post.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
               <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <img src={post.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="avatar" />
                     <div>
                        <p className="text-sm font-bold text-gray-900">{post.author} {(post as any).role === 'admin' && <span className="text-[10px] bg-gray-800 text-white px-1 rounded ml-1">ADMIN</span>}</p>
                        <p className="text-xs text-gray-400 font-medium">{post.timeAgo}</p>
                     </div>
                  </div>
                  <button className="text-gray-400 hover:bg-gray-100 p-1 rounded-full"><MoreHorizontal size={20} /></button>
               </div>

               {post.content && (
                  <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">
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
               </div>
            </div>
         )})
         )}
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
   const [content, setContent] = useState('');
   const [loading, setLoading] = useState(false);
   
   const handlePublish = async () => {
       const userString = localStorage.getItem('user');
       if (!userString) return;
       const user: User = JSON.parse(userString);

       if (!content.trim()) return;

       setLoading(true);
       try {
           const res = await fetch('http://localhost:3000/api/forums', {
               method: 'POST',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({
                   user_id: user.id,
                   author_name: user.name,
                   content: content,
                   image: '' // Opcional: Implementar subida de imagenes luego
               })
           });
           const data = await res.json();
           if(data.success) {
               onBack(); // Volver y recargar
           } else {
               alert('Error al publicar');
           }
       } catch (err) {
           console.error(err);
           alert('Error de conexión');
       } finally {
           setLoading(false);
       }
   };

   return (
      <div className="h-full flex flex-col bg-white rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
         <div className="flex justify-between items-center mb-6">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={24} className="text-gray-800"/></button>
            <button 
                onClick={handlePublish}
                disabled={loading}
                className="bg-espe-green text-white px-6 py-2 rounded-full font-bold text-sm shadow-md hover:brightness-105 disabled:opacity-50"
            >
                {loading ? 'Publicando...' : 'Publicar'}
            </button>
         </div>
         
         <textarea 
            className="flex-1 resize-none border-none outline-none text-lg text-gray-600 placeholder-gray-300 w-full bg-transparent"
            placeholder="¿Qué quieres compartir con la comunidad?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
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

/* --- STUDY GROUPS (Mocked for now as per request focus on others) --- */
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
                     <span className="flex items-center gap-1"><UserIcon size={14}/> {group.createdBy}</span>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}

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
             {/* Form logic here (same as before) */}
            <p className="text-center text-gray-500 italic">Funcionalidad en desarrollo...</p>
            <div className="pt-4">
               <button type="submit" className="w-full bg-espe-green text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-espe-darkGreen transition-colors">
                  Crear Grupo (Demo)
               </button>
            </div>
         </form>
      </div>
   );
}

export const StudyGroupDetailScreen: React.FC<{ group: StudyGroup | null, onBack: () => void }> = ({ group, onBack }) => {
   if (!group) return null;
   return (
      <div className="bg-white min-h-[500px] rounded-3xl p-8 relative shadow-sm border border-gray-100 max-w-3xl mx-auto">
         <button onClick={onBack} className="mb-4 p-2 bg-gray-100 rounded-full"><ArrowLeft size={24}/></button>
         <h1 className="text-2xl font-bold">{group.title}</h1>
         <p className="mt-4">{group.description}</p>
      </div>
   );
}