import { useState, useEffect } from 'react';
import { BookingCalendar } from '@omidrahmati/react-slot-scheduler';
import type { CalendarSlot, DaySchedule } from '@omidrahmati/react-slot-scheduler';
import { meetingRoomSchedules } from '../data/hotelData';
import '@omidrahmati/react-slot-scheduler/dist/index.css';

interface Props {
  isDark: boolean;
  lang: 'fa' | 'en';
}

export function MeetingRoomDemo({ isDark, lang }: Props) {
  const [date, setDate] = useState(new Date());
  const [draggable, setDraggable] = useState(true);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<DaySchedule[]>(meetingRoomSchedules);

  const isFa = lang === 'fa';

  useEffect(() => {
    setDate(new Date());
    setSchedules(meetingRoomSchedules);
  }, [lang]);

  const handleSlotClick = (_date: string, slot: CalendarSlot) => {
    if (slot.status === 'available') {
      setLastAction(isFa ? `اتاق برای ${slot.startTime}–${slot.endTime} رزرو شد ✓` : `Room booked for ${slot.startTime}–${slot.endTime} ✓`);
    }
  };

  const handleBookingClick = (id: string) => {
    setLastAction(isFa ? `جزئیات رزرو ${id}` : `View booking ${id}`);
  };

  const handleSlotMove = (payload: { slot: CalendarSlot; from: { date: string; startTime: string }; to: { date: string; startTime: string } }) => {
    const duration =
      parseInt(payload.slot.endTime.split(':')[0]) * 60 + parseInt(payload.slot.endTime.split(':')[1]) -
      (parseInt(payload.slot.startTime.split(':')[0]) * 60 + parseInt(payload.slot.startTime.split(':')[1]));
    const [toH, toM] = payload.to.startTime.split(':').map(Number);
    const endMins = toH * 60 + toM + duration;
    const newEnd = `${String(Math.floor(endMins / 60)).padStart(2, '0')}:${String(endMins % 60).padStart(2, '0')}`;

    setSchedules(prev => prev.map(day => {
      if (day.date === payload.from.date) {
        return { ...day, slots: day.slots.filter(s => !(s.startTime === payload.slot.startTime && s.endTime === payload.slot.endTime)) };
      }
      if (day.date === payload.to.date) {
        return { ...day, slots: [...day.slots, { ...payload.slot, startTime: payload.to.startTime, endTime: newEnd }] };
      }
      return day;
    }));

    setLastAction(
      isFa
        ? `رزرو از ${payload.from.startTime} به ${payload.to.startTime} منتقل شد`
        : `Meeting moved from ${payload.from.startTime} to ${payload.to.startTime} on ${payload.to.date}`
    );
  };

  const themeColors = isDark
    ? { primary: '#818cf8', bg: '#0f172a', panel: '#1e293b', border: '#334155', text: '#f1f5f9', mutedText: '#94a3b8', bookedBg: '#3730a3', blockedBg: '#334155', customBg: '#5b21b6' }
    : { primary: '#6366f1', bg: '#f8fafc', panel: '#ffffff', border: '#e2e8f0', text: '#0f172a', mutedText: '#64748b', bookedBg: '#e0e7ff', blockedBg: '#f1f5f9', customBg: '#f5f3ff' };

  return (
    <div className="demo-wrapper">
      <div className="demo-controls">
        <div className="control-group">
          <span className="control-label">{isFa ? 'جابجایی زنده' : 'Live Drag & Drop'}</span>
          <label className="toggle">
            <input type="checkbox" checked={draggable} onChange={e => setDraggable(e.target.checked)} />
            <span className="toggle-track"><span className="toggle-thumb" /></span>
          </label>
        </div>

        <div className="stat-chips">
          <span className="stat-chip available">{isFa ? '۱۲ آزاد' : '12 Free'}</span>
          <span className="stat-chip booked">{isFa ? '۸ رزرو' : '8 Booked'}</span>
          <span className="stat-chip blocked">{isFa ? '۲ مسدود' : '2 Blocked'}</span>
        </div>

        <div className="control-group" style={{ marginInlineStart: 'auto' }}>
          <span className="control-label" style={{ fontSize: 11, color: 'var(--text2)' }}>
            {isFa ? '💡 روی بازه‌های خالی برای رزرو کلیک کنید · برای جابه‌جایی بکشید' : '💡 Click free slots to book · Drag to reschedule'}
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
          value={date}
          onChange={setDate}
          schedules={schedules}
          draggableSlots={draggable}
          onSlotClick={handleSlotClick}
          onBookingClick={handleBookingClick}
          onSlotMove={handleSlotMove}
          locale={isFa ? 'fa-IR' : 'en-US'}
          weekStartsOn={isFa ? 6 : 1}
          direction="auto"
          theme={themeColors}
        />
      </div>
    </div>
  );
}
