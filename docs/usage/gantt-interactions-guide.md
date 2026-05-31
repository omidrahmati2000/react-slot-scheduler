# Gantt Interactions Guide

## Scope
This guide covers `task-timeline` and `resource-planner` modes.

## Move Items
- In `hour` mode, drag an item across the time axis and/or to another row.
- In `day` mode, drag an item across date columns and rows.
- `onGanttItemMove` payload includes:
  - `newRowId`
  - `newDate`
  - `newStartTime`
  - `newEndTime`

## Resize Items
- Resize is available in `hour` mode using left/right handles.
- `onGanttItemResize` payload includes:
  - `newStartTime`
  - `newEndTime`

## Create Items (Hour Mode)
- Drag on empty row space to create a new time block.
- `onGanttItemCreate` payload includes:
  - `rowId`
  - `date`
  - `startTime`
  - `endTime`

## View Controls
- `ganttTimeUnit="hour"`: hour-based timeline
- `ganttTimeUnit="day"`: day-column timeline
- `ganttScale="week" | "month"`: applies in `day` mode

## Example
```tsx
<BookingCalendar
  mode="task-timeline"
  dataAdapter={adapter}
  dataSource={items}
  schedules={[]}
  value={date}
  onChange={setDate}
  ganttTimeUnit="hour"
  onGanttItemMove={(p) => updateItem(p)}
  onGanttItemResize={(p) => resizeItem(p)}
  onGanttItemCreate={(p) => createItem(p)}
/>
```
