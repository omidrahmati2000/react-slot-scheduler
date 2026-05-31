# Conflict Policy Guide

## Purpose
In production systems, slot moves should be policy-controlled to prevent overlaps and business-rule violations.

## APIs
1. `onBeforeSlotMove(payload) => boolean | Promise<boolean>`
- Called before applying a move.
- Returning `false` blocks the move.

2. `onSlotConflict(payload)`
- Called when overlap or policy denial occurs.
- `reason` can be:
  - `overlap`
  - `blocked-by-policy`

## Example
```tsx
<BookingCalendar
  draggableSlots
  onBeforeSlotMove={async ({ to }) => {
    // block lunch hour
    return !(to.startTime >= '12:00' && to.endTime <= '13:00');
  }}
  onSlotConflict={({ reason }) => {
    if (reason === 'overlap') alert('Time conflict');
    if (reason === 'blocked-by-policy') alert('This move is not allowed');
  }}
  onSlotMove={(payload) => applyMove(payload)}
  schedules={schedules}
  value={date}
  onChange={setDate}
/>
```
