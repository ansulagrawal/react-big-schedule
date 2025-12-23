/**
 * Calculate the cumulative x and y position of a DOM element relative to the document.
 * @param {HTMLElement} element - The element whose position to compute.
 * @returns {{x: number, y: number}} The element's left (`x`) and top (`y`) coordinates in pixels.
 */
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
