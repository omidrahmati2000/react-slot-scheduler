import type { DaySchedule } from '@omidrahmati/react-slot-scheduler';

function getDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

// Center schedules around today so yesterday/today/tomorrow always have data.
const s = -3;
const m = -3;

export const appointmentSchedulesFa: DaySchedule[] = [
  {
    date: getDateStr(s + 0),
    isWorkingDay: true,
    workStartTime: '08:00',
    workEndTime: '17:00',
    slots: [
      { startTime: '08:00', endTime: '08:30', status: 'booked', bookingId: 'b1', title: 'آقای احمدی', description: 'ویزیت عمومی' },
      { startTime: '08:30', endTime: '09:00', status: 'booked', bookingId: 'b2', title: 'خانم رضایی', description: 'پیگیری درمان' },
      { startTime: '10:00', endTime: '10:30', status: 'blocked', title: 'استراحت' },
      { startTime: '10:30', endTime: '11:00', status: 'booked', bookingId: 'b3', title: 'آقای کریمی', description: 'معاینه' },
      { startTime: '11:30', endTime: '12:00', status: 'booked', bookingId: 'b4', title: 'خانم موسوی', description: 'آزمایش خون' },
      { startTime: '14:00', endTime: '14:30', status: 'booked', bookingId: 'b5', title: 'آقای حسینی', description: 'مشاوره' },
      { startTime: '16:00', endTime: '16:30', status: 'booked', bookingId: 'b6', title: 'خانم نجفی', description: 'ویزیت عمومی' },
    ],
  },
  {
    date: getDateStr(s + 1),
    isWorkingDay: true,
    workStartTime: '08:00',
    workEndTime: '17:00',
    slots: [
      { startTime: '08:00', endTime: '09:00', status: 'blocked', title: 'جلسه پزشکان' },
      { startTime: '09:30', endTime: '10:00', status: 'booked', bookingId: 'b7', title: 'آقای صادقی', description: 'عکسبرداری' },
      { startTime: '14:00', endTime: '14:30', status: 'booked', bookingId: 'b8', title: 'خانم قاسمی', description: 'پیگیری' },
    ],
  },
  {
    date: getDateStr(s + 2),
    isWorkingDay: true,
    workStartTime: '08:00',
    workEndTime: '17:00',
    slots: [
      { startTime: '09:00', endTime: '09:30', status: 'booked', bookingId: 'b9', title: 'آقای ابراهیمی', description: 'ویزیت' },
      { startTime: '13:00', endTime: '13:30', status: 'blocked', title: 'وقت ناهار' },
      { startTime: '15:00', endTime: '15:30', status: 'booked', bookingId: 'b10', title: 'خانم شریفی', description: 'معاینه دوره‌ای' },
    ],
  },
  {
    date: getDateStr(s + 3),
    isWorkingDay: true,
    workStartTime: '09:00',
    workEndTime: '16:00',
    slots: [
      { startTime: '09:30', endTime: '10:00', status: 'booked', bookingId: 'b13', title: 'خانم همتی', description: 'ویزیت' },
      { startTime: '12:00', endTime: '12:30', status: 'blocked', title: 'استراحت کوتاه' },
      { startTime: '14:30', endTime: '15:00', status: 'booked', bookingId: 'b14', title: 'آقای توکلی', description: 'مشاوره' },
    ],
  },
  {
    date: getDateStr(s + 4),
    isWorkingDay: true,
    workStartTime: '09:00',
    workEndTime: '16:00',
    slots: [
      { startTime: '09:00', endTime: '09:30', status: 'booked', bookingId: 'b15', title: 'خانم کیانی', description: 'ویزیت' },
      { startTime: '11:00', endTime: '11:30', status: 'booked', bookingId: 'b16', title: 'آقای راد', description: 'پیگیری' },
    ],
  },
  {
    date: getDateStr(s + 5),
    isWorkingDay: true,
    workStartTime: '09:00',
    workEndTime: '15:00',
    slots: [
      { startTime: '10:00', endTime: '10:30', status: 'booked', bookingId: 'b11', title: 'آقای تهرانی', description: 'ویزیت' },
      { startTime: '13:30', endTime: '14:00', status: 'booked', bookingId: 'b12', title: 'خانم مرادی', description: 'مشاوره' },
    ],
  },
  {
    date: getDateStr(s + 6),
    isWorkingDay: true,
    workStartTime: '10:00',
    workEndTime: '14:00',
    slots: [
      { startTime: '10:30', endTime: '11:00', status: 'booked', bookingId: 'b17', title: 'آقای ملکی', description: 'ویزیت سریع' },
      { startTime: '12:30', endTime: '13:00', status: 'blocked', title: 'ضدعفونی' },
    ],
  },
];

