import React, { useState } from 'react';
import { Calendar as CalendarIcon, Info, ChevronLeft, ChevronRight, Clock, MapPin, X, BookOpen, Edit3, Save } from 'lucide-react';

interface Event {
    day: number;
    title: string;
    time: string;
    location: string;
}

interface ClassItem {
    subject: string;
    time: string;
    room: string;
}

export const CalendarScreen: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  
  // December 2025 Logic
  // Dec 1, 2025 is a Monday (Index 0). 31 days.
  const daysInMonth = 31;
  const startDayIndex = 0; 
  
  // Events Data
  const events: Event[] = [
    { day: 4, title: 'Programa Fiestas de Quito', time: '10:00 AM', location: 'Coliseo' },
    { day: 5, title: 'Feriado Fiestas de Quito', time: 'Todo el día', location: 'Nacional' },
    { day: 18, title: 'Computación Paralela Examen 2P', time: '07:00 AM', location: 'Lab 204' },
    { day: 20, title: 'Registro de calificaciones', time: '23:59 PM', location: 'Banner' },
    { day: 22, title: 'Inicio Vacaciones', time: '-', location: '-' },
    { day: 25, title: 'Navidad', time: 'Todo el día', location: '-' }
  ];

  // Helper to determine weekday index (0-6) for a given date in Dec 2025
  const getWeekdayIndex = (day: number) => (startDayIndex + day - 1) % 7;

  // Mock Schedule Data (0=Mon, 4=Fri)
  const classSchedule: Record<number, ClassItem[]> = {
      0: [ // Lunes
          { subject: 'Cálculo Vectorial', time: '07:00 - 09:00', room: 'A-201' },
          { subject: 'Física II', time: '09:30 - 11:30', room: 'Lab Física 1' },
      ],
      1: [ // Martes
          { subject: 'Estructura de Datos', time: '07:00 - 09:00', room: 'Lab Comp 3' },
          { subject: 'Ingeniería de Software', time: '11:00 - 13:00', room: 'B-105' },
      ],
      2: [ // Miercoles
          { subject: 'Cálculo Vectorial', time: '07:00 - 09:00', room: 'A-201' },
          { subject: 'Física II', time: '14:00 - 16:00', room: 'A-202' },
      ],
      3: [ // Jueves
          { subject: 'Estructura de Datos', time: '07:00 - 09:00', room: 'Lab Comp 3' },
      ],
      4: [ // Viernes
          { subject: 'Ingeniería de Software', time: '09:00 - 11:00', room: 'B-105' },
          { subject: 'Tutoría Tésis', time: '12:00 - 13:00', room: 'Oficina 4' },
      ]
  };

  const getEventsForDay = (day: number) => events.filter(e => e.day === day);

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
                   <h2 className="text-xl font-bold text-gray-800">Diciembre</h2>
                   <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">SII - 2025</p>
                </div>
             </div>
             <div className="flex gap-1">
                <button className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20}/></button>
                <button className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight size={20}/></button>
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
                {Array(startDayIndex).fill(null).map((_, i) => <div key={`empty-${i}`}></div>)}
                
                {/* Days */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                   const dayEvents = getEventsForDay(day);
                   const isToday = day === 22; // Simulating today is Dec 22
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
                            <div className={`absolute -bottom-1 w-4 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-espe-red'}`}></div>
                         )}
                      </div>
                   );
                })}
             </div>
          </div>
       </div>

       {/* Events Side List */}
       <div className="w-full md:w-80 hidden md:block">
          <div className="flex items-center gap-2 mb-4">
             <Info size={18} className="text-gray-400"/>
             <h3 className="font-bold text-gray-800">Próximos Eventos</h3>
          </div>
          
          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
             {events.map((evt, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-espe-green transition-colors group relative overflow-hidden">
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-espe-green group-hover:w-1.5 transition-all"></div>
                   <div className="flex gap-3">
                      <div className="flex flex-col items-center justify-center px-2 border-r border-gray-100">
                         <span className="text-xl font-bold text-gray-800 leading-none">{evt.day}</span>
                         <span className="text-[10px] font-bold text-gray-400 uppercase">Dic</span>
                      </div>
                      <div className="flex-1">
                         <h4 className="font-bold text-gray-800 text-sm mb-1">{evt.title}</h4>
                         <div className="flex items-center gap-3 text-xs text-gray-500">
                            {evt.time !== '-' && (
                               <div className="flex items-center gap-1">
                                  <Clock size={12} /> {evt.time}
                               </div>
                            )}
                         </div>
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>

       {/* --- DAY DETAIL MODAL --- */}
       {selectedDay && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               {/* Backdrop */}
               <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedDay(null)}></div>
               
               {/* Modal Content */}
               <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
                   <div className="bg-espe-green p-6 flex justify-between items-start text-white">
                        <div>
                            <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Detalle del Día</p>
                            <h2 className="text-3xl font-bold">
                                {weekDays[getWeekdayIndex(selectedDay)]}, {selectedDay} Dic
                            </h2>
                        </div>
                        <button onClick={() => setSelectedDay(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                   </div>

                   <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
                        
                        {/* Section 1: Events */}
                        <div>
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Info size={18} className="text-espe-red"/> Eventos
                            </h3>
                            {getEventsForDay(selectedDay).length > 0 ? (
                                <div className="space-y-2">
                                    {getEventsForDay(selectedDay).map((evt, i) => (
                                        <div key={i} className="bg-red-50 border border-red-100 p-3 rounded-xl flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{evt.title}</p>
                                                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                                    <Clock size={10} /> {evt.time} 
                                                    {evt.location !== '-' && <span>• {evt.location}</span>}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No hay eventos programados para hoy.</p>
                            )}
                        </div>

                        {/* Section 2: Class Schedule (Horario) */}
                        <div>
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <BookOpen size={18} className="text-blue-500"/> Horario de Clases
                            </h3>
                            {classSchedule[getWeekdayIndex(selectedDay)] ? (
                                <div className="space-y-2">
                                    {classSchedule[getWeekdayIndex(selectedDay)].map((cls, i) => (
                                        <div key={i} className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center gap-3">
                                            <div className="bg-white p-2 rounded-lg text-blue-500 font-bold text-xs shadow-sm min-w-[60px] text-center">
                                                {cls.time.split(' - ')[0]}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-800 text-sm">{cls.subject}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <MapPin size={10} /> Aula: {cls.room}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No tienes clases este día (Fin de semana o libre).</p>
                            )}
                        </div>

                        {/* Section 3: Personal Notes */}
                        <div>
                            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Edit3 size={18} className="text-espe-lime"/> Mis Anotaciones
                            </h3>
                            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                                <textarea 
                                    className="w-full bg-transparent border-none focus:outline-none text-sm text-gray-700 resize-none"
                                    rows={3}
                                    placeholder="Escribe aquí tus recordatorios personales, tareas pendientes, etc..."
                                ></textarea>
                                <div className="flex justify-end mt-2">
                                    <button className="text-xs font-bold text-yellow-700 flex items-center gap-1 hover:text-yellow-800">
                                        <Save size={12} /> Guardar Nota
                                    </button>
                                </div>
                            </div>
                        </div>

                   </div>
               </div>
           </div>
       )}
    </div>
  );
};