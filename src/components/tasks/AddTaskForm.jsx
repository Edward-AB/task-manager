import { useState, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import TaskColorPicker from './TaskColorPicker.jsx';

export default function AddTaskForm({ onAdd, deadlines = [], projects = [], inputRef: externalRef }) {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const [priority, setPriority] = useState(null);
  const [colorId, setColorId] = useState('white');
  const [duration, setDuration] = useState(2);
  const [deadlineId, setDeadlineId] = useState('');
  const [projectId, setProjectId] = useState('');
  const internalRef = useRef(null);
  const inputRef = externalRef || internalRef;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd({
      text: text.trim(), priority, color_id: colorId, duration,
      deadline_id: deadlineId || null, project_id: projectId || null,
    });
    setText('');
    setPriority(null);
    setColorId('white');
    inputRef.current?.focus();
  };

  const priorities = ['High', 'Medium', 'Low'];

  const sectionLabel = {
    fontSize: theme.font.label, fontWeight: 500, color: theme.textTertiary,
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10,
  };

  const selectStyle = {
    flex: 1,
    padding: '7px 8px', borderRadius: 8, border: `0.5px solid ${theme.border}`,
    background: theme.bg, color: theme.textSecondary, fontSize: 12,
    fontFamily: 'inherit',
  };

  const fieldLabel = {
    fontSize: 11, fontWeight: 500, color: theme.textTertiary, marginBottom: 4,
  };

  return (
    <div style={{
      padding: '16px 18px', borderRadius: theme.radius.md, border: `0.5px solid ${theme.border}`,
      background: theme.bgSecondary,
    }}>
      <div style={sectionLabel}>ADD TASK</div>
      <form onSubmit={handleSubmit}>
        <input ref={inputRef} value={text} onChange={e => setText(e.target.value)}
          placeholder="What needs to be done?" style={{
            width: '100%', padding: '8px 11px', borderRadius: 8,
            border: `0.5px solid ${theme.border}`, background: theme.bg,
            color: theme.textPrimary, fontSize: theme.font.body, outline: 'none',
            marginBottom: 10, boxSizing: 'border-box',
          }} />

        <div style={{ marginBottom: 10 }}>
          <TaskColorPicker value={colorId} onChange={setColorId} />
        </div>

        <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
          {priorities.map(p => {
            const key = p.toLowerCase();
            const active = priority === key;
            const pc = theme.priority[key];
            return (
              <button key={key} type="button"
                onClick={() => setPriority(active ? null : key)}
                style={{
                  flex: 1,
                  padding: '6px 0', borderRadius: 20,
                  fontSize: 12, fontWeight: 500,
                  background: active ? pc.bg : 'transparent',
                  color: active ? pc.text : theme.textSecondary,
                  border: `1px solid ${active ? pc.border : theme.border}`,
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: active ? pc.dot : theme.textTertiary,
                }} />
                {p}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={fieldLabel}>Duration</div>
            <select value={duration} onChange={e => setDuration(Number(e.target.value))}
              style={selectStyle}>
              {[1,2,3,4,6,8,12].map(d => <option key={d} value={d}>{d * 15} min</option>)}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <div style={fieldLabel}>Deadline</div>
            <select value={deadlineId} onChange={e => setDeadlineId(e.target.value)}
              style={selectStyle}>
              <option value="">None</option>
              {deadlines.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>

          {projects.length > 0 && (
            <div style={{ flex: 1 }}>
              <div style={fieldLabel}>Project</div>
              <select value={projectId} onChange={e => setProjectId(e.target.value)}
                style={selectStyle}>
                <option value="">None</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <button type="submit" style={{
          width: '100%', padding: '8px 0', borderRadius: 8,
          background: theme.accentBtn, color: theme.accentBtnText,
          fontWeight: 500, fontSize: 13,
          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        }}>Add task</button>
      </form>
    </div>
  );
}
