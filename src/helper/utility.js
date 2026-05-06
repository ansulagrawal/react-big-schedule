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
  const numericIds = events
    .map(event => event.id)
    .filter(id => typeof id === 'number' && Number.isFinite(id));
  return Math.max(...numericIds, 0) + 1;
}
