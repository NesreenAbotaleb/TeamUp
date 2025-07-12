import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { chatAPI } from '../../servies/Chat/chatAPI';
import { socketHandlers, initializeSocket, disposeSocket } from '../../servies/Chat/socketHandlers';

export const useTeamChat = (teamId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isConnected, setIsConnected] = useState(false);

  // Use refs to prevent stale closures
  const currentTeamId = useRef(teamId);
  const messagesRef = useRef(messages);
  const socketInitialized = useRef(false);

  // Update refs when values change
  useEffect(() => {
    currentTeamId.current = teamId;
  }, [teamId]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  const messagesMap = useMemo(() => {
    const map = new Map();
    messages.forEach(msg => map.set(msg._id || msg.id, msg));
    return map;
  }, [messages]);

  // Load initial messages
  const loadMessages = useCallback(async () => {
    if (!teamId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await chatAPI.getMessages(teamId);
      console.log('📥 Initial messages loaded:', data.messages?.length || 0);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('❌ Failed to load messages:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  // Send message
  const sendMessage = useCallback(async (content, attachments = null, replyTo = null) => {
    if (!content && !attachments?.images?.length && !attachments?.files?.length) return;

    // Check if socket is connected before sending
    if (!socketHandlers.isConnected()) {
      setError('Cannot send message: Not connected to chat server');
      throw new Error('Socket not connected');
    }

    // Validate teamId
    if (!teamId) {
      setError('Invalid team ID');
      throw new Error('Team ID is required');
    }

    try {
      setLoading(true);
      console.log('📤 Sending message via API...', { teamId, content, attachments });

      const result = await chatAPI.sendMessage(teamId, content, attachments, replyTo);
      console.log('✅ Message sent via API:', result);

      return result;
    } catch (err) {
      console.error('❌ Failed to send message:', err);
      setError(err.message || 'Failed to send message');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  // Edit message
  const editMessage = useCallback(async (messageId, content, img = null, file = null) => {
    try {
      console.log('✏️ Editing message:', messageId);
      await chatAPI.editMessage(messageId, content, img, file);
    } catch (err) {
      console.error('❌ Failed to edit message:', err);
      setError(err.message || 'Failed to edit message');
      throw err;
    }
  }, []);

  // Delete message
  const deleteMessage = useCallback(async (messageId) => {
    try {
      console.log('🗑️ Deleting message:', messageId);
      await chatAPI.deleteMessage(messageId);
      // Message will be removed via socket event
    } catch (err) {
      console.error('❌ Failed to delete message:', err);
      setError(err.message || 'Failed to delete message');
      throw err;
    }
  }, []);

  // Initialize socket connection
  useEffect(() => {
    if (!teamId || socketInitialized.current) return;

    console.log('🚀 Initializing socket for team:', teamId);

    // Enhanced message handlers with better debugging and error handling
    const handleNewMessage = (data) => {
      console.log('📨 Raw new message data received:', data);

      // Handle both formats: direct message object or data with message property
      const message = data.message || data;

      if (!message) {
        console.warn('⚠️ No message found in new message event');
        return;
      }

      console.log('📨 Processing new message:', message);

      // More flexible team ID checking
      const messageTeamId = message.teamId || message.team_id || message.team || message.teamCode;
      const currentTeam = currentTeamId.current;

      console.log('🔍 Team comparison:', { messageTeamId, currentTeam, messageData: message });

      // Allow messages without team ID for backward compatibility or if teams match
      if (!messageTeamId || messageTeamId === currentTeam || messageTeamId.toString() === currentTeam?.toString()) {
        setMessages(prev => {
          console.log('📊 Current messages count before add:', prev.length);

          // Prevent duplicate messages using multiple ID fields
          const messageId = message._id || message.id;
          const messageExists = prev.some(msg =>
            (msg._id && msg._id === messageId) ||
            (msg.id && msg.id === messageId) ||
            // Also check by content and timestamp as fallback
            (msg.content === message.content &&
              Math.abs(new Date(msg.createdAt || msg.timestamp || msg.date) - new Date(message.createdAt || message.timestamp || message.date)) < 1000)
          );

          if (messageExists) {
            console.log('⚠️ Message already exists, skipping duplicate');
            return prev;
          }

          console.log('✅ Adding new message to state');
          const newMessages = [...prev, message];

          // Sort by timestamp (handle multiple timestamp field names)
          return newMessages.sort((a, b) => {
            const aTime = new Date(a.createdAt || a.timestamp || a.date || 0);
            const bTime = new Date(b.createdAt || b.timestamp || b.date || 0);
            return aTime - bTime;
          });
        });
      } else {
        console.log('❌ Message not for current team, ignoring', { messageTeamId, currentTeam });
      }
    };

    const handleMessageUpdate = (data) => {
      console.log('✏️ Raw message update data received:', data);

      const updatedMessage = data.updatedMessage || data.message || data;
      const messageId = data.messageId || data.id || updatedMessage?._id || updatedMessage?.id;

      if (!messageId) {
        console.warn('⚠️ No message ID found in update event');
        return;
      }

      console.log('✏️ Processing message update:', { updatedMessage, messageId });

      setMessages(prev => {
        const updated = prev.map(msg => {
          const msgId = msg._id || msg.id;
          if (msgId === messageId) {
            console.log('✅ Updating message in state:', msgId);
            return { ...msg, ...updatedMessage };
          }
          return msg;
        });
        return updated;
      });
    };

    const handleMessageDelete = (data) => {
      console.log('🗑️ Raw message delete data received:', data);

      const messageId = data.messageId || data.id;

      if (!messageId) {
        console.warn('⚠️ No message ID found in delete event');
        return;
      }

      console.log('🗑️ Processing message delete:', messageId);

      setMessages(prev => {
        const filtered = prev.filter(msg => {
          const msgId = msg._id || msg.id;
          return msgId !== messageId;
        });
        console.log('✅ Message deleted from state, remaining:', filtered.length);
        return filtered;
      });
    };

    // Initialize socket with handlers
    const socket = initializeSocket(teamId, handleNewMessage, handleMessageUpdate, handleMessageDelete);

    if (socket) {
      socketInitialized.current = true;

      // Set up additional event listeners with better error handling
      socket.on('connect', () => {
        console.log('✅ Socket connected successfully');
        setConnectionStatus('connected');
        setIsConnected(true);
        setError(null);

        // Force rejoin team chat on connect
        setTimeout(() => {
          console.log('🚪 Force rejoining team chat after connect');
          socketHandlers.joinTeamChat(teamId);
        }, 100);
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        setConnectionStatus('disconnected');
        setIsConnected(false);

        // Only show error for unexpected disconnections
        if (reason !== 'io client disconnect') {
          setError('Connection lost. Attempting to reconnect...');
        }
      });

      socket.on('connect_error', (error) => {
        console.error('🚫 Socket connection error:', error);
        setConnectionStatus('error');
        setIsConnected(false);
        setError('Connection error: ' + error.message);
      });

      socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
        setConnectionStatus('connected');
        setIsConnected(true);
        setError(null);

        // Rejoin the team chat after reconnection with delay
        setTimeout(() => {
          console.log('🚪 Rejoining team chat after reconnection');
          socketHandlers.joinTeamChat(teamId);
          // Refresh messages after reconnection
          loadMessages();
        }, 500);
      });

      socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 Reconnection attempt', attemptNumber);
        setConnectionStatus('reconnecting');
        setIsConnected(false);
      });

      // Add error event listener
      socket.on('error', (error) => {
        console.error('🚫 Socket error:', error);
        setError('Socket error: ' + error.message);
      });

      // Set initial connection status
      setConnectionStatus('connecting');



      // Cleanup function
      return () => {

        if (socket) {
          socket.off('connect');
          socket.off('disconnect');
          socket.off('connect_error');
          socket.off('reconnect');
          socket.off('reconnect_attempt');
          socket.off('error');
        }

        socketHandlers.leaveTeamChat(teamId);
        disposeSocket();
        socketInitialized.current = false;
      };
    } else {
      console.error('❌ Failed to initialize socket');
      setError('Failed to initialize chat connection');
    }
  }, [teamId, loadMessages]); // Add loadMessages to dependency array
  const replyToMessage = useCallback(async (originalMessageId, replyContent, attachments = null) => {
    try {
      if (!originalMessageId || !replyContent) {
        throw new Error('Original message ID and reply content are required');
      }

      const result = await chatAPI.replyToMessage(originalMessageId, replyContent, attachments);
      console.log("✅ Reply sent successfully:", result);
      return result;
    } catch (err) {
      console.error("❌ Failed to send reply:", err);
      setError(err.message || "Failed to reply to message");
      throw err;
    }
  }, []);
  // Load messages on mount and when teamId changes
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Manual reconnection function
  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnection triggered');
    setError(null);
    setConnectionStatus('connecting');

    // Reset socket initialization flag
    socketInitialized.current = false;

    // Dispose current socket and reinitialize
    disposeSocket();

    // Small delay before reinitializing
    setTimeout(() => {
      socketInitialized.current = false;
      // The useEffect will handle reinitialization
    }, 500);
  }, []);

  return {
    messages,
    messagesMap,
    loading,
    error,
    connectionStatus,
    isConnected,
    sendMessage,
    editMessage,
    deleteMessage,
    refreshMessages: loadMessages,
    replyToMessage,
  };
};