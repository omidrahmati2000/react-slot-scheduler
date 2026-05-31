export type CalendarViewMode = 'day' | 'week';
export type SchedulerMode = 'time-grid' | 'task-timeline' | 'resource-planner';

export type SlotStatus =
  | 'available'
  | 'booked'
  | 'blocked'
  | 'outside'
  | 'custom';

export interface CalendarSlot {
  startTime: string;
  endTime: string;
  status: SlotStatus;
  itemId?: string;
  /** @deprecated Use itemId */
  bookingId?: string;
  title?: string;
  description?: string;
}

export interface DaySchedule {
  date: string;
  isWorkingDay: boolean;
  workStartTime?: string;
  workEndTime?: string;
  slots: CalendarSlot[];
}

export interface TaskTimelineItem {
  id: string;
  date: string;
  endDate?: string;      // last day of multi-day span (inclusive, YYYY-MM-DD)
  startTime: string;
  endTime: string;
  title: string;
  status?: SlotStatus;
  description?: string;
  assignee?: string;
  progress?: number;
  resourceId?: string;
  meta?: Record<string, unknown>;
}

export interface ResourcePlannerItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  resourceId: string;
  title: string;
  status?: SlotStatus;
  description?: string;
  meta?: Record<string, unknown>;
}

export interface ResourceDefinition {
  id: string;
  title: string;
  meta?: Record<string, unknown>;
}

// ─── Gantt / Horizontal scheduler types ────────────────────────────────────

export interface GanttRow {
  id: string;
  label: string;
  subLabel?: string;
  color?: string;
}

export interface GanttItem {
  id: string;
  rowId: string;
  date: string;         // start date YYYY-MM-DD
  endDate?: string;     // end date for multi-day spans
  startTime: string;    // 'HH:mm'
  endTime: string;      // 'HH:mm'
  title: string;
  subTitle?: string;
  status: SlotStatus;
}

export interface GanttMovePayload {
  item: GanttItem;
  newRowId: string;
  newStartTime: string;
  newEndTime: string;
  newDate: string;
  newEndDate?: string;   // set when moving a multi-day item
}

export interface GanttResizePayload {
  item: GanttItem;
  newStartTime: string;
  newEndTime: string;
}

export interface GanttCreatePayload {
  rowId: string;
  date: string;          // start date
  endDate?: string;      // end date when day-mode drag spans multiple columns
  startTime: string;
  endTime: string;
}

export type GanttTimeUnit = 'hour' | 'day';
export type GanttScale = 'day' | 'week' | 'month';

export interface GanttDataAdapter<TData = unknown> {
  toGantt: (input: TData, options: { date: Date; locale: string }) => {
    rows: GanttRow[];
    items: GanttItem[];
    timeStart: number;        // hour 0-23
    timeEnd: number;          // hour 0-23
    granularity: number;      // minutes
    timeUnit: GanttTimeUnit;  // 'hour' = day view, 'day' = week/month view
    scale?: GanttScale;       // default 'week' for day mode
  };
}

// Legacy — time-grid mode only
export interface SchedulerDataAdapter<TData = unknown> {
  toSchedules: (input: TData) => DaySchedule[];
  toGantt?: never;
}

export interface SlotMovePayload {
  slot: CalendarSlot;
  from: { date: string; startTime: string; endTime: string };
  to: { date: string; startTime: string; endTime: string };
}

export interface SlotConflictPayload extends SlotMovePayload {
  reason: 'overlap' | 'blocked-by-policy';
  conflictingSlot?: CalendarSlot;
}

export interface CalendarTheme {
  primary: string;
  bg: string;
  panel: string;
  border: string;
  text: string;
  mutedText: string;
  availableBg: string;
  bookedBg: string;
  blockedBg: string;
  customBg: string;
}

export interface BookingCalendarProps {
  value: Date;
  onChange: (date: Date) => void;
  schedules: DaySchedule[];
  mode?: SchedulerMode;
  dataAdapter?: SchedulerDataAdapter<any> | GanttDataAdapter<any>;
  ganttTimeUnit?: GanttTimeUnit;   // override adapter's timeUnit
  ganttScale?: GanttScale;         // override adapter's scale
  dataSource?: unknown;
  resources?: ResourceDefinition[];
  viewMode?: CalendarViewMode;
  onViewModeChange?: (mode: CalendarViewMode) => void;
  onSlotClick?: (date: string, slot: CalendarSlot) => void;
  onItemClick?: (itemId: string) => void;
  /** @deprecated Use onItemClick */
  onBookingClick?: (bookingId: string) => void;
  onSlotMove?: (payload: SlotMovePayload) => void;
  onGanttItemMove?: (payload: GanttMovePayload) => void;
  onGanttItemResize?: (payload: GanttResizePayload) => void;
  onGanttItemCreate?: (payload: GanttCreatePayload) => void;
  onBeforeSlotMove?: (payload: SlotMovePayload) => boolean | Promise<boolean>;
  onSlotConflict?: (payload: SlotConflictPayload) => void;
  draggableSlots?: boolean;
  selectionMode?: boolean;
  selectedSlots?: Array<{ date: string; startTime: string; endTime: string }>;
  onSelectionChange?: (slots: Array<{ date: string; startTime: string; endTime: string }>) => void;
  onSlotDragSelectStart?: (slot: { date: string; startTime: string; endTime: string }) => void;
  onSlotDragSelectMove?: (slot: { date: string; startTime: string; endTime: string }) => void;
  onSlotDragSelectEnd?: (slots: Array<{ date: string; startTime: string; endTime: string }>) => void;
  isSlotSelected?: (slot: { date: string; startTime: string; endTime: string }) => boolean;
  slotGranularity?: number;
  locale?: string;
  weekStartsOn?: 0 | 1 | 6;
  direction?: 'rtl' | 'ltr' | 'auto';
  translations?: Partial<{
    previous: string;
    today: string;
    next: string;
    day: string;
    week: string;
  }>;
  theme?: Partial<CalendarTheme>;
  hideTimeColumn?: boolean;
  className?: string;
}

export type SlotCalendarProps = BookingCalendarProps;
