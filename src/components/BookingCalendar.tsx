import React, { useEffect, useMemo, useState } from 'react';
import type { BookingCalendarProps, CalendarTheme, CalendarSlot, GanttDataAdapter, SlotMovePayload } from '../types';
import { addDays, generateTimeSlots, getHourBounds, getWeekDays, rangesOverlap, toIsoDate } from '../utils/date';
import { defaultTheme } from '../styles/defaultTheme';
import { GanttScheduler } from './GanttScheduler';
import '../styles/calendar.css';

function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function slotClass(status: CalendarSlot['status']): string {
  return `rbc-slot ${status}`;
}

function minutesToTime(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function compressSelectionKeys(
  keys: Iterable<string>,
  slotGranularity: number
): Array<{ date: string; startTime: string; endTime: string }> {
  const byDate = new Map<string, number[]>();
  for (const k of keys) {
    const [date, startTime] = k.split('__');
    const minute = toMinutes(startTime);
    const arr = byDate.get(date) ?? [];
    arr.push(minute);
    byDate.set(date, arr);
  }

  const merged: Array<{ date: string; startTime: string; endTime: string }> = [];
  for (const [date, mins] of byDate.entries()) {
    mins.sort((a, b) => a - b);
    let rangeStart = mins[0];
    let prev = mins[0];
    for (let i = 1; i < mins.length; i += 1) {
      const current = mins[i];
      if (current === prev + slotGranularity) {
        prev = current;
        continue;
      }
      merged.push({ date, startTime: minutesToTime(rangeStart), endTime: minutesToTime(prev + slotGranularity) });
      rangeStart = current;
      prev = current;
    }
    merged.push({ date, startTime: minutesToTime(rangeStart), endTime: minutesToTime(prev + slotGranularity) });
  }

  return merged.sort((a, b) => (a.date === b.date ? toMinutes(a.startTime) - toMinutes(b.startTime) : a.date.localeCompare(b.date)));
}

export function BookingCalendar({
  value,
  onChange,
  schedules,
  mode: schedulerMode = 'time-grid',
  dataAdapter,
  dataSource,
  ganttTimeUnit,
  ganttScale,
  viewMode,
  onViewModeChange,
  onSlotClick,
  onItemClick,
  onBookingClick,
  onSlotMove,
  onGanttItemMove,
  onGanttItemResize,
  onGanttItemCreate,
  onBeforeSlotMove,
  onSlotConflict,
  draggableSlots = false,
  selectionMode = false,
  selectedSlots,
  onSelectionChange,
  onSlotDragSelectStart,
  onSlotDragSelectMove,
  onSlotDragSelectEnd,
  isSlotSelected,
  slotGranularity = 30,
  locale = 'fa-IR',
  weekStartsOn = 6,
  direction = 'auto',
  translations,
  theme,
  hideTimeColumn = false,
  className
}: BookingCalendarProps) {
  const [internalMode, setInternalMode] = useState<'day' | 'week'>('week');
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<Set<string>>(new Set());
  const liveSelectionRef = React.useRef<Set<string>>(new Set());
  const isSelectingRef = React.useRef(false);
  const [isSelecting, setIsSelecting] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setInternalMode(window.innerWidth < 768 ? 'day' : 'week');
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onUp = () => { isSelectingRef.current = false; setIsSelecting(false); };
    window.addEventListener('mouseup', onUp);
    return () => window.removeEventListener('mouseup', onUp);
  }, []);
  const calendarMode = viewMode ?? internalMode;
  const setCalendarMode = (m: 'day' | 'week') => {
    setInternalMode(m);
    onViewModeChange?.(m);
  };
  const isRtlLocale = /^fa|^ar|^he/.test(locale.toLowerCase());
  const resolvedDirection = direction === 'auto' ? (isRtlLocale ? 'rtl' : 'ltr') : direction;
  const t = {
    previous: isRtlLocale ? 'قبلی' : 'Previous',
    today: isRtlLocale ? 'امروز' : 'Today',
    next: isRtlLocale ? 'بعدی' : 'Next',
    day: isRtlLocale ? 'روز' : 'Day',
    week: isRtlLocale ? 'هفته' : 'Week',
    ...translations
  };
  const ganttTranslations = useMemo(() => {
    const map: Partial<{ previous: string; today: string; next: string }> = {};
    if (t.previous) map.previous = t.previous;
    if (t.today) map.today = t.today;
    if (t.next) map.next = t.next;
    return map;
  }, [t.previous, t.today, t.next]);

  const mergedTheme: CalendarTheme = { ...defaultTheme, ...theme };
  const cssVars = {
    ['--rbc-primary' as string]: mergedTheme.primary,
    ['--rbc-bg' as string]: mergedTheme.bg,
    ['--rbc-panel' as string]: mergedTheme.panel,
    ['--rbc-border' as string]: mergedTheme.border,
    ['--rbc-text' as string]: mergedTheme.text,
    ['--rbc-muted' as string]: mergedTheme.mutedText,
    ['--rbc-available' as string]: mergedTheme.availableBg,
    ['--rbc-booked' as string]: mergedTheme.bookedBg,
    ['--rbc-blocked' as string]: mergedTheme.blockedBg,
    ['--rbc-custom' as string]: mergedTheme.customBg
  } as React.CSSProperties;

  // ── Gantt mode: delegate to GanttScheduler ──────────────────────────────
  const isGanttMode = schedulerMode === 'task-timeline' || schedulerMode === 'resource-planner';

  const ganttData = useMemo(() => {
    if (!isGanttMode || !dataAdapter || dataSource === undefined) return null;
    const adapter = dataAdapter as GanttDataAdapter<unknown>;
    if (typeof adapter.toGantt !== 'function') return null;
    return adapter.toGantt(dataSource, { date: value, locale });
  }, [isGanttMode, dataAdapter, dataSource, value, locale]);

  if (isGanttMode && ganttData) {
    return (
      <GanttScheduler
        schedulerMode={schedulerMode}
        rows={ganttData.rows}
        items={ganttData.items}
        date={value}
        timeStart={ganttData.timeStart}
        timeEnd={ganttData.timeEnd}
        granularity={ganttData.granularity}
        timeUnit={ganttTimeUnit ?? ganttData.timeUnit}
        scale={ganttScale ?? ganttData.scale ?? (ganttData.timeUnit === 'day' ? 'week' : undefined)}
        weekStartsOn={weekStartsOn}
        locale={locale}
        direction={direction === 'auto' ? (/^fa|^ar|^he/.test(locale.toLowerCase()) ? 'rtl' : 'ltr') : direction as 'rtl' | 'ltr'}
        theme={theme}
        onItemClick={onItemClick}
        onItemMove={onGanttItemMove}
        onItemResize={onGanttItemResize}
        onItemCreate={onGanttItemCreate}
        translations={ganttTranslations}
        onDateChange={onChange}
      />
    );
  }

  const normalizedSchedules = useMemo(() => {
    if (dataAdapter && dataSource !== undefined && !isGanttMode) {
      const adapter = dataAdapter as { toSchedules?: (d: unknown) => typeof schedules };
      if (typeof adapter.toSchedules === 'function') return adapter.toSchedules(dataSource);
    }
    return schedules;
  }, [dataAdapter, dataSource, schedules, isGanttMode]);

  const days = useMemo(() => (calendarMode === 'week' ? getWeekDays(value, weekStartsOn) : [value]), [calendarMode, value, weekStartsOn]);
  const byDate = useMemo(() => new Map(normalizedSchedules.map((d) => [d.date, d])), [normalizedSchedules]);
  const bounds = useMemo(() => getHourBounds(normalizedSchedules), [normalizedSchedules]);
  const times = useMemo(() => generateTimeSlots(bounds.start, bounds.end, slotGranularity), [bounds, slotGranularity]);

  const title = calendarMode === 'week'
    ? `${days[0].toLocaleDateString(locale)} - ${days[days.length - 1].toLocaleDateString(locale)}`
    : value.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const rowsHeight = 30;
  const totalMinutes = (bounds.end - bounds.start) * 60;
  const currentSelectionKeys = useMemo(() => {
    if (selectedSlots) {
      const keys = new Set<string>();
      for (const s of selectedSlots) {
        const start = toMinutes(s.startTime);
        const end = toMinutes(s.endTime);
        for (let m = start; m < end; m += slotGranularity) {
          keys.add(`${s.date}__${minutesToTime(m)}`);
        }
      }
      return keys;
    }
    return internalSelectedKeys;
  }, [selectedSlots, internalSelectedKeys, slotGranularity]);

  const emitSelection = (keys: Set<string>) => {
    const values = compressSelectionKeys(keys, slotGranularity);
    onSelectionChange?.(values);
    return values;
  };

  const addSelection = (date: string, startTime: string) => {
    const key = `${date}__${startTime}`;
    if (liveSelectionRef.current.has(key)) return;
    liveSelectionRef.current = new Set(liveSelectionRef.current);
    liveSelectionRef.current.add(key);

    const endTime = minutesToTime(toMinutes(startTime) + slotGranularity);
    onSlotDragSelectMove?.({ date, startTime, endTime });

    if (selectedSlots) {
      emitSelection(liveSelectionRef.current);
      return;
    }
    const nextKeys = new Set(liveSelectionRef.current);
    setInternalSelectedKeys(nextKeys);
    setTimeout(() => emitSelection(nextKeys), 0);
  };

  const findConflict = (payload: SlotMovePayload): CalendarSlot | undefined => {
    const targetStart = toMinutes(payload.to.startTime);
    const targetEnd = toMinutes(payload.to.endTime);
    const sameSlotMove =
      payload.from.date === payload.to.date &&
      payload.from.startTime === payload.to.startTime &&
      payload.from.endTime === payload.to.endTime;
    if (sameSlotMove) return undefined;
    const targetDay = byDate.get(payload.to.date);
    if (!targetDay) return undefined;

    return targetDay.slots.find((s) => {
      if (
        payload.from.date === payload.to.date &&
        s.startTime === payload.from.startTime &&
        s.endTime === payload.from.endTime &&
        (s.itemId ?? s.bookingId) === (payload.slot.itemId ?? payload.slot.bookingId)
      ) {
        return false;
      }
      const sStart = toMinutes(s.startTime);
      const sEnd = toMinutes(s.endTime);
      return rangesOverlap(targetStart, targetEnd, sStart, sEnd);
    });
  };

  return (
    <div
      className={`rbc-root rbc-model-${schedulerMode} ${className ?? ''} ${resolvedDirection === 'rtl' ? 'rbc-rtl' : 'rbc-ltr'}`}
      style={cssVars}
      dir={resolvedDirection}
      data-scheduler-mode={schedulerMode}
    >
      <div className="rbc-toolbar">
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="rbc-btn" onClick={() => onChange(addDays(value, calendarMode === 'week' ? -7 : -1))}>{t.previous}</button>
          <button className="rbc-btn" onClick={() => onChange(new Date())}>{t.today}</button>
          <button className="rbc-btn" onClick={() => onChange(addDays(value, calendarMode === 'week' ? 7 : 1))}>{t.next}</button>
        </div>
        <strong>{title}</strong>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className={`rbc-btn ${calendarMode === 'day' ? 'active' : ''}`} onClick={() => setCalendarMode('day')}>{t.day}</button>
          <button className={`rbc-btn ${calendarMode === 'week' ? 'active' : ''}`} onClick={() => setCalendarMode('week')}>{t.week}</button>
        </div>
      </div>

      <div className="rbc-grid" style={{
          ['--rbc-days' as string]: String(days.length),
          ['--rbc-rows' as string]: String(times.length),
          gridTemplateRows: `auto repeat(${times.length}, ${rowsHeight}px)`
        } as React.CSSProperties}>
        {!hideTimeColumn && <div className="rbc-day-head" />}
        {days.map((d) => {
          const isToday = toIsoDate(d) === toIsoDate(new Date());
          return <div key={d.toISOString()} className={`rbc-day-head ${isToday ? 'today' : ''}`}>{d.toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' })}</div>;
        })}

        {times.map((t, rowIdx) => (
          <React.Fragment key={t}>
            {!hideTimeColumn && (
              <div
                className="rbc-time"
                style={{ gridRow: rowIdx + 2, gridColumn: 1 } as React.CSSProperties}
              >
                {t}
              </div>
            )}
            {days.map((d, colIdx) => {
              const dayIso = toIsoDate(d);
              const cellKey = `${dayIso}-${t}`;
              const tMin = toMinutes(t);
              const cellHasSlot = byDate.get(dayIso)?.slots.some(
                s => toMinutes(s.startTime) <= tMin && tMin < toMinutes(s.endTime)
              ) ?? false;
              return (
                <div
                  key={`${t}-${d.toISOString()}`}
                  data-slot-cell="true"
                  data-date={dayIso}
                  data-start-time={t}
                  className={`rbc-cell ${dragOverKey === cellKey ? 'rbc-drop-target' : ''} ${selectionMode && !cellHasSlot && (isSlotSelected?.({ date: dayIso, startTime: t, endTime: minutesToTime(tMin + slotGranularity) }) || currentSelectionKeys.has(`${dayIso}__${t}`)) ? 'rbc-cell-selected' : ''}`}
                  style={{ height: rowsHeight, gridRow: rowIdx + 2, gridColumn: (hideTimeColumn ? 1 : 2) + colIdx } as React.CSSProperties}
                  onMouseDown={(e) => {
                    if (!selectionMode || e.button !== 0 || cellHasSlot) return;
                    liveSelectionRef.current = new Set();
                    setInternalSelectedKeys(new Set());
                    isSelectingRef.current = true;
                    setIsSelecting(true);
                    const endTime = minutesToTime(tMin + slotGranularity);
                    onSlotDragSelectStart?.({ date: dayIso, startTime: t, endTime });
                    addSelection(dayIso, t);
                  }}
                  onMouseEnter={() => {
                    if (!selectionMode || !isSelectingRef.current || cellHasSlot) return;
                    addSelection(dayIso, t);
                  }}
                  onMouseUp={() => {
                    if (!selectionMode || !isSelectingRef.current) return;
                    isSelectingRef.current = false;
                    setIsSelecting(false);
                    const keys = liveSelectionRef.current;
                    const final = compressSelectionKeys(keys, slotGranularity);
                    liveSelectionRef.current = new Set();
                    onSlotDragSelectEnd?.(final);
                  }}
                />
              );
            })}
          </React.Fragment>
        ))}

        {!hideTimeColumn && (
          <div
            className="rbc-empty-col"
            style={{ gridRow: `2 / span ${times.length}`, gridColumn: 1 } as React.CSSProperties}
          />
        )}
        {days.map((d, i) => {
          const dayIso = toIsoDate(d);
          const day = byDate.get(dayIso);

          const calcTimeFromY = (e: React.DragEvent<HTMLDivElement>): string => {
            const rect = e.currentTarget.getBoundingClientRect();
            const fraction = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
            const mins = Math.floor((fraction * totalMinutes) / slotGranularity) * slotGranularity;
            return minutesToTime(bounds.start * 60 + mins);
          };

          return (
            <div
              key={`slots-${dayIso}`}
              className="rbc-empty-col"
              style={{
                gridRow: `2 / span ${times.length}`,
                gridColumn: (hideTimeColumn ? 1 : 2) + i,
                pointerEvents: draggableSlots ? 'auto' : 'none',
              } as React.CSSProperties}
              onDragOver={(e) => {
                if (!draggableSlots) return;
                e.preventDefault();
                const t = calcTimeFromY(e);
                setDragOverKey(`${dayIso}-${t}`);
              }}
              onDragLeave={() => setDragOverKey(null)}
              onDrop={(e) => {
                if (!draggableSlots || !onSlotMove) return;
                e.preventDefault();
                setDragOverKey(null);
                const raw = e.dataTransfer.getData('application/x-rbc-slot');
                if (!raw) return;
                const payload = JSON.parse(raw) as { slot: CalendarSlot; date: string };
                const targetStart = calcTimeFromY(e);
                const duration = toMinutes(payload.slot.endTime) - toMinutes(payload.slot.startTime);
                if (duration <= 0) return;
                const movePayload: SlotMovePayload = {
                  slot: payload.slot,
                  from: { date: payload.date, startTime: payload.slot.startTime, endTime: payload.slot.endTime },
                  to: { date: dayIso, startTime: targetStart, endTime: minutesToTime(toMinutes(targetStart) + duration) }
                };

                const conflict = findConflict(movePayload);
                if (conflict) {
                  onSlotConflict?.({ ...movePayload, reason: 'overlap', conflictingSlot: conflict });
                  return;
                }

                Promise.resolve(onBeforeSlotMove?.(movePayload) ?? true).then((allowed) => {
                  if (!allowed) {
                    onSlotConflict?.({ ...movePayload, reason: 'blocked-by-policy' });
                    return;
                  }
                  onSlotMove(movePayload);
                });
              }}
            >
              {(day?.slots ?? []).map((slot, i) => {
                const start = toMinutes(slot.startTime);
                const end = toMinutes(slot.endTime);
                const top = ((start - bounds.start * 60) / totalMinutes) * 100;
                const height = ((end - start) / totalMinutes) * 100;
                return (
                  <div
                    key={`${slot.startTime}-${slot.endTime}-${i}`}
                    data-slot-item="true"
                    data-date={dayIso}
                    data-start-time={slot.startTime}
                    data-end-time={slot.endTime}
                    className={slotClass(slot.status)}
                    style={{ top: `${top}%`, height: `${height}%` }}
                    draggable={draggableSlots}
                    onDragStart={(e) => {
                      if (!draggableSlots) return;
                      e.stopPropagation();
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('application/x-rbc-slot', JSON.stringify({ slot, date: dayIso }));
                    }}
                    onClick={() => {
                      const id = slot.itemId ?? slot.bookingId;
                      if (id) {
                        onItemClick?.(id);
                        onBookingClick?.(id);
                        return;
                      }
                      onSlotClick?.(dayIso, slot);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter' && e.key !== ' ') return;
                      e.preventDefault();
                      const id = slot.itemId ?? slot.bookingId;
                      if (id) {
                        onItemClick?.(id);
                        onBookingClick?.(id);
                        return;
                      }
                      onSlotClick?.(dayIso, slot);
                    }}
                  >
                    <div className="rbc-label">{slot.title ?? `${slot.startTime} - ${slot.endTime}`}</div>
                    <div className="rbc-sub">{slot.description ?? slot.status}</div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BookingCalendar;
