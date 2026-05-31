import { useEffect, useMemo, useState } from 'react';
import { BookingCalendar, createTaskTimelineAdapter } from '@omidrahmati/react-slot-scheduler';
import type { GanttCreatePayload, GanttMovePayload, GanttResizePayload, GanttScale, GanttTimeUnit, TaskTimelineItem } from '@omidrahmati/react-slot-scheduler';
import { taskTimelineItemsFa, taskTimelineItemsEn } from '../data/taskTimelineData';
import { BookingModal } from '../components/BookingModal';
import '@omidrahmati/react-slot-scheduler/dist/index.css';

interface Props {
  isDark: boolean;
  lang: 'fa' | 'en';
}

export function TaskTimelineDemo({ isDark, lang }: Props) {
  const isFa = lang === 'fa';

  const [items, setItems] = useState<TaskTimelineItem[]>(isFa ? taskTimelineItemsFa : taskTimelineItemsEn);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [date, setDate] = useState(() => new Date());
  const [pendingCreate, setPendingCreate] = useState<GanttCreatePayload | null>(null);
  const [timeUnit, setTimeUnit] = useState<GanttTimeUnit>('hour');
  const [scale, setScale] = useState<GanttScale>('week');

  // Reset when language switches
  useEffect(() => {
    setItems(isFa ? taskTimelineItemsFa : taskTimelineItemsEn);
    setDate(new Date());
  }, [isFa]);

  const adapter = useMemo(() => createTaskTimelineAdapter(), []);

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
        ? `✅ وظیفه "${payload.item.title}" به ${payload.newStartTime}–${payload.newEndTime} منتقل شد`
        : `✅ Task "${payload.item.title}" moved to ${payload.newStartTime}–${payload.newEndTime}`
    );
  };

  const handleResize = (payload: GanttResizePayload) => {
    setItems(prev => prev.map(item =>
      item.id === payload.item.id
        ? { ...item, startTime: payload.newStartTime, endTime: payload.newEndTime }
        : item
    ));
    setLastAction(
      isFa
        ? `↔ زمان وظیفه "${payload.item.title}" به ${payload.newStartTime}–${payload.newEndTime} تغییر کرد`
        : `↔ Task "${payload.item.title}" resized to ${payload.newStartTime}–${payload.newEndTime}`
    );
  };

  const handleCreate = (payload: GanttCreatePayload) => {
    // Open modal to fill in task details
    setPendingCreate(payload);
  };

  const handleModalConfirm = (data: { title: string; description: string; status: 'booked' | 'blocked' | 'custom' }) => {
    if (!pendingCreate) return;
    const newItem: TaskTimelineItem = {
      id: `task-new-${Date.now()}`,
      date: pendingCreate.date,
      endDate: pendingCreate.endDate,
      startTime: pendingCreate.startTime,
      endTime: pendingCreate.endTime,
      title: data.title,
      status: data.status,
      assignee: pendingCreate.rowId,
      progress: 0,
    };
    setItems(prev => [...prev, newItem]);
    setLastAction(
      isFa
        ? `✅ وظیفه "${data.title}" برای "${pendingCreate.rowId}" ثبت شد`
        : `✅ Task "${data.title}" added for "${pendingCreate.rowId}"`
    );
    setPendingCreate(null);
  };

  const themeColors = isDark
    ? { primary: '#22c55e', bg: '#0f172a', panel: '#1e293b', border: '#334155', text: '#f1f5f9', mutedText: '#94a3b8', bookedBg: '#14532d', blockedBg: '#7f1d1d', customBg: '#134e3c' }
    : { primary: '#16a34a', bg: '#f8fafc', panel: '#ffffff', border: '#e2e8f0', text: '#0f172a', mutedText: '#64748b', bookedBg: '#bbf7d0', blockedBg: '#fecaca', customBg: '#a7f3d0' };

  return (
    <div className="demo-wrapper">
      <div className="demo-controls">
        <div className="control-group">
          <span className="control-label">{isFa ? 'حالت' : 'Mode'}</span>
          <span className="stat-chip" style={{ background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
            Gantt · task-timeline
          </span>
        </div>
        <div className="control-group">
          <span className="control-label">{isFa ? 'تعداد وظایف' : 'Tasks'}</span>
          <span className="stat-chip available">{items.length}</span>
        </div>
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
        <div className="control-group" style={{ marginInlineStart: 'auto' }}>
          <span style={{ fontSize: 11, color: 'var(--text2)' }}>
            {isFa
              ? (timeUnit === 'hour'
                  ? '💡 بکش جابجا کن · لبه = تغییر اندازه · روی فضای خالی بکش = وظیفه جدید'
                  : '💡 بکش جابجا کن · روی ردیف خالی بکش = وظیفه چندروزه')
              : (timeUnit === 'hour'
                  ? '💡 Drag to move · Edges to resize · Drag empty area to create'
                  : '💡 Drag to move · Drag empty row area to create multi-day task')
            }
          </span>
        </div>
      </div>

      {lastAction && (
        <div className="event-toast">
          <span className="event-icon">⚡</span>
          <span>{lastAction}</span>
          <button className="toast-close" onClick={() => setLastAction(null)}>×</button>
        </div>
      )}

      <div className="calendar-shell">
        <BookingCalendar
          mode="task-timeline"
          value={date}
          onChange={setDate}
          schedules={[]}
          dataAdapter={adapter}
          dataSource={items}
          locale={isFa ? 'fa-IR' : 'en-US'}
          weekStartsOn={isFa ? 6 : 1}
          direction="auto"
          theme={themeColors}
          ganttTimeUnit={timeUnit}
          ganttScale={timeUnit === 'day' ? scale : undefined}
          onItemClick={(id) => {
            const item = items.find(t => t.id === id);
            if (!item) return;
            setLastAction(
              isFa
                ? `📌 "${item.title}" — ${item.assignee} — ${item.startTime}–${item.endTime}`
                : `📌 "${item.title}" — ${item.assignee} — ${item.startTime}–${item.endTime}`
            );
          }}
          onGanttItemMove={handleMove}
          onGanttItemResize={handleResize}
          onGanttItemCreate={handleCreate}
          translations={isFa
            ? { previous: 'قبلی', today: 'امروز', next: 'بعدی' }
            : { previous: 'Previous', today: 'Today', next: 'Next' }
          }
        />
      </div>

      <div style={{ padding: '8px 20px 12px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { status: 'booked',  lc: '#bbf7d0', dc: '#14532d', fa: 'در دست اجرا', en: 'In Progress' },
          { status: 'blocked', lc: '#fecaca', dc: '#7f1d1d', fa: 'مسدود',       en: 'Blocked' },
          { status: 'custom',  lc: '#a7f3d0', dc: '#134e3c', fa: 'در انتظار',   en: 'Pending' },
        ].map(({ status, lc, dc, fa, en }) => (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)' }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: isDark ? dc : lc, display: 'inline-block', border: '1px solid var(--border)' }} />
            {isFa ? fa : en}
          </div>
        ))}
      </div>

      {pendingCreate && (
        <BookingModal
          slots={[{ date: pendingCreate.date, startTime: pendingCreate.startTime, endTime: pendingCreate.endTime }]}
          lang={lang}
          isDark={isDark}
          onConfirm={handleModalConfirm}
          onClose={() => setPendingCreate(null)}
        />
      )}
    </div>
  );
}
