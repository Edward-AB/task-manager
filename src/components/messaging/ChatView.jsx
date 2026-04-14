import { useRef, useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import { useAuth } from '../../hooks/useAuth.js';
import MessageBubble from './MessageBubble.jsx';
import DateSeparator from './DateSeparator.jsx';
import MessageInput from './MessageInput.jsx';
import RoleBadge from '../teams/RoleBadge.jsx';
import { Avatar } from '../teams/MemberAvatarStack.jsx';

function groupKey(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toISOString().slice(0, 10);
}
function groupLabel(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ChatView({ conversation, messages = [], onSend, onRetry, onLoadMore, loading }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showNewBtn, setShowNewBtn] = useState(false);
  const prevLenRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNew = messages.length > prevLenRef.current;
    if (isNew && autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShowNewBtn(false);
    } else if (isNew && !autoScroll) {
      setShowNewBtn(true);
    }
    prevLenRef.current = messages.length;
  }, [messages, autoScroll]);

  // Initial scroll to bottom on conversation change
  useEffect(() => {
    if (conversation?.id) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 0);
      setAutoScroll(true);
      setShowNewBtn(false);
    }
  }, [conversation?.id]);

  const handleScroll = (e) => {
    const el = e.currentTarget;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAutoScroll(dist < 80);
    if (el.scrollTop < 60) {
      onLoadMore?.(conversation?.id);
    }
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setAutoScroll(true);
    setShowNewBtn(false);
  };

  if (!conversation) {
    return (
      <EmptyConversation />
    );
  }

  const other = conversation.other;

  // Build list with date separators
  let lastKey = null;
  const rendered = [];
  messages.forEach((m, i) => {
    const key = groupKey(m.created_at);
    if (key !== lastKey) {
      rendered.push(<DateSeparator key={`sep-${key}-${i}`} label={groupLabel(m.created_at)} />);
      lastKey = key;
    }
    const isSelf = m.sender_id === user?.id || m.sender_id === 'self';
    const isLastSelfMessage = isSelf && i === messages.length - 1;
    rendered.push(
      <MessageBubble key={m.id} message={m} isSelf={isSelf}
        showReadReceipt={isLastSelfMessage}
        onRetry={onRetry} />
    );
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px',
        borderBottom: `0.5px solid ${theme.border}`,
        background: theme.bg,
      }}>
        <Avatar user={other} size={24} ring={false} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 500, color: theme.textPrimary,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>@{other?.username}</div>
        </div>
        {conversation.teamName && (
          <span style={{
            fontSize: 9, padding: '1px 6px', borderRadius: 20,
            background: theme.bgSecondary, color: theme.textSecondary,
            border: `0.5px solid ${theme.border}`,
          }}>
            <span style={{
              display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
              background: conversation.teamColor || theme.accent,
              marginRight: 4, verticalAlign: 'middle',
            }} />
            {conversation.teamName}
          </span>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} style={{
        flex: 1, overflowY: 'auto',
        padding: '8px 14px',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
        background: theme.bg,
      }}>
        {loading && messages.length === 0 && (
          <div style={{ fontSize: 11, color: theme.textTertiary, textAlign: 'center', padding: 20 }}>
            Loading messages…
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div style={{ fontSize: 11, color: theme.textTertiary, textAlign: 'center', padding: 20 }}>
            No messages yet. Say hi!
          </div>
        )}
        {rendered}
        <div ref={bottomRef} />
      </div>

      {showNewBtn && (
        <button onClick={scrollToBottom} style={{
          position: 'absolute', bottom: 76, right: 16,
          background: theme.accentBtn, color: theme.accentBtnText,
          border: 'none', borderRadius: 20,
          padding: '6px 12px', fontSize: 11, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>New message ↓</button>
      )}

      <MessageInput onSend={onSend} />
    </div>
  );
}

function EmptyConversation() {
  const { theme } = useTheme();
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, textAlign: 'center',
      color: theme.textTertiary,
    }}>
      <svg width={44} height={44} viewBox="0 0 32 32" fill="none" style={{ marginBottom: 12, opacity: 0.6 }}>
        <path d="M4 8a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-9l-5 4v-4H7a3 3 0 0 1-3-3V8z"
          stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round"/>
      </svg>
      <div style={{ fontSize: 13, fontWeight: 500, color: theme.textSecondary }}>Select a conversation</div>
      <div style={{ fontSize: 11, marginTop: 4 }}>Click a team member to start chatting.</div>
    </div>
  );
}
