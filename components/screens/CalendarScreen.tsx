import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Info, ChevronLeft, ChevronRight, Clock, MapPin, X, BookOpen, Edit3, Save, Plus } from 'lucide-react';
import { User, UserEvent } from '../../types';

export const CalendarScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date()); // Tracks month/year viewing
  const [selectedDay, setSelectedDay] = useState<number | null>(null); // Tracks clicked day
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State for New Event
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventType, setNewEventType] = useState('Evento');
  const [newEventColor, setNewEventColor] = useState('bg-blue-500');

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const colors = [
      { class: 'bg-blue-500', name: 'Azul' },
      { class: 'bg-red-500', name: 'Rojo' },
      { class: 'bg-green-500', name: 'Verde' },
      { class: 'bg-purple-500', name: 'Morado' },
      { class: 'bg-orange-500', name: 'Naranja' },
      { class: 'bg-gray-800', name: 'Negro' }
  ];

  // Load User Events
  const fetchEvents = () => {
      const userString = localStorage.getItem('user');
      if (!userString) return;
      const user: User = JSON.parse(userString);

      fetch(`http://localhost:3000/api/calendar?user_id=${user.id}`)
          .then(res => res.json())
          .then(data => {
              setEvents(data);
              setLoading(false);
          })
          .catch(err => {
              console.error(err);
              setLoading(false);
          });
  };

  useEffect(() => {
      fetchEvents();
  }, []);

  // Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Get weekday of 1st day (0=Sun, 1=Mon... 6=Sat)
  let firstDayOfWeek = new Date(year, month, 1).getDay();
  // Adjust to make Monday = 0, Sunday = 6
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Navigation Handlers
  const prevMonth = () => {
      setCurrentDate(new Date(year, month - 1, 1));
      setSelectedDay(null);
  };
  const nextMonth = () => {
      setCurrentDate(new Date(year, month + 1, 1));
      setSelectedDay(null);
  };

  // Helper: Get events for a specific day number in CURRENT view month
  const getEventsForDay = (day: number) => {
      // Format YYYY-MM-DD ensuring 2 digits for month/day
      const mStr = (month + 1).toString().padStart(2, '0');
      const dStr = day.toString().padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;
      
      return events.filter(e => e.event_date === dateStr);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
      e.preventDefault();
      const userString = localStorage.getItem('user');
      if (!userString || !selectedDay) return;
      const user: User = JSON.parse(userString);

      // Format date
      const mStr = (month + 1).toString().padStart(2, '0');
      const dStr = selectedDay.toString().padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;

      try {
          const res = await fetch('http://localhost:3000/api/calendar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  user_id: user.id,
                  title: newEventTitle,
                  event_date: dateStr,
                  event_time: newEventTime,
                  location: newEventLocation,
                  type_label: newEventType,
                  color: newEventColor
              })
          });
          const data = await res.json();
          if(data.success) {
              // Reset and reload
              setShowAddEvent(false);
              setNewEventTitle('');
              setNewEventTime('');
              setNewEventLocation('');
              fetchEvents();
          } else {
              alert('Error al guardar');
          }
      } catch(err) {
          alert('Error de conexión');
      }
  };

  const currentMonthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(currentDate);
  // Capitalize first letter
  const formattedMonthName = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full relative">
       {/* Main Calendar Section */}
       <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-2">
                <div className="bg-espe-green/10 p-2 rounded-lg text-espe-green">
                   <CalendarIcon size={24}/>
                </div>
                <div>
                   <h2 className="text-xl font-bold text-gray-800">{formattedMonthName}</h2>
                   <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">{year}</p>
                </div>
             </div>
             <div className="flex gap-1">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20}/></button>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight size={20}/></button>
             </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
             <div className="grid grid-cols-7 gap-4 mb-4 text-center">
                {weekDays.map(d => (
                   <div key={d} className={`text-xs font-bold uppercase tracking-wider ${d === 'Dom' || d === 'Sáb' ? 'text-gray-400' : 'text-espe-green'}`}>{d}</div>
                ))}
             </div>

             <div className="grid grid-cols-7 gap-y-6 gap-x-2 text-center text-sm">
                {/* Empty slots for start of month */}
                {Array(firstDayOfWeek).fill(null).map((_, i) => <div key={`empty-${i}`}></div>)}
                
                {/* Days */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                   const dayEvents = getEventsForDay(day);
                   
                   // Check if is today
                   const today = new Date();
                   const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                   const hasEvent = dayEvents.length > 0;

                   return (
                      <div 
                        key={day} 
                        onClick={() => setSelectedDay(day)}
                        className="flex flex-col items-center justify-center relative cursor-pointer group h-10 w-10 mx-auto"
                      >
                         <div className={`
                            w-8 h-8 flex items-center justify-center rounded-full font-bold transition-all
                            ${isToday ? 'bg-espe-green text-white shadow-lg shadow-green-200' : 'text-gray-700 hover:bg-white hover:shadow-md'}
                            ${selectedDay === day ? 'ring-2 ring-espe-lime' : ''}
                         `}>
                            {day}
                         </div>
                         {/* Event Indicator Bar */}
                         {hasEvent && (
                            <div className="flex gap-0.5 mt-1 justify-center absolute -bottom-2 w-full">
                                {dayEvents.slice(0,3).map((e, idx) => (
                                    <div key={idx} className={`w-1.5 h-1.5 rounded-full ${e.color.replace('bg-', 'bg-')}`}></div>
                                ))}
                            </div>
                         )}
                      </div>
                   );
                })}
             </div>
          </div>
       </div>

       {/* Events Side List (Shows events for selected month mostly, or upcoming) */}
       <div className="w-full md:w-80 hidden md:block">
          <div className="flex items-center gap-2 mb-4">
             <Info size={18} className="text-gray-400"/>
             <h3 className="font-bold text-gray-800">Eventos del Mes</h3>
          </div>
          
          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
             {events.filter(e => {
                 const d = new Date(e.event_date);
                 return d.getMonth() === month && d.getFullYear() === year;
             }).sort((a,b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()).map((evt, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-espe-green transition-colors group relative overflow-hidden">
                   <div className={`absolute left-0 top-0 bottom-0 w-1 ${evt.color} group-hover:w-1.5 transition-all`}></div>
                   <div className="flex gap-3">
                      <div className="flex flex-col items-center justify-center px-2 border-r border-gray-100 w-14">
                         <span className="text-xl font-bold text-gray-800 leading-none">{parseInt(evt.event_date.split('-')[2])}</span>
                         <span className="text-[10px] font-bold text-gray-400 uppercase">
                             {new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(new Date(evt.event_date))}
                         </span>
                      </div>
                      <div className="flex-1">
                         <h4 className="font-bold text-gray-800 text-sm mb-1">{evt.title}</h4>
                         <div className="flex items-center justify-between text-xs text-gray-500">
                             {evt.event_time && (
                               <span className="flex items-center gap-1"><Clock size={12} /> {evt.event_time}</span>
                             )}
                             <span className="font-semibold text-espe-green/70 text-[10px] uppercase border border-espe-green/20 px-1 rounded">{evt.type_label}</span>
                         </div>
                      </div>
                   </div>
                </div>
             ))}
             {events.filter(e => {
                 const d = new Date(e.event_date);
                 return d.getMonth() === month && d.getFullYear() === year;
             }).length === 0 && (
                 <p className="text-gray-400 text-center text-sm py-4">No hay eventos este mes.</p>
             )}
          </div>
       </div>

       {/* --- DAY DETAIL MODAL --- */}
       {selectedDay && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               {/* Backdrop */}
               <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedDay(null)}></div>
               
               {/* Modal Content */}
               <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">
                   <div className="bg-espe-green p-6 flex justify-between items-start text-white shrink-0">
                        <div>
                            <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Agenda Personal</p>
                            <h2 className="text-3xl font-bold">
                                {selectedDay} de {formattedMonthName}
                            </h2>
                        </div>
                        <button onClick={() => setSelectedDay(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                   </div>

                   <div className="p-6 overflow-y-auto flex-1 space-y-6">
                        
                        {/* List of Events for this Day */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <Clock size={18} className="text-espe-green"/> Eventos Programados
                                </h3>
                                {!showAddEvent && (
                                    <button 
                                        onClick={() => setShowAddEvent(true)}
                                        className="text-xs font-bold bg-espe-lime text-espe-darkGreen px-3 py-1 rounded-full flex items-center gap-1 hover:brightness-105"
                                    >
                                        <Plus size={14}/> Nuevo Evento
                                    </button>
                                )}
                            </div>

                            {showAddEvent ? (
                                <form onSubmit={handleSaveEvent} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3 animate-fade-in">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Título</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm"
                                            value={newEventTitle}
                                            onChange={e => setNewEventTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Hora</label>
                                            <input 
                                                type="time" 
                                                className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm"
                                                value={newEventTime}
                                                onChange={e => setNewEventTime(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Tipo</label>
                                            <input 
                                                type="text" 
                                                placeholder="Ej. Examen"
                                                className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm"
                                                value={newEventType}
                                                onChange={e => setNewEventType(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Ubicación</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm"
                                            value={newEventLocation}
                                            onChange={e => setNewEventLocation(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Color</label>
                                        <div className="flex gap-2">
                                            {colors.map(c => (
                                                <button 
                                                    key={c.name}
                                                    type="button"
                                                    onClick={() => setNewEventColor(c.class)}
                                                    className={`w-6 h-6 rounded-full ${c.class} ${newEventColor === c.class ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                                                    title={c.name}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowAddEvent(false)}
                                            className="flex-1 py-2 text-gray-500 font-bold text-xs hover:bg-gray-200 rounded-lg"
                                        >
                                            Cancelar
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="flex-1 py-2 bg-espe-green text-white font-bold text-xs rounded-lg hover:bg-espe-darkGreen"
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                {getEventsForDay(selectedDay).length > 0 ? (
                                    <div className="space-y-2">
                                        {getEventsForDay(selectedDay).map((evt, i) => (
                                            <div key={i} className={`bg-white border-l-4 ${evt.color.replace('bg-', 'border-')} p-3 rounded-r-xl shadow-sm flex justify-between items-center`}>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold uppercase bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{evt.type_label}</span>
                                                        <p className="font-bold text-gray-800 text-sm">{evt.title}</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                        <Clock size={10} /> {evt.event_time || '--:--'} 
                                                        {evt.location && <span>• <MapPin size={10} className="inline"/> {evt.location}</span>}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center">No tienes eventos programados para hoy.</p>
                                )}
                                </>
                            )}
                        </div>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};