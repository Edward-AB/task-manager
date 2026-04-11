import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

export default function DayNoteCard({ note, onSave }) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState(note || '');

  // Sync external note changes
  if (note !== undefined && note !== null && note !== value && !expanded) {
    setValue(note);
  }

  const handleBlur = () => {
    if (value !== note) {
      onSave(value);
    }
  };

  const cardStyle = {
    background: theme.bgSecondary,
    border: `0.5px solid ${theme.border}`,
    borderRadius: theme.radius.md,
    padding: '12px 14px',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
  };

  const labelStyle = {
    fontSize: theme.font.bodySmall,
    fontWeight: 600,
    color: theme.textSecondary,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  const chevronStyle = {
    fontSize: theme.font.bodySmall,
    color: theme.textTertiary,
    transition: `transform ${theme.transition}`,
    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  };

  const textareaStyle = {
    width: '100%',
    marginTop: 10,
    padding: '10px 12px',
    fontSize: theme.font.body,
    fontFamily: 'inherit',
    color: theme.textPrimary,
    background: theme.bgTertiary,
    border: `1px solid ${theme.border}`,
    borderRadius: theme.radius.md,
    outline: 'none',
    resize: 'vertical',
    minHeight: 72,
    boxSizing: 'border-box',
    transition: `border-color ${theme.transition}`,
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle} onClick={() => setExpanded(!expanded)}>
        <div style={labelStyle}>
          {'\uD83D\uDCDD'} Day note
          {value && !expanded && (
            <span style={{ fontWeight: 400, color: theme.textTertiary, marginLeft: 4 }}>
              - {value.slice(0, 40)}{value.length > 40 ? '...' : ''}
            </span>
          )}
        </div>
        <span style={chevronStyle}>{'\u25BC'}</span>
      </div>
      {expanded && (
        <textarea
          style={textareaStyle}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          placeholder="Write a note for today..."
        />
      )}
    </div>
  );
}
