import { useTheme } from '../../hooks/useTheme.js';
import { dateKey, getMonday, addDays } from '../../utils/dates.js';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function WeekStrip({ date, onDateChange, tasks }) {
  const { theme } = useTheme();
  const monday = getMonday(date);
  const sunday = addDays(monday, 6);
  const selectedKey = dateKey(date);
  const todayStr = dateKey(new Date());

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(monday, i);
    const key = dateKey(d);
    const dayTasks = tasks.filter((t) => t.date === key);
    const cnt = dayTasks.length;
    const allDone = cnt > 0 && dayTasks.every((t) => t.done);
    const isSelected = key === selectedKey;
    const isToday = key === todayStr;
    return { d, key, num: d.getDate(), letter: DAY_LETTERS[i], cnt, allDone, isSelected, isToday };
  });

  const fmt = (d) => d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
  const rangeLabel = `${fmt(monday)} \u2013 ${fmt(sunday)}`;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <button
          onClick={() => onDateChange(addDays(date, -7))}
          style={{ background: 'none', border: `0.5px solid ${theme.border}`, borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: theme.textSecondary, fontSize: 12 }}
        >
          &#8249;
        </button>
        <span style={{ fontSize: 11, fontWeight: 500, color: theme.textSecondary }}>{rangeLabel}</span>
        <button
          onClick={() => onDateChange(addDays(date, 7))}
          style={{ background: 'none', border: `0.5px solid ${theme.border}`, borderRadius: 6, padding: '3px 8px', cursor: 'pointer', color: theme.textSecondary, fontSize: 12 }}
        >
          &#8250;
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {days.map((day, i) => (
          <button
            key={i}
            onClick={() => onDateChange(day.d)}
            style={{
              padding: '6px 2px',
              borderRadius: 9,
              border: day.isSelected ? `1.5px solid ${theme.selectedDayBorder}` : `0.5px solid ${theme.border}`,
              background: day.isSelected ? theme.selectedDay : day.isToday ? theme.todayDayBg : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 10, color: day.isSelected ? theme.selectedDayText : theme.textTertiary, marginBottom: 2 }}>
              {day.letter}
            </div>
            <div style={{ fontSize: 13, fontWeight: day.isSelected ? 500 : 400, color: day.isSelected ? theme.selectedDayText : day.isToday ? theme.textPrimary : theme.textSecondary }}>
              {day.num}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 3, height: 6 }}>
              {day.cnt > 0 && (
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: day.allDone ? theme.accent : '#97C459' }} />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
