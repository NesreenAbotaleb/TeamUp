import { io } from "socket.io-client";
import api from "./../../api/API";

// Global socket instance
let socket = null;
let currentRoom = null;
let connectionAttempts = 0;

const DEBUG = true; // Set to false in production

const log = (message, data = '') => {
  if (DEBUG) {
    console.log(`[SOCKET DEBUG] ${message}`, data);
  }
};

// Initialize Socket connection
export const initializeSocket = (teamId, onNewMessage, onUpdateMessage, onDeleteMessage) => {
  if (socket) {
    log('🔄 Disposing existing socket before creating new one');
    socket.disconnect();
    socket = null;
  }

  log('🚀 Initializing new socket connection');
  
  socket = io(api, { 
    transports: ['websocket', 'polling'], // Allow fallback to polling
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000
  });

  socket.on('connect', () => {
    log('✅ Connected to Socket.IO server');
    connectionAttempts = 0;
    
    // Join the team chat room immediately after connection
    if (teamId) {
      socket.emit('join-team-chat', teamId);
      log(`🚪 Joined team chat: ${teamId}`);
    }
  });

  socket.on('new-message', (data) => {
    log('📨 Received new message event:', data);
    if (onNewMessage) {
      // Pass the entire data object to let the handler decide how to process it
      onNewMessage(data);
    }
  });

  socket.on('message-updated', (data) => {
    log('✏️ Received message update event:', data);
    if (onUpdateMessage) {
      // Pass the entire data object to let the handler decide how to process it
      onUpdateMessage(data);
    }
  });

  socket.on('message-deleted', (data) => {
    log('🗑️ Received message delete event:', data);
    if (onDeleteMessage) {
      // Pass the entire data object to let the handler decide how to process it
      onDeleteMessage(data);
    }
  });

  socket.on('disconnect', (reason) => {
    log('❌ Socket disconnected, reason:', reason);
  });

  socket.on('connect_error', (error) => {
    log('🚫 Connection error:', error);
    connectionAttempts++;
  });

  socket.on('reconnect', (attemptNumber) => {
    log('🔄 Reconnected after attempts:', attemptNumber);
    connectionAttempts = 0;
    
    // Rejoin team chat after reconnection
    if (teamId) {
      socket.emit('join-team-chat', teamId);
      log(`🚪 Rejoined team chat after reconnection: ${teamId}`);
    }
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    log('🔄 Reconnection attempt:', attemptNumber);
  });

  socket.on('reconnect_error', (error) => {
    log('🚫 Reconnection error:', error);
  });

  socket.on('reconnect_failed', () => {
    log('❌ Reconnection failed after all attempts');
  });

  return socket;
};

export const disposeSocket = () => {
  if (socket) {
    log('🧹 Disposing socket connection');
    socket.disconnect();
    socket = null;
    currentRoom = null;
    connectionAttempts = 0;
  }
};

