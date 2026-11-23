/** Windowing helpers for the Scheduler: only rows (and events) near the viewport are mounted. */

export interface RowWindow {
  /** First mounted row index. */
  start: number;
  /** One past the last mounted row index. */
  end: number;
  /** Height of the rows above `start`, rendered as one spacer. */
  padTop: number;
  /** Height of the rows from `end` on, rendered as one spacer. */
  padBottom: number;
}

export interface ColumnWindow {
  start: number;
  end: number;
  padLeft: number;
  padRight: number;
}

/** Columns overlapping the pixel range [from, to) when every column is `width` wide. */
export function getColumnWindow(count: number, width: number, from: number, to: number): ColumnWindow {
  const start = Math.min(count, Math.max(0, Math.floor(from / width)));
  const end = Math.max(start, Math.min(count, Math.ceil(to / width)));
  return { start, end, padLeft: start * width, padRight: (count - end) * width };
}

/** Skip windowing below these sizes: small schedulers render everything, as before. */
export const VIRTUAL_MIN_ROWS = 50;
export const VIRTUAL_MIN_EVENTS = 500;
/** Background cells are windowed by column only above this many columns (the vertical view has one per resource). */
export const VIRTUAL_MIN_COLUMNS = 100;

/** Rows overlapping the pixel range [from, to), found from their heights; spacers keep the total height. */
export function getRowWindow(rowHeights: number[], from: number, to: number): RowWindow {
  let top = 0;
  let start = rowHeights.length;
  let end = rowHeights.length;
  let padTop = 0;
  for (let i = 0; i < rowHeights.length; i += 1) {
    const bottom = top + rowHeights[i];
    if (start === rowHeights.length && bottom > from) {
      start = i;
      padTop = top;
    }
    if (top >= to) {
      end = i;
      break;
    }
    top = bottom;
  }
  if (start === rowHeights.length) return { start, end: start, padTop: top, padBottom: 0 };
  let padBottom = 0;
  for (let i = end; i < rowHeights.length; i += 1) padBottom += rowHeights[i];
  return { start, end, padTop, padBottom };
}

/** Empty row standing in for the unmounted rows above/below the window (keeps scroll height and alignment). */
export function Spacer({ height }: { height: number }) {
  if (height <= 0) return null;
  return (
    <tr style={{ height, border: 0 }}>
      <td style={{ height, padding: 0, border: 0 }} />
    </tr>
  );
}
