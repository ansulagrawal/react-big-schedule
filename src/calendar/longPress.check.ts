// Run: bun src/calendar/longPress.check.ts
import { startLongPress } from './longPress';

const assert = (ok: boolean, msg: string) => {
  if (!ok) throw new Error(msg);
};
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// the helper only touches window listeners and navigator.vibrate
const added: string[] = [];
const removed: string[] = [];
(globalThis as unknown as { window: unknown }).window = {
  addEventListener: (t: string) => added.push(t),
  removeEventListener: (t: string) => removed.push(t),
};
(globalThis as unknown as { navigator: unknown }).navigator = { vibrate: () => true };

const at = (pointerType: string) => ({ pointerType, clientX: 100, clientY: 100 });

// mouse and pen: armed at once, nothing registered
let armed = 0;
const mouse = startLongPress(at('mouse'), { onArm: () => armed++ });
assert(
  mouse.armed && mouse.move(500, 500) === 'drag' && armed === 1 && added.length === 0,
  'mouse is armed immediately',
);

// touch with delay 0 behaves like a mouse
assert(startLongPress(at('touch'), { delay: 0 }).armed, 'delay 0 is immediate');

// touch: a swipe before the hold finishes cancels, a small drift waits
const swipe = startLongPress(at('touch'), { delay: 40 });
assert(!swipe.armed && swipe.move(104, 103) === 'wait', 'small drift keeps waiting');
assert(swipe.move(100, 160) === 'cancel', 'moving far before the hold is a scroll');
swipe.stop();
assert(removed.includes('touchmove') && removed.includes('contextmenu'), 'stop removes the listeners');

// touch: holding still arms after the delay, then moves drag
let lifted = 0;
const hold = startLongPress(at('touch'), { delay: 30, onArm: () => lifted++ });
await sleep(60);
assert(hold.armed && lifted === 1 && hold.move(100, 300) === 'drag', 'arms after the hold');
hold.stop();

// stopping early prevents arming
let late = 0;
const early = startLongPress(at('touch'), { delay: 30, onArm: () => late++ });
early.stop();
await sleep(60);
assert(!early.armed && late === 0, 'stop before the hold cancels it');

console.log('longPress.check passed');
