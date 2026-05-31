<div align="center">

# react-slot-scheduler

**The lightweight slot calendar for React — zero dependencies, RTL-first, 3 scheduler modes + complete demo patterns.**

[![npm](https://img.shields.io/npm/v/@omidrahmati/react-slot-scheduler?color=0f766e)](https://www.npmjs.com/package/@omidrahmati/react-slot-scheduler)
[![gzip size](https://img.shields.io/bundlephobia/minzip/@omidrahmati/react-slot-scheduler?color=0f766e&label=27%20kB%20gzip)](https://bundlephobia.com/package/@omidrahmati/react-slot-scheduler)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18%2B-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![zero deps](https://img.shields.io/badge/dependencies-0-brightgreen)](https://bundlephobia.com/package/@omidrahmati/react-slot-scheduler)
[![license: MIT](https://img.shields.io/npm/l/@omidrahmati/react-slot-scheduler?color=0f766e)](./LICENSE)

</div>

---

<table>
  <tr>
    <td width="50%">
      <img src="https://raw.githubusercontent.com/omidrahmati2000/react-slot-scheduler/main/media/screenshot-fa-light.png" alt="React slot scheduler — Persian RTL, Jalali calendar, appointment booking" />
      <p align="center"><sub>🇮🇷 Persian · RTL · Jalali · Appointment</sub></p>
    </td>
    <td width="50%">
      <img src="https://raw.githubusercontent.com/omidrahmati2000/react-slot-scheduler/main/media/screenshot-meeting-dark.png" alt="React slot scheduler — Meeting room drag and drop rescheduling, dark mode" />
      <p align="center"><sub>🏢 Meeting Room · Drag & drop · Dark mode</sub></p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="https://raw.githubusercontent.com/omidrahmati2000/react-slot-scheduler/main/media/screenshot-task-timeline.png" alt="React slot scheduler — Gantt task timeline, assignee, progress, dark mode" />
      <p align="center"><sub>🗂️ Task Timeline · Gantt · Assignee · Progress %</sub></p>
    </td>
    <td width="50%">
      <img src="https://raw.githubusercontent.com/omidrahmati2000/react-slot-scheduler/main/media/screenshot-resource-planner.png" alt="React slot scheduler — Resource planner, rooms, doctors, overlap stacking" />
      <p align="center"><sub>🧩 Resource Planner · Overlap stacking · Week/Month</sub></p>
    </td>
  </tr>
</table>

---

## Why react-slot-scheduler?

| | **react-slot-scheduler** | Alternatives |
|---|---|---|
| Bundle (gzip) | **27 kB** | 400–800 kB (antd + react-dnd + dayjs) |
| Dependencies | **0** | 5–10 packages |
| RTL / Persian / Arabic | ✅ **built-in** | ❌ not supported |
| Dark mode | ✅ **CSS tokens** | ❌ manual |
| TypeScript | ✅ **100% typed** | partial |
| Scheduling modes | ✅ **Multiple production modes** | time-grid only |
| API style | ✅ **hooks props** | class-based (`SchedulerData`) |
| UI framework lock-in | ✅ **none** | Ant Design required |
| Next.js / SSR | ✅ **ready** | varies |

---

## Scheduling Modes

| Mode | Import / `mode` prop | Use case |
|---|---|---|
| **Time Grid** | default — no `mode` needed | Appointment booking, clinic, salon |
| **Meeting Room** | default — use `DaySchedule[]` | Office meeting room reservation |
| **Task Timeline** | `mode="task-timeline"` + `createTaskTimelineAdapter()` | Team task / sprint scheduling |
| **Resource Planner** | `mode="resource-planner"` + `createResourcePlannerAdapter()` | Multi-resource (rooms, doctors, staff) |
| **Theme Playground (Demo tab)** | — | Preview 6 built-in color presets |

---

## Install

```bash
npm i @omidrahmati/react-slot-scheduler
# yarn add @omidrahmati/react-slot-scheduler
# pnpm add @omidrahmati/react-slot-scheduler
```

Import the stylesheet once at your app entry:

```ts
import '@omidrahmati/react-slot-scheduler/dist/index.css';
```

### Quick Start (from scratch)

```tsx
import { useState } from 'react';
import { BookingCalendar, type DaySchedule } from '@omidrahmati/react-slot-scheduler';
import '@omidrahmati/react-slot-scheduler/dist/index.css';

const schedules: DaySchedule[] = [
  {
    date: '2026-06-01',
    isWorkingDay: true,
    slots: [
      { startTime: '09:00', endTime: '10:00', status: 'booked', itemId: 'a-1', title: 'Standup' },
    ],
  },
];

export default function App() {
  const [value, setValue] = useState(new Date('2026-06-01'));
  return <BookingCalendar value={value} onChange={setValue} schedules={schedules} locale="en-US" />;
}
```

### Next.js App Router

Import CSS once in your app layout or root client entry:

```tsx
// app/layout.tsx
import '@omidrahmati/react-slot-scheduler/dist/index.css';
```

---

## Mode 1 — Appointment / Time Grid

The default mode. Pass a `DaySchedule[]` array — each day has a list of time slots.

```tsx
import { useState } from 'react';
import { BookingCalendar } from '@omidrahmati/react-slot-scheduler';
import type { DaySchedule } from '@omidrahmati/react-slot-scheduler';
import '@omidrahmati/react-slot-scheduler/dist/index.css';

const schedules: DaySchedule[] = [
  {
    date: '2026-06-01',        // YYYY-MM-DD
    isWorkingDay: true,
    workStartTime: '09:00',    // sets the visible grid start
    workEndTime: '18:00',      // sets the visible grid end
    slots: [
      {
        startTime: '09:00',
        endTime: '10:00',
        status: 'booked',
        itemId: 'appt-1',      // passed to onItemClick when clicked
        title: 'Alice — Haircut',
        description: 'Confirmed',
      },
      {
        startTime: '11:00',
        endTime: '11:30',
        status: 'blocked',
        title: 'Lunch Break',
      },
    ],
  },
  {
    date: '2026-06-02',
    isWorkingDay: false,       // greys out the column, no slots rendered
    slots: [],
  },
];

export default function App() {
  const [date, setDate] = useState(new Date());

  return (
    <BookingCalendar
      value={date}
      onChange={setDate}
      schedules={schedules}
      locale="en-US"
      weekStartsOn={1}         // 1 = Monday
      onItemClick={(id) => console.log('booked slot clicked:', id)}
      onSlotClick={(date, slot) => console.log('empty area clicked:', date, slot)}
    />
  );
}
```

### Drag & Drop Rescheduling

```tsx
const [schedules, setSchedules] = useState<DaySchedule[]>(initial);

function handleMove({ slot, from, to }: SlotMovePayload) {
  setSchedules(prev =>
    prev.map(day => {
      if (day.date === from.date)
        return {
          ...day,
          slots: day.slots.filter(s => s.startTime !== from.startTime),
        };
      if (day.date === to.date)
        return {
          ...day,
          slots: [...day.slots, { ...slot, startTime: to.startTime, endTime: to.endTime }],
        };
      return day;
    })
  );
}

<BookingCalendar
  draggableSlots
  onSlotMove={handleMove}
  schedules={schedules}
  value={date}
  onChange={setDate}
/>
```

### Multi-Select Empty Slots

Drag across empty cells to select a time range. Only fires on cells that have no existing slot.

```tsx
<BookingCalendar
  selectionMode
  onSlotDragSelectEnd={(slots) => {
    // slots: Array<{ date: string; startTime: string; endTime: string }>
    openBookingDialog(slots);
  }}
  onSelectionChange={(slots) => setSelectionCount(slots.length)}
  schedules={schedules}
  value={date}
  onChange={setDate}
/>
```

---

## Mode 2 — Persian / Arabic RTL

Switch locale and the layout, dates, and labels all change automatically.

```tsx
<BookingCalendar
  locale="fa-IR"
  weekStartsOn={6}       // 6 = Saturday (start of week in Iran)
  direction="auto"       // RTL detected from locale automatically
  translations={{
    previous: 'Previous',
    today:    'Today',
    next:     'Next',
    day:      'Day',
    week:     'Week',
  }}
  schedules={schedules}
  value={date}
  onChange={setDate}
/>
```

Supported locales: `fa-IR`, `ar`, `ar-SA`, `ar-EG`, `en-US`, `en-GB`, and any BCP-47 string supported by `Intl`.

---

## Mode 3 — Task Timeline (Gantt)

Use `mode="task-timeline"` with `createTaskTimelineAdapter()`. Each item has an `assignee` and `progress` field.

```tsx
import {
  BookingCalendar,
  createTaskTimelineAdapter,
} from '@omidrahmati/react-slot-scheduler';
import type { TaskTimelineItem } from '@omidrahmati/react-slot-scheduler';

const tasks: TaskTimelineItem[] = [
  {
    id: 'task-1',
    date: '2026-06-01',
    startTime: '09:00',
    endTime: '10:30',
    title: 'Design Review',
    status: 'booked',       // 'booked' | 'blocked' | 'custom'
    assignee: 'Sara',
    progress: 70,           // 0–100
  },
  {
    id: 'task-2',
    date: '2026-06-01',
    startTime: '11:00',
    endTime: '12:00',
    title: 'API Contract',
    status: 'custom',
    assignee: 'Arman',
    progress: 35,
  },
  {
    id: 'task-3',
    date: '2026-06-02',
    startTime: '10:00',
    endTime: '11:30',
    title: 'QA Sync',
    status: 'blocked',
    assignee: 'Neda',
    progress: 50,
  },
];

export default function TaskScheduler() {
  const [date, setDate] = useState(new Date());
  const adapter = useMemo(() => createTaskTimelineAdapter(), []);

  return (
    <BookingCalendar
      mode="task-timeline"
      value={date}
      onChange={setDate}
      schedules={[]}              // not used in task-timeline mode
      dataAdapter={adapter}
      dataSource={tasks}
      locale="en-US"
      onItemClick={(id) => {
        const task = tasks.find(t => t.id === id);
        console.log('Task clicked:', task);
      }}
    />
  );
}
```

### `TaskTimelineItem` interface

```ts
interface TaskTimelineItem {
  id: string;
  date: string;        // start date: 'YYYY-MM-DD'
  endDate?: string;    // optional multi-day end date (inclusive)
  startTime: string;   // 'HH:mm'
  endTime: string;     // 'HH:mm'
  title: string;
  status?: 'available' | 'booked' | 'blocked' | 'outside' | 'custom';
  description?: string;
  assignee?: string;
  progress?: number;   // 0–100
  resourceId?: string;
  meta?: Record<string, unknown>;
}
```

---

## Mode 4 — Resource Planner

Use `mode="resource-planner"` with `createResourcePlannerAdapter(resources)`. Each item is linked to a resource via `resourceId`. The resource name is shown as the sub-label in each slot.

```tsx
import {
  BookingCalendar,
  createResourcePlannerAdapter,
} from '@omidrahmati/react-slot-scheduler';
import type {
  ResourceDefinition,
  ResourcePlannerItem,
} from '@omidrahmati/react-slot-scheduler';

const resources: ResourceDefinition[] = [
  { id: 'room-a',  title: 'Room A' },
  { id: 'room-b',  title: 'Room B' },
  { id: 'dr-amini', title: 'Dr. Amini' },
];

const items: ResourcePlannerItem[] = [
  {
    id: 'rp-1',
    date: '2026-06-01',
    startTime: '09:00',
    endTime: '10:00',
    resourceId: 'room-a',    // must match a resource id
    title: 'Team Sync',
    status: 'booked',
  },
  {
    id: 'rp-2',
    date: '2026-06-01',
    startTime: '10:30',
    endTime: '11:30',
    resourceId: 'room-b',
    title: 'Client Call',
    status: 'custom',
  },
  {
    id: 'rp-3',
    date: '2026-06-02',
    startTime: '14:00',
    endTime: '15:00',
    resourceId: 'dr-amini',
    title: 'Consultation',
    status: 'booked',
  },
];

export default function ResourceCalendar() {
  const [date, setDate] = useState(new Date());
  const adapter = useMemo(() => createResourcePlannerAdapter(resources), []);

  return (
    <BookingCalendar
      mode="resource-planner"
      value={date}
      onChange={setDate}
      schedules={[]}
      resources={resources}
      dataAdapter={adapter}
      dataSource={items}
      locale="en-US"
      onItemClick={(id) => {
        const item = items.find(i => i.id === id);
        const resource = resources.find(r => r.id === item?.resourceId);
        console.log(`${item?.title} — ${resource?.title}`);
      }}
    />
  );
}
```

### `ResourceDefinition` interface

```ts
interface ResourceDefinition {
  id: string;
  title: string;   // displayed as slot sub-label
  meta?: Record<string, unknown>;
}
```

### `ResourcePlannerItem` interface

```ts
interface ResourcePlannerItem {
  id: string;
  date: string;        // 'YYYY-MM-DD'
  startTime: string;   // 'HH:mm'
  endTime: string;     // 'HH:mm'
  resourceId: string;  // must match a ResourceDefinition.id
  title: string;
  status?: 'available' | 'booked' | 'blocked' | 'outside' | 'custom';
  description?: string;
  meta?: Record<string, unknown>;
}
```

---

## Dark Mode / Custom Theming

Override any or all of the 9 CSS design tokens:

```tsx
<BookingCalendar
  theme={{
    primary:   '#818cf8',   // accent — buttons, today cell, active tab
    bg:        '#0f172a',   // grid background
    panel:     '#1e293b',   // toolbar + time-label column
    border:    '#334155',   // grid lines
    text:      '#f1f5f9',   // primary text
    mutedText: '#94a3b8',   // time labels + slot sub-labels
    bookedBg:  '#3730a3',   // booked slot fill
    blockedBg: '#334155',   // blocked / outside slot fill
    customBg:  '#5b21b6',   // custom slot fill
  }}
  schedules={schedules}
  value={date}
  onChange={setDate}
/>
```

---

## Full API Reference

### `BookingCalendarProps`

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `Date` | — | **Required.** Currently focused date |
| `onChange` | `(date: Date) => void` | — | **Required.** Navigation callback |
| `schedules` | `DaySchedule[]` | — | **Required.** Pass `[]` when using `dataSource` |
| `mode` | `'time-grid' \| 'task-timeline' \| 'resource-planner'` | `'time-grid'` | Scheduler mode |
| `dataAdapter` | `SchedulerDataAdapter` | — | Required when `mode` is not `'time-grid'` |
| `dataSource` | `TaskTimelineItem[] \| ResourcePlannerItem[]` | — | Data for non-time-grid modes |
| `resources` | `ResourceDefinition[]` | — | Required when `mode="resource-planner"` |
| `ganttTimeUnit` | `'hour' \| 'day'` | adapter-driven | Override Gantt time unit in non-time-grid modes |
| `ganttScale` | `'day' \| 'week' \| 'month'` | adapter/default | Override day-mode column scale |
| `viewMode` | `'day' \| 'week'` | auto | Controlled view; auto = Day on mobile |
| `onViewModeChange` | `(mode) => void` | — | Fired on Day/Week toggle |
| `draggableSlots` | `boolean` | `false` | Enable HTML5 drag & drop |
| `onSlotMove` | `(payload: SlotMovePayload) => void` | — | Fires after a successful drop |
| `onBeforeSlotMove` | `(payload) => boolean \| Promise<boolean>` | — | Validate/deny drop before `onSlotMove` |
| `onSlotConflict` | `(payload: SlotConflictPayload) => void` | — | Fires on overlap or policy denial |
| `onGanttItemMove` | `(payload: GanttMovePayload) => void` | — | Fired when an item is moved in Gantt modes |
| `onGanttItemResize` | `(payload: GanttResizePayload) => void` | — | Fired when an item is resized in hour-based Gantt |
| `onGanttItemCreate` | `(payload: GanttCreatePayload) => void` | — | Fired when a new item is created by dragging on empty row space (hour mode) |
| `selectionMode` | `boolean` | `false` | Enable drag-to-select on empty cells |
| `selectedSlots` | `Array<{ date; startTime; endTime }>` | — | Controlled external selection model |
| `onSlotDragSelectStart` | `(slot) => void` | — | Fires when drag selection starts |
| `onSlotDragSelectMove` | `(slot) => void` | — | Fires for each entered empty cell |
| `onSlotDragSelectEnd` | `(slots[]) => void` | — | Fires on mouseup with selected cells |
| `onSelectionChange` | `(slots[]) => void` | — | Fires on each added cell |
| `isSlotSelected` | `(slot) => boolean` | — | Controlled external selection |
| `onSlotClick` | `(date, slot) => void` | — | Click on any slot |
| `onItemClick` | `(itemId) => void` | — | Click on slots with `itemId` / `id` |
| `onBookingClick` | `(bookingId) => void` | — | Deprecated alias of `onItemClick` |
| `slotGranularity` | `number` | `30` | Minutes per grid row (15, 30, 60…) |
| `locale` | `string` | `'fa-IR'` | BCP-47 locale — drives labels & direction |
| `weekStartsOn` | `0 \| 1 \| 6` | `6` | Week start: 0=Sun, 1=Mon, 6=Sat |
| `direction` | `'rtl' \| 'ltr' \| 'auto'` | `'auto'` | Layout direction |
| `translations` | `Partial<Translations>` | — | Override toolbar label strings |
| `theme` | `Partial<CalendarTheme>` | — | Override design tokens |
| `hideTimeColumn` | `boolean` | `false` | Hide the time-label column |
| `className` | `string` | — | Extra CSS class on root |

### Notes For Production Usage

- In `task-timeline` and `resource-planner` modes, pass `schedules={[]}` and provide `dataAdapter` + `dataSource`.
- `onGanttItemResize` applies to hour-based Gantt mode (`ganttTimeUnit="hour"`).
- `onGanttItemCreate` applies to hour-based Gantt mode (`ganttTimeUnit="hour"`).
- For policy validation in time-grid mode, use `onBeforeSlotMove` and handle denials via `onSlotConflict`.

---

### `DaySchedule`

Used in default `time-grid` mode. The `workStartTime` / `workEndTime` pair defines the visible hour range.

```ts
interface DaySchedule {
  date: string;            // 'YYYY-MM-DD'
  isWorkingDay: boolean;   // false → column is greyed, slots ignored
  workStartTime?: string;  // 'HH:mm' — grid visible start (default: min slot time)
  workEndTime?: string;    // 'HH:mm' — grid visible end   (default: max slot time)
  slots: CalendarSlot[];
}
```

### `CalendarSlot`

```ts
interface CalendarSlot {
  startTime: string;    // 'HH:mm'
  endTime: string;      // 'HH:mm'
  status: 'booked' | 'blocked' | 'outside' | 'custom';
  itemId?: string;      // → onItemClick fired when clicked
  bookingId?: string;   // deprecated alias for itemId
  title?: string;       // main label in slot
  description?: string; // sub-label in slot
}
```

> **Tip:** Do **not** create `status: 'available'` slots — empty grid cells already represent available time.
> In `selectionMode`, users drag across empty cells to select them.

### Slot Status Guide

| Status | Typical use | Click | Drag |
|---|---|---|---|
| `booked` | Confirmed reservation | ✅ `onItemClick` | ✅ if `draggableSlots` |
| `blocked` | Break, holiday, lunch | — | — |
| `outside` | Outside working hours | — | — |
| `custom` | App-defined category | ✅ `onItemClick` | ✅ if `draggableSlots` |

### `SlotMovePayload`

```ts
interface SlotMovePayload {
  slot: CalendarSlot;
  from: { date: string; startTime: string; endTime: string };
  to:   { date: string; startTime: string; endTime: string };
}
```

### `SlotConflictPayload`

```ts
interface SlotConflictPayload extends SlotMovePayload {
  reason: 'overlap' | 'blocked-by-policy';
  conflictingSlot?: CalendarSlot;
}
```

### `GanttMovePayload`

```ts
interface GanttMovePayload {
  item: GanttItem;
  newRowId: string;
  newDate: string;       // 'YYYY-MM-DD'
  newEndDate?: string;   // set for multi-day item moves
  newStartTime: string;  // 'HH:mm'
  newEndTime: string;    // 'HH:mm'
}
```

### `GanttResizePayload`

```ts
interface GanttResizePayload {
  item: GanttItem;
  newStartTime: string;
  newEndTime: string;
}
```

### `GanttCreatePayload`

```ts
interface GanttCreatePayload {
  rowId: string;
  date: string;       // start date: 'YYYY-MM-DD'
  endDate?: string;   // end date in day-scale multi-column drag
  startTime: string;  // 'HH:mm'
  endTime: string;    // 'HH:mm'
}
```

### `CalendarTheme` Tokens

| Token | Default | Controls |
|---|---|---|
| `primary` | `#0f766e` | Buttons, today column, active view tab |
| `bg` | `#f4f7f7` | Grid background |
| `panel` | `#ffffff` | Toolbar + time column |
| `border` | `#d6e0df` | Grid lines |
| `text` | `#102725` | Primary text |
| `mutedText` | `#5c7270` | Time labels, slot sub-labels |
| `availableBg` | `#ffffff` | Empty-slot surface |
| `bookedBg` | `#fee2e2` | Booked slot background |
| `blockedBg` | `#e5e7eb` | Blocked/outside slot background |
| `customBg` | `#e0f2fe` | Custom slot background |

---

## Demo App

```bash
git clone https://github.com/omidrahmati2000/react-slot-scheduler
cd react-slot-scheduler/example
npm install
npm run dev   # → http://localhost:5173
```

### Deploy Demo on Vercel

The example app is deploy-ready for Vercel.

1. Import this repository into Vercel
2. Set Root Directory to `example`
3. Deploy

Detailed guide: [Vercel Deployment Guide](./docs/usage/vercel-deployment.md)

| Tab | Mode | What it shows |
|---|---|---|
| 📅 Appointment | time-grid | FA ↔ EN, drag & drop, multi-select, 4 color swatches |
| 🏢 Meeting Room | time-grid | Live drag-rescheduling with React state |
| 🗂️ Task Timeline | task-timeline | Bilingual tasks with assignee, dark/light |
| 🧩 Resource Planner | resource-planner | Multi-resource (rooms + doctors), FA/EN |
| 🎨 Themes | — | 6 presets: Ocean, Forest, Sunset, Midnight, Sakura, Gold |

---

## Scripts

```bash
npm run build          # compile → dist/
npm run typecheck      # TypeScript strict check
npm run test           # vitest run
npm run test:coverage  # coverage report
```

---

## Deep Usage Guides

- [Model Selection Guide](./docs/usage/model-selection-guide.md)
- [Conflict Policy Guide](./docs/usage/conflict-policy-guide.md)
- [Resource Planner Guide](./docs/usage/resource-planner-guide.md)
- [Gantt Interactions Guide](./docs/usage/gantt-interactions-guide.md)
- [Vercel Deployment Guide](./docs/usage/vercel-deployment.md)

## AI Usage & Attribution

- This project may use AI-assisted drafting for some docs, examples, or refactors.
- All published code and documentation are manually reviewed and validated before release.
- No generated output is accepted as-is without human verification.
- If a contribution includes AI-assisted content, keep prompts/private data out of commits and ensure licensing/compliance checks are completed.

## Documentation Standard

- All public documentation and code examples are maintained in English.
- Root `README.md` is the primary reference for installation, usage patterns, API, and production integration.

---

## Roadmap

- [ ] Month view
- [ ] Event resize — drag slot start/end edges
- [x] Click-to-create (hour mode) — drag on empty area to define a new slot
- [ ] Cross-day slots — slots spanning midnight

PRs and issues welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

MIT © [Omid Rahmati](https://github.com/omidrahmati2000)

## Author

Omid Rahmati  
Email: `omidrahmati2000@gmail.com`

---

<div align="center">
<sub>React 18+ · Zero dependencies · 27 kB gzip · TypeScript-first · RTL/LTR · 3 scheduler modes</sub>
</div>