export const socketHandlers = {
  // Get socket instance
  getSocket() {
    return socket;
  },

  isConnected() {
    const connected = socket && socket.connected;
    log('🔍 Connection status check:', connected);
    return connected;
  },

  getSocketId() {
    return socket ? socket.id : null;
  },

  joinTeamChat(teamId) {
    if (!teamId) {
      log('❌ Cannot join chat - no teamId provided');
      return;
    }

    if (!socket) {
      log('⚠️ Socket not initialized');
      return;
    }

    if (!socket.connected) {
      log('⚠️ Socket not connected, cannot join team chat');
      return;
    }

    const roomName = `team-${teamId}`;
    log(`🚪 Attempting to join room: ${roomName}`);

    if (currentRoom && currentRoom !== roomName) {
      log(`🚪 Leaving current room: ${currentRoom}`);
      socket.emit('leave-room', currentRoom);
    }

    currentRoom = roomName;

    // Use the join-team-chat event as in your original code
    socket.emit('join-team-chat', teamId);
    
    // Optional: Also emit join-room for additional room management
    socket.emit('join-room', roomName, (ack) => {
      log('📋 Join room acknowledgment:', ack);
    });

    // Test connection
    socket.emit('echo-test', {
      message: 'Testing connection after join',
      timestamp: Date.now(),
      room: roomName
    }, (response) => {
      log('🔊 Echo test response after join:', response);
    });
  },

  leaveTeamChat(teamId) {
    if (!socket || !teamId) return;

    const roomName = `team-${teamId}`;
    log(`🚪 Leaving room: ${roomName}`);

    if (socket.connected) {
      socket.emit('leave-room', roomName);
    }

    if (currentRoom === roomName) {
      currentRoom = null;
    }
  },

  // Send a message
  sendMessage(teamId, message, callback) {
    if (!socket || !socket.connected) {
      log('⚠️ Cannot send message - socket not connected');
      const error = new Error('Socket not connected');
      if (callback) callback({ error: error.message });
      return Promise.reject(error);
    }

    return new Promise((resolve, reject) => {
      socket.emit('send-message', { teamId, message }, (response) => {
        log('✉️ Message sent response:', response);
        if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
        if (callback) callback(response);
      });
    });
  },

  // Update a message
  updateMessage(messageId, updatedContent, callback) {
    if (!socket || !socket.connected) {
      log('⚠️ Cannot update message - socket not connected');
      const error = new Error('Socket not connected');
      if (callback) callback({ error: error.message });
      return Promise.reject(error);
    }

    return new Promise((resolve, reject) => {
      socket.emit('update-message', { messageId, updatedContent }, (response) => {
        log('✏️ Message updated response:', response);
        if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
        if (callback) callback(response);
      });
    });
  },

  // Delete a message
  deleteMessage(messageId, callback) {
    if (!socket || !socket.connected) {
      log('⚠️ Cannot delete message - socket not connected');
      const error = new Error('Socket not connected');
      if (callback) callback({ error: error.message });
      return Promise.reject(error);
    }

    return new Promise((resolve, reject) => {
      socket.emit('delete-message', { messageId }, (response) => {
        log('🗑️ Message deleted response:', response);
        if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
        if (callback) callback(response);
      });
    });
  },

  // Get messages from server
  getMessages(teamId, callback) {
    if (!socket || !socket.connected) {
      log('⚠️ Cannot get messages - socket not connected');
      const error = new Error('Socket not connected');
      if (callback) callback({ error: error.message });
      return Promise.reject(error);
    }

    return new Promise((resolve, reject) => {
      socket.emit('get-messages', { teamId }, (response) => {
        log('📜 Fetched messages response:', response);
        if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
        if (callback) callback(response);
      });
    });
  },

  // Event listener helpers
  onNewMessage(callback) {
    if (!socket) return;
    socket.off('new-message');
    socket.on('new-message', callback);
  },

  onMessageUpdated(callback) {
    if (!socket) return;
    socket.off('message-updated');
    socket.on('message-updated', callback);
  },

  onMessageDeleted(callback) {
    if (!socket) return;
    socket.off('message-deleted');
    socket.on('message-deleted', callback);
  },

  onConnect(callback) {
    if (!socket) return;
    socket.off('connect');
    socket.on('connect', callback);
  },

  onDisconnect(callback) {
    if (!socket) return;
    socket.off('disconnect');
    socket.on('disconnect', callback);
  },

  onConnectError(callback) {
    if (!socket) return;
    socket.off('connect_error');
    socket.on('connect_error', callback);
  },

  onReconnect(callback) {
    if (!socket) return;
    socket.off('reconnect');
    socket.on('reconnect', callback);
  },

  removeListener(event) {
    if (socket) {
      log(`🔇 Removing listener for: ${event}`);
      socket.off(event);
    }
  },

  reconnect() {
    log('🔄 Manual reconnection triggered');
    if (socket) {
      socket.disconnect();
      setTimeout(() => {
        socket.connect();
      }, 1000);
    } else {
      log('⚠️ No socket to reconnect');
    }
  },

  disconnect() {
    log('🔌 Disconnecting socket');
    disposeSocket();
  },

  getConnectionInfo() {
    return {
      connected: socket?.connected || false,
      socketId: socket?.id || null,
      currentRoom,
      transport: socket?.io?.engine?.transport?.name || null,
      connectionAttempts
    };
  },

  testConnection() {
    if (!socket || !socket.connected) {
      log('❌ Cannot test - socket not connected');
      return Promise.reject('Socket not connected');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject('Ping timeout');
      }, 5000);

      socket.emit('ping', Date.now(), (response) => {
        clearTimeout(timeout);
        log('🏓 Ping response:', response);
        resolve(response);
      });
    });
  }
};