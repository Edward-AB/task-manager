import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import { slotToTime } from '../../utils/slots.js';

export default function TaskItem({ task, deadlines = [], onToggle, onDelete, onNote, onUpdate, onMove }) {
  const { theme } = useTheme();
  const [hover, setHover] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editingFields, setEditingFields] = useState(false);

  const tc = task.colorId
    ? theme.taskColor.find(c => c.id === task.colorId) || theme.taskColor[0]
    : theme.taskColor[0];

  const pc = task.priority ? theme.priority[task.priority] : null;
  const dl = task.deadlineId ? deadlines.find(d => d.id === task.deadlineId) : null;
  const dlc = dl ? theme.deadline[dl.color_idx % theme.deadline.length] : null;

  const handleDoubleClick = () => {
    setEditing(true);
    setEditText(task.text);
  };

  const handleEditSubmit = () => {
    if (editText.trim() && editText.trim() !== task.text) {
      onUpdate(task.id, { text: editText.trim() });
    }
    setEditing(false);
  };

  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px',
        borderRadius: theme.radius.md, background: tc.bg,
        borderLeft: `3px solid ${pc ? pc.border : tc.border}`,
        transition: 'box-shadow 200ms',
        boxShadow: hover ? theme.shadow.sm : 'none',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      draggable
      onDragStart={e => { e.dataTransfer.setData('text/plain', task.id); e.dataTransfer.effectAllowed = 'move'; }}
    >
      {/* Checkbox — custom SVG circle matching v1 */}
      <button onClick={() => onToggle(task.id, !task.done)} style={{
        width: 14, height: 14, borderRadius: '50%', flexShrink: 0, marginTop: 2,
        border: task.done ? 'none' : `1px solid ${theme.textTertiary}`,
        background: task.done ? '#2D9B6F' : 'transparent', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'transform 200ms',
      }}>
        {task.done ? <svg width={8} height={8} viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
        </svg> : null}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <input value={editText} onChange={e => setEditText(e.target.value)}
            onBlur={handleEditSubmit} onKeyDown={e => e.key === 'Enter' && handleEditSubmit()}
            autoFocus style={{
              width: '100%', fontSize: theme.font.body, border: `1px solid ${theme.borderFocus}`,
              borderRadius: theme.radius.sm, padding: '2px 6px', background: theme.bg,
              color: theme.textPrimary, outline: 'none',
            }} />
        ) : (
          <div onDoubleClick={handleDoubleClick} style={{
            fontSize: theme.font.body, color: tc.text,
            textDecoration: task.done ? 'line-through' : 'none',
            opacity: task.done ? 0.6 : 1, cursor: 'text',
          }}>{task.text}</div>
        )}

        {/* Tags row */}
        <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          {pc && (
            <span style={{
              fontSize: 9, padding: '1px 6px', borderRadius: theme.radius.full,
              background: pc.bg, color: pc.text, border: `0.5px solid ${pc.border}`,
              display: 'inline-flex', alignItems: 'center', gap: 3,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: pc.dot }} />
              {task.priority}
            </span>
          )}
          {task.duration && (
            <span style={{ fontSize: 9, color: theme.textTertiary }}>{task.duration * 15}m</span>
          )}
          {task.slot != null && (
            <span style={{ fontSize: 9, color: theme.textTertiary }}>{slotToTime(task.slot)}</span>
          )}
          {task.note && (
            <span style={{ display: 'inline-flex', alignItems: 'center' }} title="Has note">
              <svg width={10} height={10} viewBox="0 0 14 14" fill="none">
                <rect x="2" y="1" width="10" height="12" rx="1.5" stroke={theme.textTertiary} strokeWidth="1.2"/>
                <line x1="4.5" y1="4" x2="9.5" y2="4" stroke={theme.textTertiary} strokeWidth="1" strokeLinecap="round"/>
                <line x1="4.5" y1="6.5" x2="9.5" y2="6.5" stroke={theme.textTertiary} strokeWidth="1" strokeLinecap="round"/>
                <line x1="4.5" y1="9" x2="7.5" y2="9" stroke={theme.textTertiary} strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </span>
          )}
          {dl && dlc && (
            <span style={{
              fontSize: 9, padding: '1px 6px', borderRadius: theme.radius.full,
              background: dlc.bg, color: dlc.text, border: `0.5px solid ${dlc.border}`,
            }}>{dl.title}</span>
          )}
        </div>

        {/* Inline field editor (Dev-43) */}
        {editingFields && (
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={task.priority || ''} onChange={e => onUpdate(task.id, { priority: e.target.value || null })}
              style={{ fontSize: 10, padding: '2px 4px', borderRadius: theme.radius.sm, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.textPrimary }}>
              <option value="">No priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select value={task.duration || 2} onChange={e => onUpdate(task.id, { duration: Number(e.target.value) })}
              style={{ fontSize: 10, padding: '2px 4px', borderRadius: theme.radius.sm, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.textPrimary }}>
              {[1,2,3,4,6,8,12].map(d => <option key={d} value={d}>{d * 15}m</option>)}
            </select>
            <div style={{ display: 'flex', gap: 3 }}>
              {theme.taskColor.map(c => (
                <button key={c.id} onClick={() => onUpdate(task.id, { color_id: c.id })} style={{
                  width: 20, height: 12, borderRadius: 4, background: c.bg, padding: 0,
                  border: (task.color_id || task.colorId) === c.id ? `1.5px solid ${theme.textPrimary}` : `1px solid ${c.border}`,
                  cursor: 'pointer',
                }} />
              ))}
            </div>
            <button onClick={() => setEditingFields(false)} style={{
              fontSize: 9, padding: '1px 6px', borderRadius: theme.radius.sm,
              border: `1px solid ${theme.border}`, color: theme.textTertiary, cursor: 'pointer',
            }}>Done</button>
          </div>
        )}
      </div>

      {/* Actions */}
      {hover && !editing && (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button onClick={() => setEditingFields(!editingFields)} title="Edit fields" style={{
            width: 24, height: 24, borderRadius: theme.radius.sm, fontSize: 11,
            color: editingFields ? theme.accent : theme.textTertiary, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `0.5px solid ${editingFields ? theme.accent : theme.border}`,
          }}>✎</button>
          {onNote && (
            <button onClick={() => onNote(task)} title="Note" style={{
              width: 24, height: 24, borderRadius: theme.radius.sm,
              color: theme.textTertiary, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `0.5px solid ${theme.border}`, padding: 0,
            }}>
              <svg width={12} height={12} viewBox="0 0 14 14" fill="none">
                <rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <line x1="4.5" y1="4" x2="9.5" y2="4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                <line x1="4.5" y1="6.5" x2="9.5" y2="6.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                <line x1="4.5" y1="9" x2="7.5" y2="9" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </button>
          )}
          {onMove && (
            <button onClick={() => onMove(task.id)} title="Move to tomorrow" style={{
              width: 24, height: 24, borderRadius: theme.radius.sm, fontSize: 11,
              color: theme.textTertiary, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `0.5px solid ${theme.border}`,
            }}>→</button>
          )}
          <button onClick={() => onDelete(task.id)} title="Delete" style={{
            width: 24, height: 24, borderRadius: theme.radius.sm, fontSize: 11,
            color: theme.danger, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `0.5px solid ${theme.danger}40`,
          }}>×</button>
        </div>
      )}
    </div>
  );
}
