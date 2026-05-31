import { useState, useEffect } from 'react';
import { BookingCalendar } from '@omidrahmati/react-slot-scheduler';
import type { CalendarSlot, DaySchedule } from '@omidrahmati/react-slot-scheduler';
import { appointmentSchedulesFa, appointmentSchedulesEn } from '../data/appointmentData';
import { BookingModal } from '../components/BookingModal';
import '@omidrahmati/react-slot-scheduler/dist/index.css';

interface Props {
  isDark: boolean;
  lang: 'fa' | 'en';
}

const themes = {
  teal: {
    light: { primary: '#0f766e', bookedBg: '#fda4af', blockedBg: '#e2e8f0', customBg: '#bae6fd' },
    dark:  { primary: '#2dd4bf', bookedBg: '#be123c', blockedBg: '#334155', customBg: '#0369a1' },
  },
  blue: {
    light: { primary: '#1d4ed8', bookedBg: '#f9a8d4', blockedBg: '#e2e8f0', customBg: '#c4b5fd' },
    dark:  { primary: '#60a5fa', bookedBg: '#be185d', blockedBg: '#334155', customBg: '#4338ca' },
  },
  purple: {
    light: { primary: '#7c3aed', bookedBg: '#f9a8d4', blockedBg: '#e2e8f0', customBg: '#93c5fd' },
    dark:  { primary: '#a78bfa', bookedBg: '#be185d', blockedBg: '#334155', customBg: '#1d4ed8' },
  },
  rose: {
    light: { primary: '#be185d', bookedBg: '#fca5a5', blockedBg: '#e2e8f0', customBg: '#6ee7b7' },
    dark:  { primary: '#fb7185', bookedBg: '#b91c1c', blockedBg: '#334155', customBg: '#065f46' },
  },
};

type ThemeKey = keyof typeof themes;

