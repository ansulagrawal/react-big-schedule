import type { Dayjs } from 'dayjs';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from './Icons';

// Month picker used by the header date label.
interface MiniCalendarProps {
  value: string;
  /** The scheduler's locale-bound dayjs. */
  dayjs: (date?: string | Date) => Dayjs;
  onSelect: (date: Dayjs) => void;
}

function MiniCalendar({ value, dayjs, onSelect }: MiniCalendarProps) {
  const selected = dayjs(value);
  const [month, setMonth] = useState(selected.startOf('month'));
  const first = month.startOf('week');
  const days = Array.from({ length: 42 }, (_, i) => first.add(i, 'day'));
  const today = dayjs();

  const nav = (label: string, delta: number, Icon: typeof ChevronLeft) => (
    <button
      type="button"
      aria-label={label}
      className="rbs-icon-btn"
      onClick={() => setMonth(month.add(delta, 'month'))}
    >
      <Icon />
    </button>
  );

  return (
    <div className="rbs-mini-calendar rbs:w-72 rbs:p-2">
      <div className="rbs:mb-2 rbs:flex rbs:items-center rbs:justify-between">
        {nav('Previous month', -1, ChevronLeft)}
        <span className="rbs:text-sm rbs:font-medium">{month.format('MMMM YYYY')}</span>
        {nav('Next month', 1, ChevronRight)}
      </div>
      <div className="rbs:grid rbs:grid-cols-7 rbs:gap-0.5 rbs:text-center rbs:text-xs">
        {days.slice(0, 7).map(d => (
          <span key={d.format('d')} className="rbs:py-1 rbs:text-muted">
            {d.format('dd')}
          </span>
        ))}
        {days.map(d => {
          const outside = d.month() !== month.month();
          const isSelected = d.isSame(selected, 'day');
          return (
            <button
              key={d.format('YYYY-MM-DD')}
              type="button"
              data-selected={isSelected || undefined}
              data-today={d.isSame(today, 'day') || undefined}
              data-outside={outside || undefined}
              className="rbs-mini-day"
              onClick={() => onSelect(d)}
            >
              {d.date()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MiniCalendar;
