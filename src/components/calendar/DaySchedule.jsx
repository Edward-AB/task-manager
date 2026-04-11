import { useRef, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import { dateKey } from '../../utils/dates.js';
import { slotToTime } from '../../utils/slots.js';
import { computeColumns } from '../../utils/calendar.js';
import { getTaskColor } from '../../utils/colors.js';
import {
  SLOT_HEIGHT, SLOTS_PER_HOUR, HOUR_HEIGHT, CALENDAR_HOURS,
  CALENDAR_LABEL_WIDTH, DEFAULT_WORK_START, DEFAULT_WORK_END,
} from '../../constants';
import NowLine from './NowLine.jsx';
import CalendarTask from './CalendarTask.jsx';
import BlockedTimeSlot from './BlockedTimeSlot.jsx';

const TOTAL_HEIGHT = CALENDAR_HOURS * HOUR_HEIGHT;

export default function DaySchedule({
  date, tasks, deadlines, blockedTimes, events,
  onSlotClick, onTaskDrop, onTaskToggle,
}) {
  const { theme } = useTheme();
  const scrollRef = useRef(null);
  const dayStr = dateKey(date);
  const isToday = dayStr === dateKey(new Date());

  // Filter tasks for this day that have a slot
  const scheduledTasks = tasks.filter((t) => t.date === dayStr && t.slot != null);
  const columns = computeColumns(scheduledTasks);

  // Filter blocked times for this day
  const dayBlocked = (blockedTimes || []).filter((b) => b.date === dayStr || b.recurring);

  // Scroll to 6am on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 6 * HOUR_HEIGHT, behavior: 'auto' });
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId || !scrollRef.current) return;
    const rect = scrollRef.current.getBoundingClientRect();
    const scrollTop = scrollRef.current.scrollTop;
    const y = e.clientY - rect.top + scrollTop;
    const slot = Math.max(0, Math.floor(y / SLOT_HEIGHT));
    onTaskDrop?.(taskId, slot);
  };

  const handleClick = (e) => {
    if (!scrollRef.current) return;
    const rect = scrollRef.current.getBoundingClientRect();
    const scrollTop = scrollRef.current.scrollTop;
    const y = e.clientY - rect.top + scrollTop;
    const x = e.clientX - rect.left;
    if (x < CALENDAR_LABEL_WIDTH) return;
    const slot = Math.max(0, Math.floor(y / SLOT_HEIGHT));
    onSlotClick?.(slot);
  };

  const cardStyle = {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle = {
    padding: '14px 20px',
    borderBottom: `1px solid ${theme.border}`,
    fontSize: theme.font.bodySmall,
    fontWeight: 600,
    color: theme.textSecondary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const scrollAreaStyle = {
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    height: 'calc(100vh - 120px)',
    position: 'relative',
  };

  const timelineStyle = {
    position: 'relative',
    height: TOTAL_HEIGHT,
    background: theme.calBg,
  };

  // Working hours background
  const workStart = DEFAULT_WORK_START;
  const workEnd = DEFAULT_WORK_END;
  const workTop = (workStart / SLOTS_PER_HOUR) * HOUR_HEIGHT;
  const workHeight = ((workEnd - workStart) / SLOTS_PER_HOUR) * HOUR_HEIGHT;

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <span>DAY SCHEDULE &mdash; DRAG TASKS HERE</span>
        <span style={{ color: theme.textTertiary, fontWeight: 400 }}>
          {scheduledTasks.length} task{scheduledTasks.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div
        ref={scrollRef}
        style={scrollAreaStyle}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div style={timelineStyle}>
          {/* Working hours highlight */}
          <div
            style={{
              position: 'absolute',
              top: workTop,
              left: CALENDAR_LABEL_WIDTH,
              right: 0,
              height: workHeight,
              background: theme.workingHoursBg,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />

          {/* Hour rules and labels */}
          {Array.from({ length: CALENDAR_HOURS }, (_, h) => {
            const top = h * HOUR_HEIGHT;
            return (
              <div key={h}>
                {/* Hour label */}
                <div
                  style={{
                    position: 'absolute',
                    top: top - 6,
                    left: 4,
                    width: CALENDAR_LABEL_WIDTH - 8,
                    textAlign: 'right',
                    fontSize: theme.font.label,
                    color: theme.textTertiary,
                    fontWeight: 500,
                    zIndex: 3,
                    pointerEvents: 'none',
                  }}
                >
                  {String(h).padStart(2, '0')}:00
                </div>
                {/* Hour line */}
                <div
                  style={{
                    position: 'absolute',
                    top,
                    left: CALENDAR_LABEL_WIDTH,
                    right: 0,
                    height: 1,
                    background: theme.hourRule,
                    zIndex: 1,
                    pointerEvents: 'none',
                  }}
                />
              </div>
            );
          })}

          {/* Blocked times */}
          {dayBlocked.map((block, i) => (
            <BlockedTimeSlot key={block.id || i} block={block} />
          ))}

          {/* Scheduled tasks */}
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
              />
            );
          })}

          {/* Now line */}
          {isToday && <NowLine />}
        </div>
      </div>
    </div>
  );
}