export function AppointmentDemo({ isDark, lang }: Props) {
  const [date, setDate] = useState(new Date());
  const [activeTheme, setActiveTheme] = useState<ThemeKey>('teal');
  const [draggable, setDraggable] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectionCount, setSelectionCount] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [pendingSlots, setPendingSlots] = useState<Array<{date:string;startTime:string;endTime:string}>>([]);

  const isFa = lang === 'fa';
  const [schedules, setSchedules] = useState<DaySchedule[]>(
    isFa ? appointmentSchedulesFa : appointmentSchedulesEn
  );

  // Reset schedules when language changes
  useEffect(() => {
    setDate(new Date());
    setSelectionCount(0);
    setSchedules(isFa ? appointmentSchedulesFa : appointmentSchedulesEn);
  }, [isFa]);

  const handleSlotClick = (date: string, slot: CalendarSlot) => {
    setLastAction(
      isFa
        ? `نوبت ${slot.startTime}–${slot.endTime} در تاریخ ${date} انتخاب شد`
        : `Slot ${slot.startTime}–${slot.endTime} on ${date} selected`
    );
  };

  const handleBookingClick = (id: string) => {
    setLastAction(isFa ? `رزرو ${id} باز شد` : `Booking ${id} opened`);
  };

  const handleSlotMove = (payload: { slot: CalendarSlot; from: { date: string; startTime: string; endTime: string }; to: { date: string; startTime: string; endTime: string } }) => {
    // Actually update the schedules state so the move persists visually
    setSchedules(prev => prev.map(day => {
      if (day.date === payload.from.date) {
        return { ...day, slots: day.slots.filter(s => !(s.startTime === payload.from.startTime && s.endTime === payload.from.endTime)) };
      }
      if (day.date === payload.to.date) {
        return { ...day, slots: [...day.slots, { ...payload.slot, startTime: payload.to.startTime, endTime: payload.to.endTime }] };
      }
      return day;
    }));
    setLastAction(
      isFa
        ? `✅ نوبت "${payload.slot.title}" از ${payload.from.startTime} به ${payload.to.startTime} جابجا شد`
        : `✅ "${payload.slot.title}" moved ${payload.from.startTime} → ${payload.to.startTime} on ${payload.to.date}`
    );
  };

  const handleSelectionEnd = (slots: Array<{date: string; startTime: string; endTime: string}>) => {
    setSelectionCount(slots.length);
    if (slots.length === 0) return;
    // Open modal to fill in booking details
    setPendingSlots(slots);
  };

  const handleModalConfirm = (data: { title: string; description: string; status: 'booked' | 'blocked' | 'custom' }) => {
    setSchedules(prev => {
      const updated = [...prev];
      for (const sel of pendingSlots) {
        const idx = updated.findIndex(d => d.date === sel.date);
        const newSlot: CalendarSlot = {
          startTime: sel.startTime,
          endTime: sel.endTime,
          status: data.status,
          itemId: `new-${Date.now()}-${sel.startTime}`,
          title: data.title,
          description: data.description || undefined,
        };
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], slots: [...updated[idx].slots, newSlot] };
        } else {
          updated.push({ date: sel.date, isWorkingDay: true, workStartTime: '08:00', workEndTime: '17:00', slots: [newSlot] });
        }
      }
      return updated;
    });
    setLastAction(
      isFa
        ? `✅ نوبت "${data.title}" ثبت شد (${pendingSlots[0]?.startTime}–${pendingSlots[pendingSlots.length-1]?.endTime})`
        : `✅ "${data.title}" booked (${pendingSlots[0]?.startTime}–${pendingSlots[pendingSlots.length-1]?.endTime})`
    );
    setPendingSlots([]);
    setSelectionCount(0);
  };

  const themeColors = {
    ...(isDark ? themes[activeTheme].dark : themes[activeTheme].light),
    ...(isDark
      ? { bg: '#0f172a', panel: '#1e293b', border: '#334155', text: '#f1f5f9', mutedText: '#94a3b8' }
      : { bg: '#f8fafc', panel: '#ffffff', border: '#e2e8f0', text: '#0f172a', mutedText: '#64748b' }),
  };

  return (
    <div className="demo-wrapper">
      <div className="demo-controls">
        <div className="control-group">
          <span className="control-label">{isFa ? 'رنگ‌بندی' : 'Color'}</span>
          <div className="theme-swatches">
            {(Object.keys(themes) as ThemeKey[]).map((key) => (
              <button
                key={key}
                className={`swatch ${activeTheme === key ? 'active' : ''}`}
                style={{ background: isDark ? themes[key].dark.primary : themes[key].light.primary }}
                onClick={() => setActiveTheme(key)}
                title={key}
              />
            ))}
          </div>
        </div>

        <div className="control-group">
          <span className="control-label">{isFa ? 'جابجایی' : 'Drag & Drop'}</span>
          <label className="toggle">
            <input type="checkbox" checked={draggable} onChange={e => { setDraggable(e.target.checked); if (e.target.checked) setSelectionMode(false); }} />
            <span className="toggle-track"><span className="toggle-thumb" /></span>
          </label>
        </div>

        <div className="control-group">
          <span className="control-label">{isFa ? 'چندانتخابی' : 'Multi-Select'}</span>
          <label className="toggle">
            <input type="checkbox" checked={selectionMode} onChange={e => { setSelectionMode(e.target.checked); if (e.target.checked) setDraggable(false); setSelectionCount(0); }} />
            <span className="toggle-track"><span className="toggle-thumb" /></span>
          </label>
        </div>

        {selectionMode && (
          <div className="control-group">
            <span className="stat-chip" style={{ background: 'var(--primary)', color: '#fff', padding: '4px 10px', borderRadius: 999, fontSize: 11 }}>
              {isFa ? `${selectionCount} انتخاب شد` : `${selectionCount} selected`}
            </span>
            {selectionCount > 0 && (
              <button className="pill" onClick={() => { setSelectionCount(0); setLastAction(null); }}>
                {isFa ? 'پاک کردن' : 'Clear'}
              </button>
            )}
          </div>
        )}

        <div className="stat-chips">
          <span className="stat-chip available">{isFa ? 'آزاد' : 'Open'}</span>
          <span className="stat-chip booked">{isFa ? 'رزروشده' : 'Booked'}</span>
          <span className="stat-chip blocked">{isFa ? 'مسدود' : 'Blocked'}</span>
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
          value={date}
          onChange={setDate}
          schedules={schedules}
          draggableSlots={draggable && !selectionMode}
          selectionMode={selectionMode}
          onSelectionChange={(slots) => setSelectionCount(slots.length)}
          onSlotDragSelectEnd={handleSelectionEnd}
          onSlotClick={handleSlotClick}
          onBookingClick={handleBookingClick}
          onSlotMove={handleSlotMove}
          locale={isFa ? 'fa-IR' : 'en-US'}
          weekStartsOn={isFa ? 6 : 1}
          direction="auto"
          theme={themeColors}
        />
      </div>

      {pendingSlots.length > 0 && (
        <BookingModal
          slots={pendingSlots}
          lang={lang}
          isDark={isDark}
          onConfirm={handleModalConfirm}
          onClose={() => { setPendingSlots([]); setSelectionCount(0); }}
        />
      )}
    </div>
  );
}
