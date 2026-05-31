import { useState } from 'react';
import { BookingCalendar } from '@omidrahmati/react-slot-scheduler';
import type { CalendarTheme, DaySchedule } from '@omidrahmati/react-slot-scheduler';
import '@omidrahmati/react-slot-scheduler/dist/index.css';

interface Props {
  isDark: boolean;
  lang: 'fa' | 'en';
}

function getDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const m = -3;

const sampleSchedules: DaySchedule[] = [
  {
    date: getDateStr(m + 0), // Monday
    isWorkingDay: true,
    workStartTime: '09:00',
    workEndTime: '17:00',
    slots: [
      { startTime: '09:00', endTime: '10:00', status: 'booked', bookingId: 'b1', title: 'Reserved' },
      { startTime: '11:00', endTime: '12:00', status: 'blocked', title: 'Blocked' },
      { startTime: '14:00', endTime: '15:30', status: 'custom', title: 'Custom' },
    ],
  },
  { date: getDateStr(m + 1), isWorkingDay: true, workStartTime: '09:00', workEndTime: '17:00', slots: [
    { startTime: '10:00', endTime: '11:30', status: 'booked', bookingId: 'b2', title: 'Reserved' },
  ]},
  { date: getDateStr(m + 2), isWorkingDay: true, workStartTime: '09:00', workEndTime: '17:00', slots: [
    { startTime: '13:00', endTime: '14:00', status: 'booked', bookingId: 'b3', title: 'Reserved' },
  ]},
  { date: getDateStr(m + 3), isWorkingDay: true, workStartTime: '09:00', workEndTime: '17:00', slots: [
    { startTime: '10:00', endTime: '11:30', status: 'booked', bookingId: 'b5', title: 'Reserved' },
    { startTime: '14:00', endTime: '15:00', status: 'custom', title: 'Custom' },
  ]},
  { date: getDateStr(m + 4), isWorkingDay: true, workStartTime: '10:00', workEndTime: '16:00', slots: [
    { startTime: '14:00', endTime: '15:30', status: 'booked', bookingId: 'b4', title: 'Reserved' },
  ]},
  { date: getDateStr(m + 5), isWorkingDay: true, workStartTime: '10:00', workEndTime: '14:00', slots: [
    { startTime: '10:30', endTime: '11:00', status: 'booked', bookingId: 'b6', title: 'Reserved' },
  ]},
  { date: getDateStr(m + 6), isWorkingDay: true, workStartTime: '10:00', workEndTime: '14:00', slots: [
    { startTime: '12:00', endTime: '13:00', status: 'custom', title: 'Custom' },
  ]},
];

type PresetEntry = {
  name: string;
  label: string;
  light: Partial<CalendarTheme>;
  dark: Partial<CalendarTheme>;
};

const presets: PresetEntry[] = [
  {
    name: 'ocean', label: '🌊 Ocean',
    light: { primary: '#0369a1', bookedBg: '#bfdbfe', blockedBg: '#e2e8f0', customBg: '#bbf7d0' },
    dark:  { primary: '#38bdf8', bookedBg: '#1e3a5f', blockedBg: '#263348', customBg: '#134e27' },
  },
  {
    name: 'forest', label: '🌲 Forest',
    light: { primary: '#15803d', bookedBg: '#bbf7d0', blockedBg: '#e2e8f0', customBg: '#bfdbfe' },
    dark:  { primary: '#4ade80', bookedBg: '#14532d', blockedBg: '#1e2f23', customBg: '#1e3a5f' },
  },
  {
    name: 'sunset', label: '🌅 Sunset',
    light: { primary: '#c2410c', bookedBg: '#fed7aa', blockedBg: '#e2e8f0', customBg: '#fecaca' },
    dark:  { primary: '#fb923c', bookedBg: '#431407', blockedBg: '#2a1f1a', customBg: '#450a0a' },
  },
  {
    name: 'midnight', label: '🌙 Midnight',
    light: { primary: '#4f46e5', bookedBg: '#c7d2fe', blockedBg: '#e2e8f0', customBg: '#ddd6fe' },
    dark:  { primary: '#818cf8', bg: '#0f172a', panel: '#1e293b', border: '#334155', text: '#f1f5f9', mutedText: '#94a3b8', bookedBg: '#312e81', blockedBg: '#263348', customBg: '#3b2d6e' },
  },
  {
    name: 'sakura', label: '🌸 Sakura',
    light: { primary: '#db2777', bookedBg: '#fbcfe8', blockedBg: '#f1f5f9', customBg: '#d1fae5' },
    dark:  { primary: '#f472b6', bookedBg: '#831843', blockedBg: '#2a1f29', customBg: '#065f46' },
  },
  {
    name: 'gold', label: '✨ Gold',
    light: { primary: '#b45309', bookedBg: '#fde68a', blockedBg: '#e2e8f0', customBg: '#d1fae5' },
    dark:  { primary: '#fbbf24', bookedBg: '#451a03', blockedBg: '#292015', customBg: '#064e3b' },
  },
];

export function ThemePlayground({ isDark, lang }: Props) {
  const [date, setDate] = useState(new Date());
  const [activePreset, setActivePreset] = useState('ocean');

  const isFa = lang === 'fa';
  const preset = presets.find(p => p.name === activePreset)!;

  const baseTheme = isDark
    ? { bg: '#0f172a', panel: '#1e293b', border: '#334155', text: '#f1f5f9', mutedText: '#94a3b8' }
    : { bg: '#f8fafc', panel: '#ffffff', border: '#e2e8f0', text: '#0f172a', mutedText: '#64748b' };

  const mergedTheme = { ...baseTheme, ...(isDark ? preset.dark : preset.light) };

  return (
    <div className="demo-wrapper">
      <div className="demo-controls">
        <div className="control-group">
          <span className="control-label">{isFa ? 'تم‌های آماده' : 'Presets'}</span>
          <div className="pill-group flex-wrap">
            {presets.map(p => (
              <button
                key={p.name}
                className={`pill ${activePreset === p.name ? 'active' : ''}`}
                onClick={() => setActivePreset(p.name)}
                style={activePreset === p.name ? { borderColor: (isDark ? p.dark : p.light).primary, color: (isDark ? p.dark : p.light).primary } : {}}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="calendar-shell">
        <BookingCalendar
          value={date}
          onChange={setDate}
          schedules={sampleSchedules}
          locale={isFa ? 'fa-IR' : 'en-US'}
          weekStartsOn={isFa ? 6 : 1}
          direction="auto"
          theme={mergedTheme}
        />
      </div>
    </div>
  );
}
