// Run: bun src/components/virtual.check.ts
import { ViewType } from '../config/default';
import SchedulerData from './SchedulerData';
import { getRowWindow } from './virtual';

const assert = (ok: boolean, msg: string) => {
  if (!ok) throw new Error(msg);
};
const same = (a: unknown, b: unknown, msg: string) =>
  assert(JSON.stringify(a) === JSON.stringify(b), `${msg}: ${JSON.stringify(a)}`);

// 10 rows of 30px: pixel range [65, 130) overlaps rows 2..4 (60-90, 90-120, 120-150)
same(getRowWindow(Array(10).fill(30), 65, 130), { start: 2, end: 5, padTop: 60, padBottom: 150 }, 'middle');
same(
  getRowWindow(Array(10).fill(30), -400, 100),
  { start: 0, end: 4, padTop: 0, padBottom: 180 },
  'top, negative from',
);
same(getRowWindow(Array(10).fill(30), 250, 900), { start: 8, end: 10, padTop: 240, padBottom: 0 }, 'bottom');
same(getRowWindow([20, 50, 10], 20, 70), { start: 1, end: 2, padTop: 20, padBottom: 10 }, 'uneven heights');
same(getRowWindow([], 0, 100), { start: 0, end: 0, padTop: 0, padBottom: 0 }, 'no rows');
for (const [from, to] of [
  [0, 1],
  [29, 31],
  [299, 400],
  [123, 124],
]) {
  const w = getRowWindow(Array(10).fill(30), from, to);
  assert(w.padTop + (w.end - w.start) * 30 + w.padBottom === 300, `heights add up for ${from}-${to}`);
}

// the data layer stays cheap at 10k events x 200 resources (render cost is what windowing removes)
const sd = new SchedulerData('2026-11-01', ViewType.Month);
sd.setResources(Array.from({ length: 200 }, (_, i) => ({ id: `r${i}`, name: `R${i}` })));
const base = new Date('2026-11-01T00:00:00').getTime();
const fmt = (t: number) => sd.localeDayjs(new Date(t)).format('YYYY-MM-DD HH:mm:ss');
const events = Array.from({ length: 10000 }, (_, i) => {
  const s = base + ((i * 7919) % (30 * 24)) * 3600_000;
  return { id: i, title: `E${i}`, start: fmt(s), end: fmt(s + 6 * 3600_000), resourceId: `r${i % 200}` };
});
const t = performance.now();
sd.setEvents(events);
const ms = performance.now() - t;
assert(ms < 3000, `setEvents(10k) took ${ms.toFixed(0)}ms`);
// switching views must stay fast even with wide header rows (year: 260 cells, vertical: one column per resource)
sd.config.displayWeekend = false;
for (const [name, vt] of [
  ['day', ViewType.Day],
  ['year', ViewType.Year],
  ['vertical', ViewType.VerticalResource],
] as const) {
  const t1 = performance.now();
  sd.setViewType(vt, false, false);
  sd.setEvents(events);
  const took = performance.now() - t1;
  assert(took < 1500, `switching to ${name} took ${took.toFixed(0)}ms`);
}
console.log(`virtual.check passed (setEvents 10k x 200: ${ms.toFixed(0)}ms)`);
