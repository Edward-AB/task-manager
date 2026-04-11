import { useTheme } from '../../hooks/useTheme.js';
import WeekStrip from '../calendar/WeekStrip.jsx';
import MonthCalendar from '../calendar/MonthCalendar.jsx';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function GreetingCard({ date, onDateChange, tasks, calView, onCalViewChange }) {
  const { theme } = useTheme();

  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;

  const cardStyle = {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: theme.radius.lg,
    padding: '20px',
  };

  const greetStyle = {
    fontSize: theme.font.heading,
    fontWeight: 700,
    color: theme.textPrimary,
    marginBottom: 4,
  };

  const subtitleStyle = {
    fontSize: theme.font.bodySmall,
    color: theme.textSecondary,
    marginBottom: 14,
  };

  const toggleWrap = {
    display: 'flex',
    gap: 4,
    background: theme.bgTertiary,
    borderRadius: theme.radius.md,
    padding: 3,
    marginBottom: 14,
  };

  const toggleBtn = (active) => ({
    flex: 1,
    padding: '5px 0',
    border: 'none',
    borderRadius: theme.radius.sm,
    background: active ? theme.surface : 'transparent',
    color: active ? theme.textPrimary : theme.textTertiary,
    fontSize: theme.font.bodySmall,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: active ? theme.shadow.sm : 'none',
    transition: `all ${theme.transition}`,
  });

  return (
    <div style={cardStyle}>
      <div style={greetStyle}>
        {getGreeting()}
      </div>
      <div style={subtitleStyle}>
        {total > 0 ? `${done} of ${total} tasks done today` : 'No tasks for today'}
      </div>

      {/* Week / Month toggle */}
      <div style={toggleWrap}>
        <button style={toggleBtn(calView === 'week')} onClick={() => onCalViewChange('week')}>
          Week
        </button>
        <button style={toggleBtn(calView === 'month')} onClick={() => onCalViewChange('month')}>
          Month
        </button>
      </div>

      {calView === 'week' ? (
        <WeekStrip date={date} onDateChange={onDateChange} tasks={tasks} />
      ) : (
        <MonthCalendar date={date} onDateChange={onDateChange} tasks={tasks} />
      )}
    </div>
  );
}
