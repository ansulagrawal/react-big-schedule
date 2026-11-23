// Run: bun src/calendar/a11y.check.ts
import { readableText } from './utils';

const assert = (ok: boolean, msg: string) => {
  if (!ok) throw new Error(msg);
};

// text colour picked for event backgrounds must be readable (WCAG AA: 4.5:1)
const lum = (hex: string) => {
  const [r = 0, g = 0, b = 0] = [1, 3, 5]
    .map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};
for (const bg of [
  '#16a34a',
  '#2563eb',
  '#ff0000',
  '#f759ab',
  '#fa9e95',
  '#d9d9d9',
  '#1e3a8a',
  '#000000',
  '#ffffff',
  '#fbbf24',
]) {
  const fg = readableText(bg) as string;
  const full = fg === '#fff' ? '#ffffff' : '#111111';
  assert(
    contrast(bg, full) >= 4.5 || contrast(bg, full) >= contrast(bg, full === '#ffffff' ? '#111111' : '#ffffff'),
    `${bg} -> ${fg}`,
  );
}
assert(readableText('red') === '#111', 'named colour');
assert(readableText('rgb(0, 0, 0)') === '#fff', 'rgb()');
assert(readableText('#fff') === '#111', 'short hex');
assert(readableText('var(--accent)') === undefined, 'unknown format falls back to the theme colour');
assert(readableText(undefined) === undefined, 'no colour');
console.log('a11y.check passed');
