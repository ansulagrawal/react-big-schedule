import type { Dayjs } from 'dayjs';
import React, { type CSSProperties, type ReactNode, useCallback, useMemo } from 'react';
import { CellUnit } from '../config/default';
import type { HeaderCell } from '../types';
import type SchedulerData from './SchedulerData';

export type NonAgendaCellHeaderTemplateResolver = (
  schedulerData: SchedulerData,
  item: HeaderCell,
  formattedList: string[],
  style: CSSProperties,
) => ReactNode;

export interface HeaderViewProps {
  schedulerData: SchedulerData;
  /** Changes whenever schedulerData mutates, so the memoised view re-renders. */
  schedulerDataVersion?: number;
  nonAgendaCellHeaderTemplateResolver?: NonAgendaCellHeaderTemplateResolver;
}

/** Render the table header rows: optional month and week-number rows plus the main header row. */
function HeaderView({ schedulerData, nonAgendaCellHeaderTemplateResolver }: HeaderViewProps) {
  const { headers, cellUnit, config, localeDayjs } = schedulerData;
  const { showWeekNumber, weekNumberRowHeight = 24, showMonthRow, monthRowHeight = 24 } = config;
  const headerHeight = schedulerData.getTableHeaderHeight();
  const cellWidth = schedulerData.getContentCellWidth();
  const minuteStepsInHour = schedulerData.getMinuteStepsInHour();

  // Group consecutive headers sharing a key into spanning <th>s (week number row, month row)
  const buildGroupRow = useCallback(
    (keyOf: (d: Dayjs) => string, labelOf: (d: Dayjs) => string, stickyLabel = false) => {
      const groups: { key: string; label: string; colspan: number }[] = [];
      headers.forEach(item => {
        const d = localeDayjs(new Date(item.time));
        const key = keyOf(d);
        const last = groups[groups.length - 1];
        if (last && last.key === key) last.colspan += 1;
        else groups.push({ key, label: labelOf(d), colspan: 1 });
      });

      const cellStyle: CSSProperties = {
        fontSize: '0.85em',
        opacity: 0.7,
        borderBottom: `1px solid ${config.headerBorderColor || 'var(--rbs-border)'}`,
        padding: '4px 8px',
        textAlign: 'center',
      };

      return groups.map(group => (
        <th
          key={group.key}
          colSpan={group.colspan}
          style={{
            ...cellStyle,
            ...(stickyLabel && { textAlign: 'left' }),
            width: group.colspan * cellWidth,
            minWidth: group.colspan * cellWidth,
          }}
        >
          {stickyLabel ? <span style={{ position: 'sticky', left: 8 }}>{group.label}</span> : group.label}
        </th>
      ));
    },
    [headers, localeDayjs, config.headerBorderColor, cellWidth],
  );

  const isGrouped = !schedulerData.isVerticalResourceView();
  const weekNumberRow = useMemo(
    () =>
      showWeekNumber && isGrouped
        ? buildGroupRow(
            d => `w-${d.year()}-${d.isoWeek()}`,
            d => `W${d.isoWeek()}`,
          )
        : null,
    [showWeekNumber, isGrouped, buildGroupRow],
  );
  const monthRow = useMemo(
    () =>
      showMonthRow && isGrouped
        ? buildGroupRow(
            d => `m-${d.year()}-${d.month()}`,
            d => d.format('MMMM YYYY'),
            true,
          )
        : null,
    [showMonthRow, isGrouped, buildGroupRow],
  );

  // Extract common style creation logic
  const createCellStyle = useCallback(
    (item: HeaderCell, width: number, isLastCell: boolean): CSSProperties => {
      if (isLastCell) {
        return item.nonWorkingTime
          ? {
              color: config.nonWorkingTimeHeadColor,
              backgroundColor: config.nonWorkingTimeHeadBgColor,
            }
          : {};
      }
      return item.nonWorkingTime
        ? {
            width,
            color: config.nonWorkingTimeHeadColor,
            backgroundColor: config.nonWorkingTimeHeadBgColor,
          }
        : { width };
    },
    [config],
  );

  // Extract cell format selection logic
  const getCellFormat = useCallback(
    (cellUnitParam: CellUnit) => {
      const formatMap: Partial<Record<CellUnit, string>> = {
        [CellUnit.Week]: config.nonAgendaWeekCellHeaderFormat,
        [CellUnit.Month]: config.nonAgendaMonthCellHeaderFormat,
        [CellUnit.Year]: config.nonAgendaYearCellHeaderFormat,
        [CellUnit.Quarter]: config.nonAgendaQuarterCellHeaderFormat,
      };
      return formatMap[cellUnitParam] || config.nonAgendaOtherCellHeaderFormat;
    },
    [config],
  );

  // Render cell content helper
  const renderCellContent = useCallback(
    (item: HeaderCell, formattedList: string[], style: CSSProperties) => {
      if (typeof nonAgendaCellHeaderTemplateResolver === 'function') {
        return nonAgendaCellHeaderTemplateResolver(schedulerData, item, formattedList, style);
      }

      const content = formattedList.map(text => <div key={`${item.time}-${text}`}>{text}</div>);
      return (
        <th key={`header-${item.time}`} className="header3-text" style={style}>
          <div>{content}</div>
        </th>
      );
    },
    [nonAgendaCellHeaderTemplateResolver, schedulerData],
  );

  // Memoize header list generation
  const headerList = useMemo(() => {
    if (schedulerData.isVerticalResourceView()) {
      return headers.map(item => {
        const style = { width: cellWidth, minWidth: cellWidth };
        return (
          <th key={`header-${item.id}`} className="header3-text" style={style}>
            <div>{item.name}</div>
          </th>
        );
      });
    }

    if (cellUnit === CellUnit.Hour) {
      const result: ReactNode[] = [];
      const lastIndex = headers.length - minuteStepsInHour;

      headers.forEach((item, index) => {
        if (index % minuteStepsInHour !== 0) return;

        const datetime = localeDayjs(new Date(item.time));
        const width = cellWidth * minuteStepsInHour;
        const isLastCell = index === lastIndex;
        const style = createCellStyle(item, width, isLastCell);
        const formattedList = config.nonAgendaDayCellHeaderFormat.split('|').map(format => datetime.format(format));

        result.push(renderCellContent(item, formattedList, style));
      });

      return result;
    }

    // Non-hour cell units
    const cellFormat = getCellFormat(cellUnit);
    const lastIndex = headers.length - 1;

    return headers.map((item, index) => {
      const datetime = localeDayjs(new Date(item.time));
      const isLastCell = index === lastIndex;
      const style = createCellStyle(item, cellWidth, isLastCell);
      const formattedList = cellFormat.split('|').map(format => datetime.format(format));

      return renderCellContent(item, formattedList, style);
    });
  }, [
    cellUnit,
    headers,
    minuteStepsInHour,
    cellWidth,
    config,
    localeDayjs,
    createCellStyle,
    getCellFormat,
    renderCellContent,
    schedulerData.isVerticalResourceView,
  ]);

  return (
    <thead>
      {monthRow && <tr style={{ height: monthRowHeight }}>{monthRow}</tr>}
      {weekNumberRow && <tr style={{ height: weekNumberRowHeight }}>{weekNumberRow}</tr>}
      <tr style={{ height: headerHeight }}>{headerList}</tr>
    </thead>
  );
}

export default React.memo(HeaderView);
