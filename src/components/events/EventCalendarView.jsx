import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const categoryColors = {
  technical: 'bg-blue-500',
  cultural: 'bg-pink-500',
  sports: 'bg-green-500',
  workshop: 'bg-amber-500',
  seminar: 'bg-purple-500',
  other: 'bg-gray-500',
};

export default function EventCalendarView({ events }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad to start on Sunday
  const startPad = monthStart.getDay();
  const paddedDays = [...Array(startPad).fill(null), ...days];

  const getEventsForDay = (day) => {
    if (!day) return [];
    return events.filter(e => e.date && isSameDay(new Date(e.date), day));
  };

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-lg">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-1">
          <Button size="icon" variant="outline" className="h-8 w-8 rounded-xl" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" className="rounded-xl h-8 px-3 text-xs" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
          <Button size="icon" variant="outline" className="h-8 w-8 rounded-xl" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {paddedDays.map((day, i) => {
          const dayEvents = day ? getEventsForDay(day) : [];
          const isSelected = day && selectedDay && isSameDay(day, selectedDay);
          const isCurrentMonth = day && isSameMonth(day, currentMonth);
          return (
            <button
              key={i}
              onClick={() => day && setSelectedDay(isSelected ? null : day)}
              disabled={!day}
              className={`
                relative min-h-[56px] p-1 rounded-xl text-left transition-all text-xs
                ${!day ? 'invisible' : ''}
                ${isSelected ? 'bg-primary/15 ring-1 ring-primary' : 'hover:bg-muted/50'}
                ${isToday(day || new Date()) && !isSelected ? 'ring-1 ring-primary/40' : ''}
                ${!isCurrentMonth ? 'opacity-40' : ''}
              `}
            >
              {day && (
                <>
                  <span className={`font-medium text-xs ${isToday(day) ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 2).map(e => (
                      <div key={e.id} className={`${categoryColors[e.category] || 'bg-primary'} h-1.5 rounded-full w-full opacity-80`} />
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-muted-foreground">+{dayEvents.length - 2}</span>
                    )}
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Events */}
      {selectedDay && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <h3 className="font-medium text-sm text-muted-foreground">
            {format(selectedDay, 'EEEE, MMMM d')}
          </h3>
          {selectedEvents.length === 0 ? (
            <div className="text-center py-6 bg-muted/20 rounded-xl">
              <Calendar className="w-6 h-6 mx-auto mb-1 text-muted-foreground opacity-40" />
              <p className="text-xs text-muted-foreground">No events on this day</p>
            </div>
          ) : (
            selectedEvents.map(e => (
              <Link to={`/events/${e.id}`} key={e.id}>
                <div className="flex items-center gap-3 p-3 bg-card border border-border/50 rounded-xl hover:shadow-md transition-all">
                  <div className={`w-2 h-10 rounded-full ${categoryColors[e.category] || 'bg-primary'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.time} · {e.venue}</p>
                  </div>
                  <Badge variant="secondary" className="rounded-full text-xs">{e.category}</Badge>
                </div>
              </Link>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}