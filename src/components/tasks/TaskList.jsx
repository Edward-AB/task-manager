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

  const sectionLabel = (text, color) => (
    <div style={{
      fontSize: theme.font.label, fontWeight: 500, color: color || theme.textTertiary,
      letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, marginTop: 4,
    }}>{text}</div>
  );

  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId') || e.dataTransfer.getData('text/plain');
    if (taskId && onDrop) onDrop(taskId, null);
  };

  const itemProps = { deadlines, onToggle, onDelete, onNote, onUpdate, onMove };

  const totalVisible = overdueTasks.length + dayTasks.length;
  if (totalVisible === 0) {
    return (
      <div style={{
        padding: 24, textAlign: 'center', borderRadius: theme.radius.md,
        border: `0.5px solid ${theme.border}`, background: theme.bgSecondary,
      }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>{'\uD83D\uDCCB'}</div>
        <p style={{ color: theme.textTertiary, fontSize: theme.font.body }}>No tasks for this day</p>
        <p style={{ color: theme.textTertiary, fontSize: theme.font.bodySmall, marginTop: 4 }}>Add one above to get started</p>
      </div>
    );
  }

  const sectionWrap = {
    borderRadius: theme.radius.md,
    border: `0.5px solid ${theme.border}`,
    background: theme.bgSecondary,
    padding: 10,
  };

  const listGap = { display: 'flex', flexDirection: 'column', gap: 6 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {overdueTasks.length > 0 && (
        <div style={sectionWrap}>
          {sectionLabel(`Overdue (${overdueTasks.length})`, theme.danger)}
          <div style={listGap}>
            {overdueTasks.map((t) => (
              <TaskItem key={t.id} task={t} {...itemProps} />
            ))}
          </div>
        </div>
      )}

      {deadlineTasks.length > 0 && (
        <div style={sectionWrap}>
          {sectionLabel(`DEADLINE TASKS SCHEDULED TODAY`)}
          <div style={listGap}>
            {deadlineTasks.map((t) => (
              <TaskItem key={t.id} task={t} {...itemProps} />
            ))}
          </div>
        </div>
      )}

      {(unscheduled.length > 0 || scheduled.length > 0) && (
        <div style={sectionWrap} onDragOver={handleDragOver} onDrop={handleDrop}>
          {unscheduled.length > 0 && (
            <>
              {sectionLabel(`UNSCHEDULED \u00B7 ${unscheduled.length}`)}
              <div style={listGap}>
                {unscheduled.map((t) => (
                  <TaskItem key={t.id} task={t} {...itemProps} />
                ))}
              </div>
            </>
          )}

          {scheduled.length > 0 && (
            <div style={{ marginTop: unscheduled.length > 0 ? 16 : 0 }}>
              {sectionLabel(`SCHEDULED \u00B7 ${scheduled.length}`)}
              <div style={listGap}>
                {scheduled.map((t) => (
                  <TaskItem key={t.id} task={t} {...itemProps} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
