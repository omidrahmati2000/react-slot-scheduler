import type { DaySchedule } from '@omidrahmati/react-slot-scheduler';

function getDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

// Center schedules around today so yesterday/today/tomorrow are always populated.
const m = -3;

export const meetingRoomSchedules: DaySchedule[] = [
  {
    date: getDateStr(m + 0), // Monday
    isWorkingDay: true,
    workStartTime: '08:00',
    workEndTime: '20:00',
    slots: [
      { startTime: '08:00', endTime: '09:00', status: 'booked', bookingId: 'm1', title: 'Engineering Standup', description: 'Daily sync — Room A' },
      { startTime: '09:30', endTime: '11:00', status: 'booked', bookingId: 'm2', title: 'Product Review', description: 'Q4 planning — Room A' },
      { startTime: '13:00', endTime: '14:30', status: 'booked', bookingId: 'm3', title: 'Client Demo', description: 'Acme Corp — Room A' },
      { startTime: '15:30', endTime: '17:00', status: 'booked', bookingId: 'm4', title: 'Design Sprint', description: 'UX team — Room A' },
      { startTime: '17:00', endTime: '18:00', status: 'blocked', title: 'Cleaning' },
      { startTime: '18:00', endTime: '19:00', status: 'custom', title: 'After-hours booking', description: 'External event' },
    ],
  },
  {
    date: getDateStr(m + 1), // Tuesday
    isWorkingDay: true,
    workStartTime: '08:00',
    workEndTime: '20:00',
    slots: [
      { startTime: '09:30', endTime: '11:30', status: 'booked', bookingId: 'm5', title: 'Board Meeting', description: 'Quarterly review' },
      { startTime: '14:00', endTime: '15:00', status: 'booked', bookingId: 'm6', title: 'Interview', description: 'Senior Dev candidate' },
    ],
  },
  {
    date: getDateStr(m + 2), // Wednesday
    isWorkingDay: true,
    workStartTime: '08:00',
    workEndTime: '20:00',
    slots: [
      { startTime: '09:00', endTime: '10:00', status: 'booked', bookingId: 'm7', title: 'Sales Sync', description: 'Weekly pipeline review' },
      { startTime: '11:00', endTime: '12:30', status: 'booked', bookingId: 'm8', title: 'Workshop', description: 'Team training' },
      { startTime: '15:00', endTime: '16:00', status: 'booked', bookingId: 'm9', title: 'Strategy Session', description: '2026 planning' },
    ],
  },
  {
    date: getDateStr(m + 3), // Thursday
    isWorkingDay: true,
    workStartTime: '08:00',
    workEndTime: '20:00',
    slots: [
      { startTime: '08:00', endTime: '09:00', status: 'blocked', title: 'Setup' },
      { startTime: '09:00', endTime: '12:00', status: 'booked', bookingId: 'm10', title: 'All-Hands Meeting', description: 'Company-wide event' },
      { startTime: '15:00', endTime: '16:00', status: 'booked', bookingId: 'm11', title: 'Retrospective', description: 'Sprint review' },
    ],
  },
  {
    date: getDateStr(m + 4), // Friday
    isWorkingDay: true,
    workStartTime: '08:00',
    workEndTime: '20:00',
    slots: [
      { startTime: '10:00', endTime: '11:00', status: 'booked', bookingId: 'm12', title: 'HR Review', description: 'Performance cycle' },
      { startTime: '16:00', endTime: '17:00', status: 'booked', bookingId: 'm13', title: 'Team Lunch Planning', description: 'Social event' },
    ],
  },
  {
    date: getDateStr(m + 5), // Saturday
    isWorkingDay: false,
    slots: [],
  },
  {
    date: getDateStr(m + 6), // Sunday
    isWorkingDay: false,
    slots: [],
  },
];
