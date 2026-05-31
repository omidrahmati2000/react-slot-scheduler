# Task Timeline Day View + Resource Planner Overlap Fix

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add weekly/monthly day-view to Task Timeline with multi-day drag-to-create, and fix the lane-overlap bug in Resource Planner day mode.

**Architecture:** Extend `GanttItem`/`GanttCreatePayload` with optional `endDate` for multi-day spans. Refactor day-mode item rendering to an overlay at the **row level** (instead of per-cell) so items can visually span multiple columns. Fix day-mode lane assignment to use sequential per-cell ordering (not time-overlap reuse, which causes visual stacking bugs).

**Tech Stack:** React 18, TypeScript, pure CSS absolute positioning, tsup build

---

## File Map

| File | Change |
|------|--------|
| `src/types.ts` | Add `endDate?` to `GanttItem`, `TaskTimelineItem`, `GanttCreatePayload`; add `newEndDate?` to `GanttMovePayload` |
| `src/adapters.ts` | Pass `endDate` through in `createTaskTimelineAdapter` |
| `src/components/GanttScheduler.tsx` | Day-mode: sequential lane assign, row-level overlay render, day-mode create drag, span-aware move payload |
| `src/styles/gantt.css` | Add `.gantt-day-item-overlay` rule |
| `example/src/demos/TaskTimelineDemo.tsx` | Add timeUnit/scale controls; pass `ganttTimeUnit`/`ganttScale`; handle `endDate` in create/move |
| `example/src/data/taskTimelineData.ts` | Add multi-day sample items |

---

## Task 1 — Extend types

**Files:**
- Modify: `src/types.ts`

- [ ] **Step 1: Update `GanttItem`, `TaskTimelineItem`, `GanttCreatePayload`, `GanttMovePayload`**

Replace relevant interfaces in `src/types.ts`:

```typescript
export interface TaskTimelineItem {
  id: string;
  date: string;
  endDate?: string;      // ← NEW: last day of multi-day span (inclusive, YYYY-MM-DD)
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

export interface GanttItem {
  id: string;
  rowId: string;
  date: string;          // start date YYYY-MM-DD
  endDate?: string;      // ← NEW: end date for multi-day spans
  startTime: string;     // HH:mm
  endTime: string;       // HH:mm
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
  newEndDate?: string;   // ← NEW: set when moving a multi-day item
}

export interface GanttCreatePayload {
  rowId: string;
  date: string;          // start date
  endDate?: string;      // ← NEW: end date when day-mode drag spans multiple columns
  startTime: string;
  endTime: string;
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /home/omidrahmati/projects/calender && npm run typecheck 2>&1 | head -30
```

