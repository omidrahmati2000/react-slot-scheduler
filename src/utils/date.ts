export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getWeekDays(anchor: Date, weekStartsOn: 0 | 1 | 6 = 6): Date[] {
  const current = new Date(anchor);
  current.setHours(12, 0, 0, 0);

  const day = current.getDay();
  const offset = (day - weekStartsOn + 7) % 7;
  current.setDate(current.getDate() - offset);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(current);
    d.setDate(current.getDate() + i);
    return d;
  });
}

export function addDays(date: Date, amount: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

export function generateTimeSlots(startHour: number, endHour: number, granularity: number): string[] {
  const items: string[] = [];
  const startMinutes = startHour * 60;
  const endMinutes = endHour * 60;
  for (let m = startMinutes; m < endMinutes; m += granularity) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    items.push(`${h.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`);
  }
  return items;
}

export function getHourBounds(work: { workStartTime?: string; workEndTime?: string }[]): { start: number; end: number } {
  let start = 8;
  let end = 20;
  const starts: number[] = [];
  const ends: number[] = [];

  for (const d of work) {
    if (d.workStartTime && d.workEndTime) {
      starts.push(Number(d.workStartTime.split(':')[0]));
      const [eh, em] = d.workEndTime.split(':').map(Number);
      ends.push(eh + (em > 0 ? 1 : 0));
    }
  }

  if (starts.length && ends.length) {
    start = Math.min(...starts);
    end = Math.max(...ends);
  }

  return { start, end };
}

export function rangesOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && endA > startB;
}
