// DST transitions inside the visible window. timeBetween() divides ms by 86_400_000,
// so a 25h (fall-back) or 23h (spring-forward) day can skew the day count.
// US fall-back 2026-11-01, US spring-forward 2027-03-14 (America/New_York).
process.env.TZ = 'America/New_York';

import { ViewType } from '../src/config/default';
import { runCases } from './helpers/runCases';

const { Day, Week, Month } = ViewType;

runCases([
  {
    id: 'h1',
    view: Week,
    date: '2026-10-28',
    start: '2026-10-31 10:00:00',
    end: '2026-11-02 10:00:00',
    expected: { first: '2026-10-31 00:00', span: 2 },
    note: 'Week Oct26-Nov1, crosses fall-back',
  },
  {
    id: 'h2',
    view: Month,
    date: '2026-11-01',
    start: '2026-11-01 10:00:00',
    end: '2026-11-04 10:00:00',
    expected: { first: '2026-11-01 00:00', span: 4 },
    note: 'Month Nov, fall-back on day 1',
  },
  {
    id: 'h3',
    view: Month,
    date: '2026-11-01',
    start: '2026-10-30 10:00:00',
    end: '2026-11-04 10:00:00',
    expected: { first: '2026-11-01 00:00', span: 4 },
    note: 'Month Nov, carry-forward over fall-back',
  },
  {
    id: 'h4',
    view: Month,
    date: '2026-11-01',
    start: '2026-11-01',
    end: '2026-11-03',
    expected: { first: '2026-11-01 00:00', span: 3 },
    note: 'Month Nov, date-only over fall-back',
  },
  {
    id: 'h5',
    view: Month,
    date: '2027-03-01',
    start: '2027-03-13 10:00:00',
    end: '2027-03-15 10:00:00',
    expected: { first: '2027-03-13 00:00', span: 3 },
    note: 'Month Mar, spring-forward',
  },
  {
    id: 'h6',
    view: Week,
    date: '2027-03-10',
    start: '2027-03-12 10:00:00',
    end: '2027-03-15 10:00:00',
    expected: { first: '2027-03-12 00:00', span: 3 },
    note: 'Week Mar8-14, spring-forward',
  },
  {
    id: 'h7',
    view: Day,
    date: '2026-11-01',
    start: '2026-10-31 10:00:00',
    end: '2026-11-02 10:00:00',
    expected: { first: '2026-11-01 00:00', span: 48 },
    note: 'Day on fall-back day (middle)',
  },
  {
    id: 'h8',
    view: Day,
    date: '2027-03-14',
    start: '2027-03-13 10:00:00',
    end: '2027-03-15 10:00:00',
    expected: { first: '2027-03-14 00:00', span: 46 },
    note: 'Day on spring-forward day (middle)',
  },
]);
