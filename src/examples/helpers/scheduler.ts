import type { ComponentProps } from 'react';
import type { Scheduler, SchedulerData, ViewType } from '../../index';
import type { Id } from '../../types';

/** Props of the library Scheduler, used to type the example callbacks. */
export type SP = ComponentProps<typeof Scheduler>;

/** Item dragged in from outside (a task or a resource, see DnDSource). */
export interface DndItem {
  id?: Id;
  name?: string;
  resourceIds?: Id[];
}

/** A shallow copy of the view model, so React sees a new reference and re-renders. */
export const copyOf = (schedulerData: SchedulerData): SchedulerData =>
  Object.assign(Object.create(Object.getPrototypeOf(schedulerData)) as SchedulerData, schedulerData);

/** The header reports the view type as a plain number. */
export const asViewType = (value: number) => value as ViewType;
