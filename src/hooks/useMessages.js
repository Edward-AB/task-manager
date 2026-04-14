import { useState, useEffect, useCallback, useRef } from 'react';
import { apiGet, apiPost } from '../api/client.js';

const POLL_UNREAD_MS = 15000;
const POLL_MESSAGES_MS = 5000;
const POLL_CONVS_MS = 10000;

export default function useMessages({ enabled = true, panelOpen = false, activeConversationId = null } = {}) {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const lastMessageIdRef = useRef(null);

  // Polls —
  //   1. unread total (always when enabled)
  //   2. conversations list (when panel open)
  //   3. active conversation new messages (when convo open)

  const fetchUnread = useCallback(async () => {
    try {
      const res = await apiGet('/api/messages/unread');
      setUnreadTotal(res?.data?.count || 0);
    } catch {}
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await apiGet('/api/messages/conversations');
      setConversations(res?.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load conversations');
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await apiGet('/api/messages/contacts');
      setContacts(res?.data || []);
    } catch {}
  }, []);

  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    try {
      setLoading(true);
      const res = await apiGet(`/api/messages/conversations/${conversationId}`);
      const msgs = res?.data || [];
      setMessages(msgs);
      lastMessageIdRef.current = msgs.length ? msgs[msgs.length - 1].id : null;
      // Re-fetch conversations so unread count refreshes
      fetchConversations();
      fetchUnread();
    } catch (e) {
      setError(e.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [fetchConversations, fetchUnread]);

  const loadMore = useCallback(async (conversationId) => {
    if (!conversationId || messages.length === 0) return;
    const oldest = messages[0];
    try {
      setLoadingMore(true);
      const res = await apiGet(
        `/api/messages/conversations/${conversationId}?before=${oldest.id}`
      );
      const older = res?.data || [];
      if (older.length) setMessages((m) => [...older, ...m]);
    } catch {}
    finally { setLoadingMore(false); }
  }, [messages]);

  const sendMessage = useCallback(async (conversationId, content) => {
    if (!content?.trim()) return;
    // Optimistic add
    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: 'self',
      content,
      created_at: Date.now(),
      _optimistic: true,
    };
    setMessages((m) => [...m, tempMsg]);

    try {
      const res = await apiPost(`/api/messages/conversations/${conversationId}`, { content });
      const real = res?.data;
      setMessages((m) => m.map((msg) => (msg.id === tempId ? real : msg)));
      lastMessageIdRef.current = real?.id || lastMessageIdRef.current;
      return real;
    } catch (e) {
      setMessages((m) => m.map((msg) => (msg.id === tempId ? { ...msg, _failed: true } : msg)));
      throw e;
    }
  }, []);

  const retrySend = useCallback(async (failedMessage) => {
    if (!failedMessage || !failedMessage._failed) return;
    const conversationId = failedMessage.conversation_id;
    const content = failedMessage.content;
    if (!conversationId || !content) return;
    // Mark as retrying (clear _failed, keep optimistic)
    setMessages((m) => m.map((msg) => (
      msg.id === failedMessage.id
        ? { ...msg, _failed: false, _optimistic: true }
        : msg
    )));
    try {
      const res = await apiPost(`/api/messages/conversations/${conversationId}`, { content });
      const real = res?.data;
      setMessages((m) => m.map((msg) => (msg.id === failedMessage.id ? real : msg)));
      lastMessageIdRef.current = real?.id || lastMessageIdRef.current;
      return real;
    } catch (e) {
      setMessages((m) => m.map((msg) => (
        msg.id === failedMessage.id ? { ...msg, _failed: true, _optimistic: false } : msg
      )));
      throw e;
    }
  }, []);

  const startConversation = useCallback(async (teamId, participantId) => {
    const res = await apiPost('/api/messages/conversations', { teamId, participantId });
    const data = res?.data;
    if (data?.id) {
      setConversations((prev) => {
        if (prev.some((c) => c.id === data.id)) return prev;
        // Enrich with other-user and team info from contacts if available
        const group = contacts.find((g) => g.teamId === teamId);
        const other = group?.members?.find((m) => m.id === participantId) || { id: participantId };
        return [
          {
            id: data.id,
            teamId,
            teamName: group?.teamName,
            teamColor: group?.teamColor,
            other,
            lastMessageAt: data.created_at || Date.now(),
            lastMessagePreview: '',
            lastSenderId: null,
            unreadCount: 0,
          },
          ...prev,
        ];
      });
    }
    fetchConversations();
    return data;
  }, [fetchConversations, contacts]);

  // Polling — unread total
  useEffect(() => {
    if (!enabled) return;
    fetchUnread();
    const t = setInterval(fetchUnread, POLL_UNREAD_MS);
    return () => clearInterval(t);
  }, [enabled, fetchUnread]);

  // Polling — conversations list when panel is open
  useEffect(() => {
    if (!enabled || !panelOpen) return;
    fetchConversations();
    fetchContacts();
    const t = setInterval(fetchConversations, POLL_CONVS_MS);
    return () => clearInterval(t);
  }, [enabled, panelOpen, fetchConversations, fetchContacts]);

  // Polling — active conversation new messages
  useEffect(() => {
    if (!enabled || !panelOpen || !activeConversationId) return;
    const id = activeConversationId;
    const poll = async () => {
      const lastId = lastMessageIdRef.current;
      if (!lastId) return;
      try {
        const res = await apiGet(
          `/api/messages/conversations/${id}?after=${lastId}`
        );
        const newMsgs = res?.data || [];
        if (newMsgs.length) {
          setMessages((m) => [...m, ...newMsgs]);
          lastMessageIdRef.current = newMsgs[newMsgs.length - 1].id;
          fetchUnread();
        }
      } catch {}
    };
    const t = setInterval(poll, POLL_MESSAGES_MS);
    return () => clearInterval(t);
  }, [enabled, panelOpen, activeConversationId, fetchUnread]);

  return {
    conversations,
    messages,
    contacts,
    unreadTotal,
    loading,
    loadingMore,
    error,
    fetchConversations,
    fetchMessages,
    fetchContacts,
    fetchUnread,
    sendMessage,
    retrySend,
    startConversation,
    loadMore,
  };
}
