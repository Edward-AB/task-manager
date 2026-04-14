import { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';
import { useMessaging } from '../../context/MessagingContext.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import ContactSidebar from './ContactSidebar.jsx';
import ConversationList from './ConversationList.jsx';
import ChatView from './ChatView.jsx';

export default function MessagingPanel() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const {
    panelOpen, closePanel,
    conversations,
    activeConversationId,
    messages, loading,
    sendMessage, retrySend, loadMore,
  } = useMessaging();

  const [showList, setShowList] = useState(true);

  // Close on escape
  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closePanel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panelOpen, closePanel]);

  if (!user) return null;

  const activeConv = conversations.find((c) => c.id === activeConversationId) || null;

  const handleSend = async (content) => {
    if (!activeConv) return;
    await sendMessage(activeConv.id, content);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closePanel}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.15)',
          opacity: panelOpen ? 1 : 0,
          pointerEvents: panelOpen ? 'auto' : 'none',
          transition: 'opacity 250ms ease',
          zIndex: 998,
        }}
      />
      {/* Drawer */}
      <aside
        aria-hidden={!panelOpen}
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: 'min(max(380px, 35vw), 480px)',
          background: theme.bg,
          borderLeft: `0.5px solid ${theme.border}`,
          boxShadow: panelOpen ? '-4px 0 24px rgba(0,0,0,0.10)' : 'none',
          transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 250ms ease',
          zIndex: 999,
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Panel header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 14px',
          borderBottom: `0.5px solid ${theme.border}`,
          background: theme.bg,
        }}>
          <span style={{
            fontSize: 14, fontWeight: 600, color: theme.textPrimary,
            flex: 1,
          }}>Messages</span>
          <button
            onClick={() => setShowList((v) => !v)}
            title={showList ? 'Hide conversations' : 'Show conversations'}
            style={{
              width: 26, height: 26, borderRadius: 6,
              border: `0.5px solid ${theme.border}`,
              background: theme.bgSecondary, color: theme.textSecondary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
              {showList ? (
                <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
              ) : (
                <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
              )}
            </svg>
          </button>
          <button
            onClick={closePanel}
            aria-label="Close"
            style={{
              width: 26, height: 26, borderRadius: 6,
              border: `0.5px solid ${theme.border}`,
              background: theme.bgSecondary, color: theme.textSecondary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 14,
            }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <ContactSidebar />
          {showList && !activeConv && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              minWidth: 0, minHeight: 0,
              background: theme.bg,
            }}>
              <ConversationList />
            </div>
          )}
          {activeConv && (
            <ChatView
              conversation={activeConv}
              messages={messages}
              onSend={handleSend}
              onRetry={retrySend}
              onLoadMore={loadMore}
              loading={loading}
            />
          )}
          {!activeConv && !showList && (
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 24, textAlign: 'center',
              color: theme.textTertiary, fontSize: 11,
            }}>
              Select a conversation
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
