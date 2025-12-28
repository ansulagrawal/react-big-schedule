/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import { CellUnit } from '../config/default';

function HeaderView({ schedulerData, nonAgendaCellHeaderTemplateResolver }) {
  const { headers, cellUnit, config, localeDayjs } = schedulerData;
  const headerHeight = schedulerData.getTableHeaderHeight();
  const cellWidth = schedulerData.getContentCellWidth();
  const minuteStepsInHour = schedulerData.getMinuteStepsInHour();

  let headerList = [];
  let style;

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
          style = item.nonWorkingTime ? { color: config.nonWorkingTimeHeadColor, backgroundColor: config.nonWorkingTimeHeadBgColor } : {};
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
      if (index === headers.length - 1) style = item.nonWorkingTime ? { color: config.nonWorkingTimeHeadColor, backgroundColor: config.nonWorkingTimeHeadBgColor } : {};
      const cellFormat = cellUnit === CellUnit.Week
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

  return (
    <thead>
      <tr style={{ height: headerHeight }}>{headerList}</tr>
    </thead>
  );
}

HeaderView.propTypes = {
  schedulerData: PropTypes.object.isRequired,
  nonAgendaCellHeaderTemplateResolver: PropTypes.func,
};

// HeaderView.defaultProps = {
//   nonAgendaCellHeaderTemplateResolver: null,
// };

export default HeaderView;
