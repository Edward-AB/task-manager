import { useRef, useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import { dateKey } from '../../utils/dates.js';
import { computeColumns } from '../../utils/calendar.js';
import { getTaskColor } from '../../utils/colors.js';
import {
  SLOT_HEIGHT, HOUR_HEIGHT, CALENDAR_HOURS,
  CALENDAR_LABEL_WIDTH, TOTAL_SLOTS, DEFAULT_TASK_DURATION,
} from '../../constants';
import NowLine from './NowLine.jsx';
import CalendarTask from './CalendarTask.jsx';
import BlockedTimeSlot from './BlockedTimeSlot.jsx';

const TOTAL_HEIGHT = CALENDAR_HOURS * HOUR_HEIGHT;
const CL = CALENDAR_LABEL_WIDTH;
const HOURS_ARRAY = Array.from({ length: CALENDAR_HOURS }, (_, i) => i);

export default function DaySchedule({
  date, tasks, deadlines, blockedTimes, events,
  onSlotClick, onTaskDrop, onTaskToggle,
}) {
  const { theme } = useTheme();
  const scrollRef = useRef(null);
  const dragInfo = useRef(null);
  const [ghost, setGhost] = useState(null);
  const dayStr = dateKey(date);
  const isToday = dayStr === dateKey(new Date());

  // Filter tasks for this day that have a slot
  const scheduledTasks = tasks.filter((t) => t.date === dayStr && t.slot != null);
  const columns = computeColumns(scheduledTasks);

  // Filter blocked times for this day
  const dayBlocked = (blockedTimes || []).filter((b) => b.date === dayStr || b.recurring);

  // Filter deadlines for this day
  const dayDeadlines = (deadlines || []).filter((dl) => dl.date === dayStr);

  // Scroll to 6am on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 6 * HOUR_HEIGHT, behavior: 'auto' });
    }
  }, []);

  function getSlot(e) {
    if (!scrollRef.current) return 0;
    const rect = scrollRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top + scrollRef.current.scrollTop;
    return Math.max(0, Math.min(Math.floor(y / SLOT_HEIGHT), TOTAL_SLOTS - 1));
  }

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // Update ghost preview
    const taskId = dragInfo.current?.id || e.dataTransfer.getData('text/plain');
    if (!taskId && !dragInfo.current) return;
    const rawSlot = getSlot(e);
    const offset = dragInfo.current?.grabOffset || 0;
    const slot = Math.max(0, rawSlot - offset);
    const dur = dragInfo.current?.duration || dragInfo.current?.dur || DEFAULT_TASK_DURATION;
    const deadlineId = dragInfo.current?.deadlineId || dragInfo.current?.deadline_id || null;
    setGhost({ slot, dur, deadlineId });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const taskId = dragInfo.current?.id || e.dataTransfer.getData('text/plain');
    if (!taskId || !scrollRef.current) {
      setGhost(null);
      dragInfo.current = null;
      return;
    }
    const rawSlot = getSlot(e);
    const offset = dragInfo.current?.grabOffset || 0;
    const slot = Math.max(0, rawSlot - offset);
    onTaskDrop?.(taskId, slot);
    setGhost(null);
    dragInfo.current = null;
  };

  const handleDragLeave = (e) => {
    if (!scrollRef.current?.contains(e.relatedTarget)) {
      setGhost(null);
    }
  };

  const handleClick = (e) => {
    if (!scrollRef.current) return;
    const rect = scrollRef.current.getBoundingClientRect();
    const scrollTop = scrollRef.current.scrollTop;
    const y = e.clientY - rect.top + scrollTop;
    const x = e.clientX - rect.left;
    if (x < CL) return;
    const slot = Math.max(0, Math.floor(y / SLOT_HEIGHT));
    onSlotClick?.(slot);
  };

  const handleTaskDragStart = (e, task) => {
    // Calculate grab offset: how far from the task's top the user clicked
    const cursorSlot = getSlot(e);
    const taskSlot = task.slot ?? 0;
    const grabOffset = cursorSlot - taskSlot;
    dragInfo.current = { ...task, grabOffset };
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    // v1: custom small drag ghost (lines 498-504)
    const tc = getTaskColor(task, deadlines, theme);
    const el = document.createElement('div');
    el.style.cssText = `position:absolute;top:-999px;padding:4px 10px;background:${tc.bg};border:1px solid ${tc.border};border-radius:8px;font-size:12px;color:${tc.text};white-space:nowrap;max-width:180px;overflow:hidden;text-overflow:ellipsis;`;
    el.textContent = task.text;
    document.body.appendChild(el);
    e.dataTransfer.setDragImage(el, 0, 0);
    setTimeout(() => document.body.removeChild(el), 0);
  };

  return (
    <div style={{
      background: theme.bgSecondary,
      border: `0.5px solid ${theme.border}`,
      borderRadius: 14,
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Section label — v1 SL component */}
      <div style={{
        fontSize: 10,
        fontWeight: 500,
        color: theme.textTertiary,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: 10,
      }}>
        Day schedule &mdash; drag tasks here
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'scroll',
          borderRadius: 12,
          border: `0.5px solid ${theme.border}`,
          background: theme.calBg,
        }}
      >
        <div style={{ position: 'relative', height: TOTAL_HEIGHT, width: '100%' }}>
          {/* Hour rows — v1: position:absolute divs with flex label + content area */}
          {HOURS_ARRAY.map((h, hi) => (
            <div key={h} style={{
              position: 'absolute',
              top: hi * HOUR_HEIGHT,
              left: 0,
              right: 0,
              height: HOUR_HEIGHT,
              display: 'flex',
              borderBottom: hi < HOURS_ARRAY.length - 1 ? `0.5px solid ${theme.hourRule}` : 'none',
            }}>
              {/* Hour label column */}
              <div style={{
                width: CL,
                flexShrink: 0,
                paddingTop: 4,
                paddingRight: 7,
                fontSize: 10,
                color: theme.textTertiary,
                textAlign: 'right',
              }}>
                {String(h).padStart(2, '0')}:00
              </div>
              {/* Content area with quarter-hour dashes */}
              <div style={{
                flex: 1,
                position: 'relative',
                borderLeft: `0.5px solid ${theme.hourRule}`,
              }}>
                {[1, 2, 3].map((q) => (
                  <div key={q} style={{
                    position: 'absolute',
                    top: q * SLOT_HEIGHT,
                    left: 0,
                    right: 0,
                    borderTop: `0.5px dashed ${theme.dashLine}`,
                    opacity: 0.7,
                  }} />
                ))}
              </div>
            </div>
          ))}

          {/* Now line */}
          {isToday && <NowLine />}

          {/* Deadline badges */}
          {dayDeadlines.map((dl, i) => {
            const idx = dl.colorIdx ?? dl.color_idx ?? 0;
            const c = theme.deadline[idx % theme.deadline.length];
            return (
              <div key={dl.id} style={{
                position: 'absolute',
                right: 4,
                top: 4 + i * 22,
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: 6,
                padding: '2px 8px',
                fontSize: 10,
                color: c.text,
                fontWeight: 500,
                pointerEvents: 'none',
                zIndex: 5,
              }}>
                {dl.title} &mdash; due today
              </div>
            );
          })}

          {/* Ghost preview during drag */}
          {ghost && (() => {
            const gc = getTaskColor({ deadlineId: ghost.deadlineId }, deadlines, theme);
            return (
              <div style={{
                position: 'absolute',
                left: CL,
                right: 0,
                top: ghost.slot * SLOT_HEIGHT,
                height: ghost.dur * SLOT_HEIGHT,
                background: gc.bg,
                border: `1.5px dashed ${gc.border}`,
                borderRadius: 8,
                opacity: 0.8,
                pointerEvents: 'none',
                zIndex: 4,
              }} />
            );
          })()}

          {/* Blocked times */}
          {dayBlocked.map((block, i) => (
            <BlockedTimeSlot key={block.id || i} block={block} />
          ))}

          {/* Scheduled tasks container — v1: position:absolute, left:CL, right:0 */}
          <div style={{ position: 'absolute', left: CL, right: 0, top: 0, bottom: 0 }}>
            {scheduledTasks.map((task) => {
              const layout = columns[task.id] || { col: 0, total: 1 };
              const colorObj = getTaskColor(task, deadlines, theme);
              return (
                <CalendarTask
                  key={task.id}
                  task={task}
                  col={layout.col}
                  totalCols={layout.total}
                  colorObj={colorObj}
                  onToggle={onTaskToggle}
                  deadlines={deadlines}
                  onDragStart={handleTaskDragStart}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
