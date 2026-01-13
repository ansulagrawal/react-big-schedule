import PropTypes from 'prop-types';
import { CellUnit } from '../config/default';

function HeaderView({ schedulerData, nonAgendaCellHeaderTemplateResolver, showWeekNumber }) {
  const { headers, cellUnit, config, localeDayjs } = schedulerData;
  const headerHeight = schedulerData.getTableHeaderHeight();
  const cellWidth = schedulerData.getContentCellWidth();
  const minuteStepsInHour = schedulerData.getMinuteStepsInHour();

  let headerList = [];
  let weekNumberRow = [];
  let style;

  // Helper function to generate week number cells with merged columns
  const generateWeekNumberRow = () => {
    if (!showWeekNumber) return null;

    const weekGroups = [];
    let currentWeek = null;
    let colspan = 0;
    let startIndex = 0;

    headers.forEach((item, index) => {
      const datetime = localeDayjs(new Date(item.time));
      const weekNum = datetime.isoWeek();

      if (currentWeek === null) {
        currentWeek = weekNum;
        colspan = 1;
        startIndex = index;
      } else if (currentWeek === weekNum) {
        colspan += 1;
      } else {
        weekGroups.push({ week: currentWeek, colspan, startIndex });
        currentWeek = weekNum;
        colspan = 1;
        startIndex = index;
      }
    });

    // Push the last week group
    if (currentWeek !== null) {
      weekGroups.push({ week: currentWeek, colspan, startIndex });
    }

    return weekGroups.map((group, idx) => {
      const cellStyle = {
        fontSize: '0.85em',
        opacity: 0.7,
        borderBottom: '1px solid #e9e9e9',
        padding: '4px 8px',
        textAlign: 'center',
      };

      return (
        <th key={`week-${group.week}-${idx}`} colSpan={group.colspan} style={cellStyle}>
          W{group.week}
        </th>
      );
    });
  };

  if (cellUnit === CellUnit.Hour) {
    headers.forEach((item, index) => {
      if (index % minuteStepsInHour === 0) {
        const datetime = localeDayjs(new Date(item.time));

        style = item.nonWorkingTime
          ? {
              width: cellWidth * minuteStepsInHour,
              color: config.nonWorkingTimeHeadColor,
              backgroundColor: config.nonWorkingTimeHeadBgColor,
            }
          : {
              width: cellWidth * minuteStepsInHour,
            };

        if (index === headers.length - minuteStepsInHour) {
          style = item.nonWorkingTime
            ? { color: config.nonWorkingTimeHeadColor, backgroundColor: config.nonWorkingTimeHeadBgColor }
            : {};
        }

        const pFormattedList = config.nonAgendaDayCellHeaderFormat.split('|').map(pitem => datetime.format(pitem));
        let element;

        if (typeof nonAgendaCellHeaderTemplateResolver === 'function') {
          element = nonAgendaCellHeaderTemplateResolver(schedulerData, item, pFormattedList, style);
        } else {
          const pList = pFormattedList.map((formattedItem, pIndex) => <div key={pIndex}>{formattedItem}</div>);

          element = (
            <th key={`header-${item.time}`} className="header3-text" style={style}>
              <div>{pList}</div>
            </th>
          );
        }
        headerList.push(element);
      }
    });
  } else {
    headerList = headers.map((item, index) => {
      const datetime = localeDayjs(new Date(item.time));
      style = item.nonWorkingTime
        ? {
            width: cellWidth,
            color: config.nonWorkingTimeHeadColor,
            backgroundColor: config.nonWorkingTimeHeadBgColor,
          }
        : { width: cellWidth };
      if (index === headers.length - 1)
        style = item.nonWorkingTime
          ? { color: config.nonWorkingTimeHeadColor, backgroundColor: config.nonWorkingTimeHeadBgColor }
          : {};
      const cellFormat =
        cellUnit === CellUnit.Week
          ? config.nonAgendaWeekCellHeaderFormat
          : cellUnit === CellUnit.Month
            ? config.nonAgendaMonthCellHeaderFormat
            : cellUnit === CellUnit.Year
              ? config.nonAgendaYearCellHeaderFormat
              : config.nonAgendaOtherCellHeaderFormat;
      const pFormattedList = cellFormat.split('|').map(dateFormatPart => datetime.format(dateFormatPart));

      if (typeof nonAgendaCellHeaderTemplateResolver === 'function') {
        return nonAgendaCellHeaderTemplateResolver(schedulerData, item, pFormattedList, style);
      }

      const pList = pFormattedList.map((formattedItem, pIndex) => <div key={pIndex}>{formattedItem}</div>);

      return (
        <th key={`header-${item.time}`} className="header3-text" style={style}>
          <div>{pList}</div>
        </th>
      );
    });
  }

  weekNumberRow = generateWeekNumberRow();

  return (
    <thead>
      {showWeekNumber && weekNumberRow && <tr style={{ height: 24 }}>{weekNumberRow}</tr>}
      <tr style={{ height: headerHeight }} className="no-scrollbar">
        {headerList}
      </tr>
    </thead>
  );
}

HeaderView.propTypes = {
  schedulerData: PropTypes.object.isRequired,
  nonAgendaCellHeaderTemplateResolver: PropTypes.func,
  showWeekNumber: PropTypes.bool,
};

// HeaderView.defaultProps = {
//   nonAgendaCellHeaderTemplateResolver: null,
// };

export default HeaderView;
