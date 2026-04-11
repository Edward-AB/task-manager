import { useTheme } from '../../hooks/useTheme.js';
import { slotToTime } from '../../utils/slots.js';
import { SLOT_HEIGHT, CALENDAR_LABEL_WIDTH } from '../../constants';

export default function CalendarTask({ task, col, totalCols, colorObj, onToggle, deadlines }) {
  const { theme } = useTheme();

  const top = task.slot * SLOT_HEIGHT;
  const height = Math.max(task.duration * SLOT_HEIGHT, SLOT_HEIGHT);
  const colWidth = totalCols > 0 ? (100 / totalCols) : 100;
  const left = `calc(${CALENDAR_LABEL_WIDTH}px + ${col * colWidth}%)`;
  const width = `calc(${colWidth}% - 4px)`;

  const pillStyle = {
    position: 'absolute',
    top,
    left,
    width,
    height: height - 2,
    background: colorObj?.bg || theme.accentBg,
    border: `1px solid ${colorObj?.border || theme.accentBorder}`,
    borderLeft: `3px solid ${colorObj?.dot || theme.accent}`,
    borderRadius: theme.radius.sm,
    padding: '2px 6px',
    fontSize: theme.font.label,
    color: colorObj?.text || theme.accentText,
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    zIndex: 5,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 4,
    opacity: task.done ? 0.5 : 1,
    textDecoration: task.done ? 'line-through' : 'none',
    transition: `opacity ${theme.transition}`,
  };

  const timeStr = slotToTime(task.slot);

  return (
    <div
      style={pillStyle}
      title={`${task.text} (${timeStr})`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={() => onToggle?.(task)}
    >
      <span style={{ opacity: 0.6, flexShrink: 0 }}>{timeStr}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.text}</span>
      {(task.deadlineId || task.deadline_id) && deadlines && (() => {
        const dl = deadlines.find(d => d.id === (task.deadlineId || task.deadline_id));
        if (!dl) return null;
        const dlc = theme.deadline[dl.color_idx % theme.deadline.length];
        return (
          <span style={{
            flexShrink: 0, fontSize: 9, padding: '0 4px', borderRadius: 3,
            background: `${dlc.dot}30`, color: dlc.text, fontWeight: 500,
            whiteSpace: 'nowrap',
          }}>{dl.title}</span>
        );
      })()}
    </div>
  );
}
