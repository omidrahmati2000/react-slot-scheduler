import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BookingCalendar } from '../BookingCalendar';
import type { DaySchedule } from '../../types';
import { createResourcePlannerAdapter, createTaskTimelineAdapter } from '../../adapters';
import { rangesOverlap } from '../../utils/date';

const schedules: DaySchedule[] = [
  {
    date: '2026-05-30',
    isWorkingDay: true,
    workStartTime: '09:00',
    workEndTime: '12:00',
    slots: [
      { startTime: '09:00', endTime: '10:00', status: 'booked', itemId: 'item-1', title: 'Item A' },
      { startTime: '10:00', endTime: '11:00', status: 'available', title: 'Open' },
    ],
  },
];

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

describe('BookingCalendar', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalInnerWidth });
  });

  it('renders with Persian defaults and RTL direction', () => {
    render(<BookingCalendar value={new Date('2026-05-30T10:00:00')} onChange={() => {}} schedules={schedules} />);

    expect(screen.getByRole('button', { name: 'امروز' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'هفته' })).toBeInTheDocument();
    expect(document.querySelector('.rbc-root')).toHaveAttribute('dir', 'rtl');
  });

  it('switches to LTR and English labels via locale', () => {
    render(
      <BookingCalendar
        value={new Date('2026-05-30T10:00:00')}
        onChange={() => {}}
        schedules={schedules}
        locale="en-US"
      />
    );

    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Week' })).toBeInTheDocument();
    expect(document.querySelector('.rbc-root')).toHaveAttribute('dir', 'ltr');
  });

  it('uses custom translations', () => {
    render(
      <BookingCalendar
        value={new Date('2026-05-30T10:00:00')}
        onChange={() => {}}
        schedules={schedules}
        locale="en-US"
        translations={{ today: 'Now', week: '7D' }}
      />
    );

    expect(screen.getByRole('button', { name: 'Now' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '7D' })).toBeInTheDocument();
  });

  it('defaults to day mode on small screens', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 480 });
    render(<BookingCalendar value={new Date('2026-05-30T10:00:00')} onChange={() => {}} schedules={schedules} />);

    expect(screen.getByRole('button', { name: 'روز' })).toHaveClass('active');
  });

  it('calls onItemClick when slot has itemId', () => {
    const onItemClick = vi.fn();
    render(
      <BookingCalendar
        value={new Date('2026-05-30T10:00:00')}
        onChange={() => {}}
        schedules={schedules}
        onItemClick={onItemClick}
      />
    );

    fireEvent.click(screen.getByText('Item A'));
    expect(onItemClick).toHaveBeenCalledWith('item-1');
  });

  it('supports keyboard activation for slot items', () => {
    const onItemClick = vi.fn();
    render(
      <BookingCalendar
        value={new Date('2026-05-30T10:00:00')}
        onChange={() => {}}
        schedules={schedules}
        onItemClick={onItemClick}
      />
    );

    const slot = screen.getByRole('button', { name: /Item A/i });
    fireEvent.keyDown(slot, { key: 'Enter' });
    fireEvent.keyDown(slot, { key: ' ' });
    expect(onItemClick).toHaveBeenCalledTimes(2);
  });

  it('calls onSlotClick when slot has no item id', () => {
    const onSlotClick = vi.fn();
    render(
      <BookingCalendar
        value={new Date('2026-05-30T10:00:00')}
        onChange={() => {}}
        schedules={schedules}
        onSlotClick={onSlotClick}
      />
    );

    fireEvent.click(screen.getByText('Open'));
    expect(onSlotClick).toHaveBeenCalledTimes(1);
    expect(onSlotClick.mock.calls[0][0]).toBe('2026-05-30');
  });

  it('emits correct drag payload on slot drag start', () => {
    render(
      <BookingCalendar
        value={new Date('2026-05-30T10:00:00')}
        onChange={() => {}}
        schedules={schedules}
        draggableSlots
      />
    );

    const slot = document.querySelector('[data-slot-item=\"true\"][data-date=\"2026-05-30\"][data-start-time=\"09:00\"]') as HTMLElement;
    const setData = vi.fn();

    fireEvent.dragStart(slot, {
      dataTransfer: {
        effectAllowed: 'move',
        setData,
      },
    });

    expect(setData).toHaveBeenCalledTimes(1);
    expect(setData.mock.calls[0][0]).toBe('application/x-rbc-slot');
    expect(setData.mock.calls[0][1]).toContain('2026-05-30');
    expect(setData.mock.calls[0][1]).toContain('09:00');
  });

  it('supports selection mode drag and emits selection callbacks', async () => {
    const onSelectionChange = vi.fn();
    const onSlotDragSelectStart = vi.fn();
    const onSlotDragSelectEnd = vi.fn();

    render(
      <BookingCalendar
        value={new Date('2026-05-30T10:00:00')}
        onChange={() => {}}
        schedules={schedules}
        selectionMode
        onSelectionChange={onSelectionChange}
        onSlotDragSelectStart={onSlotDragSelectStart}
        onSlotDragSelectEnd={onSlotDragSelectEnd}
      />
    );

    const first = document.querySelector('[data-slot-cell=\"true\"][data-date=\"2026-05-30\"][data-start-time=\"11:00\"]') as HTMLElement;
    const second = document.querySelector('[data-slot-cell=\"true\"][data-date=\"2026-05-30\"][data-start-time=\"11:30\"]') as HTMLElement;

    fireEvent.mouseDown(first, { button: 0 });
    fireEvent.mouseEnter(second);
    fireEvent.mouseUp(second);

    expect(onSlotDragSelectStart).toHaveBeenCalled();
    await waitFor(() => expect(onSelectionChange).toHaveBeenCalled());
    const changed = onSelectionChange.mock.calls[0][0];
    expect(changed).toHaveLength(1);
    expect(changed[0].date).toBe('2026-05-30');
    expect(changed[0].startTime).toBe('11:00');
    expect(timeToMinutes(changed[0].endTime)).toBeGreaterThanOrEqual(timeToMinutes('11:30'));
    expect(onSlotDragSelectEnd).toHaveBeenCalled();
    const ended = onSlotDragSelectEnd.mock.calls[0][0];
    expect(ended).toHaveLength(1);
    expect(ended[0].date).toBe('2026-05-30');
    expect(ended[0].startTime).toBe('11:00');
    expect(timeToMinutes(ended[0].endTime)).toBeGreaterThanOrEqual(timeToMinutes('11:30'));
  });

  it('selection mode controlled emits onSelectionChange without internal state', () => {
    const onSelectionChange = vi.fn();

    render(
      <BookingCalendar
        value={new Date('2026-05-30T10:00:00')}
        onChange={() => {}}
        schedules={schedules}
        selectionMode
        selectedSlots={[]}
        onSelectionChange={onSelectionChange}
      />
    );

    const first = document.querySelector('[data-slot-cell=\"true\"][data-date=\"2026-05-30\"][data-start-time=\"11:00\"]') as HTMLElement;
    fireEvent.mouseDown(first, { button: 0 });

    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange.mock.calls[0][0][0]).toHaveProperty('date');
  });

  it('calls onChange when navigation buttons clicked', () => {
    const onChange = vi.fn();
    render(<BookingCalendar value={new Date('2026-05-30T10:00:00')} onChange={onChange} schedules={schedules} />);

    fireEvent.click(screen.getByRole('button', { name: 'بعدی' }));
    fireEvent.click(screen.getByRole('button', { name: 'قبلی' }));
    fireEvent.click(screen.getByRole('button', { name: 'امروز' }));

    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('renders task-timeline mode through data adapter', () => {
    const adapter = createTaskTimelineAdapter();
    const data = [
      { id: 'task-1', date: '2026-05-30', startTime: '09:00', endTime: '10:00', title: 'Task A', status: 'booked' as const },
    ];

    render(
      <BookingCalendar
        value={new Date('2026-05-30T10:00:00')}
        onChange={() => {}}
        schedules={[]}
        mode="task-timeline"
        dataAdapter={adapter}
        dataSource={data}
      />
    );

    expect(document.querySelector('.gantt-root')).toHaveAttribute('data-scheduler-mode', 'task-timeline');
    expect(screen.getAllByText('Task A').length).toBeGreaterThan(0);
  });

  it('calls gantt item callbacks in task-timeline mode', async () => {
    const adapter = createTaskTimelineAdapter();
    const onGanttItemMove = vi.fn();
    const onGanttItemResize = vi.fn();
    const onItemClick = vi.fn();
    const data = [
      { id: 'task-1', date: '2026-05-30', startTime: '09:00', endTime: '10:00', title: 'Task A', status: 'booked' as const, assignee: 'Sara' },
      { id: 'task-2', date: '2026-05-30', startTime: '10:30', endTime: '11:30', title: 'Task B', status: 'custom' as const, assignee: 'Sara' },
    ];

    const { container } = render(
      <BookingCalendar
        value={new Date('2026-05-30T10:00:00')}
        onChange={() => {}}
        schedules={[]}
        mode="task-timeline"
        dataAdapter={adapter}
        dataSource={data}
        onItemClick={onItemClick}
        onGanttItemMove={onGanttItemMove}
        onGanttItemResize={onGanttItemResize}
      />
    );

    fireEvent.click(screen.getByText('Task A'));
    expect(onItemClick).toHaveBeenCalledWith('task-1');

    const grid = container.querySelector('.gantt-scroll-wrap') as HTMLDivElement;
    vi.spyOn(grid, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, width: 1000, height: 300, top: 0, left: 0, right: 1000, bottom: 300, toJSON: () => ({})
    } as DOMRect);

    const item = container.querySelector('.gantt-item') as HTMLDivElement;
    fireEvent.mouseDown(item, { button: 0, clientX: 400, clientY: 120 });
    fireEvent.mouseMove(container.querySelector('.gantt-root') as HTMLDivElement, { clientX: 520, clientY: 120 });
    fireEvent.mouseUp(container.querySelector('.gantt-root') as HTMLDivElement);

    await waitFor(() => expect(onGanttItemMove).toHaveBeenCalled());

    const rightHandle = container.querySelector('.gantt-handle-right') as HTMLDivElement;
    fireEvent.mouseDown(rightHandle, { button: 0, clientX: 500, clientY: 120 });
    fireEvent.mouseMove(container.querySelector('.gantt-root') as HTMLDivElement, { clientX: 620, clientY: 120 });
    fireEvent.mouseUp(container.querySelector('.gantt-root') as HTMLDivElement);

    await waitFor(() => expect(onGanttItemResize).toHaveBeenCalled());
  });

  it('moves gantt item backward in RTL when dragging to the right', async () => {
    const adapter = createTaskTimelineAdapter();
    const onGanttItemMove = vi.fn();
    const data = [
      { id: 'task-1', date: '2026-05-30', startTime: '09:00', endTime: '10:00', title: 'Task A', status: 'booked' as const, assignee: 'Sara' },
    ];

    const { container } = render(
      <BookingCalendar
        value={new Date('2026-05-30T10:00:00')}
        onChange={() => {}}
        schedules={[]}
        mode="task-timeline"
        dataAdapter={adapter}
        dataSource={data}
        locale="fa-IR"
        onGanttItemMove={onGanttItemMove}
      />
    );

    const grid = container.querySelector('.gantt-scroll-wrap') as HTMLDivElement;
    vi.spyOn(grid, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, width: 1000, height: 300, top: 0, left: 0, right: 1000, bottom: 300, toJSON: () => ({})
    } as DOMRect);

    const item = container.querySelector('.gantt-item') as HTMLDivElement;
    const root = container.querySelector('.gantt-root') as HTMLDivElement;

    fireEvent.mouseDown(item, { button: 0, clientX: 400, clientY: 120 });
    fireEvent.mouseMove(root, { clientX: 520, clientY: 120 });
    fireEvent.mouseUp(root);

    await waitFor(() => expect(onGanttItemMove).toHaveBeenCalled());
    const payload = onGanttItemMove.mock.calls[0][0];
    expect(payload.item.id).toBe('task-1');
    expect(timeToMinutes(payload.newStartTime)).toBeLessThanOrEqual(timeToMinutes('09:00'));
  });

  it('supports keyboard activation for gantt items', () => {
    const adapter = createTaskTimelineAdapter();
    const onItemClick = vi.fn();
    const data = [
      { id: 'task-1', date: '2026-05-30', startTime: '09:00', endTime: '10:00', title: 'Task A', status: 'booked' as const, assignee: 'Sara' },
    ];

    render(
      <BookingCalendar
        value={new Date('2026-05-30T10:00:00')}
        onChange={() => {}}
        schedules={[]}
        mode="task-timeline"
        dataAdapter={adapter}
        dataSource={data}
        onItemClick={onItemClick}
      />
    );

    const item = document.querySelector('.gantt-item[role="button"]') as HTMLElement;
    fireEvent.keyDown(item, { key: 'Enter' });
    fireEvent.keyDown(item, { key: ' ' });
    expect(onItemClick).toHaveBeenCalledTimes(2);
  });

  it('creates a gantt item by dragging on empty row area', async () => {
    const adapter = createTaskTimelineAdapter();
    const onGanttItemCreate = vi.fn();
    const data = [
      { id: 'task-1', date: '2026-05-30', startTime: '09:00', endTime: '10:00', title: 'Task A', status: 'booked' as const, assignee: 'Sara' },
    ];

    const { container } = render(
      <BookingCalendar
        value={new Date('2026-05-30T10:00:00')}
        onChange={() => {}}
        schedules={[]}
        mode="task-timeline"
        dataAdapter={adapter}
        dataSource={data}
        onGanttItemCreate={onGanttItemCreate}
      />
    );

    const grid = container.querySelector('.gantt-scroll-wrap') as HTMLDivElement;
    vi.spyOn(grid, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, width: 1000, height: 300, top: 0, left: 0, right: 1000, bottom: 300, toJSON: () => ({})
    } as DOMRect);

    const rowContent = container.querySelector('.gantt-row-content') as HTMLDivElement;
    const root = container.querySelector('.gantt-root') as HTMLDivElement;

    fireEvent.mouseDown(rowContent, { button: 0, clientX: 360, clientY: 120 });
    fireEvent.mouseMove(root, { clientX: 520, clientY: 120 });
    fireEvent.mouseUp(root);

    await waitFor(() => expect(onGanttItemCreate).toHaveBeenCalledTimes(1));
    expect(onGanttItemCreate.mock.calls[0][0]).toHaveProperty('rowId');
    expect(onGanttItemCreate.mock.calls[0][0]).toHaveProperty('date', '2026-05-30');
  });

  it('does not create a gantt item on simple click without drag', async () => {
    const adapter = createTaskTimelineAdapter();
    const onGanttItemCreate = vi.fn();
    const data = [
      { id: 'task-1', date: '2026-05-30', startTime: '09:00', endTime: '10:00', title: 'Task A', status: 'booked' as const, assignee: 'Sara' },
    ];

    const { container } = render(
      <BookingCalendar
        value={new Date('2026-05-30T10:00:00')}
        onChange={() => {}}
        schedules={[]}
        mode="task-timeline"
        dataAdapter={adapter}
        dataSource={data}
        onGanttItemCreate={onGanttItemCreate}
      />
    );

    const grid = container.querySelector('.gantt-scroll-wrap') as HTMLDivElement;
    vi.spyOn(grid, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, width: 1000, height: 300, top: 0, left: 0, right: 1000, bottom: 300, toJSON: () => ({})
    } as DOMRect);

    const rowContent = container.querySelector('.gantt-row-content') as HTMLDivElement;
    const root = container.querySelector('.gantt-root') as HTMLDivElement;

    fireEvent.mouseDown(rowContent, { button: 0, clientX: 360, clientY: 120 });
    fireEvent.mouseUp(root);

    await new Promise((r) => setTimeout(r, 20));
    expect(onGanttItemCreate).not.toHaveBeenCalled();
  });

  it('respects onBeforeSlotMove policy and emits blocked-by-policy', async () => {
    const onSlotMove = vi.fn();
    const onSlotConflict = vi.fn();
    const onBeforeSlotMove = vi.fn(async () => false);

    render(
      <BookingCalendar
        value={new Date('2026-05-30T10:00:00')}
        onChange={() => {}}
        schedules={schedules}
        viewMode="day"
        hideTimeColumn
        draggableSlots
        onSlotMove={onSlotMove}
        onBeforeSlotMove={onBeforeSlotMove}
        onSlotConflict={onSlotConflict}
      />
    );

    const dropCol = document.querySelector('.rbc-empty-col') as HTMLDivElement;
    vi.spyOn(dropCol, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, width: 200, height: 180, top: 0, left: 0, right: 200, bottom: 180, toJSON: () => ({})
    } as DOMRect);

    fireEvent.drop(dropCol, {
      clientY: 150,
      dataTransfer: {
        getData: () =>
          JSON.stringify({
            date: '2026-05-30',
            slot: { startTime: '09:00', endTime: '10:00', status: 'booked', itemId: 'moving' },
          }),
      },
    });

    await waitFor(() => expect(onBeforeSlotMove).toHaveBeenCalled());
    expect(onSlotMove).not.toHaveBeenCalled();
    expect(onSlotConflict).toHaveBeenCalled();
    expect(onSlotConflict.mock.calls[0][0].reason).toBe('blocked-by-policy');
  });

  it('does not treat back-to-back ranges as overlap', () => {
    expect(rangesOverlap(9 * 60, 10 * 60, 10 * 60, 11 * 60)).toBe(false);
    expect(rangesOverlap(10 * 60, 11 * 60, 9 * 60, 10 * 60)).toBe(false);
    expect(rangesOverlap(9 * 60, 10 * 60, 9 * 60 + 30, 10 * 60 + 30)).toBe(true);
  });

  it('renders resource-planner mode through resource adapter', () => {
    const adapter = createResourcePlannerAdapter([{ id: 'room-a', title: 'Room A' }]);
    const data = [
      {
        id: 'res-1',
        date: '2026-05-30',
        startTime: '09:00',
        endTime: '10:00',
        resourceId: 'room-a',
        title: 'Interview',
        status: 'booked' as const,
      },
    ];

    render(
      <BookingCalendar
        value={new Date('2026-05-30T10:00:00')}
        onChange={() => {}}
        schedules={[]}
        mode="resource-planner"
        dataAdapter={adapter}
        dataSource={data}
      />
    );

    expect(document.querySelector('.gantt-root')).toHaveAttribute('data-scheduler-mode', 'resource-planner');
    expect(screen.getByText('Interview')).toBeInTheDocument();
  });

  it('navigates in resource-planner mode toolbar', () => {
    const adapter = createResourcePlannerAdapter([{ id: 'room-a', title: 'Room A' }]);
    const onChange = vi.fn();
    const data = [
      { id: 'res-1', date: '2026-05-30', startTime: '09:00', endTime: '10:00', resourceId: 'room-a', title: 'Interview', status: 'booked' as const },
    ];

    render(
      <BookingCalendar
        value={new Date('2026-05-30T10:00:00')}
        onChange={onChange}
        schedules={[]}
        mode="resource-planner"
        dataAdapter={adapter}
        dataSource={data}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'قبلی' }));
    fireEvent.click(screen.getByRole('button', { name: 'بعدی' }));
    fireEvent.click(screen.getByRole('button', { name: 'امروز' }));

    expect(onChange).toHaveBeenCalledTimes(3);
  });
});
