import { useTheme } from '../../hooks/useTheme.js';
import { useMessaging } from '../../context/MessagingContext.jsx';
import { Avatar } from '../teams/MemberAvatarStack.jsx';

export default function ContactSidebar() {
  const { theme } = useTheme();
  const { contacts = [], conversations = [], startAndOpen, openConversation, activeConversationId } = useMessaging();

  // Build a lookup from (teamId, userId) to conversation
  const convByPair = new Map();
  conversations.forEach((c) => {
    if (c.teamId && c.other?.id) {
      convByPair.set(`${c.teamId}:${c.other.id}`, c);
    }
  });

  const handleClick = async (teamId, member) => {
    const key = `${teamId}:${member.id}`;
    const existing = convByPair.get(key);
    if (existing) {
      openConversation(existing.id);
    } else {
      await startAndOpen(teamId, member.id);
    }
  };

  if (!contacts.length) {
    return (
      <div style={{
        width: 64, minWidth: 64,
        borderRight: `0.5px solid ${theme.border}`,
        background: theme.bgSecondary,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        padding: '14px 0',
        overflowY: 'auto',
        scrollbarWidth: 'none',
      }}>
        <div style={{
          fontSize: 9, color: theme.textTertiary,
          textAlign: 'center', padding: '0 6px',
          lineHeight: 1.3,
        }}>
          No team mates yet
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: 64, minWidth: 64,
      borderRight: `0.5px solid ${theme.border}`,
      background: theme.bgSecondary,
      display: 'flex', flexDirection: 'column',
      padding: '10px 0',
      overflowY: 'auto',
      scrollbarWidth: 'none',
    }}>
      {contacts.map((group, gi) => (
        <div key={group.teamId || gi} style={{ marginBottom: 14 }}>
          {/* Team color strip + initial */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 8px', marginBottom: 6,
          }} title={group.teamName}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: group.teamColor || theme.accent,
            }} />
          </div>
          {/* Member avatars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
            {(group.members || []).map((m) => {
              const key = `${group.teamId}:${m.id}`;
              const conv = convByPair.get(key);
              const isActive = conv && conv.id === activeConversationId;
              const unread = conv?.unreadCount || 0;
              return (
                <button
                  key={m.id}
                  onClick={() => handleClick(group.teamId, m)}
                  title={`@${m.username}`}
                  style={{
                    position: 'relative',
                    width: 40, height: 40,
                    padding: 0, border: 'none', background: 'transparent',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isActive ? `0 0 0 2px ${theme.accent}` : 'none',
                    transition: 'box-shadow 150ms ease',
                  }}
                >
                  <Avatar user={m} size={36} ring={false} />
                  {unread > 0 && (
                    <span style={{
                      position: 'absolute', top: -2, right: -2,
                      minWidth: 14, height: 14, padding: '0 3px',
                      borderRadius: 7, background: theme.danger, color: '#fff',
                      fontSize: 8, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `1.5px solid ${theme.bgSecondary}`,
                    }}>{unread > 9 ? '9+' : unread}</span>
                  )}
                </button>
              );
            })}
          </div>
          {gi < contacts.length - 1 && (
            <div style={{
              height: 0.5, background: theme.border,
              margin: '10px 12px 0',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}
