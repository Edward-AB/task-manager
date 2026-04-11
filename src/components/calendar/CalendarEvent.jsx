import { useTheme } from '../../hooks/useTheme.js';
import { slotToTime } from '../../utils/slots.js';
import { SLOT_HEIGHT, CALENDAR_LABEL_WIDTH } from '../../constants';

const DEFAULT_COLOR = '#6366f1';

export default function CalendarEvent({ event, column, totalColumns }) {
  const { theme } = useTheme();

  const eventColor = event.color || DEFAULT_COLOR;

  const top = event.start_slot * SLOT_HEIGHT;
  const height = Math.max((event.end_slot - event.start_slot) * SLOT_HEIGHT, SLOT_HEIGHT);
  const colWidth = totalColumns > 0 ? (100 / totalColumns) : 100;
  const left = `calc(${CALENDAR_LABEL_WIDTH}px + ${column * colWidth}%)`;
  const width = `calc(${colWidth}% - 4px)`;

  const timeStr = slotToTime(event.start_slot);

  const pillStyle = {
    position: 'absolute',
    top,
    left,
    width,
    height: height - 2,
    background: `${eventColor}d9`, // ~0.85 opacity via hex alpha
    border: `1px solid ${eventColor}60`,
    borderLeft: `3px solid ${eventColor}`,
    borderRadius: theme.radius.md,
    padding: '2px 6px',
    fontSize: theme.font.label,
    color: '#fff',
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    zIndex: 6,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 4,
    transition: `opacity ${theme.transition}`,
  };

  return (
    <div
      style={pillStyle}
      title={`${event.title} (${timeStr} - ${slotToTime(event.end_slot)})`}
    >
      <svg width={10} height={10} viewBox="0 0 14 14" fill="none" style={{ opacity: 0.8, flexShrink: 0 }}>
        <rect x="1" y="2" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M1 5.5h12" stroke="currentColor" strokeWidth="1"/>
      </svg>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {event.title}
      </span>
    </div>
  );
}
