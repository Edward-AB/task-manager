import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import { slotToTime } from '../../utils/slots.js';

const DEFAULT_COLOR = '#6366f1';

export default function EventItem({ event, onEdit, onDelete }) {
  const { theme } = useTheme();
  const [hover, setHover] = useState(false);

  const eventColor = event.color || DEFAULT_COLOR;

  const timeRange =
    event.start_slot != null && event.end_slot != null
      ? `${slotToTime(event.start_slot)} - ${slotToTime(event.end_slot)}`
      : null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '8px 10px',
        borderRadius: theme.radius.md,
        background: `${eventColor}12`,
        borderLeft: `3px solid ${eventColor}`,
        transition: `box-shadow ${theme.transition}`,
        boxShadow: hover ? theme.shadow.sm : 'none',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Icon */}
      <svg width={12} height={12} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
        <rect x="1" y="2" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M1 5.5h12" stroke="currentColor" strokeWidth="1"/>
        <line x1="4" y1="1" x2="4" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="10" y1="1" x2="10" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: theme.font.body,
          color: theme.textPrimary,
          fontWeight: 500,
        }}>
          {event.title}
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          {timeRange && (
            <span style={{
              fontSize: 9,
              padding: '1px 6px',
              borderRadius: theme.radius.full,
              background: `${eventColor}20`,
              color: eventColor,
              border: `0.5px solid ${eventColor}40`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontWeight: 500,
            }}>
              {timeRange}
            </span>
          )}
          {event.date && (
            <span style={{ fontSize: 9, color: theme.textTertiary }}>{event.date}</span>
          )}
        </div>

        {event.description && (
          <div style={{
            fontSize: theme.font.label,
            color: theme.textTertiary,
            marginTop: 4,
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {event.description}
          </div>
        )}
      </div>

      {/* Actions (visible on hover) */}
      {hover && (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {onEdit && (
            <button
              onClick={() => onEdit(event)}
              title="Edit"
              style={{
                width: 24,
                height: 24,
                borderRadius: theme.radius.sm,
                fontSize: 11,
                color: theme.textTertiary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `0.5px solid ${theme.border}`,
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              {'\u270E'}
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(event.id)}
              title="Delete"
              style={{
                width: 24,
                height: 24,
                borderRadius: theme.radius.sm,
                fontSize: 11,
                color: theme.danger,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `0.5px solid ${theme.danger}40`,
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              {'\u00D7'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
