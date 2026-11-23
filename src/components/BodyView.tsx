import React, { type CSSProperties } from 'react';
import type SchedulerData from './SchedulerData';
import { type RowWindow, Spacer } from './virtual';

export interface BodyViewProps {
  schedulerData: SchedulerData;
  /** Changes whenever schedulerData mutates, so the memoised view re-renders. */
  schedulerDataVersion?: number;
  /** Mount only these rows (virtual rendering). */
  rowWindow?: RowWindow;
}

/** Render the table body (<tbody>) with one row per visible slot and one cell per header. */
function BodyView({ schedulerData, rowWindow }: BodyViewProps) {
  const { renderData, headers, config, behaviors } = schedulerData;
  const width = schedulerData.getContentCellWidth();

  const displayRows = renderData.filter(o => o.render);
  const tableRows = (rowWindow ? displayRows.slice(rowWindow.start, rowWindow.end) : displayRows).map(row => {
    const { slotId, groupOnly, rowHeight } = row;
    const rowCells = headers.map(header => {
      // vertical view: every header shares one time, the resource id tells the columns apart
      const key = `${slotId}_${header.id ?? header.time}`;
      const style: CSSProperties = { width, minWidth: width };
      const isVertical = schedulerData.isVerticalResourceView();

      if (isVertical) {
        if (row.nonWorkingTime) {
          style.backgroundColor = config.nonWorkingTimeBodyBgColor;
        }
      } else if (header.nonWorkingTime) {
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

  return (
    <tbody>
      {rowWindow && <Spacer height={rowWindow.padTop} />}
      {tableRows}
      {rowWindow && <Spacer height={rowWindow.padBottom} />}
    </tbody>
  );
}

export default React.memo(BodyView);
