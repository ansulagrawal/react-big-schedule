import { type ComponentType, lazy } from 'react';

export interface Route {
  path: string;
  label: string;
  component: ComponentType;
}

export interface RouteGroup {
  title: string;
  routes: Route[];
}

const page = (path: string, label: string, load: () => Promise<{ default: ComponentType }>): Route => ({
  path,
  label,
  component: lazy(load),
});

export const groups: RouteGroup[] = [
  { title: 'Overview', routes: [page('/', 'Home', () => import('./pages/Home'))] },
  {
    title: 'Scheduler',
    routes: [
      page('/basic', 'Basic', () => import('./pages/Basic')),
      page('/read-only', 'Read Only', () => import('./pages/Read-Only')),
      page('/add-more', 'Add More', () => import('./pages/Add-More')),
      page('/drag-and-drop', 'Drag and Drop', () => import('./pages/Drag-And-Drop')),
      page('/custom-time', 'Custom Time', () => import('./pages/Custom-Time')),
      page('/resize-by-parent', 'Resize By Parent', () => import('./pages/Resize-By-Parent')),
      page('/vertical-view', 'Vertical View', () => import('./pages/VerticalView')),
      page('/customization', 'Customization', () => import('./pages/Customization')),
      page('/grouped-header', 'Grouped Header', () => import('./pages/Grouped-Header')),
      page('/cadence', 'Weekly / Monthly', () => import('./pages/Cadence')),
      page('/hide-weekends', 'Hide Weekends', () => import('./pages/Hide-Weekends')),
      page('/infinite-scroll', 'Infinite Scroll', () => import('./pages/Infinite-Scroll')),
    ],
  },
  { title: 'Calendar', routes: [page('/calendar', 'Calendar', () => import('./pages/Calendar'))] },
];

export const routes = groups.flatMap(g => g.routes);
