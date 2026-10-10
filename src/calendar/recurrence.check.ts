// Run: bun src/calendar/recurrence.check.ts
import SchedulerData from '../components/SchedulerData';
import { ViewType } from '../config/default';
import { expandRecurring } from './recurrence';
import { withTimeZone } from './timezone';
import type { CalendarEvent } from './types';

const assert = {
  equal: (a: unknown, b: unknown) => {
    if (a !== b) throw new Error(`expected ${String(b)}, got ${String(a)}`);
  },
  deepEqual: (a: unknown, b: unknown) => assert.equal(JSON.stringify(a), JSON.stringify(b)),
  ok: (v: unknown) => assert.equal(Boolean(v), true),
};

const base = new SchedulerData(undefined, ViewType.Week, false, false).localeDayjs;
const utc = withTimeZone(base, 'UTC');
const range = { start: utc('2024-03-04'), end: utc('2024-03-18') }; // two weeks, Mon..Mon

// rrule: weekly Mon/Wed, 1h, one wed skipped via exceptions
const weekly: CalendarEvent = {
  id: 'a',
  title: 'Standup',
  start: '2024-03-01T09:00:00',
  end: '2024-03-01T10:00:00',
  rrule: 'FREQ=WEEKLY;BYDAY=MO,WE',
  exceptions: ['2024-03-13T09:00:00'],
};
const occ = expandRecurring([weekly], range, utc);
assert.deepEqual(
  occ.map(o => String(o.start).slice(0, 16)),
  ['2024-03-04T09:00', '2024-03-06T09:00', '2024-03-11T09:00'],
);
assert.ok(String(occ[0]?.id).startsWith('a:2024-03-04T09:00'));
assert.equal(occ[0]?.extendedProps?.recurringId, 'a');
assert.equal(occ[0]?.end && String(occ[0].end).slice(11, 16), '10:00');

// simple form
const simple: CalendarEvent = {
  id: 's',
  title: 'Gym',
  start: '2024-01-01',
  recurrence: { daysOfWeek: [2, 4], startTime: '07:30', endTime: '08:15', endRecur: '2024-03-13' },
};
const so = expandRecurring([simple], range, utc);
assert.deepEqual(
  so.map(o => String(o.start).slice(0, 16)),
  ['2024-03-05T07:30', '2024-03-07T07:30', '2024-03-12T07:30'],
);

// plain events pass through untouched
const plain: CalendarEvent = { id: 'p', title: 'x', start: '2024-03-05' };
assert.equal(expandRecurring([plain], range, utc)[0], plain);

// time zones: 2024-03-01T00:00:00Z is 05:30 in Kolkata and 19:00 (Feb 29) in New York; offset-less string is wall time
const inst = '2024-03-01T00:00:00Z';
assert.equal(withTimeZone(base, 'Asia/Kolkata')(inst).format('YYYY-MM-DD HH:mm'), '2024-03-01 05:30');
assert.equal(withTimeZone(base, 'America/New_York')(inst).format('YYYY-MM-DD HH:mm'), '2024-02-29 19:00');
assert.equal(withTimeZone(base, 'Asia/Kolkata')('2024-03-01T05:30:00').toISOString(), '2024-03-01T00:00:00.000Z');
assert.equal(withTimeZone(base, 'UTC')('2024-03-01').format('YYYY-MM-DD HH:mm'), '2024-03-01 00:00');

console.log('recurrence.check: ok');
