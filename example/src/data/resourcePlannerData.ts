import type { ResourceDefinition, ResourcePlannerItem } from '@omidrahmati/react-slot-scheduler';

function relativeDate(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

// Keep sample density around today to avoid empty demo states.
const mon = relativeDate(-2);
const tue = relativeDate(-1);
const wed = relativeDate(0);
const thu = relativeDate(1);
const fri = relativeDate(2);

// ─── Resources ────────────────────────────────────────────────────────────────
export const resourcesFa: ResourceDefinition[] = [
  { id: 'room-a',  title: 'اتاق A'     },
  { id: 'room-b',  title: 'اتاق B'     },
  { id: 'room-c',  title: 'اتاق C'     },
  { id: 'dr-amini',  title: 'دکتر امینی' },
  { id: 'dr-rezaei', title: 'دکتر رضایی' },
];

export const resourcesEn: ResourceDefinition[] = [
  { id: 'room-a',  title: 'Room A'   },
  { id: 'room-b',  title: 'Room B'   },
  { id: 'room-c',  title: 'Room C'   },
  { id: 'dr-amini',  title: 'Dr. Amini'  },
  { id: 'dr-rezaei', title: 'Dr. Rezaei' },
];

// ─── FA items — rich data with overlap ────────────────────────────────────────
export const resourcePlannerItemsFa: ResourcePlannerItem[] = [
  // Room A — two overlapping meetings
  { id: 'rfa1', date: mon, startTime: '09:00', endTime: '10:00', resourceId: 'room-a', title: 'جلسه تیم',       status: 'booked' },
  { id: 'rfa2', date: mon, startTime: '09:30', endTime: '10:30', resourceId: 'room-a', title: 'ارائه محصول',    status: 'custom' },
  { id: 'rfa3', date: mon, startTime: '11:00', endTime: '12:00', resourceId: 'room-a', title: 'مصاحبه',         status: 'booked' },
  { id: 'rfa4', date: tue, startTime: '09:00', endTime: '11:00', resourceId: 'room-a', title: 'آموزش تیم',      status: 'booked' },
  { id: 'rfa5', date: wed, startTime: '10:00', endTime: '11:30', resourceId: 'room-a', title: 'جلسه مشتری',     status: 'custom' },
  { id: 'rfa6', date: thu, startTime: '14:00', endTime: '16:00', resourceId: 'room-a', title: 'بررسی پروژه',    status: 'booked' },
  // Room B
  { id: 'rfb1', date: mon, startTime: '10:30', endTime: '11:30', resourceId: 'room-b', title: 'مذاکره قرارداد', status: 'booked' },
  { id: 'rfb2', date: tue, startTime: '13:00', endTime: '14:00', resourceId: 'room-b', title: 'مصاحبه ارشد',    status: 'blocked' },
  { id: 'rfb3', date: wed, startTime: '09:00', endTime: '10:00', resourceId: 'room-b', title: 'جلسه فروش',      status: 'booked' },
  { id: 'rfb4', date: wed, startTime: '09:30', endTime: '10:30', resourceId: 'room-b', title: 'دمو محصول',      status: 'custom' },
  { id: 'rfb5', date: fri, startTime: '11:00', endTime: '12:00', resourceId: 'room-b', title: 'بررسی هفتگی',    status: 'booked' },
  // Room C
  { id: 'rfc1', date: tue, startTime: '10:00', endTime: '12:00', resourceId: 'room-c', title: 'کارگاه آموزشی',  status: 'booked' },
  { id: 'rfc2', date: thu, startTime: '09:00', endTime: '10:00', resourceId: 'room-c', title: 'جلسه طراحی',     status: 'custom' },
  { id: 'rfc3', date: thu, startTime: '09:30', endTime: '10:30', resourceId: 'room-c', title: 'بررسی UI',       status: 'booked' },
  { id: 'rfc4', date: fri, startTime: '14:00', endTime: '15:30', resourceId: 'room-c', title: 'برنامه‌ریزی',   status: 'booked' },
  // Dr. Amini
  { id: 'rfd1', date: mon, startTime: '09:00', endTime: '10:00', resourceId: 'dr-amini', title: 'ویزیت',         status: 'booked' },
  { id: 'rfd2', date: mon, startTime: '11:00', endTime: '12:00', resourceId: 'dr-amini', title: 'مشاوره',        status: 'booked' },
  { id: 'rfd3', date: tue, startTime: '09:00', endTime: '10:30', resourceId: 'dr-amini', title: 'معاینه',        status: 'custom' },
  { id: 'rfd4', date: wed, startTime: '14:00', endTime: '15:00', resourceId: 'dr-amini', title: 'پیگیری',        status: 'booked' },
  { id: 'rfd5', date: thu, startTime: '11:00', endTime: '12:00', resourceId: 'dr-amini', title: 'ویزیت اورژانس', status: 'blocked' },
  // Dr. Rezaei
  { id: 'rfe1', date: tue, startTime: '10:00', endTime: '11:00', resourceId: 'dr-rezaei', title: 'معاینه دوره‌ای', status: 'booked' },
  { id: 'rfe2', date: wed, startTime: '09:00', endTime: '10:00', resourceId: 'dr-rezaei', title: 'مشاوره',         status: 'custom' },
  { id: 'rfe3', date: fri, startTime: '10:00', endTime: '11:00', resourceId: 'dr-rezaei', title: 'ویزیت',          status: 'booked' },
  { id: 'rfe4', date: fri, startTime: '10:30', endTime: '11:30', resourceId: 'dr-rezaei', title: 'پیگیری',         status: 'custom' },
];

// ─── EN items ────────────────────────────────────────────────────────────────
export const resourcePlannerItemsEn: ResourcePlannerItem[] = [
  // Room A — overlapping
  { id: 'rea1', date: mon, startTime: '09:00', endTime: '10:00', resourceId: 'room-a', title: 'Team Standup',    status: 'booked' },
  { id: 'rea2', date: mon, startTime: '09:30', endTime: '10:30', resourceId: 'room-a', title: 'Product Demo',    status: 'custom' },
  { id: 'rea3', date: mon, startTime: '11:00', endTime: '12:00', resourceId: 'room-a', title: 'Interview',       status: 'booked' },
  { id: 'rea4', date: tue, startTime: '09:00', endTime: '11:00', resourceId: 'room-a', title: 'Team Training',   status: 'booked' },
  { id: 'rea5', date: wed, startTime: '10:00', endTime: '11:30', resourceId: 'room-a', title: 'Client Meeting',  status: 'custom' },
  { id: 'rea6', date: thu, startTime: '14:00', endTime: '16:00', resourceId: 'room-a', title: 'Project Review',  status: 'booked' },
  // Room B
  { id: 'reb1', date: mon, startTime: '10:30', endTime: '11:30', resourceId: 'room-b', title: 'Contract Negot.', status: 'booked' },
  { id: 'reb2', date: tue, startTime: '13:00', endTime: '14:00', resourceId: 'room-b', title: 'Senior Interview', status: 'blocked' },
  { id: 'reb3', date: wed, startTime: '09:00', endTime: '10:00', resourceId: 'room-b', title: 'Sales Meeting',   status: 'booked' },
  { id: 'reb4', date: wed, startTime: '09:30', endTime: '10:30', resourceId: 'room-b', title: 'Product Demo',    status: 'custom' },
  { id: 'reb5', date: fri, startTime: '11:00', endTime: '12:00', resourceId: 'room-b', title: 'Weekly Review',   status: 'booked' },
  // Room C
  { id: 'rec1', date: tue, startTime: '10:00', endTime: '12:00', resourceId: 'room-c', title: 'Workshop',        status: 'booked' },
  { id: 'rec2', date: thu, startTime: '09:00', endTime: '10:00', resourceId: 'room-c', title: 'Design Session',  status: 'custom' },
  { id: 'rec3', date: thu, startTime: '09:30', endTime: '10:30', resourceId: 'room-c', title: 'UI Review',       status: 'booked' },
  { id: 'rec4', date: fri, startTime: '14:00', endTime: '15:30', resourceId: 'room-c', title: 'Sprint Planning', status: 'booked' },
  // Dr. Amini
  { id: 'red1', date: mon, startTime: '09:00', endTime: '10:00', resourceId: 'dr-amini', title: 'Consultation', status: 'booked' },
  { id: 'red2', date: mon, startTime: '11:00', endTime: '12:00', resourceId: 'dr-amini', title: 'Check-up',      status: 'booked' },
  { id: 'red3', date: tue, startTime: '09:00', endTime: '10:30', resourceId: 'dr-amini', title: 'Examination',   status: 'custom' },
  { id: 'red4', date: wed, startTime: '14:00', endTime: '15:00', resourceId: 'dr-amini', title: 'Follow-up',     status: 'booked' },
  { id: 'red5', date: thu, startTime: '11:00', endTime: '12:00', resourceId: 'dr-amini', title: 'Emergency',     status: 'blocked' },
  // Dr. Rezaei — overlap
  { id: 'ree1', date: tue, startTime: '10:00', endTime: '11:00', resourceId: 'dr-rezaei', title: 'Routine Check', status: 'booked' },
  { id: 'ree2', date: wed, startTime: '09:00', endTime: '10:00', resourceId: 'dr-rezaei', title: 'Consultation',  status: 'custom' },
  { id: 'ree3', date: fri, startTime: '10:00', endTime: '11:00', resourceId: 'dr-rezaei', title: 'Visit',         status: 'booked' },
  { id: 'ree4', date: fri, startTime: '10:30', endTime: '11:30', resourceId: 'dr-rezaei', title: 'Follow-up',     status: 'custom' },
];
