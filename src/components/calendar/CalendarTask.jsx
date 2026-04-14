import { useTheme } from '../../hooks/useTheme.js';
import { slotToTime } from '../../utils/slots.js';
import { SLOT_HEIGHT } from '../../constants';

function PriorityTag({ priority, P }) {
  const c = P[priority || 'none'];
  return (
    <span style={{
      fontSize: 9, padding: '1px 5px 1px 4px', borderRadius: 20,
      background: c.bg, color: c.text, border: `0.5px solid ${c.border}`,
      flexShrink: 0, whiteSpace: 'nowrap', display: 'inline-flex',
      alignItems: 'center', gap: 3,
    }}>
      <span style={{
        width: 5, height: 5, borderRadius: '50%', background: c.dot,
        flexShrink: 0, display: 'inline-block',
      }} />
      {priority || 'none'}
    </span>
  );
}

export default function CalendarTask({
  task, col, totalCols, colorObj, onToggle, deadlines,
  onUnschedule, onResize, onDragStart: onDragStartProp,
}) {
  const { theme } = useTheme();

  const top = task.slot * SLOT_HEIGHT;
  const height = Math.max(task.duration * SLOT_HEIGHT, SLOT_HEIGHT);
  const colPct = totalCols > 0 ? (100 / totalCols) : 100;
  const leftPct = col * colPct;
  const narrow = colPct <= 55;

  const tc = colorObj || theme.taskColor[0];
  const P = theme.priority;

  // Find deadline info
  const dlId = task.deadlineId || task.deadline_id;
  const dl = dlId && deadlines ? deadlines.find(d => d.id === dlId) : null;
  const dlC = dl ? theme.deadline[(dl.colorIdx ?? dl.color_idx ?? 0) % theme.deadline.length] : null;

  // Priority colors for checkbox accent
  const pc = P[task.priority || 'none'];

  return (
    <div
      className="cpill trow"
      draggable
      onDragStart={(e) => {
        if (onDragStartProp) {
          onDragStartProp(e, task);
        } else {
          e.dataTransfer.setData('text/plain', task.id);
          e.dataTransfer.effectAllowed = 'move';
        }
      }}
      style={{
        position: 'absolute',
        left: `${leftPct}%`,
        width: `calc(${colPct}% - 4px)`,
        top,
        height,
        background: tc.bg,
        border: `1px solid ${tc.border}`,
        borderRadius: 9,
        padding: '3px 6px',
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        overflow: 'hidden',
      }}
    >
      <input
        type="checkbox"
        checked={task.done}
        onChange={() => onToggle?.(task)}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 10, height: 10, flexShrink: 0,
          accentColor: pc.dot,
          marginTop: 0,
        }}
      />
      {narrow ? (
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{
            fontSize: 11, fontWeight: 500,
            color: task.done ? tc.border : tc.text,
            textDecoration: task.done ? 'line-through' : 'none',
            lineHeight: 1.3, overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {task.text}
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3 }}>
            <PriorityTag priority={task.priority} P={P} />
            <span style={{ fontSize: 9, color: tc.dot, whiteSpace: 'nowrap' }}>
              {slotToTime(task.slot)}&middot;{task.duration * 15}m
            </span>
            {dl && dlC && (
              <span style={{
                padding: '1px 4px', borderRadius: 5,
                background: dlC.bg, color: dlC.text,
                border: `0.5px solid ${dlC.border}`,
                fontSize: 9, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80,
              }}>
                {dl.title}
              </span>
            )}
          </div>
        </div>
      ) : (
        <>
          <span style={{
            fontSize: 11, fontWeight: 500,
            color: task.done ? tc.border : tc.text,
            textDecoration: task.done ? 'line-through' : 'none',
            flex: 1, minWidth: 0, lineHeight: 1.3, overflow: 'hidden',
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          }}>
            {task.text}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <PriorityTag priority={task.priority} P={P} />
            <span style={{ fontSize: 9, color: tc.dot, whiteSpace: 'nowrap' }}>
              {slotToTime(task.slot)}&middot;{task.duration * 15}m
            </span>
            {dl && dlC && (
              <span style={{
                padding: '1px 4px', borderRadius: 5,
                background: dlC.bg, color: dlC.text,
                border: `0.5px solid ${dlC.border}`,
                fontSize: 9, whiteSpace: 'nowrap',
              }}>
                {dl.title}
              </span>
            )}
          </div>
        </>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onUnschedule?.(task.id); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: tc.dot, fontSize: 10, padding: 0, lineHeight: 1,
          flexShrink: 0,
          alignSelf: 'center',
          marginTop: 0,
        }}
      >
        ↩
      </button>
      <div className="rh" onMouseDown={(e) => onResize?.(e, task)}>
        <div style={{ width: 20, height: 2.5, borderRadius: 2, background: tc.border, opacity: 0.9 }} />
      </div>
    </div>
  );
}
