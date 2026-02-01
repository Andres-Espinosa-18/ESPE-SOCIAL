import React, { useState, useEffect, useRef } from 'react';
import { ViewState, StudyGroup, ForumPost, User } from '../../types';
import { Search, Plus, MoreHorizontal, ArrowLeft, Image as ImageIcon, Smile, Users, User as UserIcon, Heart, MessageCircle, Share2, Calendar, BookOpen, X, CheckCircle } from 'lucide-react';

/* --- FORUM SCREEN --- */
export const ForumsScreen: React.FC<{ onNavigate: (v: ViewState) => void }> = ({ onNavigate }) => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [myLikes, setMyLikes] = useState<string[]>([]);
  
  const fetchPosts = () => {
      fetch('http://localhost:3000/api/forums')
      .then(res => res.json())
      .then(data => {
          setPosts(data);
          setLoading(false);
      })
      .catch(err => setLoading(false));
  };

  const fetchMyLikes = () => {
      const userString = localStorage.getItem('user');
      if (!userString) return;
      const user = JSON.parse(userString);
      fetch(`http://localhost:3000/api/forums/mylikes?user_id=${user.id}`)
          .then(res => res.json())
          .then(data => setMyLikes(data));
  };

  useEffect(() => {
      fetchPosts();
      fetchMyLikes();
  }, []);

  const handleLike = async (postId: string) => {
    const userString = localStorage.getItem('user');
    if (!userString) return;
    const user = JSON.parse(userString);

    // Optimistic Update
    const isLiked = myLikes.includes(postId);
    setMyLikes(prev => isLiked ? prev.filter(id => id !== postId) : [...prev, postId]);
    setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, likesCount: p.likesCount + (isLiked ? -1 : 1) } : p
    ));

    await fetch('http://localhost:3000/api/forums/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, user_id: user.id })
    });
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
            const isLiked = myLikes.includes(post.id);
            
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
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 text-sm font-bold transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                     >
                        <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                        <span>{post.likesCount}</span>
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
   const [imageFile, setImageFile] = useState<string | null>(null);
   const [showEmoji, setShowEmoji] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);
   
   const emojis = ['😀', '😂', '😍', '🤔', '😎', '😭', '👍', '🔥', '🎉', '❤️'];

   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
       const file = e.target.files?.[0];
       if (file) {
           const reader = new FileReader();
           reader.onloadend = () => {
               setImageFile(reader.result as string);
           };
           reader.readAsDataURL(file);
       }
   };

   const addEmoji = (emoji: string) => {
       setContent(prev => prev + emoji);
       setShowEmoji(false);
   };
   
   const handlePublish = async () => {
       const userString = localStorage.getItem('user');
       if (!userString) return;
       const user: User = JSON.parse(userString);

       if (!content.trim() && !imageFile) return;

       setLoading(true);
       try {
           const res = await fetch('http://localhost:3000/api/forums', {
               method: 'POST',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({
                   user_id: user.id,
                   author_name: user.name,
                   content: content,
                   image: imageFile || ''
               })
           });
           const data = await res.json();
           if(data.success) {
               onBack(); 
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
            className="flex-1 resize-none border-none outline-none text-lg text-gray-600 placeholder-gray-300 w-full bg-transparent p-2"
            placeholder="¿Qué quieres compartir con la comunidad?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
         ></textarea>

         {imageFile && (
             <div className="relative mb-4">
                 <img src={imageFile} alt="Preview" className="h-32 rounded-xl object-cover border" />
                 <button onClick={() => setImageFile(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X size={12}/></button>
             </div>
         )}

         {/* Emoji Picker */}
         {showEmoji && (
             <div className="bg-white border rounded-xl shadow-lg p-2 flex gap-2 mb-2 animate-fade-in absolute bottom-20">
                 {emojis.map(e => (
                     <button key={e} onClick={() => addEmoji(e)} className="text-xl hover:scale-125 transition-transform">{e}</button>
                 ))}
             </div>
         )}

         <div className="mt-auto border-t pt-4">
             <div className="flex gap-4 text-espe-green mb-4 items-center">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-green-50 rounded-lg"><ImageIcon size={24} /></button>
                
                <button onClick={() => setShowEmoji(!showEmoji)} className="p-2 hover:bg-green-50 rounded-lg"><Smile size={24} /></button>
                {/* Location removed as requested */}
             </div>
         </div>
      </div>
   );
}

/* --- STUDY GROUPS --- */
export const StudyGroupsScreen: React.FC<{ onSelect: (g: StudyGroup) => void, onCreate: () => void }> = ({ onSelect, onCreate }) => {
   const [activeTab, setActiveTab] = useState<'EXPLORE' | 'MY'>('EXPLORE');
   const [groups, setGroups] = useState<StudyGroup[]>([]);
   const [searchTerm, setSearchTerm] = useState('');
   const [loading, setLoading] = useState(true);

   const loadGroups = () => {
       setLoading(true);
       const userString = localStorage.getItem('user');
       if (!userString) return;
       const user = JSON.parse(userString);

       const endpoint = activeTab === 'EXPLORE' ? 'http://localhost:3000/api/study_groups' : `http://localhost:3000/api/study_groups/my?user_id=${user.id}`;

       fetch(endpoint)
       .then(res => res.json())
       .then(data => {
           setGroups(data);
           setLoading(false);
       });
   };

   useEffect(() => {
       loadGroups();
   }, [activeTab]);

   const filteredGroups = groups.filter(g => 
       g.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       g.description.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const handleJoin = async (e: React.MouseEvent, group: StudyGroup) => {
       e.stopPropagation();
       const userString = localStorage.getItem('user');
       if (!userString) return;
       const user = JSON.parse(userString);

       const res = await fetch('http://localhost:3000/api/study_groups/join', {
           method: 'POST',
           headers: {'Content-Type': 'application/json'},
           body: JSON.stringify({ group_id: group.id, user_id: user.id })
       });
       const data = await res.json();
       if(data.success) {
           alert(data.message);
           loadGroups();
       } else {
           alert(data.message || 'Error al unirse');
       }
   };

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

         {/* Tabs */}
         <div className="flex gap-4 border-b border-gray-200 pb-1">
             <button 
                onClick={() => setActiveTab('EXPLORE')} 
                className={`pb-2 px-2 font-bold transition-colors ${activeTab === 'EXPLORE' ? 'text-espe-green border-b-2 border-espe-green' : 'text-gray-400'}`}
             >
                 Explorar
             </button>
             <button 
                onClick={() => setActiveTab('MY')} 
                className={`pb-2 px-2 font-bold transition-colors ${activeTab === 'MY' ? 'text-espe-green border-b-2 border-espe-green' : 'text-gray-400'}`}
             >
                 Mis Grupos
             </button>
         </div>

         <div className="relative">
             <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
             <input 
                type="text" 
                placeholder="Buscar materia o tema..." 
                className="w-full pl-12 pr-4 py-3 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-espe-green bg-white"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
             />
         </div>

         {loading ? (
             <div className="text-center text-gray-400">Cargando grupos...</div>
         ) : filteredGroups.length === 0 ? (
             <div className="text-center text-gray-400">No se encontraron grupos.</div>
         ) : (
            <div className="grid md:grid-cols-2 gap-4">
                {filteredGroups.map(group => (
                <div key={group.id} onClick={() => onSelect(group)} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-espe-green cursor-pointer transition-all hover:shadow-md group relative">
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
                    
                    <div className="flex items-center justify-between border-t pt-3">
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                            <span className="flex items-center gap-1"><Calendar size={14}/> {group.date}</span>
                            <span className="flex items-center gap-1"><UserIcon size={14}/> {group.createdBy}</span>
                        </div>
                        
                        {activeTab === 'EXPLORE' && (
                            <button 
                                onClick={(e) => handleJoin(e, group)}
                                className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-espe-green transition-colors font-bold"
                            >
                                Unirse
                            </button>
                        )}
                    </div>
                </div>
                ))}
            </div>
         )}
      </div>
   );
}

export const CreateStudyGroupScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
   const [formData, setFormData] = useState({ title: '', description: '', topic: '', meeting_date: '' });
   const [loading, setLoading] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       const userString = localStorage.getItem('user');
       if (!userString) return;
       const user = JSON.parse(userString);

       setLoading(true);
       try {
           const res = await fetch('http://localhost:3000/api/study_groups', {
               method: 'POST',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({ ...formData, user_id: user.id })
           });
           const data = await res.json();
           if(data.success) {
               alert('Grupo creado exitosamente');
               onBack();
           } else {
               alert('Error al crear grupo');
           }
       } catch (err) {
           alert('Error de conexión');
       } finally {
           setLoading(false);
       }
   };

   return (
      <div className="bg-white rounded-3xl p-8 shadow-md max-w-2xl mx-auto">
         <div className="flex items-center justify-between mb-8 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800">Crear Grupo de Estudio</h2>
            <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
               <X size={20} className="text-gray-600"/>
            </button>
         </div>
         <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Título del Grupo</label>
                <input 
                    type="text" 
                    className="w-full border rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-espe-green outline-none" 
                    placeholder="Ej. Repaso Cálculo Integral"
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Materia / Tema</label>
                <input 
                    type="text" 
                    className="w-full border rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-espe-green outline-none" 
                    placeholder="Ej. Matemáticas"
                    required
                    value={formData.topic}
                    onChange={e => setFormData({...formData, topic: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
                <textarea 
                    className="w-full border rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-espe-green outline-none h-32 resize-none" 
                    placeholder="Describe el objetivo del grupo..."
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Próxima Reunión (Opcional)</label>
                <input 
                    type="date" 
                    className="w-full border rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-espe-green outline-none"
                    value={formData.meeting_date}
                    onChange={e => setFormData({...formData, meeting_date: e.target.value})}
                />
            </div>

            <div className="pt-4">
               <button type="submit" disabled={loading} className="w-full bg-espe-green text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:bg-espe-darkGreen transition-colors disabled:opacity-50">
                  {loading ? 'Creando...' : 'Crear Grupo'}
               </button>
            </div>
         </form>
      </div>
   );
}

export const StudyGroupDetailScreen: React.FC<{ group: StudyGroup | null, onBack: () => void }> = ({ group, onBack }) => {
   if (!group) return null;
   // In a real app, fetch members here
   return (
      <div className="bg-white min-h-[500px] rounded-3xl p-8 relative shadow-sm border border-gray-100 max-w-3xl mx-auto">
         <button onClick={onBack} className="mb-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><ArrowLeft size={24}/></button>
         
         <div className="flex justify-between items-start mb-6">
             <div>
                <h1 className="text-3xl font-bold text-gray-900">{group.title}</h1>
                <span className="inline-block bg-green-100 text-espe-green text-xs font-bold px-3 py-1 rounded-full mt-2">
                    { (group as any).topic || 'General'}
                </span>
             </div>
             <div className="bg-gray-50 p-3 rounded-xl text-center min-w-[100px]">
                 <p className="text-xs text-gray-500 uppercase font-bold">Miembros</p>
                 <p className="text-2xl font-bold text-espe-green">{group.members}</p>
             </div>
         </div>

         <div className="prose max-w-none text-gray-600 mb-8 border-b pb-8">
            <h3 className="font-bold text-gray-800 text-lg mb-2">Acerca del grupo</h3>
            <p>{group.description}</p>
         </div>

         <div className="mb-8">
             <h3 className="font-bold text-gray-800 text-lg mb-4">Información</h3>
             <div className="grid grid-cols-2 gap-4">
                 <div className="bg-gray-50 p-4 rounded-xl">
                     <p className="text-xs text-gray-400 font-bold uppercase">Creado por</p>
                     <p className="font-bold text-gray-800">{group.createdBy}</p>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-xl">
                     <p className="text-xs text-gray-400 font-bold uppercase">Próxima Reunión</p>
                     <p className="font-bold text-gray-800">{group.date}</p>
                 </div>
             </div>
         </div>

         {/* Placeholder for member actions */}
         <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
             <Users size={20} className="text-blue-600"/>
             <p className="text-sm text-blue-800 font-medium">
                 Eres miembro de este grupo. <button className="underline font-bold">Ver lista de miembros</button>
             </p>
         </div>
      </div>
   );
}