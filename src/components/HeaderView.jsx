import PropTypes from 'prop-types';
import { CellUnit } from '../config/default';
import { useMemo } from 'react';

function HeaderView({ schedulerData, nonAgendaCellHeaderTemplateResolver, showWeekNumber }) {
  const { headers, cellUnit, config, localeDayjs } = schedulerData;
  const headerHeight = schedulerData.getTableHeaderHeight();
  const cellWidth = schedulerData.getContentCellWidth();
  const minuteStepsInHour = schedulerData.getMinuteStepsInHour();

  // Week number row generation
  const weekNumberRow = useMemo(() => {
    if (!showWeekNumber) return null;

    const weekGroups = [];
    let currentWeek = null;
    let colspan = 0;

    headers.forEach(item => {
      const weekNum = localeDayjs(new Date(item.time)).isoWeek();

      if (currentWeek === weekNum) {
        colspan += 1;
      } else {
        if (currentWeek !== null) {
          weekGroups.push({ week: currentWeek, colspan });
        }
        currentWeek = weekNum;
        colspan = 1;
      }
    });

    // Push the last week group
    if (currentWeek !== null) {
      weekGroups.push({ week: currentWeek, colspan });
    }

    const cellStyle = {
      fontSize: '0.85em',
      opacity: 0.7,
      borderBottom: '1px solid #e9e9e9',
      padding: '4px 8px',
      textAlign: 'center',
    };

    return weekGroups.map((group, idx) => (
      <th key={`week-${group.week}-${idx}`} colSpan={group.colspan} style={cellStyle}>
        W{group.week}
      </th>
    ));
  }, [showWeekNumber, headers, localeDayjs]);

  // Extract common style creation logic
  const createCellStyle = (item, width, isLastCell) => {
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
  };

  // Extract cell format selection logic
  const getCellFormat = cellUnit => {
    const formatMap = {
      [CellUnit.Week]: config.nonAgendaWeekCellHeaderFormat,
      [CellUnit.Month]: config.nonAgendaMonthCellHeaderFormat,
      [CellUnit.Year]: config.nonAgendaYearCellHeaderFormat,
    };
    return formatMap[cellUnit] || config.nonAgendaOtherCellHeaderFormat;
  };

  // Render cell content helper
  const renderCellContent = (item, formattedList, style) => {
    if (typeof nonAgendaCellHeaderTemplateResolver === 'function') {
      return nonAgendaCellHeaderTemplateResolver(schedulerData, item, formattedList, style);
    }

    const content = formattedList.map((text, idx) => <div key={idx}>{text}</div>);
    return (
      <th key={`header-${item.time}`} className="header3-text" style={style}>
        <div>{content}</div>
      </th>
    );
  };

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
    nonAgendaCellHeaderTemplateResolver,
    schedulerData,
  ]);

  return (
    <thead>
      {weekNumberRow && <tr style={{ height: 24 }}>{weekNumberRow}</tr>}
      <tr style={{ height: headerHeight }}>{headerList}</tr>
    </thead>
  );
}

HeaderView.propTypes = {
  schedulerData: PropTypes.object.isRequired,
  nonAgendaCellHeaderTemplateResolver: PropTypes.func,
  showWeekNumber: PropTypes.bool,
};

export default HeaderView;
