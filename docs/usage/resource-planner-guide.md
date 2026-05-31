# Resource Planner Guide

## Use Case
Scheduling shared resources such as:
- meeting rooms
- doctors
- support agents

## Minimal Setup
```tsx
import {
  BookingCalendar,
  createResourcePlannerAdapter,
  type ResourceDefinition,
  type ResourcePlannerItem
} from '@omidrahmati/react-slot-scheduler';

const resources: ResourceDefinition[] = [
  { id: 'room-a', title: 'Room A' },
  { id: 'room-b', title: 'Room B' },
];

const items: ResourcePlannerItem[] = [
  { id: '1', date: '2026-06-01', startTime: '09:00', endTime: '10:00', resourceId: 'room-a', title: 'Daily Sync' },
];

const adapter = createResourcePlannerAdapter(resources);

<BookingCalendar
  mode="resource-planner"
  schedules={[]}
  resources={resources}
  dataAdapter={adapter}
  dataSource={items}
  value={date}
  onChange={setDate}
/>
```
