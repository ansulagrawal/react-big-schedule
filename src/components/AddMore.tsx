import type { HeaderItem } from '../types';
import type SchedulerData from './SchedulerData';

export interface AddMoreProps {
  schedulerData: SchedulerData;
  number: number;
  left: number;
  width: number;
  top: number;
  clickAction: (headerItem: HeaderItem) => void;
  headerItem: HeaderItem;
}

function AddMore({ schedulerData, number, left, width, top, clickAction, headerItem }: AddMoreProps) {
  const { config } = schedulerData;
  const content = `+${number} more`;

  return (
    <button
      type="button"
      className="timeline-event"
      style={{ left, width, top }}
      onClick={() => clickAction(headerItem)}
    >
      <div
        style={{
          height: config.eventItemHeight,
          color: 'var(--rbs-muted)',
          textAlign: 'center',
        }}
      >
        {content}
      </div>
    </button>
  );
}

export default AddMore;
