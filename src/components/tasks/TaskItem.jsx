import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import { slotToTime } from '../../utils/slots.js';

/* ── v1 helper: NpIcon (note/page icon) ── */
function NpIcon({ has, color, size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, verticalAlign: 'middle' }}>
      <rect x={1} y={1} width={10} height={10} rx={1.5} stroke={color} strokeWidth={1.2}
        fill={has ? 'currentColor' : 'none'} fillOpacity={has ? 0.18 : 0} />
      <line x1={3} y1={4} x2={9} y2={4} stroke={color} strokeWidth={1} />
      <line x1={3} y1={6.5} x2={9} y2={6.5} stroke={color} strokeWidth={1} />
      <line x1={3} y1={9} x2={7} y2={9} stroke={color} strokeWidth={1} />
    </svg>
  );
}

/* ── v1 helper: PriorityTag ── */
function PriorityTag({ priority, P }) {
  const c = P[priority || 'none'];
  return (
    <span style={{
      fontSize: 9, padding: '1px 5px 1px 4px', borderRadius: 20,
      background: c.bg, color: c.text, border: `0.5px solid ${c.border}`,
      flexShrink: 0, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 3,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, flexShrink: 0, display: 'inline-block' }} />
      {priority || 'none'}
    </span>
  );
}

/* ── v1 helper: AB (action button base style) ── */
const AB = (t) => ({
  width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: 6, border: `0.5px solid ${t.border}`, background: 'transparent',
  cursor: 'pointer', flexShrink: 0, padding: 0, lineHeight: 1,
});

