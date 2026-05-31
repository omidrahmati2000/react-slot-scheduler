import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { CalendarTheme, GanttCreatePayload, GanttItem, GanttMovePayload, GanttResizePayload, GanttRow } from '../types';
import { defaultTheme } from '../styles/defaultTheme';
import '../styles/gantt.css';

// ─── Helpers ────────────────────────────────────────────────────────────────

function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function toTime(mins: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, mins));
  return `${String(Math.floor(clamped / 60)).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`;
}
function snapToGrid(mins: number, gran: number): number {
  return Math.round(mins / gran) * gran;
}
function isoStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(d: Date, n: number): Date {
  const dd = new Date(d);
  dd.setDate(dd.getDate() + n);
  return dd;
}

// ─── Overlap lane assignment ─────────────────────────────────────────────────

interface LanedItem extends GanttItem {
  lane: number;
  totalLanes: number;
}

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

function assignLanes(items: GanttItem[]): LanedItem[] {
  const sorted = [...items].sort((a, b) => toMin(a.startTime) - toMin(b.startTime));
  const laneEnds: number[] = [];
  const result: LanedItem[] = [];
  for (const item of sorted) {
    const s = toMin(item.startTime);
    const e = toMin(item.endTime);
    let assigned = laneEnds.findIndex(end => end <= s);
    if (assigned === -1) { assigned = laneEnds.length; laneEnds.push(0); }
    laneEnds[assigned] = e;
    result.push({ ...item, lane: assigned, totalLanes: 0 });
  }
  const n = laneEnds.length || 1;
  return result.map(r => ({ ...r, totalLanes: n }));
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type GanttScale = 'day' | 'week' | 'month';

export interface GanttSchedulerProps {
  schedulerMode?: 'task-timeline' | 'resource-planner';
  rows: GanttRow[];
  items: GanttItem[];
  date: Date;
  // Hour mode props
  timeStart?: number;
  timeEnd?: number;
  granularity?: number;
  // View mode
  timeUnit?: 'hour' | 'day';   // 'hour' = hourly columns, 'day' = date columns
  scale?: GanttScale;          // for day mode: 'week' (7 cols) or 'month' (30 cols)
  weekStartsOn?: 0 | 1 | 6;
  // Common
  locale?: string;
  direction?: 'rtl' | 'ltr';
  theme?: Partial<CalendarTheme>;
  onItemClick?: (id: string) => void;
  onItemMove?: (payload: GanttMovePayload) => void;
  onItemResize?: (payload: GanttResizePayload) => void;
  onItemCreate?: (payload: GanttCreatePayload) => void;
  translations?: Partial<{ previous: string; today: string; next: string; week: string; month: string }>;
  onDateChange?: (d: Date) => void;
}

const ROW_MIN_H = 60;
const LANE_H = 44;
const LANE_GAP = 4;
const LABEL_W = 144;

// ─── Component ───────────────────────────────────────────────────────────────

export function GanttScheduler({
  schedulerMode,
  rows,
  items,
  date,
  timeUnit = 'hour',
  scale = 'week',
  weekStartsOn = 1,
  timeStart = 8,
  timeEnd = 20,
  granularity = 30,
  locale = 'en-US',
  direction = 'ltr',
  theme,
  onItemClick,
  onItemMove,
  onItemResize,
  onItemCreate,
  translations,
  onDateChange,
}: GanttSchedulerProps) {
  const merged = { ...defaultTheme, ...theme };
  const isRtl = direction === 'rtl';
  const todayStr = (() => { const d = new Date(); d.setHours(12, 0, 0, 0); return isoStr(d); })();
  const totalMins = (timeEnd - timeStart) * 60;

  const t = { previous: 'Previous', today: 'Today', next: 'Next', week: 'Week', month: 'Month', ...translations };

  const cssVars = {
    '--gantt-primary': merged.primary,
    '--gantt-bg': merged.bg,
    '--gantt-panel': merged.panel,
    '--gantt-border': merged.border,
    '--gantt-text': merged.text,
    '--gantt-muted': merged.mutedText,
    '--gantt-booked': merged.bookedBg,
    '--gantt-blocked': merged.blockedBg,
    '--gantt-custom': merged.customBg,
  } as React.CSSProperties;

  // ── HOUR MODE columns ────────────────────────────────────────────────────
  const hourCols = useMemo(() => {
    if (timeUnit !== 'hour') return [];
    return Array.from({ length: timeEnd - timeStart }, (_, i) =>
      `${String(timeStart + i).padStart(2, '0')}:00`
    );
  }, [timeUnit, timeStart, timeEnd]);

  // ── DAY MODE: compute visible date columns ───────────────────────────────
  const dayColumns = useMemo((): Date[] => {
    if (timeUnit !== 'day') return [];
    const anchor = new Date(date);
    anchor.setHours(12, 0, 0, 0);
    if (scale === 'week') {
      const dow = anchor.getDay();
      const offset = (dow - weekStartsOn + 7) % 7;
      anchor.setDate(anchor.getDate() - offset);
      return Array.from({ length: 7 }, (_, i) => addDays(anchor, i));
    }
    if (scale === 'month') {
      const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12);
      const daysInMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => addDays(first, i));
    }
    // day = single day
    return [new Date(anchor)];
  }, [timeUnit, date, scale, weekStartsOn]);

  const dayColStrs = useMemo(() => dayColumns.map(isoStr), [dayColumns]);

  // ── Items grouped by row for HOUR mode ──────────────────────────────────
  const itemsByRowHour = useMemo(() => {
    if (timeUnit !== 'hour') return new Map<string, GanttItem[]>();
    const dateStr = isoStr(date);
    const map = new Map<string, GanttItem[]>();
    for (const item of items) {
      if (item.date !== dateStr) continue;
      const list = map.get(item.rowId) ?? [];
      list.push(item);
      map.set(item.rowId, list);
    }
    return map;
  }, [items, date, timeUnit]);

  // ── Items grouped by row+date for DAY mode ───────────────────────────────
  const itemsByRowDate = useMemo(() => {
    if (timeUnit !== 'day') return new Map<string, GanttItem[]>();
    const dateSet = new Set(dayColStrs);
    const map = new Map<string, GanttItem[]>();
    for (const item of items) {
      if (!dateSet.has(item.date)) continue;
      const key = `${item.rowId}__${item.date}`;
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return map;
  }, [items, timeUnit, dayColStrs]);

  // ── Drag state ────────────────────────────────────────────────────────────
  const gridRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{
    type: 'move' | 'resize-left' | 'resize-right';
    item: GanttItem;
    origStart: number; origEnd: number;
    curStart: number; curEnd: number;
    curRowId: string; curDate: string;
  } | null>(null);

  // ── Create state (hour mode: drag on empty cell) ──────────────────────────
  const [creating, setCreating] = useState<{
    rowId: string;
    date: string;        // hour-mode: single date; day-mode: start date
    startMin: number;    // hour-mode only (0 for day-mode)
    endMin: number;      // hour-mode only (0 for day-mode)
    endDate?: string;    // day-mode only: current end date of ghost span
  } | null>(null);

  const getTimeFromX = useCallback((clientX: number, grid: HTMLDivElement): number => {
    const rect = grid.getBoundingClientRect();
    const contentW = rect.width - LABEL_W;
    const contentLeft = isRtl ? rect.left : rect.left + LABEL_W;
    const contentRight = isRtl ? rect.right - LABEL_W : rect.right;
    let frac = isRtl
      ? (contentRight - clientX) / contentW
      : (clientX - contentLeft) / contentW;
    frac = Math.max(0, Math.min(1, frac));
    return timeStart * 60 + frac * totalMins;
  }, [isRtl, timeStart, totalMins]);

  // For day-mode: get which date column the cursor is in
  const getDateFromX = useCallback((clientX: number, grid: HTMLDivElement): string | null => {
    if (!dayColumns.length) return null;
    const rect = grid.getBoundingClientRect();
    const contentW = rect.width - LABEL_W;
    const contentLeft = isRtl ? rect.left : rect.left + LABEL_W;
    const contentRight = isRtl ? rect.right - LABEL_W : rect.right;
    let frac = isRtl
      ? (contentRight - clientX) / contentW
      : (clientX - contentLeft) / contentW;
    frac = Math.max(0, Math.min(0.9999, frac));
    const colIdx = Math.floor(frac * dayColumns.length);
    return isoStr(dayColumns[Math.min(colIdx, dayColumns.length - 1)]);
  }, [dayColumns, isRtl]);

  const getRowFromY = useCallback((clientY: number, grid: HTMLDivElement): string | null => {
    const scrollTop = grid.scrollTop ?? 0;
    const rect = grid.getBoundingClientRect();
    const relY = clientY - rect.top + scrollTop - 40;
    let acc = 0;
    for (const row of rows) {
      const h = ROW_MIN_H;
      if (relY >= acc && relY < acc + h) return row.id;
      acc += h;
    }
    return null;
  }, [rows]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Handle create drag in hour mode
    if (creating && gridRef.current && timeUnit === 'hour') {
      const rawMin = getTimeFromX(e.clientX, gridRef.current);
      const snapped = snapToGrid(rawMin, granularity);
      const endMin = Math.max(snapped, creating.startMin + granularity);
      setCreating(c => c ? { ...c, endMin } : null);
      return;
    }
    // Handle create drag in day mode
    if (creating && gridRef.current && timeUnit === 'day') {
      const hovered = getDateFromX(e.clientX, gridRef.current);
      if (hovered) setCreating(c => c ? { ...c, endDate: hovered } : null);
      return;
    }

    if (!dragging || !gridRef.current) return;

    if (timeUnit === 'hour') {
      const rawMin = getTimeFromX(e.clientX, gridRef.current);
      const duration = dragging.origEnd - dragging.origStart;
      if (dragging.type === 'move') {
        const snapped = snapToGrid(rawMin - duration / 2, granularity);
        const newStart = Math.max(timeStart * 60, snapped);
        const newRowId = getRowFromY(e.clientY, gridRef.current) ?? dragging.curRowId;
        setDragging(d => d ? { ...d, curStart: newStart, curEnd: newStart + duration, curRowId: newRowId } : null);
      } else if (dragging.type === 'resize-left') {
        const snapped = snapToGrid(rawMin, granularity);
        setDragging(d => d ? { ...d, curStart: Math.min(snapped, dragging.curEnd - granularity) } : null);
      } else {
        const snapped = snapToGrid(rawMin, granularity);
        setDragging(d => d ? { ...d, curEnd: Math.max(snapped, dragging.curStart + granularity) } : null);
      }
    } else if (timeUnit === 'day' && dragging.type === 'move') {
      const newDate = getDateFromX(e.clientX, gridRef.current) ?? dragging.curDate;
      const newRowId = getRowFromY(e.clientY, gridRef.current) ?? dragging.curRowId;
      setDragging(d => d ? { ...d, curDate: newDate, curRowId: newRowId } : null);
    }
  }, [creating, dragging, getTimeFromX, getDateFromX, getRowFromY, granularity, timeStart, timeUnit]);

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

  // ── Navigation ────────────────────────────────────────────────────────────
  const navDelta = timeUnit === 'day'
    ? (scale === 'month' ? 30 : scale === 'week' ? 7 : 1)
    : 1;

  const navigate = (delta: number) => {
    if (!onDateChange) return;
    onDateChange(addDays(date, delta * navDelta));
  };

  const titleLabel = useMemo(() => {
    if (timeUnit === 'day' && dayColumns.length > 1) {
      const first = dayColumns[0].toLocaleDateString(locale, { month: 'short', day: 'numeric' });
      const last = dayColumns[dayColumns.length - 1].toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
      return `${first} – ${last}`;
    }
    return date.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  }, [timeUnit, dayColumns, date, locale]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      className={`gantt-root ${isRtl ? 'gantt-rtl' : 'gantt-ltr'}`}
      data-scheduler-mode={schedulerMode}
      style={{ ...cssVars, direction: isRtl ? 'rtl' : 'ltr' }}
      onMouseMove={dragging || creating ? onMouseMove : undefined}
      onMouseUp={dragging || creating ? onMouseUp : undefined}
      onMouseLeave={dragging || creating ? onMouseUp : undefined}
    >
      {/* Toolbar */}
      <div className="gantt-toolbar">
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="gantt-btn" onClick={() => navigate(-1)}>{t.previous}</button>
          <button className="gantt-btn" onClick={() => onDateChange?.(new Date())}>{t.today}</button>
          <button className="gantt-btn" onClick={() => navigate(1)}>{t.next}</button>
        </div>
        <strong className="gantt-title">{titleLabel}</strong>
        <div style={{ display: 'flex', gap: 4 }}>
          <span className="gantt-badge">
            {timeUnit === 'hour' ? '⏱ Hour' : scale === 'month' ? '📅 Month' : scale === 'week' ? '📅 Week' : '📅 Day'}
          </span>
        </div>
      </div>

      {/* Main grid */}
      <div className="gantt-scroll-wrap" ref={gridRef}>

        {/* ── HOUR MODE ────────────────────────────────────────────────────── */}
        {timeUnit === 'hour' && (
          <>
            <div className="gantt-header">
              <div className="gantt-label-col gantt-header-label" />
              <div className="gantt-time-header">
                {hourCols.map(slot => (
                  <div key={slot} className="gantt-time-cell">{slot}</div>
                ))}
              </div>
            </div>

            {rows.map(row => {
              // When dragging, show item in its TARGET row (not original)
              const baseItems = itemsByRowHour.get(row.id) ?? [];
              const dragItem = dragging?.item;
              const isDragTargetRow = dragging?.type === 'move' && dragging.curRowId === row.id && dragItem?.rowId !== row.id;
              const isDragSourceRow = dragging?.type === 'move' && dragItem?.rowId === row.id && dragging.curRowId !== row.id;
              // For source row: hide the dragged item; for target row: add ghost
              const visibleItems = isDragSourceRow
                ? baseItems.filter(i => i.id !== dragItem!.id)
                : baseItems;
              const ghostItems: GanttItem[] = isDragTargetRow && dragItem
                ? [{ ...dragItem, rowId: row.id, startTime: toTime(dragging!.curStart), endTime: toTime(dragging!.curEnd) }]
                : [];

              const allVisible = [...visibleItems, ...ghostItems];
              const laned = assignLanes(allVisible);
              const maxLanes = Math.max(1, laned.length > 0 ? Math.max(...laned.map(l => l.totalLanes)) : 1);
              const rowH = Math.max(ROW_MIN_H, maxLanes * (LANE_H + LANE_GAP) + LANE_GAP * 2);

              return (
                <div key={row.id} className="gantt-row" style={{ minHeight: rowH }}>
                  <div className="gantt-label-col">
                    <div className="gantt-row-label-text">{row.label}</div>
                    {row.subLabel && <div className="gantt-row-sublabel">{row.subLabel}</div>}
                  </div>
                  <div
                    className="gantt-row-content"
                    style={{ '--gantt-cols': hourCols.length, cursor: onItemCreate ? 'cell' : 'default' } as React.CSSProperties}
                    onMouseDown={(ev) => {
                      if (ev.button !== 0 || !onItemCreate || !gridRef.current) return;
                      if ((ev.target as HTMLElement).closest('.gantt-item')) return;
                      ev.preventDefault();
                      const rawMin = getTimeFromX(ev.clientX, gridRef.current);
                      const snapped = snapToGrid(rawMin, granularity);
                      setCreating({ rowId: row.id, date: isoStr(date), startMin: snapped, endMin: snapped });
                    }}
                  >
                    {hourCols.map((_, i) => (
                      <div
                        key={i}
                        className="gantt-grid-line"
                        style={
                          isRtl
                            ? { right: `${(i / hourCols.length) * 100}%` }
                            : { left: `${(i / hourCols.length) * 100}%` }
                        }
                      />
                    ))}

                    {/* Create ghost */}
                    {creating?.rowId === row.id && (
                      <div
                        className="gantt-selection-ghost"
                        style={{
                          ...(isRtl
                            ? { right: `${Math.max(0, ((creating.startMin - timeStart * 60) / totalMins) * 100)}%` }
                            : { left: `${Math.max(0, ((creating.startMin - timeStart * 60) / totalMins) * 100)}%` }),
                          width: `${Math.max(0.5, ((creating.endMin - creating.startMin) / totalMins) * 100)}%`,
                          top: LANE_GAP, height: LANE_H,
                        }}
                      >
                        <div className="gantt-item-inner">
                          <div className="gantt-item-title">{toTime(creating.startMin)} – {toTime(creating.endMin)}</div>
                        </div>
                      </div>
                    )}

                    {laned.map(item => {
                      const isOrigDrg = dragging?.item.id === item.id && dragging.curRowId === row.id;
                      const isGhost = ghostItems.some(g => g.id === item.id);
                      const s = isOrigDrg || isGhost ? dragging!.curStart : toMin(item.startTime);
                      const e = isOrigDrg || isGhost ? dragging!.curEnd : toMin(item.endTime);
                      const leftPct = ((s - timeStart * 60) / totalMins) * 100;
                      const widthPct = ((e - s) / totalMins) * 100;
                      const topPx = LANE_GAP + item.lane * (LANE_H + LANE_GAP);
                      const cls = `gantt-item gantt-item-${item.status} ${isOrigDrg || isGhost ? 'gantt-item-dragging' : ''}`;

                      return (
                        <div
                          key={`${item.id}-${row.id}`}
                          className={cls}
                          style={{
                            ...(isRtl
                              ? { right: `${Math.max(0, leftPct)}%` }
                              : { left: `${Math.max(0, leftPct)}%` }),
                            width: `${Math.max(0.5, widthPct)}%`,
                            top: topPx,
                            height: LANE_H,
                            cursor: isGhost ? 'grabbing' : 'grab'
                          }}
                          onClick={(ev) => { ev.stopPropagation(); if (!dragging) onItemClick?.(item.id); }}
                          onKeyDown={(ev) => {
                            if (ev.key !== 'Enter' && ev.key !== ' ') return;
                            ev.preventDefault();
                            ev.stopPropagation();
                            if (!dragging) onItemClick?.(item.id);
                          }}
                          role="button"
                          tabIndex={0}
                          onMouseDown={(ev) => {
                            if (ev.button !== 0 || isGhost) return; ev.preventDefault();
                            setDragging({ type: 'move', item, origStart: toMin(item.startTime), origEnd: toMin(item.endTime), curStart: toMin(item.startTime), curEnd: toMin(item.endTime), curRowId: row.id, curDate: item.date });
                          }}
                        >
                          <div className="gantt-handle gantt-handle-left" onMouseDown={(ev) => { if (isGhost) return; ev.preventDefault(); ev.stopPropagation(); setDragging({ type: isRtl ? 'resize-right' : 'resize-left', item, origStart: toMin(item.startTime), origEnd: toMin(item.endTime), curStart: toMin(item.startTime), curEnd: toMin(item.endTime), curRowId: row.id, curDate: item.date }); }} />
                          <div className="gantt-item-inner">
                            <div className="gantt-item-title">{item.title}</div>
                            {item.subTitle && <div className="gantt-item-sub">{item.subTitle}</div>}
                          </div>
                          <div className="gantt-handle gantt-handle-right" onMouseDown={(ev) => { if (isGhost) return; ev.preventDefault(); ev.stopPropagation(); setDragging({ type: isRtl ? 'resize-left' : 'resize-right', item, origStart: toMin(item.startTime), origEnd: toMin(item.endTime), curStart: toMin(item.startTime), curEnd: toMin(item.endTime), curRowId: row.id, curDate: item.date }); }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}

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
              // Collect all items for this row with sequential lane assignment per start-date cell
              const rowItems = dayColStrs.flatMap(ds =>
                assignLanesSequential(itemsByRowDate.get(`${row.id}__${ds}`) ?? [])
              );

              // Row height: max items starting on any single day
              const maxPerCol = Math.max(1, ...dayColStrs.map(ds =>
                (itemsByRowDate.get(`${row.id}__${ds}`) ?? []).length
              ));
              const rowH = Math.max(ROW_MIN_H, maxPerCol * (LANE_H + LANE_GAP) + LANE_GAP * 2);

              // Create ghost column span
              const creatingThisRow = creating?.rowId === row.id && creating.endDate !== undefined;
              let ghostColStart = -1, ghostColEnd = -1;
              if (creatingThisRow && creating) {
                const a = dayColStrs.indexOf(creating.date);
                const b = dayColStrs.indexOf(creating.endDate!);
                const ai = a < 0 ? 0 : a;
                const bi = b < 0 ? 0 : b;
                ghostColStart = Math.min(ai, bi);
                ghostColEnd   = Math.max(ai, bi);
              }

              return (
                <div key={row.id} className="gantt-row" style={{ minHeight: rowH }}>
                  <div className="gantt-label-col">
                    <div className="gantt-row-label-text">{row.label}</div>
                    {row.subLabel && <div className="gantt-row-sublabel">{row.subLabel}</div>}
                  </div>

                  <div className="gantt-row-day-content" style={{ position: 'relative' }}>
                    {/* Background cells — click/drag-create zones */}
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

                    {/* Items overlay — positioned absolutely over the cell grid */}
                    {rowItems.map(item => {
                      const colStart = dayColStrs.indexOf(item.date);
                      if (colStart < 0) return null;
                      const rawColEnd = item.endDate ? dayColStrs.indexOf(item.endDate) : colStart;
                      const colEnd = rawColEnd < 0 ? dayColStrs.length - 1 : Math.max(colStart, rawColEnd);
                      const spanCols = colEnd - colStart + 1;

                      const isDraggingThis = dragging?.item.id === item.id && dragging.type === 'move';
                      const rawEffectiveColStart = isDraggingThis ? dayColStrs.indexOf(dragging!.curDate) : colStart;
                      if (rawEffectiveColStart < 0) return null; // dragged outside visible range
                      const effectiveColStart = rawEffectiveColStart;
                      const effectiveSpan = spanCols; // preserve span on drag

                      const leftPct = (effectiveColStart / dayColumns.length) * 100;
                      const widthPct = (effectiveSpan / dayColumns.length) * 100;
                      const topPx = LANE_GAP + item.lane * (LANE_H + LANE_GAP);

                      const cls = `gantt-item gantt-item-${item.status} gantt-day-item-overlay${isDraggingThis ? ' gantt-item-dragging' : ''}`;

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
                            boxSizing: 'border-box' as const,
                            paddingLeft: 4,
                            paddingRight: 4,
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
                              curStart: toMin(item.startTime),  curEnd: toMin(item.endTime),
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
      </div>
    </div>
  );
}
