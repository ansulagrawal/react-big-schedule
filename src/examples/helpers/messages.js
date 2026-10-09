import dayjs from 'dayjs';

const formatDateTime = value => (value ? dayjs(value).format('MMM D, YYYY HH:mm') : '');

// User-facing text for the example pages' confirm/alert dialogs
export const messages = {
  clicked: event => `You clicked "${event.title}".`,
  ops: (name, event) => `Ran ${name} on "${event.title}".`,
  create: (slotName, start, end) =>
    `Create a new event${slotName ? ` for ${slotName}` : ''} from ${formatDateTime(start)} to ${formatDateTime(end)}?`,
  adjustStart: (event, newStart) => `Change the start of "${event.title}" to ${formatDateTime(newStart)}?`,
  adjustEnd: (event, newEnd) => `Change the end of "${event.title}" to ${formatDateTime(newEnd)}?`,
  move: (event, slotName, start, end) =>
    `Move "${event.title}" to ${slotName}, ${formatDateTime(start)} to ${formatDateTime(end)}?`,
};
