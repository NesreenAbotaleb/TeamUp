import React, { useState, useEffect, useCallback, useContext, useMemo } from "react";
import style from './style.module.css';
import Header from "./../../Componant/Header/Header";
import ChatBody from "../../Componant/Chat/ChatBody";
import SocketDebugPanel from "./../../Componant/Chat/socketDebugPanel";
import { useNavigate, useParams } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import UserContext from "../../context/Usercontext";
import { useTeamChat } from "./../../Componant/Chat/useTeamChat";

function Chat() {
  // State for attachments and UI
  const [attachments, setAttachments] = useState({ files: [], images: [] });
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showDebug, setShowDebug] = useState(false); // Changed to false by default
  const [error, setError] = useState("");

  // React Router
  const navigate = useNavigate();
  const { team_Code } = useParams();

  // User context
  const { user } = useContext(UserContext);

  // Use the custom chat hook
  const {
    messages,
    loading: isLoading,
    error: chatError,
    connectionStatus,
    isConnected,
    sendMessage,
    editMessage,
    deleteMessage,
    refreshMessages
  } = useTeamChat(team_Code);

  // Memoize auth check to prevent re-running on every render
  useEffect(() => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      console.error('No auth token found');
      navigate('/login');
      return;
    }

    if (!team_Code) {
      console.error('No team code provided');
      navigate('/');
      return;
    }
  }, [navigate, team_Code]); // Only depend on navigate and team_Code

  // Memoize handlers to prevent recreation on every render
  const handleSendMessage = useCallback(async (messageData) => {
    console.log('🚀 Attempting to send message:', messageData);

    if (!isConnected) {
      console.warn('⚠️ Cannot send message, socket not connected yet.');
      setError('Cannot send message: Not connected to chat server');
      return;
    }

    try {
      console.log('📤 Sending message via API...');

      // Prepare attachments in the correct format
      const attachments = messageData.attachments &&
        (messageData.attachments.images?.length > 0 || messageData.attachments.files?.length > 0)
        ? messageData.attachments
        : null;

      await sendMessage(messageData.text, attachments, messageData.replyTo);
      console.log('✅ Message sent successfully');

      // Clear attachments after successful send
      setAttachments({ files: [], images: [] });

    } catch (err) {
      console.error('❌ Failed to send message:', err);
      setError('Failed to send message: ' + err.message);
    }
  }, [isConnected, sendMessage]);

  // Memoize attachment handler
  const handleAttachment = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const processedAttachments = {
        images: [],
        files: []
      };

      // Process each file
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          // Process image files
          processedAttachments.images.push({
            file: file, // Keep the actual File object for FormData
            name: file.name,
            size: file.size,
            type: file.type,
            preview: URL.createObjectURL(file) // For preview display
          });
        } else {
          // Process non-image files
          processedAttachments.files.push({
            file: file, // Keep the actual File object for FormData
            name: file.name,
            size: file.size,
            type: file.type
          });
        }
      }

      setAttachments(prevAttachments => ({
        files: [...prevAttachments.files, ...processedAttachments.files],
        images: [...prevAttachments.images, ...processedAttachments.images]
      }));

      console.log('Processed attachments:', processedAttachments);
    } catch (error) {
      console.error('Failed to process attachments:', error);
      alert('Failed to process attachments: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Memoize file select handler
  const handleFileSelect = useCallback(async () => {
    try {
      // Create a file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = "image/*,application/pdf,.doc,.docx,.txt,.zip,.rar";

      return new Promise((resolve, reject) => {
        input.onchange = async (e) => {
          try {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
              await handleAttachment(files);
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        };

        input.oncancel = () => resolve();
        input.click();
      });
    } catch (error) {
      console.error('File selection error:', error);
      alert('File selection error: ' + error.message);
    }
  }, [handleAttachment]);

  // Memoize attachment management functions
  const removeAttachment = useCallback((type, index) => {
    setAttachments(prev => {
      const newAttachments = { ...prev };

      // Clean up preview URL if it's an image
      if (type === 'images' && prev[type][index]?.preview) {
        URL.revokeObjectURL(prev[type][index].preview);
      }

      newAttachments[type] = prev[type].filter((_, i) => i !== index);
      return newAttachments;
    });
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments(prev => {
      // Clean up all preview URLs
      prev.images.forEach(img => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });

      return { files: [], images: [] };
    });
  }, []);

  // Memoize error handlers
  const clearError = useCallback(() => {
    setError("");
    refreshMessages();
  }, [refreshMessages]);

  const handleReconnect = useCallback(() => {
    console.log('Manual reconnection triggered');
    refreshMessages();
  }, [refreshMessages]);

  // Memoize drag and drop functionality
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      handleAttachment(acceptedFiles);
    }
  }, [handleAttachment]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar']
    },
    maxSize: 50 * 1024 * 1024,
    multiple: true,
    noClick: true,
    noKeyboard: true,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: (fileRejections) => {
      setDragActive(false);
      const errors = fileRejections.flatMap(rejection =>
        rejection.errors.map(error => error.message)
      );
      alert(`File(s) rejected: ${errors.join(', ')}`);
    }
  });

  // Cleanup attachment URLs on unmount  
  useEffect(() => {
    return () => {
      attachments.images.forEach(img => {
        if (img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [attachments.images]);

  // Memoize debug logging to reduce console spam
  const debugInfo = useMemo(() => ({
    timestamp: new Date().toISOString(),
    teamCode: team_Code,
    messagesCount: messages.length,
    connectionStatus,
    isConnected,
    isLoading,
    error: chatError,
    userId: user?.userId,
    userName: user?.name
  }), [team_Code, messages.length, connectionStatus, isConnected, isLoading, chatError, user]);

  // Only log when debug is enabled and values change
  useEffect(() => {
    if (showDebug) {
      console.log('=== CHAT STATE DEBUG ===', debugInfo);
    }
  }, [showDebug, debugInfo]);

  useEffect(() => {
    console.log("Checking authentication, user:", user);
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // Memoize current error to display
  const currentError = error || chatError;

  return (
    <div className={style.container}>
      <Header />

      {/* Debug Panel - Only render when shown */}
      {showDebug && (
        <SocketDebugPanel teamId={team_Code} />
      )}

      {/* Error Message */}
      {currentError && (
        <div className={style.errorBar}>
          <span>❌ {currentError}</span>
          <button onClick={clearError} className={style.clearError}>×</button>
        </div>
      )}

      <div
        className={`${style.ChatContainer} ${isDragActive || dragActive ? style.dragActive : ''}`}
        {...getRootProps()}
      >
        <input {...getInputProps()} />

        {(isDragActive || dragActive) && (
          <div className={style.dragOverlay}>
            <p>Drop files here to upload</p>
          </div>
        )}

        {/* Chat Body - now includes CreateMess component */}
        <ChatBody
          messages={messages}
          isLoading={isLoading}
          error={currentError}
          onEditMessage={editMessage}
          onDeleteMessage={deleteMessage}
          onRetry={handleReconnect}
          onSendMessage={handleSendMessage}
          attachments={attachments}
          onFileSelect={handleFileSelect}
          onRemoveAttachment={removeAttachment}
          onClearAttachments={clearAttachments}
          isUploading={isUploading}
        />
      </div>
    </div>
  );
}

export default React.memo(Chat);