import type { Dayjs } from 'dayjs';
import { ChevronLeft, ChevronRight } from '../components/ui/Icons';
import type { CalendarViewName } from './types';

export interface ToolbarProps {
  title: string;
  view: CalendarViewName;
  views: { name: CalendarViewName; label: string }[];
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onView: (view: CalendarViewName) => void;
  today: Dayjs;
  loading?: boolean;
}

function Toolbar({ title, view, views, onPrev, onNext, onToday, onView, loading }: ToolbarProps) {
  return (
    <div className="rbs-cal-toolbar rbs:flex rbs:flex-wrap rbs:items-center rbs:justify-between rbs:gap-2 rbs:pb-3">
      <div className="rbs:flex rbs:items-center rbs:gap-2">
        <button type="button" aria-label="Previous" className="rbs-icon-btn" onClick={onPrev}>
          <ChevronLeft />
        </button>
        <button type="button" aria-label="Next" className="rbs-icon-btn" onClick={onNext}>
          <ChevronRight />
        </button>
        <button type="button" className="rbs-btn" onClick={onToday}>
          Today
        </button>
        {loading && <span className="rbs-spinner" role="status" aria-label="Loading events" />}
      </div>
      <h2 className="rbs-cal-title rbs:m-0 rbs:text-lg rbs:font-medium">{title}</h2>
      {/* biome-ignore lint/a11y/useSemanticElements: a styled button group, <fieldset> would add browser chrome */}
      <div className="rbs-segmented" role="group" aria-label="View">
        {views.map(v => (
          <button key={v.name} type="button" aria-pressed={v.name === view} onClick={() => onView(v.name)}>
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Toolbar;
