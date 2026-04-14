import { useTheme } from '../../hooks/useTheme.js';
import { useMessaging } from '../../context/MessagingContext.jsx';
import { Avatar } from '../teams/MemberAvatarStack.jsx';

function relativeTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function ConversationList() {
  const { theme } = useTheme();
  const { conversations = [], activeConversationId, openConversation } = useMessaging();

  if (!conversations.length) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, textAlign: 'center',
        color: theme.textTertiary, fontSize: 11,
      }}>
        No conversations yet. Click an avatar on the left to start one.
      </div>
    );
  }

  return (
    <div style={{
      flex: 1, overflowY: 'auto',
      padding: '6px 0',
    }}>
      {conversations.map((c) => {
        const isActive = c.id === activeConversationId;
        const unread = c.unreadCount || 0;
        return (
          <button
            key={c.id}
            onClick={() => openConversation(c.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '10px 14px',
              border: 'none',
              background: isActive ? theme.accentBg : 'transparent',
              cursor: 'pointer', fontFamily: 'inherit',
              textAlign: 'left',
              transition: 'background 150ms ease',
            }}
          >
            <Avatar user={c.other} size={32} ring={false} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                justifyContent: 'space-between',
              }}>
                <span style={{
                  fontSize: 12, fontWeight: unread > 0 ? 600 : 500,
                  color: isActive ? theme.accentText : theme.textPrimary,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>@{c.other?.username}</span>
                <span style={{
                  fontSize: 9, color: isActive ? theme.accentText : theme.textTertiary,
                  flexShrink: 0,
                }}>{relativeTime(c.lastMessageAt)}</span>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                marginTop: 2,
              }}>
                <span style={{
                  flex: 1, minWidth: 0,
                  fontSize: 11,
                  color: isActive ? theme.accentText : (unread > 0 ? theme.textPrimary : theme.textSecondary),
                  fontWeight: unread > 0 ? 500 : 400,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{c.lastMessagePreview || '—'}</span>
                {unread > 0 && (
                  <span style={{
                    minWidth: 16, height: 16, padding: '0 4px',
                    borderRadius: 8, background: theme.danger, color: '#fff',
                    fontSize: 9, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>{unread > 9 ? '9+' : unread}</span>
                )}
              </div>
              {c.teamName && (
                <div style={{
                  fontSize: 9, color: isActive ? theme.accentText : theme.textTertiary,
                  marginTop: 2,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: c.teamColor || theme.accent,
                  }} />
                  {c.teamName}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
