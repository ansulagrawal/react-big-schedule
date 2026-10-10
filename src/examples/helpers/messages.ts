import dayjs from 'dayjs';
import type { SchedulerEvent } from '../../types';

const formatDateTime = (value?: string) => (value ? dayjs(value).format('MMM D, YYYY HH:mm') : '');

// User-facing text for the example pages' confirm/alert dialogs
export const messages = {
  clicked: (event: SchedulerEvent) => `You clicked "${event.title}".`,
  ops: (name: string, event: SchedulerEvent) => `Ran ${name} on "${event.title}".`,
  create: (slotName: string | undefined, start?: string, end?: string) =>
    `Create a new event${slotName ? ` for ${slotName}` : ''} from ${formatDateTime(start)} to ${formatDateTime(end)}?`,
  adjustStart: (event: SchedulerEvent, newStart: string) =>
    `Change the start of "${event.title}" to ${formatDateTime(newStart)}?`,
  adjustEnd: (event: SchedulerEvent, newEnd: string) =>
    `Change the end of "${event.title}" to ${formatDateTime(newEnd)}?`,
  move: (event: SchedulerEvent, slotName: string | undefined, start: string, end: string) =>
    `Move "${event.title}" to ${slotName}, ${formatDateTime(start)} to ${formatDateTime(end)}?`,
};
