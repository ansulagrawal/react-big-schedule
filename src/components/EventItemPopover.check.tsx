// Run: bun src/components/EventItemPopover.check.tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { ViewType } from '../config/default';
import type { SchedulerEvent } from '../types';
import EventItemPopover from './EventItemPopover';
import SchedulerData from './SchedulerData';

const schedulerData = new SchedulerData('2026-01-01', ViewType.Week);
const eventItem = {
  id: 1,
  start: '2026-01-01 10:00:00',
  end: '2026-01-01 11:00:00',
  title: 'T',
  resourceId: 'r1',
} as SchedulerEvent;
const render = (resolver?: unknown) =>
  renderToStaticMarkup(
    <EventItemPopover
      schedulerData={schedulerData}
      eventItem={eventItem}
      title="DefaultTitle"
      startTime="2026-01-01 10:00:00"
      endTime="2026-01-01 11:00:00"
      statusColor="#000"
      // biome-ignore lint/suspicious/noExplicitAny: deliberately invalid input
      eventItemPopoverTemplateResolver={resolver as any}
    />,
  );

const origError = console.error;
console.error = () => {};
const has = (html: string, s: string) => {
  if (!html.includes(s)) throw new Error(`expected "${s}" in ${html}`);
};
has(
  render(() => <b>custom</b>),
  'custom',
);
has(
  render(() => {
    throw new Error('boom');
  }),
  'DefaultTitle',
);
has(render({}), 'DefaultTitle');
has(
  render(() => null),
  'DefaultTitle',
);
console.error = origError;
console.log('EventItemPopover.check passed');
