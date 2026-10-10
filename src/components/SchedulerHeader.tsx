import React, { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import type { ViewType } from '../config/default';
import { DATE_FORMAT } from '../config/default';
import type SchedulerData from './SchedulerData';
import { ChevronLeft, ChevronRight } from './ui/Icons';
import MiniCalendar from './ui/MiniCalendar';
import Popover from './ui/Popover';

export interface ViewChangeEvent {
  viewType: ViewType;
  showAgenda: boolean;
  isEventPerspective: boolean;
}

export interface SchedulerHeaderProps {
  /** Receives the encoded view key: viewType, showAgenda (0|1), isEventPerspective (0|1). */
  onViewChange: (event: { target: { value: string } }) => void;
  goNext: () => void;
  goBack: () => void;
  onSelectDate: (date: string) => void;
  schedulerData: SchedulerData;
  leftCustomHeader?: ReactNode;
  rightCustomHeader?: ReactNode;
  style?: CSSProperties;
}

const Spinner = () => <span className="rbs-spinner" role="status" aria-label="Loading" />;

const SchedulerHeader = React.forwardRef<HTMLDivElement, SchedulerHeaderProps>(
  ({ onViewChange, goNext, goBack, onSelectDate, schedulerData, leftCustomHeader, rightCustomHeader, style }, ref) => {
    const [viewSpinning, setViewSpinning] = useState(false);
    const [dateSpinning, setDateSpinning] = useState(false);
    const [visible, setVisible] = useState(false);

    const { viewType, showAgenda, isEventPerspective, config } = schedulerData;
    const dateLabel = schedulerData.getDateLabel();
    const selectDate = schedulerData.getSelectedDate();
    const currentView = `${viewType}${showAgenda ? 1 : 0}${isEventPerspective ? 1 : 0}`;

    const isMountedRef = useRef(true);

    useEffect(() => {
      return () => {
        isMountedRef.current = false;
      };
    }, []);

    const handleEvents = <A,>(func: (arg: A) => void, isViewSpinning: boolean, funcArg: A) => {
      const isSpinEnabled = isViewSpinning ? config.viewChangeSpinEnabled : config.dateChangeSpinEnabled;

      const setSpin = isViewSpinning ? setViewSpinning : setDateSpinning;

      if (isSpinEnabled) {
        setSpin(true);
      }

      const coreFunc = () => {
        try {
          func(funcArg);
        } finally {
          if (isSpinEnabled && isMountedRef.current) {
            setSpin(false);
          }
        }
      };

      if (isSpinEnabled) {
        setTimeout(coreFunc, config.schedulerHeaderEventsFuncsTimeoutMs);
      } else {
        coreFunc();
      }
    };

    const popover = (
      <div className="rbs-popover-calendar">
        <MiniCalendar
          dayjs={schedulerData.localeDayjs}
          value={selectDate}
          onSelect={date => {
            setVisible(false);
            handleEvents(onSelectDate, false, date.format(DATE_FORMAT));
          }}
        />
      </div>
    );

    const viewButtons = config.views.map(item => {
      const value = `${item.viewType}${item.showAgenda ? 1 : 0}${item.isEventPerspective ? 1 : 0}`;
      return (
        <button
          key={value}
          type="button"
          aria-pressed={value === currentView}
          onClick={() => handleEvents(onViewChange, true, { target: { value } })}
        >
          <span style={{ margin: '0px 8px' }}>{item.viewName}</span>
        </button>
      );
    });

    return (
      <div ref={ref} className="rbs:flex rbs:flex-wrap rbs:items-center rbs:justify-between rbs:gap-2.5" style={style}>
        {leftCustomHeader}
        <div className="header2-text rbs:flex rbs:items-center rbs:gap-2">
          <div className="rbs:flex rbs:items-center">
            <ChevronLeft
              style={{ marginRight: '8px' }}
              className="icon-nav"
              onClick={() => handleEvents(goBack, false, undefined)}
            />
            {config.calendarPopoverEnabled ? (
              <Popover
                content={popover}
                placement="bottomLeft"
                trigger="click"
                open={visible}
                onOpenChange={setVisible}
                className="scheduler-header-popover"
              >
                <span className="header2-text-label" style={{ cursor: 'pointer' }}>
                  {dateLabel}
                </span>
              </Popover>
            ) : (
              <span className="header2-text-label">{dateLabel}</span>
            )}
            <ChevronRight
              style={{ marginLeft: '8px' }}
              className="icon-nav"
              onClick={() => handleEvents(goNext, false, undefined)}
            />
          </div>
          {dateSpinning && <Spinner />}
        </div>
        <div className="rbs:flex rbs:items-center rbs:gap-2">
          {viewSpinning && <Spinner />}
          {/* biome-ignore lint/a11y/useSemanticElements: fieldset cannot be styled as the segmented control */}
          <div className="rbs-segmented" role="group">
            {viewButtons}
          </div>
        </div>
        {rightCustomHeader}
      </div>
    );
  },
);

SchedulerHeader.displayName = 'SchedulerHeader';

export default SchedulerHeader;
