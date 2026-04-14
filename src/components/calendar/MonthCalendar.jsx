import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import { dateKey } from '../../utils/dates.js';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function MonthCalendar({ date, onDateChange, tasks }) {
  const { theme } = useTheme();
  const selectedKey = dateKey(date);
  const todayStr = dateKey(new Date());

  // viewDate controls which month is displayed (independent of selection)
  const [viewDate, setViewDate] = useState(new Date(date.getFullYear(), date.getMonth(), 1));
  const vYear = viewDate.getFullYear();
  const vMonth = viewDate.getMonth();

  const firstDay = new Date(vYear, vMonth, 1);
  const lastDay = new Date(vYear, vMonth + 1, 0);

  // Day of week for first day (Mon=0)
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const daysInMonth = lastDay.getDate();

  // Build cells with prev/current/next month days
  const cells = [];

  // Leading days from previous month
  if (startDow > 0) {
    const prevLastDay = new Date(vYear, vMonth, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      cells.push({ d: new Date(vYear, vMonth - 1, prevLastDay - i), cur: false });
    }
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ d: new Date(vYear, vMonth, d), cur: true });
  }

  // Trailing days from next month
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      cells.push({ d: new Date(vYear, vMonth + 1, d), cur: false });
    }
  }

  // Index tasks by date for fast lookup
  const tasksByDate = {};
  for (const t of tasks) {
    if (!t.date) continue;
    if (!tasksByDate[t.date]) tasksByDate[t.date] = [];
    tasksByDate[t.date].push(t);
  }

  return (
    <div>
      {/* Navigation header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <button
          onClick={() => setViewDate(new Date(vYear, vMonth - 1, 1))}
          style={{
            background: 'none',
            border: `0.5px solid ${theme.border}`,
            borderRadius: 6,
            padding: '3px 8px',
            cursor: 'pointer',
            color: theme.textSecondary,
            fontSize: 12,
            fontFamily: 'inherit',
          }}
        >{'\u2039'}</button>
        <span style={{ fontSize: 12, fontWeight: 500, color: theme.textSecondary }}>
          {MONTH_NAMES[vMonth]} {vYear}
        </span>
        <button
          onClick={() => setViewDate(new Date(vYear, vMonth + 1, 1))}
          style={{
            background: 'none',
            border: `0.5px solid ${theme.border}`,
            borderRadius: 6,
            padding: '3px 8px',
            cursor: 'pointer',
            color: theme.textSecondary,
            fontSize: 12,
            fontFamily: 'inherit',
          }}
        >{'\u203A'}</button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, marginBottom: 3 }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, color: theme.textTertiary, padding: '2px 0' }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((cell, i) => {
          const key = dateKey(cell.d);
          const isSel = key === selectedKey;
          const isToday = key === todayStr;
          const dayTasks = tasksByDate[key] || [];
          const cnt = dayTasks.length;
          const doneCount = dayTasks.filter((t) => t.done).length;
          const hasDeadline = dayTasks.some((t) => t.deadlineId);

          return (
            <button
              key={i}
              onClick={() => onDateChange(cell.d)}
              style={{
                padding: '4px 2px',
                borderRadius: 7,
                border: isSel ? `1.5px solid ${theme.selectedDayBorder}` : '0.5px solid transparent',
                background: isSel ? theme.selectedDay : isToday ? theme.todayDayBg : 'transparent',
                cursor: 'pointer',
                textAlign: 'center',
                opacity: cell.cur ? 1 : 0.3,
                minHeight: 32,
                fontFamily: 'inherit',
              }}
            >
              <div style={{
                fontSize: 11,
                fontWeight: isSel ? 500 : 400,
                color: isSel ? theme.selectedDayText : isToday ? theme.textPrimary : theme.textSecondary,
              }}>
                {cell.d.getDate()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 1 }}>
                {cnt > 0 && (
                  <div style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: doneCount === cnt ? theme.accent : theme.accentBorder,
                  }} />
                )}
                {hasDeadline && (
                  <div style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: '#E24B4A',
                  }} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
