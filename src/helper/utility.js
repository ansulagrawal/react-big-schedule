/* eslint-disable import/prefer-default-export */
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
