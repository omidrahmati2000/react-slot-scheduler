import type {
  GanttDataAdapter, GanttItem, GanttRow,
  ResourceDefinition, ResourcePlannerItem,
  SchedulerDataAdapter, SlotStatus,
  TaskTimelineItem
} from './types';

function defStatus(s?: SlotStatus): SlotStatus {
  return s ?? 'custom';
}

// ─── Legacy time-grid adapters (kept for backward compat) ──────────────────

export function createTaskTimelineAdapter(): GanttDataAdapter<TaskTimelineItem[]> {
  return {
    toGantt(items, { date }) {
      // Extract unique assignees → rows
      const assigneeOrder: string[] = [];
      const seen = new Set<string>();
      for (const item of items) {
        const key = item.assignee ?? item.title;
        if (!seen.has(key)) { seen.add(key); assigneeOrder.push(key); }
      }

      const rows: GanttRow[] = assigneeOrder.map(a => ({ id: a, label: a }));

      const ganttItems: GanttItem[] = items.map(item => ({
        id: item.id,
        rowId: item.assignee ?? item.title,
        date: item.date,
        endDate: item.endDate,
        startTime: item.startTime,
        endTime: item.endTime,
        title: item.title,
        subTitle: item.progress != null ? `${item.progress}%` : item.assignee,
        status: defStatus(item.status),
      }));

      // Compute visible time bounds from items on the current day
      const todayStr = date.toISOString().slice(0, 10);
      const todayItems = ganttItems.filter(i => i.date === todayStr);
      const allItems = ganttItems;
      const starts = allItems.map(i => toMin(i.startTime));
      const ends = allItems.map(i => toMin(i.endTime));
      const timeStart = starts.length ? Math.max(0, Math.floor(Math.min(...starts) / 60) - 1) : 8;
      const timeEnd = ends.length ? Math.min(24, Math.ceil(Math.max(...ends) / 60) + 1) : 20;

      return { rows, items: ganttItems, timeStart, timeEnd, granularity: 30, timeUnit: 'hour' as const };
    },
  };
}

export function createResourcePlannerAdapter(
  resources: ResourceDefinition[]
): GanttDataAdapter<ResourcePlannerItem[]> {
  return {
    toGantt(items) {
      const rows: GanttRow[] = resources.map(r => ({
        id: r.id,
        label: r.title,
        subLabel: r.meta?.type as string | undefined,
      }));

      const ganttItems: GanttItem[] = items.map(item => ({
        id: item.id,
        rowId: item.resourceId,
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime,
        title: item.title,
        subTitle: item.description,
        status: defStatus(item.status),
      }));

      const starts = ganttItems.map(i => toMin(i.startTime));
      const ends = ganttItems.map(i => toMin(i.endTime));
      const timeStart = starts.length ? Math.max(0, Math.floor(Math.min(...starts) / 60) - 1) : 8;
      const timeEnd = ends.length ? Math.min(24, Math.ceil(Math.max(...ends) / 60) + 1) : 20;

      return { rows, items: ganttItems, timeStart, timeEnd, granularity: 30, timeUnit: 'day' as const };
    },
  };
}

function toMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
