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
    background: theme.bgSecondary,
    border: `0.5px solid ${theme.border}`,
    borderRadius: theme.radius.md,
    padding: '16px',
    flexShrink: 0,
  };

  const headerRow = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  };

  const greetStyle = {
    fontSize: theme.font.heading,
    fontWeight: 500,
    color: theme.textPrimary,
    marginBottom: 2,
  };

  const subtitleStyle = {
    fontSize: theme.font.bodySmall,
    color: theme.textSecondary,
  };

  const toggleWrap = {
    display: 'flex',
    border: `0.5px solid ${theme.border}`,
    borderRadius: 8,
    overflow: 'hidden',
    flexShrink: 0,
    marginLeft: 8,
  };

  const toggleBtn = (active) => ({
    padding: '4px 9px',
    fontSize: 11,
    cursor: 'pointer',
    background: active ? theme.accent : 'transparent',
    color: active ? theme.accentBtnText : theme.textSecondary,
    border: 'none',
    fontWeight: active ? 500 : 400,
  });

  return (
    <div style={cardStyle}>
      <div style={headerRow}>
        <div>
          <div style={greetStyle}>{getGreeting()}</div>
          <div style={subtitleStyle}>
            {total > 0 ? `${done} of ${total} tasks done today` : 'Nothing planned yet'}
          </div>
        </div>
        <div style={toggleWrap}>
          {['week', 'month'].map((v) => (
            <button key={v} style={toggleBtn(calView === v)} onClick={() => onCalViewChange(v)}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {calView === 'week' ? (
        <WeekStrip date={date} onDateChange={onDateChange} tasks={tasks} />
      ) : (
        <MonthCalendar date={date} onDateChange={onDateChange} tasks={tasks} />
      )}
    </div>
  );
}
