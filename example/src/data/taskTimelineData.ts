import type { TaskTimelineItem } from '@omidrahmati/react-slot-scheduler';

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

// ─── FA data ──────────────────────────────────────────────────────────────────
export const taskTimelineItemsFa: TaskTimelineItem[] = [
  // Sara — two overlapping tasks
  { id: 'f1', date: mon, startTime: '09:00', endTime: '10:30', title: 'بررسی طراحی',      status: 'booked',  assignee: 'سارا',   progress: 70 },
  { id: 'f2', date: mon, startTime: '09:30', endTime: '10:30', title: 'جلسه تیم',          status: 'custom',  assignee: 'سارا',   progress: 40 },
  { id: 'f3', date: mon, startTime: '11:00', endTime: '12:00', title: 'قرارداد API',       status: 'booked',  assignee: 'سارا',   progress: 90 },
  // Arman
  { id: 'f4', date: mon, startTime: '10:00', endTime: '12:00', title: 'طراحی دیتابیس',    status: 'booked',  assignee: 'آرمان',  progress: 55 },
  { id: 'f5', date: tue, startTime: '09:00', endTime: '11:00', title: 'مستندسازی',        status: 'custom',  assignee: 'آرمان',  progress: 30 },
  { id: 'f6', date: tue, startTime: '13:00', endTime: '14:30', title: 'کد ریویو',          status: 'booked',  assignee: 'آرمان',  progress: 80 },
  // Neda — blocked
  { id: 'f7', date: tue, startTime: '10:00', endTime: '11:30', title: 'همگام‌سازی QA',    status: 'blocked', assignee: 'ندا',    progress: 50 },
  { id: 'f8', date: wed, startTime: '09:00', endTime: '10:30', title: 'تست رگرشن',        status: 'booked',  assignee: 'ندا',    progress: 65 },
  { id: 'f9', date: wed, startTime: '10:00', endTime: '11:00', title: 'تست واحد',         status: 'custom',  assignee: 'ندا',    progress: 45 },
  // Team — multi-day span context
  { id: 'fa', date: wed, startTime: '14:00', endTime: '16:00', title: 'برنامه‌ریزی اسپرینت', status: 'booked', assignee: 'تیم',   progress: 20 },
  { id: 'fb', date: thu, startTime: '09:00', endTime: '10:00', title: 'استندآپ روزانه',   status: 'blocked', assignee: 'تیم',    progress: 100 },
  { id: 'fc', date: thu, startTime: '11:00', endTime: '13:00', title: 'دمو محصول',        status: 'booked',  assignee: 'تیم',    progress: 10 },
  // Reza
  { id: 'fd', date: thu, startTime: '09:30', endTime: '10:30', title: 'مرور کد',           status: 'custom',  assignee: 'رضا',   progress: 80 },
  { id: 'fe', date: fri, startTime: '10:00', endTime: '11:30', title: 'رفع باگ',          status: 'booked',  assignee: 'رضا',   progress: 60 },
  // Mina
  { id: 'ff', date: fri, startTime: '13:00', endTime: '14:00', title: 'آزمایش UI',        status: 'booked',  assignee: 'مینا',  progress: 75 },
  { id: 'fg', date: fri, startTime: '13:30', endTime: '14:30', title: 'بررسی UX',         status: 'custom',  assignee: 'مینا',  progress: 55 },
  // Multi-day tasks
  { id: 'fm1', date: mon, endDate: wed, startTime: '09:00', endTime: '18:00', title: 'اسپرینت توسعه',   status: 'booked',  assignee: 'سارا',  progress: 45 },
  { id: 'fm2', date: tue, endDate: thu, startTime: '09:00', endTime: '18:00', title: 'مهاجرت دیتابیس', status: 'custom',  assignee: 'آرمان', progress: 30 },
  { id: 'fm3', date: wed, endDate: fri, startTime: '09:00', endTime: '18:00', title: 'تست یکپارچه',    status: 'booked',  assignee: 'ندا',   progress: 60 },
  { id: 'fm4', date: mon, endDate: fri, startTime: '09:00', endTime: '18:00', title: 'ریلیز هفتگی',    status: 'blocked', assignee: 'تیم',   progress: 0  },
];

