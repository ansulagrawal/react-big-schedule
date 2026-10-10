import dayjs from 'dayjs';
import { useState } from 'react';
import { Calendar, type CalendarEvent, type CalendarViewName } from '../../index';
import PageHeader from '../components/PageHeader';
import { useTheme } from '../theme';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Switch from '../ui/Switch';

const VIEWS = [
  { value: 'dayGridMonth', label: 'Month grid' },
  { value: 'dayGridWeek', label: 'Week grid' },
  { value: 'timeGridWeek', label: 'Time grid week' },
  { value: 'timeGridDay', label: 'Time grid day' },
  { value: 'listWeek', label: 'List week' },
  { value: 'listMonth', label: 'List month' },
  { value: 'multiMonthYear', label: 'Year' },
  { value: 'multiMonthStack', label: 'Year stack' },
  { value: 'multiMonthContinuous', label: 'Year flow' },
] as const satisfies readonly { value: CalendarViewName; label: string }[];

const VIEW_NAMES: CalendarViewName[] = VIEWS.map(v => v.value);

const makeEvents = (): CalendarEvent[] => {
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

const MAX_LOG = 40;

export default function CalendarPage() {
  const { theme } = useTheme();
  const [view, setView] = useState<CalendarViewName>('dayGridMonth');
  const [events, setEvents] = useState(makeEvents);
  const [editable, setEditable] = useState(true);
  const [log, setLog] = useState<string[]>([]);

  const note = (text: string) =>
    setLog(entries => [`${dayjs().format('HH:mm:ss')}  ${text}`, ...entries].slice(0, MAX_LOG));
  const patch = (next: CalendarEvent) => setEvents(list => list.map(e => (e.id === next.id ? next : e)));

  return (
    <>
      <PageHeader title="Calendar" source="Calendar.tsx" />
      <div className="ex-toolbar">
        <Select label="View" value={view} options={VIEWS} onChange={setView} />
        <Switch checked={editable} onChange={setEditable}>
          Editable (drag and resize)
        </Switch>
      </div>
      <div className="ex-split">
        <div className="ex-split-main">
          <Calendar
            theme={theme}
            events={events}
            views={VIEW_NAMES}
            view={view}
            onViewChange={setView}
            editable={editable}
            selectable
            nowIndicator
            weekNumbers
            businessHours
            dayMaxEvents
            height={720}
            onEventClick={i => note(`eventClick: ${i.event.title}`)}
            onDateClick={i => note(`dateClick: ${i.date.format('YYYY-MM-DD HH:mm')}`)}
            onSelect={i => note(`select: ${i.start.format('MM-DD HH:mm')} to ${i.end.format('MM-DD HH:mm')}`)}
            onEventDrop={i => {
              patch(i.event);
              note(`eventDrop: ${i.event.title}`);
            }}
            onEventResize={i => {
              patch(i.event);
              note(`eventResize: ${i.event.title}`);
            }}
            onDatesSet={r =>
              note(`datesSet: ${r.view} ${r.start.format('YYYY-MM-DD')} to ${r.end.format('YYYY-MM-DD')}`)
            }
            onNavLinkDayClick={date => note(`navLinkDayClick: ${date.format('YYYY-MM-DD')}`)}
          />
        </div>
        <aside className="ex-log" aria-label="Event log">
          <div className="ex-log-head">
            <strong>Callbacks</strong>
            <Button variant="ghost" onClick={() => setLog([])}>
              Clear
            </Button>
          </div>
          {log.length === 0 ? <p className="ex-muted">Click, drag or select something.</p> : null}
          <ol>
            {log.map((line, i) => (
              // newest first, so the index is the stable identity of an entry
              // biome-ignore lint/suspicious/noArrayIndexKey: log lines can repeat
              <li key={`${i}-${line}`}>{line}</li>
            ))}
          </ol>
        </aside>
      </div>
    </>
  );
}