Expected: errors only in files that haven't been updated yet (adapters, GanttScheduler, demos). Zero errors in `types.ts` itself.

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add endDate to GanttItem, TaskTimelineItem, create/move payloads"
```

---

## Task 2 — Update adapter

**Files:**
- Modify: `src/adapters.ts` lines 27-36

- [ ] **Step 1: Pass `endDate` through in `createTaskTimelineAdapter`**

In `src/adapters.ts`, update the `ganttItems` mapping inside `createTaskTimelineAdapter`:

```typescript
const ganttItems: GanttItem[] = items.map(item => ({
  id: item.id,
  rowId: item.assignee ?? item.title,
  date: item.date,
  endDate: item.endDate,                                          // ← NEW
  startTime: item.startTime,
  endTime: item.endTime,
  title: item.title,
  subTitle: item.progress != null ? `${item.progress}%` : item.assignee,
  status: defStatus(item.status),
}));
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck 2>&1 | grep "adapters" | head -10
```

Expected: no errors in adapters.ts.

- [ ] **Step 3: Commit**

```bash
git add src/adapters.ts
git commit -m "feat: pass endDate through task timeline adapter"
```

---

## Task 3 — GanttScheduler: sequential lane assignment + row-level overlay

This is the largest task. It touches `GanttScheduler.tsx` day-mode rendering.

**Files:**
- Modify: `src/components/GanttScheduler.tsx`
- Modify: `src/styles/gantt.css`

### 3A — Add helper functions and fix lane assignment

- [ ] **Step 1: Add `assignLanesSequential` and `daysBetween` / `addDaysToIso` helpers at the top of `GanttScheduler.tsx` (after the existing helpers ~line 26)**

```typescript
// Sequential lane assignment for day-mode cells (no time-overlap reuse)
function assignLanesSequential(items: GanttItem[]): LanedItem[] {
  const n = items.length || 1;
  return items.map((item, i) => ({ ...item, lane: i, totalLanes: n }));
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function addDaysToIso(iso: string, n: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return isoStr(d);
}
```

- [ ] **Step 2: Update the creating state type to support day-mode drag (around line 197)**

Replace the `creating` useState declaration:

```typescript
const [creating, setCreating] = useState<{
  rowId: string;
  date: string;        // hour-mode: the single date; day-mode: start date
  startMin: number;    // hour-mode only (0 for day-mode)
  endMin: number;      // hour-mode only (0 for day-mode)
  endDate?: string;    // day-mode only: current end date of ghost span
} | null>(null);
```

### 3B — Update `onMouseMove` for day-mode create drag

- [ ] **Step 3: Add day-mode create handling to `onMouseMove` (around line 242)**

Inside `onMouseMove`, after the existing hour-mode create block and BEFORE the `if (!dragging...) return` line:

```typescript
// Handle create drag in day mode
if (creating && gridRef.current && timeUnit === 'day') {
  const hovered = getDateFromX(e.clientX, gridRef.current);
  if (hovered) setCreating(c => c ? { ...c, endDate: hovered } : null);
  return;
}
```

### 3C — Update `onMouseUp` for day-mode create and move with newEndDate

- [ ] **Step 4: Update `onMouseUp` to fire day-mode create payload and include `newEndDate` in moves**

Replace the full `onMouseUp` callback:

```typescript
const onMouseUp = useCallback(() => {
  // Finish create
  if (creating) {
    if (timeUnit === 'hour') {
      const dur = creating.endMin - creating.startMin;
      if (dur >= granularity) {
        onItemCreate?.({
          rowId: creating.rowId,
          date: creating.date,
          startTime: toTime(creating.startMin),
          endTime: toTime(creating.endMin),
        });
      }
    } else {
      // day-mode create: span from date to endDate
      const endDate = creating.endDate ?? creating.date;
      // normalise: ensure startDate <= endDate
      const [startDate, finalEnd] = creating.date <= endDate
        ? [creating.date, endDate]
        : [endDate, creating.date];
      onItemCreate?.({
        rowId: creating.rowId,
        date: startDate,
        endDate: finalEnd !== startDate ? finalEnd : undefined,
        startTime: '09:00',
        endTime: '18:00',
      });
    }
    setCreating(null);
    return;
  }
  if (!dragging) return;
  const { item, type, curStart, curEnd, curRowId, curDate } = dragging;
  if (type === 'move') {
    // Preserve multi-day span when moving in day mode
    let newEndDate: string | undefined;
    if (item.endDate) {
      const span = daysBetween(item.date, item.endDate);
      newEndDate = addDaysToIso(curDate, span);
    }
    onItemMove?.({
      item,
      newRowId: curRowId,
      newDate: curDate,
      newEndDate,
      newStartTime: toTime(curStart),
      newEndTime: toTime(curEnd),
    });
  } else {
    onItemResize?.({ item, newStartTime: toTime(curStart), newEndTime: toTime(curEnd) });
  }
  setDragging(null);
}, [creating, dragging, granularity, onItemCreate, onItemMove, onItemResize, timeUnit]);
```

### 3D — Rewrite day-mode rendering to use row-level overlay

- [ ] **Step 5: Update the `DAY MODE` section in the render (around line 478)**

This replaces the entire `{timeUnit === 'day' && ( ... )}` block. The new approach:
- Cells are background-only containers with click/drag listeners
- All items are rendered in an overlay positioned absolutely on `gantt-row-day-content`

```tsx
{/* ── DAY MODE ─────────────────────────────────────────────────────── */}
{timeUnit === 'day' && (
  <>
    <div className="gantt-header">
      <div className="gantt-label-col gantt-header-label" />
      <div className="gantt-time-header">
        {dayColumns.map((d) => {
          const ds = isoStr(d);
          const isToday = ds === todayStr;
          const label = scale === 'month'
            ? d.toLocaleDateString(locale, { day: 'numeric' })
            : d.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });
          return (
            <div key={ds} className={`gantt-time-cell ${isToday ? 'gantt-today-col' : ''}`}>
              {label}
            </div>
          );
        })}
      </div>
    </div>

    {rows.map(row => {
      // Collect all items for this row (keyed by start date)
      const rowItems = dayColStrs.flatMap(ds =>
        assignLanesSequential(itemsByRowDate.get(`${row.id}__${ds}`) ?? [])
      );

      // Row height: max items starting on any single day
      const maxPerCol = Math.max(1, ...dayColStrs.map(ds =>
        (itemsByRowDate.get(`${row.id}__${ds}`) ?? []).length
      ));
      const rowH = Math.max(ROW_MIN_H, maxPerCol * (LANE_H + LANE_GAP) + LANE_GAP * 2);

      // Create ghost bounds for day mode
      const creatingThisRow = creating?.rowId === row.id && creating.endDate !== undefined;
      let ghostColStart = -1, ghostColEnd = -1;
      if (creatingThisRow && creating) {
        const a = dayColStrs.indexOf(creating.date);
        const b = dayColStrs.indexOf(creating.endDate!);
        ghostColStart = Math.min(a < 0 ? 0 : a, b < 0 ? 0 : b);
        ghostColEnd   = Math.max(a < 0 ? 0 : a, b < 0 ? 0 : b);
      }

      return (
        <div key={row.id} className="gantt-row" style={{ minHeight: rowH }}>
          <div className="gantt-label-col">
            <div className="gantt-row-label-text">{row.label}</div>
            {row.subLabel && <div className="gantt-row-sublabel">{row.subLabel}</div>}
          </div>

          <div className="gantt-row-day-content" style={{ position: 'relative' }}>
            {/* Background cells — click/drag zones only */}
            {dayColumns.map((d) => {
              const ds = isoStr(d);
              const isToday = ds === todayStr;
              const isDragTarget = dragging?.type === 'move'
                && dragging.curRowId === row.id
                && dragging.curDate === ds
                && (dragging.curDate !== dragging.item.date || dragging.curRowId !== dragging.item.rowId);
              return (
                <div
                  key={ds}
                  className={`gantt-day-cell ${isToday ? 'gantt-today-col' : ''} ${isDragTarget ? 'gantt-day-cell-target' : ''}`}
                  style={{ minHeight: rowH, cursor: onItemCreate ? 'cell' : 'default' }}
                  onMouseDown={(ev) => {
                    if (ev.button !== 0 || !onItemCreate || !gridRef.current) return;
                    if ((ev.target as HTMLElement).closest('.gantt-item')) return;
                    ev.preventDefault();
                    setCreating({ rowId: row.id, date: ds, startMin: 0, endMin: 0, endDate: ds });
                  }}
                />
              );
            })}

            {/* Create ghost */}
            {creatingThisRow && ghostColStart >= 0 && (
              <div
                className="gantt-selection-ghost"
                style={{
                  position: 'absolute',
                  top: LANE_GAP,
                  height: LANE_H,
                  ...(isRtl
                    ? { right: `${(ghostColStart / dayColumns.length) * 100}%` }
                    : { left:  `${(ghostColStart / dayColumns.length) * 100}%` }),
                  width: `${((ghostColEnd - ghostColStart + 1) / dayColumns.length) * 100}%`,
                }}
              >
                <div className="gantt-item-inner">
                  <div className="gantt-item-title">
                    {dayColumns[ghostColStart]?.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}
                    {ghostColEnd !== ghostColStart && ` – ${dayColumns[ghostColEnd]?.toLocaleDateString(locale, { month: 'short', day: 'numeric' })}`}
                  </div>
                </div>
              </div>
            )}

            {/* Items overlay */}
            {rowItems.map(item => {
              const colStart = dayColStrs.indexOf(item.date);
              if (colStart < 0) return null;

              const rawColEnd = item.endDate ? dayColStrs.indexOf(item.endDate) : colStart;
              const colEnd = rawColEnd < 0 ? colStart : Math.max(colStart, rawColEnd);
              const spanCols = colEnd - colStart + 1;

              const isDraggingThis = dragging?.item.id === item.id && dragging.type === 'move';
              const effectiveColStart = isDraggingThis
                ? Math.max(0, dayColStrs.indexOf(dragging!.curDate))
                : colStart;
              const effectiveColEnd = isDraggingThis
                ? effectiveColStart + (colEnd - colStart)  // preserve span
                : colEnd;
              const effectiveSpan = effectiveColEnd - effectiveColStart + 1;

              const leftPct = (effectiveColStart / dayColumns.length) * 100;
              const widthPct = (effectiveSpan / dayColumns.length) * 100;
              const topPx = LANE_GAP + item.lane * (LANE_H + LANE_GAP);

              const cls = `gantt-item gantt-item-${item.status} gantt-day-item-overlay ${isDraggingThis ? 'gantt-item-dragging' : ''}`;

              return (
                <div
                  key={`${item.id}-${row.id}`}
                  className={cls}
                  style={{
                    position: 'absolute',
                    top: topPx,
                    height: LANE_H,
                    ...(isRtl
                      ? { right: `${Math.max(0, leftPct)}%` }
                      : { left:  `${Math.max(0, leftPct)}%` }),
                    width: `${Math.max(0.5, widthPct)}%`,
                    cursor: isDraggingThis ? 'grabbing' : 'grab',
                    paddingInline: 4,
                  }}
                  onClick={(ev) => { ev.stopPropagation(); if (!dragging) onItemClick?.(item.id); }}
                  onKeyDown={(ev) => {
                    if (ev.key !== 'Enter' && ev.key !== ' ') return;
                    ev.preventDefault(); ev.stopPropagation();
                    if (!dragging) onItemClick?.(item.id);
                  }}
                  role="button"
                  tabIndex={0}
                  onMouseDown={(ev) => {
                    if (ev.button !== 0) return;
                    ev.preventDefault(); ev.stopPropagation();
                    setDragging({
                      type: 'move', item,
                      origStart: toMin(item.startTime), origEnd: toMin(item.endTime),
                      curStart: toMin(item.startTime), curEnd: toMin(item.endTime),
                      curRowId: row.id, curDate: item.date,
                    });
                  }}
                >
                  <div className="gantt-item-inner">
                    <div className="gantt-item-title">{item.title}</div>
                    <div className="gantt-item-sub">
                      {item.endDate
                        ? `${item.date} – ${item.endDate}`
                        : `${item.startTime}–${item.endTime}`}
                      {item.subTitle ? ` · ${item.subTitle}` : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    })}
  </>
)}
```

- [ ] **Step 6: Add `.gantt-day-item-overlay` CSS rule to `src/styles/gantt.css`**

Append after the existing `.gantt-day-item` rule:

```css
/* Day-mode items rendered at row level (supports multi-day span) */
.gantt-day-item-overlay {
  box-sizing: border-box;
  z-index: 2;
}
```

- [ ] **Step 7: Build and typecheck**

```bash
cd /home/omidrahmati/projects/calender && npm run typecheck 2>&1 | head -20
npm run build 2>&1 | tail -10
```

Expected: zero TypeScript errors, build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/components/GanttScheduler.tsx src/styles/gantt.css
git commit -m "feat: day-mode overlay rendering, multi-day span, sequential lane assignment, day-create drag"
```

---

## Task 4 — TaskTimelineDemo: add view controls + handle endDate

**Files:**
- Modify: `example/src/demos/TaskTimelineDemo.tsx`

- [ ] **Step 1: Add `timeUnit` and `scale` state + import types**

At the top of `TaskTimelineDemo.tsx`, add the import:

```typescript
import type { GanttCreatePayload, GanttMovePayload, GanttResizePayload, GanttScale, GanttTimeUnit, TaskTimelineItem } from '@omidrahmati/react-slot-scheduler';
```

Inside the component, after the existing state declarations:

```typescript
const [timeUnit, setTimeUnit] = useState<GanttTimeUnit>('hour');
const [scale, setScale] = useState<GanttScale>('week');
```

- [ ] **Step 2: Update `handleMove` to preserve `endDate`**

Replace the `handleMove` function:

```typescript
const handleMove = (payload: GanttMovePayload) => {
  setItems(prev => prev.map(item =>
    item.id === payload.item.id
      ? {
          ...item,
          date: payload.newDate,
          endDate: payload.newEndDate,
          startTime: payload.newStartTime,
          endTime: payload.newEndTime,
          assignee: isFa
            ? (taskTimelineItemsFa.find(t => t.assignee === payload.newRowId)?.assignee ?? payload.newRowId)
            : payload.newRowId,
        }
      : item
  ));
  setLastAction(
    isFa
      ? `✅ تسک "${payload.item.title}" به ${payload.newStartTime}–${payload.newEndTime} منتقل شد`
      : `✅ Task "${payload.item.title}" moved to ${payload.newStartTime}–${payload.newEndTime}`
  );
};
```

- [ ] **Step 3: Update `handleModalConfirm` to save `endDate` from `pendingCreate`**

Replace the `newItem` creation inside `handleModalConfirm`:

```typescript
const newItem: TaskTimelineItem = {
  id: `task-new-${Date.now()}`,
  date: pendingCreate.date,
  endDate: pendingCreate.endDate,          // ← NEW
  startTime: pendingCreate.startTime,
  endTime: pendingCreate.endTime,
  title: data.title,
  status: data.status,
  assignee: pendingCreate.rowId,
  progress: 0,
};
```

- [ ] **Step 4: Add controls UI — time axis toggle and scale picker**

In the `demo-controls` div, after the existing "تعداد تسک" group, add before the hint span:

```tsx
<div className="control-group">
  <span className="control-label">{isFa ? 'محور زمان' : 'Time axis'}</span>
  <div className="pill-group">
    <button className={`pill ${timeUnit === 'hour' ? 'active' : ''}`} onClick={() => setTimeUnit('hour')}>
      {isFa ? 'ساعتی' : 'Hourly'}
    </button>
    <button className={`pill ${timeUnit === 'day' ? 'active' : ''}`} onClick={() => setTimeUnit('day')}>
      {isFa ? 'روزانه' : 'Daily'}
    </button>
  </div>
</div>
{timeUnit === 'day' && (
  <div className="control-group">
    <span className="control-label">{isFa ? 'بازه' : 'Scale'}</span>
    <div className="pill-group">
      {(['week', 'month'] as GanttScale[]).map(s => (
        <button key={s} className={`pill ${scale === s ? 'active' : ''}`} onClick={() => setScale(s)}>
          {s === 'week' ? (isFa ? 'هفته' : 'Week') : (isFa ? 'ماه' : 'Month')}
        </button>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 5: Update the hint text and pass new props to `BookingCalendar`**

Replace the hint `<span>` content:

```tsx
{isFa
  ? (timeUnit === 'hour'
      ? '💡 بکش جابجا کن · لبه = ریسایز · روی خلأ بکش = تسک جدید'
      : '💡 بکش جابجا کن · روی ردیف خالی بکش = تسک چندروزه')
  : (timeUnit === 'hour'
      ? '💡 Drag to move · Edges to resize · Drag empty area to create'
      : '💡 Drag to move · Drag empty row area to create multi-day task')
}
```

On the `<BookingCalendar>` component, add two props after `dataSource`:

```tsx
ganttTimeUnit={timeUnit}
ganttScale={timeUnit === 'day' ? scale : undefined}
```

- [ ] **Step 6: Typecheck demo**

```bash
cd /home/omidrahmati/projects/calender/example && npx tsc --noEmit 2>&1 | head -20
```

Expected: zero errors.

- [ ] **Step 7: Commit**

```bash
git add example/src/demos/TaskTimelineDemo.tsx
git commit -m "feat: add hourly/daily view toggle and week/month scale to TaskTimelineDemo"
```

---

## Task 5 — Add multi-day sample data

**Files:**
- Modify: `example/src/data/taskTimelineData.ts`

- [ ] **Step 1: Add multi-day items to FA and EN datasets**

In `taskTimelineItemsFa`, add after the existing items:

```typescript
// تسک‌های چند‌روزه
{ id: 'fm1', date: mon, endDate: wed,  startTime: '09:00', endTime: '18:00', title: 'اسپرینت توسعه',   status: 'booked',  assignee: 'سارا',  progress: 45 },
{ id: 'fm2', date: tue, endDate: thu,  startTime: '09:00', endTime: '18:00', title: 'مهاجرت دیتابیس', status: 'custom',  assignee: 'آرمان', progress: 30 },
{ id: 'fm3', date: wed, endDate: fri,  startTime: '09:00', endTime: '18:00', title: 'تست یکپارچه',    status: 'booked',  assignee: 'ندا',   progress: 60 },
{ id: 'fm4', date: mon, endDate: fri,  startTime: '09:00', endTime: '18:00', title: 'ریلیز هفتگی',    status: 'blocked', assignee: 'تیم',   progress: 0  },
```

In `taskTimelineItemsEn`, add after the existing items:

```typescript
// Multi-day tasks
{ id: 'em1', date: mon, endDate: wed,  startTime: '09:00', endTime: '18:00', title: 'Dev Sprint',      status: 'booked',  assignee: 'Sara',  progress: 45 },
{ id: 'em2', date: tue, endDate: thu,  startTime: '09:00', endTime: '18:00', title: 'DB Migration',    status: 'custom',  assignee: 'Arman', progress: 30 },
{ id: 'em3', date: wed, endDate: fri,  startTime: '09:00', endTime: '18:00', title: 'Integration Test',status: 'booked',  assignee: 'Neda',  progress: 60 },
{ id: 'em4', date: mon, endDate: fri,  startTime: '09:00', endTime: '18:00', title: 'Weekly Release',  status: 'blocked', assignee: 'Team',  progress: 0  },
```

- [ ] **Step 2: Build the full project and check for errors**

```bash
cd /home/omidrahmati/projects/calender && npm run build 2>&1 | tail -10
cd example && npx tsc --noEmit 2>&1 | head -20
```

Expected: clean build, zero TS errors.

- [ ] **Step 3: Commit**

```bash
git add example/src/data/taskTimelineData.ts
git commit -m "feat: add multi-day sample tasks for day-view demo"
```

---

## Task 6 — Verify in browser with Playwright

- [ ] **Step 1: Start dev server**

```bash
cd /home/omidrahmati/projects/calender/example && npm run dev -- --port 5174 &
sleep 3 && curl -s http://localhost:5174 | head -3
```

- [ ] **Step 2: Verify — Task Timeline hourly view still works (regression check)**

Open http://localhost:5174, switch to FA, click Task Timeline. Verify items render at correct times, drag/resize works (existing behavior unchanged).

- [ ] **Step 3: Verify — Task Timeline weekly day view**

Click "روزانه" (Daily) button → weekly view should appear with items as cards in their day columns. Multi-day items (`اسپرینت توسعه`) should span Monday–Wednesday visually.

- [ ] **Step 4: Verify — drag-to-create in daily view**

In the daily view, drag across 3 columns on the سارا row → ghost should span those columns → release → modal should open with `date` = first day, `endDate` = last day.

- [ ] **Step 5: Verify — Resource Planner overlap bug is fixed**

Switch to Resource Planner tab → switch to Daily mode → check اتاق A on Monday. Items `جلسه تیم` (09:00-10:00) and `ارائه محصول` (09:30-10:30) should stack vertically, NOT overlap.

- [ ] **Step 6: Verify — monthly view**

In Task Timeline daily mode, click "ماه" → month grid should show all 30+ days. Items should appear in their columns.

- [ ] **Step 7: Final build**

```bash
cd /home/omidrahmati/projects/calender && npm run build 2>&1 | tail -8
```

Expected: clean ESM + CJS build.

- [ ] **Step 8: Final commit**

```bash
git add -A
git commit -m "feat: task timeline weekly/monthly view + multi-day tasks + fix resource planner overlap"
```
