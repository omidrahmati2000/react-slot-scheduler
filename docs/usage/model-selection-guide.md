# Model Selection Guide

## Choose The Right Mode
1. `time-grid`:
- Best for appointment booking, clinics, salons, and slot-based scheduling.

2. `task-timeline`:
- Best for task-centric planning where each task has start/end times.

3. `resource-planner`:
- Best for resource-first workflows (rooms, doctors, operators, equipment).

## Decision Heuristic
1. If your UI is primarily time-slot driven, choose `time-grid`.
2. If your UI is task-list and workflow driven, choose `task-timeline`.
3. If users start by selecting a resource, choose `resource-planner`.

## Adapter Pattern
- If your data is not already `DaySchedule[]`, provide a `dataAdapter`.
- The rendering engine stays the same; only the data mapping changes.
