import { useEffect, useState, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import { useMessaging } from '../../context/MessagingContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { Avatar } from '../teams/MemberAvatarStack.jsx';

export default function NewMessageToast() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { conversations = [], panelOpen, openConversation } = useMessaging();
  const [toast, setToast] = useState(null);
  const seenUnreadRef = useRef(new Map()); // convId -> unread count snapshot
  const hideTimerRef = useRef(null);

  useEffect(() => {
    if (!user || panelOpen) {
      // Reset baseline to avoid firing on reopen
      const map = new Map();
      conversations.forEach((c) => map.set(c.id, c.unreadCount || 0));
      seenUnreadRef.current = map;
      return;
    }

    // Look for conversations whose unread_count has grown since last seen
    let highest = null;
    for (const c of conversations) {
      const prev = seenUnreadRef.current.get(c.id) ?? 0;
      const curr = c.unreadCount || 0;
      if (curr > prev) {
        // Choose the most recently active conversation
        if (!highest || (c.lastMessageAt || 0) > (highest.lastMessageAt || 0)) {
          highest = c;
        }
      }
    }

    if (highest) {
      setToast({
        id: highest.id,
        other: highest.other,
        preview: highest.lastMessagePreview,
        teamName: highest.teamName,
        teamColor: highest.teamColor,
      });
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => setToast(null), 4500);
    }

    // Update baseline snapshot
    const map = new Map();
    conversations.forEach((c) => map.set(c.id, c.unreadCount || 0));
    seenUnreadRef.current = map;
  }, [conversations, user, panelOpen]);

  useEffect(() => () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, []);

  if (!toast) return null;

  const handleClick = () => {
    openConversation(toast.id);
    setToast(null);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        right: 16, bottom: 16,
        width: 300,
        background: theme.bg,
        border: `0.5px solid ${theme.border}`,
        borderRadius: 14,
        boxShadow: '0 8px 28px rgba(0,0,0,0.16)',
        padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
        cursor: 'pointer',
        zIndex: 1000,
        animation: 'slide-in 250ms ease',
        fontFamily: 'inherit',
      }}
    >
      <Avatar user={toast.other} size={32} ring={false} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: theme.textPrimary,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          @{toast.other?.username}
          {toast.teamName && (
            <span style={{
              fontSize: 9, fontWeight: 400,
              marginLeft: 6, color: theme.textTertiary,
            }}>· {toast.teamName}</span>
          )}
        </div>
        <div style={{
          fontSize: 11, color: theme.textSecondary, marginTop: 2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{toast.preview}</div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); setToast(null); }}
        aria-label="Dismiss"
        style={{
          width: 20, height: 20, border: 'none', background: 'transparent',
          color: theme.textTertiary, cursor: 'pointer',
          fontSize: 14, lineHeight: 1,
        }}
      >×</button>
      <style>{`
        @keyframes slide-in {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
