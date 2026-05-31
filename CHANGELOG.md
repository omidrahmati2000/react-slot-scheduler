# Changelog

All notable changes to this project will be documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [1.0.0] — 2026-05-30

### Added
- Stable public API for `BookingCalendar` with three scheduling modes:
  - `time-grid`
  - `task-timeline` (Gantt)
  - `resource-planner` (Gantt)
- Gantt scheduler engine with:
  - hour and day time units
  - week/month day-scale support
  - drag move and resize callbacks (`onGanttItemMove`, `onGanttItemResize`)
- Adapter APIs:
  - `createTaskTimelineAdapter`
  - `createResourcePlannerAdapter`
- Drag-and-drop slot rescheduling via HTML5 drag API (`draggableSlots`, `onSlotMove`)
- Conflict control hooks for time-grid mode:
  - `onBeforeSlotMove`
  - `onSlotConflict`
- Multi-select mode for empty cells (`selectionMode`, `onSlotDragSelectEnd`, `onSelectionChange`)
- Locale support with automatic RTL/LTR switching (`fa-IR`, `ar*`, `en-*`, any `Intl`-compatible locale)
- CSS token theming with typed theme contract (`CalendarTheme`)
- TypeScript-first package exports for component props, data models, adapters, and move payloads
- SSR-safe rendering and Next.js client compatibility
- Expanded demo app with Appointment, Meeting Room, Task Timeline, Resource Planner, and Theme Playground tabs
- Usage documentation for model selection, conflict policy, resource planning, and Gantt interactions

### Slot statuses
- `booked` — reserved slot (clickable, draggable)
- `blocked` — unavailable (visual only)
- `outside` — outside working hours
- `custom` — user-defined styling

### Notes
- Empty grid cells represent available time — no need to create `available` status slots
- Multi-select is intentionally restricted to empty cells only
- Slot and item state management is controlled by the consumer