export const appointmentSchedulesEn: DaySchedule[] = [
  {
    date: getDateStr(m + 0),
    isWorkingDay: true,
    workStartTime: '09:00',
    workEndTime: '18:00',
    slots: [
      { startTime: '09:00', endTime: '10:00', status: 'booked', bookingId: 'e1', title: 'Sarah Johnson', description: 'Haircut & Style' },
      { startTime: '11:00', endTime: '12:00', status: 'booked', bookingId: 'e2', title: 'Mike Davis', description: 'Color Treatment' },
      { startTime: '12:00', endTime: '13:00', status: 'blocked', title: 'Lunch Break' },
      { startTime: '14:00', endTime: '15:30', status: 'booked', bookingId: 'e3', title: 'Emma Wilson', description: 'Full Treatment' },
      { startTime: '17:00', endTime: '18:00', status: 'booked', bookingId: 'e4', title: 'Chris Brown', description: 'Trim' },
    ],
  },
  {
    date: getDateStr(m + 1),
    isWorkingDay: true,
    workStartTime: '09:00',
    workEndTime: '18:00',
    slots: [
      { startTime: '10:00', endTime: '11:00', status: 'booked', bookingId: 'e5', title: 'Lisa Anderson', description: 'Consultation' },
      { startTime: '13:30', endTime: '14:30', status: 'booked', bookingId: 'e6', title: 'Tom Harris', description: 'Haircut' },
      { startTime: '15:00', endTime: '17:00', status: 'booked', bookingId: 'e7', title: 'Jennifer Lee', description: 'Color & Style' },
    ],
  },
  {
    date: getDateStr(m + 2),
    isWorkingDay: true,
    workStartTime: '09:00',
    workEndTime: '18:00',
    slots: [
      { startTime: '09:30', endTime: '10:30', status: 'booked', bookingId: 'e8', title: 'David Martinez', description: 'Beard Trim' },
      { startTime: '16:00', endTime: '17:00', status: 'booked', bookingId: 'e9', title: 'Rachel White', description: 'Highlights' },
    ],
  },
  {
    date: getDateStr(m + 3),
    isWorkingDay: true,
    workStartTime: '09:00',
    workEndTime: '18:00',
    slots: [
      { startTime: '09:00', endTime: '10:30', status: 'booked', bookingId: 'e10', title: 'Sophia Adams', description: 'Balayage' },
      { startTime: '13:00', endTime: '14:00', status: 'blocked', title: 'Lunch Break' },
      { startTime: '15:00', endTime: '16:00', status: 'booked', bookingId: 'e11', title: 'James Wilson', description: 'Cut & Beard' },
    ],
  },
  {
    date: getDateStr(m + 4),
    isWorkingDay: true,
    workStartTime: '10:00',
    workEndTime: '16:00',
    slots: [
      { startTime: '11:00', endTime: '12:00', status: 'booked', bookingId: 'e12', title: 'Daniel Clark', description: 'Full Service' },
      { startTime: '14:00', endTime: '15:00', status: 'booked', bookingId: 'e13', title: 'Ashley Turner', description: 'Styling' },
    ],
  },
  {
    date: getDateStr(m + 5),
    isWorkingDay: true,
    workStartTime: '10:00',
    workEndTime: '15:00',
    slots: [
      { startTime: '10:00', endTime: '10:30', status: 'booked', bookingId: 'e14', title: 'Olivia Parker', description: 'Quick Cut' },
      { startTime: '12:30', endTime: '13:30', status: 'blocked', title: 'Maintenance' },
    ],
  },
  {
    date: getDateStr(m + 6),
    isWorkingDay: true,
    workStartTime: '10:00',
    workEndTime: '14:00',
    slots: [
      { startTime: '10:30', endTime: '11:30', status: 'booked', bookingId: 'e15', title: 'Noah Green', description: 'Consultation' },
      { startTime: '12:00', endTime: '12:30', status: 'custom', title: 'Walk-in Buffer' },
    ],
  },
];
