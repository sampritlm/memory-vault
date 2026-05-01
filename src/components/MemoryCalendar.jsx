import { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

export default function MemoryCalendar({ memories, onDateSelect, selectedDate, onClose }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Identify dates with memories
  const memoryDates = memories.reduce((acc, memory) => {
    const d = new Date(memory.date);
    const dateStr = format(d, 'yyyy-MM-dd');
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(memory);
    return acc;
  }, {});

  return (
    <div className="rounded-xl p-6 relative overflow-hidden" style={{ background: '#050505', border: '1px solid var(--accent)', boxShadow: '0 0 40px rgba(0, 0, 0, 0.8)' }}>
      {onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg transition-all" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <X className="w-5 h-5" />
        </button>
      )}
      <div className="flex flex-col mb-6 gap-4">
        <h2 className="text-xl font-black tracking-wider flex items-center gap-2" style={{ fontFamily: "'Orbitron', sans-serif", color: 'var(--accent)' }}>
          <Calendar className="w-5 h-5" />
          {format(currentDate, dateFormat).toUpperCase()}
        </h2>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="px-4 py-2 rounded-lg transition-all flex-1 flex justify-center" style={{ background: 'var(--accent-pale)', color: 'var(--accent)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-border)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-pale)'}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={handleNextMonth} className="px-4 py-2 rounded-lg transition-all flex-1 flex justify-center" style={{ background: 'var(--accent-pale)', color: 'var(--accent)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-border)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-pale)'}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-[10px] md:text-xs font-bold tracking-wider py-2" style={{ color: 'var(--text-muted)' }}>
            {day.toUpperCase()}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const hasMemories = memoryDates[dateStr] && memoryDates[dateStr].length > 0;
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isDayToday = isToday(day);
          
          let bgColor = 'transparent';
          let textColor = isCurrentMonth ? 'var(--text-primary)' : 'var(--text-faint)';
          let borderColor = 'transparent';
          
          if (isSelected) {
            bgColor = 'var(--accent)';
            textColor = '#000'; // Dark text on bright accent for contrast regardless of dark/light mode
          } else if (hasMemories) {
            bgColor = 'var(--accent-pale)';
            textColor = 'var(--accent)';
            borderColor = 'var(--accent-border)';
          }

          if (isDayToday && !isSelected) {
            borderColor = 'var(--text-muted)';
            if (!hasMemories && !isCurrentMonth) borderColor = 'var(--text-faint)';
          }
          
          return (
            <button 
              key={day.toString()} 
              onClick={() => onDateSelect(day)}
              className="relative flex flex-col items-center justify-center p-1 md:p-2 h-10 md:h-12 rounded-lg transition-all"
              style={{
                background: bgColor,
                color: textColor,
                border: `1px solid ${borderColor}`,
                opacity: isCurrentMonth ? 1 : 0.4
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.border = '1px solid var(--accent)';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.border = `1px solid ${borderColor}`;
                }
              }}
              title={hasMemories ? `${memoryDates[dateStr].length} memory(s)` : ''}
            >
              <span className="text-xs md:text-sm font-bold z-10">{format(day, 'd')}</span>
              {hasMemories && !isSelected && (
                <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }}></div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
