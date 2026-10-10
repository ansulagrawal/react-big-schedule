import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Calendar, type CalendarEvent, type CalendarViewName } from '../index';
import './generated.css';

const THEMES = ['light', 'dark', 'classic'] as const;
const VIEWS: CalendarViewName[] = [
  'dayGridMonth',
  'dayGridWeek',
  'timeGridWeek',
  'timeGridDay',
  'listWeek',
  'listMonth',
  'multiMonthYear',
  'multiMonthStack',
  'multiMonthContinuous',
];

const make = (): CalendarEvent[] => {
  const d = (offset: number, time = '09:00') => dayjs().add(offset, 'day').format(`YYYY-MM-DD[T]${time}`);
  const day = (offset: number) => dayjs().add(offset, 'day').format('YYYY-MM-DD');
  return [
    { id: 1, title: 'Standup', start: d(0, '09:00'), end: d(0, '09:30'), color: '#1677ff' },
    { id: 2, title: 'Design review', start: d(0, '11:00'), end: d(0, '12:00'), color: '#722ed1' },
    { id: 3, title: 'Sprint planning', start: d(1, '10:00'), end: d(1, '11:30'), color: '#13c2c2' },
    { id: 4, title: 'Customer call', start: d(1, '10:30'), end: d(1, '11:00'), color: '#fa541c' },
    { id: 5, title: 'Offsite', start: day(3), end: day(6), allDay: true, color: '#52c41a' },
    { id: 6, title: 'Release freeze', start: day(-2), allDay: true, color: '#f5222d' },
    { id: 7, title: 'Architecture', start: d(2, '13:00'), end: d(2, '14:30'), color: '#2f54eb' },
    { id: 8, title: 'Retro', start: d(4, '16:00'), end: d(4, '17:00'), color: '#eb2f96' },
    { id: 9, title: 'Lunch', start: d(0, '12:00'), end: d(0, '13:00'), display: 'background', color: '#fadb14' },
    { id: 10, title: 'Quarter close', start: d(8, '09:00'), end: d(8, '17:00'), color: '#fa8c16' },
    { id: 11, title: 'Planning', start: d(-6, '10:00'), end: d(-6, '11:00'), color: '#1677ff' },
    { id: 12, title: 'Hiring', start: d(10, '14:00'), end: d(10, '15:00'), color: '#13c2c2' },
  ];
};

function App() {
  const [theme, setTheme] = useState<(typeof THEMES)[number]>('light');
  const [events, setEvents] = useState(make);
  const [log, setLog] = useState('Click, drag or select something');
  const bg = theme === 'dark' ? '#000' : '#f5f5f5';
  const patch = (next: CalendarEvent) => setEvents(list => list.map(e => (e.id === next.id ? next : e)));
  const views = useMemo(() => VIEWS, []);

  return (
    <div style={{ background: bg, minHeight: '100vh', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 12,
          alignItems: 'center',
          color: theme === 'dark' ? '#fff' : '#111',
        }}
      >
        <strong>Theme</strong>
        {THEMES.map(t => (
          <button key={t} type="button" className="rbs-btn" onClick={() => setTheme(t)}>
            {t}
          </button>
        ))}
        <span style={{ marginLeft: 16, opacity: 0.7 }}>{log}</span>
      </div>
      <Calendar
        theme={theme}
        events={events}
        views={views}
        initialView="dayGridMonth"
        editable
        selectable
        nowIndicator
        weekNumbers
        businessHours
        dayMaxEvents
        height={760}
        onEventClick={i => setLog(`event click: ${i.event.title}`)}
        onDateClick={i => setLog(`date click: ${i.date.format('YYYY-MM-DD HH:mm')}`)}
        onSelect={i => setLog(`select: ${i.start.format('MM-DD HH:mm')} → ${i.end.format('MM-DD HH:mm')}`)}
        onEventDrop={i => {
          patch(i.event);
          setLog(`moved: ${i.event.title}`);
        }}
        onEventResize={i => {
          patch(i.event);
          setLog(`resized: ${i.event.title}`);
        }}
      />
    </div>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
