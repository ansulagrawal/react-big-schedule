import PropTypes from 'prop-types';
import { CellUnit } from '../config/default';
import { useCallback, useMemo } from 'react';

/**
 * Render the table header rows for a scheduler view, including an optional week-number row and the main header cells.
 * @param {Object} props.schedulerData - Scheduler configuration and utilities (headers array,
 * cell unit, formatting, sizing, and locale/date functions).
 * @param {Function} [props.nonAgendaCellHeaderTemplateResolver] - Optional resolver to customize
 * rendering of individual header cells. Called with (schedulerData, headerItem, formattedList, style).
 * @returns {JSX.Element} A <thead> element containing the optional week-number row and the
 * main header row for the scheduler table.
 */
function HeaderView({ schedulerData, nonAgendaCellHeaderTemplateResolver }) {
  const { headers, cellUnit, config, localeDayjs } = schedulerData;
  const { showWeekNumber, weekNumberRowHeight = 24 } = config;
  const headerHeight = schedulerData.getTableHeaderHeight();
  const cellWidth = schedulerData.getContentCellWidth();
  const minuteStepsInHour = schedulerData.getMinuteStepsInHour();

  // Week number row generation
  const weekNumberRow = useMemo(() => {
    if (!showWeekNumber) return null;

    const weekGroups = [];
    let currentWeekKey = null;
    let currentWeek = null;
    let currentYear = null;
    let colspan = 0;

    headers.forEach(item => {
      const year = localeDayjs(new Date(item.time)).year();
      const weekNum = localeDayjs(new Date(item.time)).isoWeek();
      const weekKey = `${year}-${weekNum}`;

      if (currentWeekKey === weekKey) {
        colspan += 1;
      } else {
        if (currentWeekKey !== null) {
          weekGroups.push({ week: currentWeek, year: currentYear, colspan });
        }
        currentWeekKey = weekKey;
        currentWeek = weekNum;
        currentYear = year;
        colspan = 1;
      }
    });

    // Push the last week group
    if (currentWeekKey !== null) {
      weekGroups.push({ week: currentWeek, year: currentYear, colspan });
    }

    const cellStyle = {
      fontSize: '0.85em',
      opacity: 0.7,
      borderBottom: `1px solid ${config.headerBorderColor || '#e9e9e9'}`,
      padding: '4px 8px',
      textAlign: 'center',
    };

    return weekGroups.map((group, idx) => (
      <th key={`week-${group.year}-${group.week}-${idx}`} colSpan={group.colspan} style={cellStyle}>
        W{group.week}
      </th>
    ));
  }, [showWeekNumber, headers, localeDayjs]);

  // Extract common style creation logic
  const createCellStyle = useCallback(
    (item, width, isLastCell) => {
      if (isLastCell) {
        return item.nonWorkingTime
          ? { color: config.nonWorkingTimeHeadColor, backgroundColor: config.nonWorkingTimeHeadBgColor }
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
    [config]
  );

  // Extract cell format selection logic
  const getCellFormat = useCallback(
    cellUnitParam => {
      const formatMap = {
        [CellUnit.Week]: config.nonAgendaWeekCellHeaderFormat,
        [CellUnit.Month]: config.nonAgendaMonthCellHeaderFormat,
        [CellUnit.Year]: config.nonAgendaYearCellHeaderFormat,
      };
      return formatMap[cellUnitParam] || config.nonAgendaOtherCellHeaderFormat;
    },
    [config]
  );

  // Render cell content helper
  const renderCellContent = useCallback(
    (item, formattedList, style) => {
      if (typeof nonAgendaCellHeaderTemplateResolver === 'function') {
        return nonAgendaCellHeaderTemplateResolver(schedulerData, item, formattedList, style);
      }

      const content = formattedList.map((text, idx) => <div key={`${item.time}-${idx}-${text}`}>{text}</div>);
      return (
        <th key={`header-${item.time}`} className="header3-text" style={style}>
          <div>{content}</div>
        </th>
      );
    },
    [nonAgendaCellHeaderTemplateResolver, schedulerData]
  );

  // Memoize header list generation
  const headerList = useMemo(() => {
    if (cellUnit === CellUnit.Hour) {
      const result = [];
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
  ]);

  return (
    <thead>
      {weekNumberRow && <tr style={{ height: weekNumberRowHeight }}>{weekNumberRow}</tr>}
      <tr style={{ height: headerHeight }}>{headerList}</tr>
    </thead>
  );
}

HeaderView.propTypes = {
  schedulerData: PropTypes.object.isRequired,
  nonAgendaCellHeaderTemplateResolver: PropTypes.func,
};

export default HeaderView;
