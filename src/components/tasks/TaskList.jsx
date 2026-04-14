import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import { dateKey } from '../../utils/dates.js';
import TaskItem from './TaskItem.jsx';

export default function TaskList({
  date, tasks, allTasks, deadlines,
  onToggle, onDelete, onNote, onUpdate, onMove, onDrop,
}) {
  const { theme } = useTheme();
  const dayStr = dateKey(date);
  const todayStr = dateKey(new Date());
  const [overUnsch, setOverUnsch] = useState(false);

  // Tasks for this day
  const dayTasks = (tasks || []).filter((t) => t.date === dayStr);

  // Overdue: past incomplete tasks (shown when viewing today)
  const overdueTasks = dayStr === todayStr
    ? (allTasks || tasks || []).filter((t) => t.date < todayStr && !t.done)
    : [];

  // Sections
  const deadlineTasks = dayTasks.filter((t) => t.deadlineId || t.deadline_id);
  const unscheduled = dayTasks.filter((t) => !(t.deadlineId || t.deadline_id) && t.slot == null);
  const scheduled = dayTasks.filter((t) => !(t.deadlineId || t.deadline_id) && t.slot != null).sort((a, b) => a.slot - b.slot);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverUnsch(true);
  };
  const handleDragLeave = () => setOverUnsch(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setOverUnsch(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && onDrop) onDrop(taskId, null);
  };

  const itemProps = { deadlines, onToggle, onDelete, onNote, onUpdate, onMove };

  const totalVisible = overdueTasks.length + dayTasks.length;

  // Section label matching v1: fontSize 10, fontWeight 500, uppercase, letterSpacing 0.08em
  const sectionLabel = (text, color) => (
    <div style={{
      fontSize: theme.font.label, fontWeight: 500, color: color || theme.textTertiary,
      letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6,
    }}>{text}</div>
  );

  // Divider between sections matching v1
  const divider = () => (
    <div style={{ height: '0.5px', background: theme.hourRule || theme.borderLight, margin: '8px 0' }} />
  );

  // Track which sections exist so we can add dividers between them
  const sections = [];

  if (overdueTasks.length > 0) {
    sections.push(
      <div key="overdue">
        {sectionLabel(`Overdue \u00B7 ${overdueTasks.length}`, theme.danger)}
        {overdueTasks.map((t) => (
          <TaskItem key={t.id} task={t} {...itemProps} />
        ))}
      </div>
    );
  }

  if (deadlineTasks.length > 0) {
    sections.push(
      <div key="deadline">
        {sectionLabel('Deadline tasks scheduled today')}
        <DeadlineTaskCards deadlineTasks={deadlineTasks} deadlines={deadlines} theme={theme} itemProps={itemProps} />
      </div>
    );
  }

  // Empty state or unscheduled section
  if (totalVisible === 0) {
    sections.push(
      <div key="empty" style={{ fontSize: 12, color: theme.textTertiary, padding: '4px 0', marginBottom: 6 }}>
        Add a task above to get started.
      </div>
    );
  } else if (unscheduled.length === 0 && dayTasks.length > 0) {
    sections.push(
      <div key="all-scheduled" style={{ fontSize: 12, color: theme.textTertiary, padding: '4px 0', marginBottom: 6 }}>
        All tasks scheduled!
      </div>
    );
  } else if (unscheduled.length > 0) {
    sections.push(
      <div key="unscheduled">
        {sectionLabel(`Unscheduled \u00B7 ${unscheduled.length}`)}
        {unscheduled.map((t) => (
          <TaskItem key={t.id} task={t} {...itemProps} />
        ))}
      </div>
    );
  }

  if (scheduled.length > 0) {
    sections.push(
      <div key="scheduled">
        {sectionLabel(`Scheduled \u00B7 ${scheduled.length}`)}
        {scheduled.map((t) => (
          <TaskItem key={t.id} task={t} {...itemProps} />
        ))}
      </div>
    );
  }

  // Render all sections inside ONE card, with dividers between them
  return (
    <div
      className="col-scroll"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 280px)',
        border: `0.5px solid ${overUnsch ? theme.accent : theme.border}`,
        borderRadius: 14,
        padding: '12px 14px',
        background: theme.bgSecondary,
      }}
    >
      {sections.map((section, i) => (
        <div key={section.key}>
          {i > 0 && divider()}
          {section}
        </div>
      ))}
    </div>
  );
}

/** Grouped deadline cards -- show deadline as collapsed card, expand to see tasks */
function DeadlineTaskCards({ deadlineTasks, deadlines, theme, itemProps }) {
  const [expanded, setExpanded] = useState({});

  // Group tasks by deadline
  const groups = {};
  deadlineTasks.forEach((t) => {
    const dlId = t.deadlineId || t.deadline_id;
    if (!groups[dlId]) groups[dlId] = [];
    groups[dlId].push(t);
  });

  const daysLeft = (dl) => {
    if (!dl.due_date) return null;
    const diff = Math.ceil((new Date(dl.due_date) - new Date()) / 86400000);
    if (diff < 0) return 'overdue';
    if (diff === 0) return 'due today';
    return `${diff}d left`;
  };

  return (
    <div>
      {Object.entries(groups).map(([dlId, tasks]) => {
        const dl = (deadlines || []).find((d) => d.id === dlId);
        const dlc = dl ? theme.deadline[(dl.color_idx ?? 0) % theme.deadline.length] : null;
        const isOpen = expanded[dlId];

        return (
          <div key={dlId} style={{ marginBottom: 5 }}>
            <button
              onClick={() => setExpanded((e) => ({ ...e, [dlId]: !e[dlId] }))}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', borderRadius: theme.radius.sm,
                border: `0.5px solid ${dlc?.border || theme.border}`,
                background: dlc?.bg || theme.bgTertiary,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              }}
            >
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: dlc?.dot || theme.accent, flexShrink: 0,
              }} />
              <span style={{ flex: 1, fontSize: theme.font.body, fontWeight: 500, color: dlc?.text || theme.textPrimary }}>
                {dl?.title || 'Deadline'}
              </span>
              <span style={{ fontSize: theme.font.label, color: dlc?.text || theme.textTertiary, opacity: 0.7 }}>
                {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                {dl && daysLeft(dl) && ` \u00B7 ${daysLeft(dl)}`}
              </span>
              <span style={{ fontSize: 10, color: dlc?.text || theme.textTertiary, transition: 'transform 200ms', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                {'\u25BC'}
              </span>
            </button>
            {isOpen && (
              <div style={{ marginTop: 4, paddingLeft: 12 }}>
                {tasks.map((t) => (
                  <TaskItem key={t.id} task={t} {...itemProps} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
