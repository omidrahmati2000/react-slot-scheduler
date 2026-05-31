import { useEffect, useMemo, useState } from 'react';
import { BookingCalendar, createResourcePlannerAdapter } from '@omidrahmati/react-slot-scheduler';
import type { GanttCreatePayload, GanttMovePayload, GanttResizePayload, GanttScale, GanttTimeUnit, ResourcePlannerItem } from '@omidrahmati/react-slot-scheduler';
import { BookingModal } from '../components/BookingModal';
import {
  resourcesFa, resourcesEn,
  resourcePlannerItemsFa, resourcePlannerItemsEn,
} from '../data/resourcePlannerData';
import '@omidrahmati/react-slot-scheduler/dist/index.css';

interface Props {
  isDark: boolean;
  lang: 'fa' | 'en';
}

export function ResourcePlannerDemo({ isDark, lang }: Props) {
  const isFa = lang === 'fa';
  const resources = isFa ? resourcesFa : resourcesEn;

  const [items, setItems] = useState<ResourcePlannerItem[]>(isFa ? resourcePlannerItemsFa : resourcePlannerItemsEn);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [scale, setScale] = useState<GanttScale>('week');
  const [timeUnit, setTimeUnit] = useState<GanttTimeUnit>('day');
  const [pendingCreate, setPendingCreate] = useState<GanttCreatePayload | null>(null);
  const [date, setDate] = useState(() => new Date());

  useEffect(() => {
    setItems(isFa ? resourcePlannerItemsFa : resourcePlannerItemsEn);
    setDate(new Date());
  }, [isFa]);

  const adapter = useMemo(() => createResourcePlannerAdapter(isFa ? resourcesFa : resourcesEn), [isFa]);

  const handleMove = (payload: GanttMovePayload) => {
    setItems(prev => prev.map(item =>
      item.id === payload.item.id
        ? { ...item, date: payload.newDate, startTime: payload.newStartTime, endTime: payload.newEndTime, resourceId: payload.newRowId }
        : item
    ));
    const res = resources.find(r => r.id === payload.newRowId);
    setLastAction(
      isFa
        ? `✅ "${payload.item.title}" → ${res?.title ?? payload.newRowId} — ${payload.newStartTime}–${payload.newEndTime}`
        : `✅ "${payload.item.title}" → ${res?.title ?? payload.newRowId} — ${payload.newStartTime}–${payload.newEndTime}`
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
        ? `↔ "${payload.item.title}" — ${payload.newStartTime}–${payload.newEndTime}`
        : `↔ "${payload.item.title}" resized to ${payload.newStartTime}–${payload.newEndTime}`
    );
  };

  const handleCreate = (payload: GanttCreatePayload) => {
    setPendingCreate(payload);
  };

  const handleModalConfirm = (data: { title: string; description: string; status: 'booked' | 'blocked' | 'custom' }) => {
    if (!pendingCreate) return;
    const res = resources.find(r => r.id === pendingCreate.rowId);
    const newItem: ResourcePlannerItem = {
      id: `res-new-${Date.now()}`,
      date: pendingCreate.date,
      startTime: pendingCreate.startTime,
      endTime: pendingCreate.endTime,
      resourceId: pendingCreate.rowId,
      title: data.title,
      status: data.status,
      description: data.description || undefined,
    };
    setItems(prev => [...prev, newItem]);
    setLastAction(
      isFa
        ? `✅ "${data.title}" برای "${res?.title}" ثبت شد`
        : `✅ "${data.title}" booked for "${res?.title}"`
    );
    setPendingCreate(null);
  };

  const themeColors = isDark
    ? { primary: '#38bdf8', bg: '#0f172a', panel: '#1e293b', border: '#334155', text: '#f1f5f9', mutedText: '#94a3b8', bookedBg: '#1e3a5f', blockedBg: '#7f1d1d', customBg: '#134e4e' }
    : { primary: '#0284c7', bg: '#f0f9ff', panel: '#ffffff', border: '#bae6fd', text: '#0c4a6e', mutedText: '#0369a1', bookedBg: '#7dd3fc', blockedBg: '#fca5a5', customBg: '#6ee7f7' };

  return (
    <div className="demo-wrapper">
      <div className="demo-controls">
        <div className="control-group">
          <span className="control-label">{isFa ? 'حالت' : 'Mode'}</span>
          <span className="stat-chip" style={{ background: '#e0f2fe', color: '#075985', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
            Gantt · resource-planner
          </span>
        </div>
        <div className="control-group">
          <span className="control-label">{isFa ? 'منابع' : 'Resources'}</span>
          <span className="stat-chip available">{resources.length}</span>
        </div>
        <div className="control-group">
          <span className="control-label">{isFa ? 'رویدادها' : 'Events'}</span>
          <span className="stat-chip booked">{items.length}</span>
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
              {(['week','month'] as GanttScale[]).map(s => (
                <button key={s} className={`pill ${scale === s ? 'active' : ''}`} onClick={() => setScale(s)}>
                  {s === 'week' ? (isFa ? 'هفته' : 'Week') : (isFa ? 'ماه' : 'Month')}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="control-group" style={{ marginInlineStart: 'auto' }}>
          <span style={{ fontSize: 11, color: 'var(--text2)' }}>
            {isFa ? '💡 بکش جابجا کن' : '💡 Drag to move'}
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
          mode="resource-planner"
          value={date}
          onChange={setDate}
          schedules={[]}
          resources={resources}
          dataAdapter={adapter}
          dataSource={items}
          ganttTimeUnit={timeUnit}
          ganttScale={timeUnit === 'day' ? scale : undefined}
          locale={isFa ? 'fa-IR' : 'en-US'}
          weekStartsOn={isFa ? 6 : 1}
          direction="auto"
          theme={themeColors}
          onItemClick={(id) => {
            const item = items.find(i => i.id === id);
            const res = resources.find(r => r.id === item?.resourceId);
            if (!item || !res) return;
            setLastAction(
              isFa
                ? `📌 "${item.title}" — ${res.title} — ${item.startTime}–${item.endTime}`
                : `📌 "${item.title}" — ${res.title} — ${item.startTime}–${item.endTime}`
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
