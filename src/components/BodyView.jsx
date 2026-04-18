import React from 'react';
import PropTypes from 'prop-types';
import { useEffect } from 'react';

function BodyView({ schedulerData, schedulerDataVersion }) {
  const { renderData, headers, config, behaviors } = schedulerData;
  const width = schedulerData.getContentCellWidth();

  // Trigger re-render when schedulerData mutations are tracked via version prop
  useEffect(() => {
    // This effect tracks layout changes without performing side effects
    // The dependency on schedulerDataVersion ensures memoization detects changes
  }, [schedulerDataVersion]);

  const tableRows = renderData
    .filter(o => o.render)
    .map(({ slotId, groupOnly, rowHeight }) => {
      const rowCells = headers.map((header, index) => {
        const key = `${slotId}_${header.time}`;
        const style = index === headers.length - 1 ? {} : { width };
        if (header.nonWorkingTime) {
          style.backgroundColor = config.nonWorkingTimeBodyBgColor;
        }
        if (groupOnly) {
          style.backgroundColor = config.groupOnlySlotColor;
        }
        if (behaviors.getNonAgendaViewBodyCellBgColorFunc) {
          const cellBgColor = behaviors.getNonAgendaViewBodyCellBgColorFunc(schedulerData, slotId, header);
          if (cellBgColor) {
            style.backgroundColor = cellBgColor;
          }
        }
        return (
          <td key={key} style={style}>
            <div />
          </td>
        );
      });

      return (
        <tr key={slotId} style={{ height: rowHeight }}>
          {rowCells}
        </tr>
      );
    });

  return <tbody>{tableRows}</tbody>;
}

BodyView.propTypes = {
  schedulerData: PropTypes.object.isRequired,
  schedulerDataVersion: PropTypes.number,
};

export default React.memo(BodyView);