// ─── EN data ──────────────────────────────────────────────────────────────────
export const taskTimelineItemsEn: TaskTimelineItem[] = [
  // Sara — overlapping tasks
  { id: 'e1', date: mon, startTime: '09:00', endTime: '10:30', title: 'Design Review',     status: 'booked',  assignee: 'Sara',  progress: 70 },
  { id: 'e2', date: mon, startTime: '09:30', endTime: '10:30', title: 'Team Meeting',      status: 'custom',  assignee: 'Sara',  progress: 40 },
  { id: 'e3', date: mon, startTime: '11:00', endTime: '12:00', title: 'API Contract',      status: 'booked',  assignee: 'Sara',  progress: 90 },
  // Arman
  { id: 'e4', date: mon, startTime: '10:00', endTime: '12:00', title: 'DB Schema',         status: 'booked',  assignee: 'Arman', progress: 55 },
  { id: 'e5', date: tue, startTime: '09:00', endTime: '11:00', title: 'Documentation',     status: 'custom',  assignee: 'Arman', progress: 30 },
  { id: 'e6', date: tue, startTime: '13:00', endTime: '14:30', title: 'Code Review',       status: 'booked',  assignee: 'Arman', progress: 80 },
  // Neda — blocked
  { id: 'e7', date: tue, startTime: '10:00', endTime: '11:30', title: 'QA Sync',           status: 'blocked', assignee: 'Neda',  progress: 50 },
  { id: 'e8', date: wed, startTime: '09:00', endTime: '10:30', title: 'Regression Test',   status: 'booked',  assignee: 'Neda',  progress: 65 },
  { id: 'e9', date: wed, startTime: '10:00', endTime: '11:00', title: 'Unit Tests',        status: 'custom',  assignee: 'Neda',  progress: 45 },
  // Team
  { id: 'ea', date: wed, startTime: '14:00', endTime: '16:00', title: 'Sprint Planning',   status: 'booked',  assignee: 'Team',  progress: 20 },
  { id: 'eb', date: thu, startTime: '09:00', endTime: '10:00', title: 'Daily Standup',     status: 'blocked', assignee: 'Team',  progress: 100 },
  { id: 'ec', date: thu, startTime: '11:00', endTime: '13:00', title: 'Product Demo',      status: 'booked',  assignee: 'Team',  progress: 10 },
  // Reza
  { id: 'ed', date: thu, startTime: '09:30', endTime: '10:30', title: 'Code Review',       status: 'custom',  assignee: 'Reza',  progress: 80 },
  { id: 'ee', date: fri, startTime: '10:00', endTime: '11:30', title: 'Bug Fix',           status: 'booked',  assignee: 'Reza',  progress: 60 },
  // Mina — overlap
  { id: 'ef', date: fri, startTime: '13:00', endTime: '14:00', title: 'UI Testing',        status: 'booked',  assignee: 'Mina',  progress: 75 },
  { id: 'eg', date: fri, startTime: '13:30', endTime: '14:30', title: 'UX Review',         status: 'custom',  assignee: 'Mina',  progress: 55 },
  // Multi-day tasks
  { id: 'em1', date: mon, endDate: wed, startTime: '09:00', endTime: '18:00', title: 'Dev Sprint',       status: 'booked',  assignee: 'Sara',  progress: 45 },
  { id: 'em2', date: tue, endDate: thu, startTime: '09:00', endTime: '18:00', title: 'DB Migration',     status: 'custom',  assignee: 'Arman', progress: 30 },
  { id: 'em3', date: wed, endDate: fri, startTime: '09:00', endTime: '18:00', title: 'Integration Test', status: 'booked',  assignee: 'Neda',  progress: 60 },
  { id: 'em4', date: mon, endDate: fri, startTime: '09:00', endTime: '18:00', title: 'Weekly Release',   status: 'blocked', assignee: 'Team',  progress: 0  },
];
