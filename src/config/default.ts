export const DATE_FORMAT = 'YYYY-MM-DD';

export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const ViewType = {
  Day: 0,
  Week: 1,
  Month: 2,
  Quarter: 3,
  Year: 4,
  Custom: 5,
  Custom1: 6,
  Custom2: 7,
  VerticalResource: 8,
} as const;
export type ViewType = (typeof ViewType)[keyof typeof ViewType];

export const CellUnit = { Day: 0, Hour: 1, Week: 2, Month: 3, Year: 4, Quarter: 5 } as const;
export type CellUnit = (typeof CellUnit)[keyof typeof CellUnit];

export const SummaryPos = {
  Top: 0,
  TopRight: 1,
  TopLeft: 2,
  Bottom: 3,
  BottomRight: 4,
  BottomLeft: 5,
} as const;
export type SummaryPos = (typeof SummaryPos)[keyof typeof SummaryPos];

export const DnDTypes = { EVENT: 'event' } as const;
export type DnDTypes = (typeof DnDTypes)[keyof typeof DnDTypes];
