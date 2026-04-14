import { useTheme } from '../../hooks/useTheme.js';
import { useMessaging } from '../../context/MessagingContext.jsx';

export default function MessagingButton() {
  const { theme } = useTheme();
  const { unreadTotal, panelOpen, togglePanel } = useMessaging();

  const badgeLabel = unreadTotal > 9 ? '9+' : String(unreadTotal);

  return (
    <button
      onClick={togglePanel}
      aria-label="Messages"
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32, borderRadius: '50%',
        border: `0.5px solid ${theme.headerBorder}`,
        background: panelOpen ? theme.accentBg : 'rgba(0,0,0,0.06)',
        color: panelOpen ? theme.accentText : theme.headerText,
        cursor: 'pointer', transition: `background ${theme.transition}`,
      }}
    >
      <svg width={14} height={14} viewBox="0 0 16 16" fill="none">
        <path d="M2 4.5a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 12 4.5V8a1.5 1.5 0 0 1-1.5 1.5H6L3.5 11.5V9.5a1.5 1.5 0 0 1-1.5-1.5V4.5z" stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round"/>
        <path d="M6 7h5M6 5.5h3" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round"/>
      </svg>
      {unreadTotal > 0 && (
        <span style={{
          position: 'absolute', top: -2, right: -2,
          minWidth: 14, height: 14, padding: '0 3px',
          borderRadius: 7, background: theme.danger, color: '#fff',
          fontSize: 8, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${theme.headerBg}`,
        }}>{badgeLabel}</span>
      )}
    </button>
  );
}
