import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import useMessages from '../hooks/useMessages.js';
import { useAuth } from '../hooks/useAuth.js';

const MessagingContext = createContext(null);

export function MessagingProvider({ children }) {
  const { user } = useAuth();
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);

  const messages = useMessages({
    enabled: !!user,
    panelOpen,
    activeConversationId,
  });

  const togglePanel = useCallback(() => setPanelOpen((o) => !o), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);
  const openPanel = useCallback(() => setPanelOpen(true), []);

  const openConversation = useCallback(async (conversationId) => {
    setActiveConversationId(conversationId);
    setPanelOpen(true);
    if (conversationId) await messages.fetchMessages(conversationId);
  }, [messages]);

  const startAndOpen = useCallback(async (teamId, participantId) => {
    const conv = await messages.startConversation(teamId, participantId);
    if (conv?.id) await openConversation(conv.id);
    return conv;
  }, [messages, openConversation]);

  const value = useMemo(() => ({
    ...messages,
    panelOpen,
    activeConversationId,
    togglePanel,
    openPanel,
    closePanel,
    openConversation,
    startAndOpen,
  }), [messages, panelOpen, activeConversationId, togglePanel, openPanel, closePanel, openConversation, startAndOpen]);

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const ctx = useContext(MessagingContext);
  if (!ctx) throw new Error('useMessaging must be used within MessagingProvider');
  return ctx;
}