export default function TaskItem({ task, deadlines = [], onToggle, onDelete, onNote, onUpdate, onMove }) {
  const { theme: t } = useTheme();
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editPri, setEditPri] = useState(task.priority || null);
  const [editDur, setEditDur] = useState(task.duration || 2);

  const P = t.priority;
  const DLC = t.deadline;

  // Task colour
  const tc = task.colorId
    ? t.taskColor.find(c => c.id === task.colorId) || t.taskColor[0]
    : t.taskColor[0];

  // Priority colour (always resolves, "none" is fallback)
  const pc = P[task.priority || 'none'];

  // Deadline lookup
  const dlId = task.deadlineId || task.deadline_id;
  const dl = dlId ? deadlines.find(d => d.id === dlId) : null;
  const dlC = dl ? DLC[(dl.color_idx ?? dl.colorIdx ?? 0) % DLC.length] : null;

  // Has note?
  const hN = !!(task.note && task.note.trim());

  // Is scheduled?
  const isScheduled = task.slot != null;

  // ── Edit handlers ──
  const startEdit = () => {
    setEditing(true);
    setEditText(task.text);
    setEditPri(task.priority || null);
    setEditDur(task.duration || 2);
  };

  const saveEdit = () => {
    const updates = {};
    const trimmed = editText.trim();
    if (trimmed && trimmed !== task.text) updates.text = trimmed;
    if (editPri !== (task.priority || null)) updates.priority = editPri;
    if (editDur !== (task.duration || 2)) updates.duration = editDur;
    if (Object.keys(updates).length > 0) onUpdate(task.id, updates);
    setEditing(false);
  };

  const cancelEdit = () => setEditing(false);

  return (
    <div
      className="trow"
      draggable={!isScheduled}
      onDragStart={!isScheduled ? e => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
        // v1: custom small drag ghost (lines 498-504)
        const el = document.createElement('div');
        el.style.cssText = `position:absolute;top:-999px;padding:4px 10px;background:${tc.bg};border:1px solid ${tc.border};border-radius:8px;font-size:12px;color:${tc.text};white-space:nowrap;max-width:180px;overflow:hidden;text-overflow:ellipsis;`;
        el.textContent = task.text;
        document.body.appendChild(el);
        e.dataTransfer.setDragImage(el, 0, 0);
        setTimeout(() => document.body.removeChild(el), 0);
      } : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        borderRadius: '0 8px 8px 0',
        background: tc.bg + '88',
        padding: '5px 8px', marginBottom: 5,
        cursor: isScheduled ? 'default' : 'grab',
        userSelect: 'none', boxSizing: 'border-box',
        borderTop: `0.5px solid ${tc.border}`,
        borderRight: `0.5px solid ${tc.border}`,
        borderBottom: `0.5px solid ${tc.border}`,
        borderLeft: `3px solid ${pc.dot}`,
      }}
    >
      {/* Checkbox */}
      <input type="checkbox" checked={task.done} onChange={() => onToggle(task.id, !task.done)} style={{ flexShrink: 0 }} />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <div>
            <input value={editText} onChange={e => setEditText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveEdit()} autoFocus
              style={{
                width: '100%', fontSize: 12, borderRadius: 6,
                border: `0.5px solid ${t.border}`, padding: '3px 7px',
                marginBottom: 4, boxSizing: 'border-box',
                background: t.bg, color: t.textPrimary,
              }} />
            <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
              {['high', 'medium', 'low'].map(p => (
                <button key={p} onClick={() => setEditPri(editPri === p ? null : p)} style={{
                  flex: 1, fontSize: 10, padding: '2px 0', borderRadius: 20,
                  border: `1px solid ${editPri === p ? P[p].border : t.border}`,
                  background: editPri === p ? P[p].bg : 'transparent',
                  color: editPri === p ? P[p].text : t.textSecondary,
                  cursor: 'pointer',
                }}>{p}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={saveEdit} style={{
                flex: 1, fontSize: 11, padding: '3px 0', borderRadius: 6,
                border: 'none', background: t.accentBtn, color: t.accentBtnText, cursor: 'pointer',
              }}>Save</button>
              <button onClick={cancelEdit} style={{
                flex: 1, fontSize: 11, padding: '3px 0', borderRadius: 6,
                border: `0.5px solid ${t.border}`, background: 'transparent',
                color: t.textSecondary, cursor: 'pointer',
              }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              fontSize: 12, color: task.done ? t.textTertiary : tc.text,
              textDecoration: task.done ? 'line-through' : 'none',
              lineHeight: 1.3, wordBreak: 'break-word',
            }}>{task.text}</div>
            <div style={{ display: 'flex', gap: 7, marginTop: 3, alignItems: 'center', flexWrap: 'wrap' }}>
              <PriorityTag priority={task.priority} P={P} />
              <span style={{ fontSize: 10, color: t.textTertiary }}>{(task.duration || 2) * 15}m</span>
              {isScheduled && <span style={{ fontSize: 10, color: t.textTertiary }}>{slotToTime(task.slot)}</span>}
              {hN && (
                <span onClick={() => onNote && onNote(task)} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', color: tc.dot }}>
                  <NpIcon has={true} color={tc.dot} />
                </span>
              )}
              {dl && dlC && (
                <span style={{
                  fontSize: 10, padding: '0px 6px', borderRadius: 20,
                  background: dlC.bg, color: dlC.text, border: `0.5px solid ${dlC.border}`, whiteSpace: 'nowrap',
                }}>{dl.title}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons — v1 pattern: className="ta" for CSS hover reveal */}
      {!editing && (
        <div className="ta" style={{ display: 'flex', gap: 3, flexShrink: 0, alignItems: 'center' }}>
          <button onClick={startEdit} style={{ ...AB(t), fontSize: 10, color: t.textSecondary, fontWeight: 500 }}>Edit</button>
          <button onClick={() => onNote && onNote(task)} style={{ ...AB(t), color: tc.dot }}>
            <NpIcon has={hN} color={tc.dot} size={11} />
          </button>
          {isScheduled ? (
            <button onClick={() => onUpdate(task.id, { slot: null })} style={{ ...AB(t), color: t.textSecondary, fontSize: 13 }}>↩</button>
          ) : (
            <button onClick={onMove ? () => onMove(task.id) : undefined} style={{
              ...AB(t),
              color: onMove ? t.textSecondary : t.textTertiary,
              opacity: onMove ? 1 : 0.35,
              cursor: onMove ? 'pointer' : 'default',
              fontSize: 13,
            }}>→</button>
          )}
          <button onClick={() => onDelete(task.id)} style={{ ...AB(t), color: '#E24B4A', fontSize: 13 }}>×</button>
        </div>
      )}
    </div>
  );
}
