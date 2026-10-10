import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const GAP = 6;
const EDGE = 4;

// placement: top|bottom + Left|Right|(centre); offset: [x, y] nudge in px
function place(anchor: Element, pop: HTMLElement, placement: string, [dx, dy]: [number, number]) {
  const a = anchor.getBoundingClientRect();
  const p = pop.getBoundingClientRect();
  const above = a.top - p.height - GAP;
  const below = a.bottom + GAP;
  let top = placement.startsWith('top') ? above : below;
  if (top < 0 && above < 0) top = below;
  else if (top + p.height > window.innerHeight && above > 0) top = above;
  let left = a.left + (a.width - p.width) / 2;
  if (placement.endsWith('Left')) left = a.left;
  else if (placement.endsWith('Right')) left = a.right - p.width;
  left = Math.max(EDGE, Math.min(left + dx, window.innerWidth - p.width - EDGE));
  return { top: top + dy, left };
}

export interface PopoverProps {
  content: ReactNode;
  placement?: string;
  trigger?: 'hover' | 'click';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  offset?: [number, number];
  className?: string;
  children: ReactNode;
}

function Popover({
  content,
  placement = 'bottomLeft',
  trigger = 'hover',
  open,
  onOpenChange,
  offset = [0, 0],
  className = '',
  children,
}: PopoverProps) {
  const [innerOpen, setInnerOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [theme, setTheme] = useState<string | undefined>();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isControlled = open !== undefined;
  const shown = isControlled ? open : innerOpen;
  const isHover = trigger === 'hover';

  const setShown = (value: boolean) => {
    if (!isControlled) setInnerOpen(value);
    onOpenChange?.(value);
  };
  const show = () => {
    clearTimeout(timer.current);
    setShown(true);
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShown(false), 100);
  };

  useLayoutEffect(() => {
    const anchor = anchorRef.current?.firstElementChild;
    const pop = popRef.current;
    if (!shown || !anchor || !pop) {
      setPos(null);
      return undefined;
    }
    setTheme((anchor.closest('[data-rbs-theme]') as HTMLElement | null)?.dataset.rbsTheme);
    const update = () => setPos(place(anchor, pop, placement, offset));
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [shown, placement, offset[0], offset[1], content]);

  useEffect(() => {
    if (!shown || trigger !== 'click') return undefined;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!anchorRef.current?.contains(target) && !popRef.current?.contains(target)) setShown(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [shown, trigger]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <>
      <span
        ref={anchorRef}
        style={{ display: 'contents' }}
        onMouseEnter={isHover ? show : undefined}
        onMouseLeave={isHover ? hide : undefined}
        onClick={trigger === 'click' ? () => setShown(!shown) : undefined}
      >
        {children}
      </span>
      {shown &&
        createPortal(
          <div
            ref={popRef}
            role="tooltip"
            data-rbs-theme={theme}
            className={`rbs-popover ${className}`}
            style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, visibility: pos ? 'visible' : 'hidden' }}
            onMouseEnter={isHover ? show : undefined}
            onMouseLeave={isHover ? hide : undefined}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}

export default Popover;
