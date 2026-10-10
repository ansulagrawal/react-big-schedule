# React Big Schedule

[![NPM version][npm-image]][npm-url] [![MIT License][mit-image]][mit-url]

[npm-image]: http://img.shields.io/npm/v/react-big-schedule.svg
[npm-url]: http://npmjs.org/package/react-big-schedule
[mit-image]: https://img.shields.io/badge/License-MIT-green.svg
[mit-url]: https://github.com/ansulagrawal/react-big-schedule/blob/master/LICENSE

A free, MIT-licensed React calendar and resource scheduler: month, week, day, list and year views, a resource timeline, drag and drop, event sources, recurring events, time zones, five design styles with palettes, light and dark. TypeScript, no UI library.

**Documentation, live demos and the full API: https://react-big-schedule.ansulagrawal.com**

## Install

```bash
npm install react-big-schedule
# or: yarn add / pnpm add / bun add
```

React 18 or 19 is a peer dependency. The package is ESM only and ships its own types.

## Quick start

```tsx
import { Calendar } from 'react-big-schedule';
import 'react-big-schedule/dist/css/style.css';

const events = [{ id: 1, title: 'Standup', start: '2026-10-12T09:00', end: '2026-10-12T09:30' }];

export default () => <Calendar events={events} theme="dark" look="material" palette="purple" editable selectable />;
```

For the resource timeline use `Scheduler` with `SchedulerData`; see the website for a complete example.

## Upgrading

Only 9.0.0 or later is supported; earlier versions are deprecated on npm. antd is no longer a dependency, the package is ESM only and React is a peer dependency. See the [upgrade guide](https://react-big-schedule.ansulagrawal.com/docs) and the [release notes](.github/release-notes/v9.0.0.md).

## Contributing

Fork, branch, `bun install`, `bun run check` and `bun run build:lib`, then open a pull request against `master`. See [CONTRIBUTING.md](CONTRIBUTING.md). The demos and docs site lives in [react-big-schedule-site](https://github.com/ansulagrawal/react-big-schedule-site); point its `react-big-schedule` dependency at your checkout (`file:../react-big-schedule`) to try a change there. Questions and bugs: [GitHub issues](https://github.com/ansulagrawal/react-big-schedule/issues).

## License and credits

[MIT](LICENSE). Forked from [react-big-scheduler](https://github.com/StephenChou1017/react-big-scheduler) and [react-big-scheduler-stch](https://github.com/hbatalhaStch/react-big-scheduler); thanks to all [contributors](https://github.com/ansulagrawal/react-big-schedule/graphs/contributors).
