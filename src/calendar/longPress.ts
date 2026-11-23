/** Touch long-press: on a touch screen a drag or selection starts after the finger rests, so a plain swipe still scrolls. */

export const DEFAULT_LONG_PRESS = 400;
/** How far (px) a finger may drift while waiting before the press counts as a scroll. */
const SLOP = 10;

export interface LongPress {
  /** True once the press may start dragging: immediately for mouse/pen or a 0 delay, else after the hold. */
  readonly armed: boolean;
  /** Feed pointer moves: 'cancel' means the finger scrolled before the hold finished. */
  move(x: number, y: number): 'cancel' | 'wait' | 'drag';
  stop(): void;
}

export interface LongPressOptions {
  /** Hold time in ms for touch pointers; 0 (or less) starts at once. Default 400. */
  delay?: number;
  /** Runs when the hold completes (lift the element, etc.). */
  onArm?: () => void;
}

const NOW_ARMED: LongPress = { armed: true, move: () => 'drag', stop: () => {} };

/**
 * Start tracking a press. Only touch pointers wait: mouse and pen are armed at once. After the hold the page
 * stops scrolling under the finger (a non-passive touchmove listener) and the long-press context menu is blocked.
 */
export function startLongPress(
  e: { pointerType: string; clientX: number; clientY: number },
  { delay = DEFAULT_LONG_PRESS, onArm }: LongPressOptions = {},
): LongPress {
  if (e.pointerType !== 'touch' || delay <= 0) {
    onArm?.();
    return NOW_ARMED;
  }
  let armed = false;
  const stopScroll = (ev: TouchEvent) => {
    if (armed && ev.cancelable) ev.preventDefault();
  };
  const noMenu = (ev: Event) => ev.preventDefault();
  const timer = setTimeout(() => {
    armed = true;
    navigator.vibrate?.(12);
    onArm?.();
  }, delay);
  // listeners go on at press time: a touchmove listener added later is ignored once scrolling has begun
  window.addEventListener('touchmove', stopScroll, { passive: false });
  window.addEventListener('contextmenu', noMenu);
  return {
    get armed() {
      return armed;
    },
    move(x, y) {
      if (armed) return 'drag';
      return Math.hypot(x - e.clientX, y - e.clientY) > SLOP ? 'cancel' : 'wait';
    },
    stop() {
      clearTimeout(timer);
      window.removeEventListener('touchmove', stopScroll);
      window.removeEventListener('contextmenu', noMenu);
    },
  };
}
