import dayjs from 'dayjs';

export function getPos(element) {
  let x = 0;
  let y = 0;
  let currentElement = element;

  while (currentElement) {
    x += currentElement.offsetLeft - currentElement.scrollLeft;
    y += currentElement.offsetTop - currentElement.scrollTop;
    currentElement = currentElement.offsetParent;
  }

  return { x, y };
}

/**
 * Generates the next numeric event ID by finding the maximum numeric ID in the events array
 * and incrementing it by 1. Filters out non-numeric and non-finite IDs.
 * @param {Array} events - Array of event objects with id properties
 * @returns {number} The next available numeric ID
 */
export function getNextNumericEventId(events) {
  const numericIds = events.map(event => event.id).filter(id => typeof id === 'number' && Number.isFinite(id));
  return Math.max(...numericIds, 0) + 1;
}

/**
 * Returns true if the string is a date-only value (YYYY-MM-DD) with no time component.
 */
export function isDateOnly(dateStr) {
  return typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

/**
 * Normalizes an event start date string to a dayjs object.
 * Date-only strings are treated as start-of-day.
 */
export function normalizeEventStart(dateStr) {
  if (isDateOnly(dateStr)) {
    return dayjs(dateStr).startOf('day');
  }
  return dayjs(dateStr);
}

/**
 * Normalizes an event end date string to a dayjs object.
 * Date-only strings are treated as end-of-day to avoid UTC midnight timezone shifting
 * causing off-by-one errors in day-cell span calculations (particularly in Month view).
 */
export function normalizeEventEnd(dateStr) {
  if (isDateOnly(dateStr)) {
    return dayjs(dateStr).endOf('day');
  }
  return dayjs(dateStr);
}
