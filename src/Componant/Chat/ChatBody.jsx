import React, { useContext, useEffect, useRef, useMemo, useState, useCallback } from "react";
import UserContext from "../../context/Usercontext";
import Message from "./Message";
import CreateMess from "./CreateMess";
import style from './style.module.css';
import api from "../../api/API";

const ChatBody = ({
  messages = [],
  isLoading = false,
  error = null,
  onEditMessage,
  onDeleteMessage,
  onRetry,
  onSendMessage,
  attachments,
  onFileSelect,
  onRemoveAttachment,
  onClearAttachments,
  isUploading,
}) => {
  const { user } = useContext(UserContext);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [fileCache, setFileCache] = useState(new Map()); // Cache for file data
  const [loadingFiles, setLoadingFiles] = useState(new Set()); // Track which files are loading
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [localMessages, setLocalMessages] = useState(messages);

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Defensive check to ensure messages is an array
  const messageList = Array.isArray(localMessages) ? localMessages : [];

  // Enhanced function to extract file info from URL
  const extractFileInfoFromUrl = useCallback((fileUrl) => {
    try {
      const url = new URL(fileUrl);
      const pathname = url.pathname;

      // Extract filename from URL path
      const segments = pathname.split('/');
      let fileName = segments[segments.length - 1];

      // Clean up Cloudinary URLs - remove version and other parameters
      if (fileUrl.includes('cloudinary.com')) {
        // For Cloudinary URLs like: /upload/v1750494836/chat/semester.zip
        const uploadIndex = segments.findIndex(seg => seg === 'upload');
        if (uploadIndex !== -1 && uploadIndex + 3 < segments.length) {
          fileName = segments[uploadIndex + 3]; // Skip 'upload', version, and folder
        }
      }

      // Remove query parameters from filename
      fileName = fileName.split('?')[0];

      // Generate a unique ID for the file
      const fileId = btoa(fileUrl).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);

      // Estimate file size from URL if possible (this is a fallback)
      let estimatedSize = 0;

      // Get file extension
      const extension = fileName.split('.').pop()?.toLowerCase() || '';

      return {
        id: fileId,
        name: fileName || 'Unknown File',
        url: fileUrl,
        downloadUrl: fileUrl,
        size: estimatedSize,
        type: extension,
        extension: extension,
        requiresAuth: false // Assuming Cloudinary URLs are public
      };
    } catch (error) {
      console.error('Error extracting file info from URL:', error);
      return null;
    }
  }, []);

  // File fetching function - enhanced to handle both IDs and URLs
  const fetchFileData = useCallback(async (fileIdOrUrl, messageId) => {
    // Check if already cached
    if (fileCache.has(fileIdOrUrl)) {
      return fileCache.get(fileIdOrUrl);
    }

    // Check if already loading
    if (loadingFiles.has(fileIdOrUrl)) {
      return null;
    }

    try {
      setLoadingFiles(prev => new Set(prev).add(fileIdOrUrl));

      // If it's a URL, extract file info directly
      if (fileIdOrUrl.startsWith('http')) {
        const fileInfo = extractFileInfoFromUrl(fileIdOrUrl);
        if (fileInfo) {
          // Try to get actual file size if possible
          try {
            const response = await fetch(fileIdOrUrl, { method: 'HEAD' });
            if (response.ok) {
              const contentLength = response.headers.get('content-length');
              if (contentLength) {
                fileInfo.size = parseInt(contentLength, 10);
              }
            }
          } catch (sizeError) {
            console.log('Could not fetch file size:', sizeError);
          }

          // Cache the file data
          setFileCache(prev => new Map(prev).set(fileIdOrUrl, fileInfo));
          return fileInfo;
        }
        return null;
      }

      // If it's an ID, fetch from API
      const response = await fetch(`${api}/files/${fileIdOrUrl}`, {
        headers: {
          'Authorization': `${user?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const fileData = await response.json();

      // Cache the file data
      setFileCache(prev => new Map(prev).set(fileIdOrUrl, fileData));

      return fileData;
    } catch (error) {
      console.error(`Error fetching file ${fileIdOrUrl}:`, error);
      return null;
    } finally {
      setLoadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileIdOrUrl);
        return newSet;
      });
    }
  }, [api, user?.token, fileCache, loadingFiles, extractFileInfoFromUrl]);

  // Enhanced message processing to handle both files array and single file URL
  const processedMessages = useMemo(() => {
    return messageList.map(message => {
      let processedFiles = [];

      // Handle files array (existing logic)
      if (message.files && Array.isArray(message.files)) {
        processedFiles = message.files.map(file => {
          // If file is just an ID string, we need to fetch the data
          if (typeof file === 'string') {
            const cachedFile = fileCache.get(file);
            if (cachedFile) {
              return cachedFile;
            }

            // Trigger fetch for this file
            fetchFileData(file, message.id || message._id);

            // Return placeholder while loading
            return {
              id: file,
              name: 'Loading...',
              size: 0,
              type: 'unknown',
              isLoading: true
            };
          }

          // If file is already a complete object, return as-is
          if (file && typeof file === 'object' && file.name && file.url) {
            return file;
          }

          // Handle file objects that might need URL generation
          if (file && typeof file === 'object' && file.id) {
            return {
              ...file,
              url: file.url || `${api}/files/${file.id}/download`,
              downloadUrl: file.downloadUrl || `${api}/files/${file.id}/download?attachment=true`
            };
          }

          return file;
        }).filter(Boolean);
      }

      // Handle single file URL (new logic for your data structure)
      if (message.file && typeof message.file === 'string' && message.file.startsWith('http')) {
        const cachedFile = fileCache.get(message.file);
        if (cachedFile) {
          processedFiles.push(cachedFile);
        } else {
          // Trigger fetch for this file URL
          fetchFileData(message.file, message.id || message._id);

          // Create a temporary file object while loading
          const tempFileInfo = extractFileInfoFromUrl(message.file);
          if (tempFileInfo) {
            processedFiles.push({
              ...tempFileInfo,
              isLoading: true,
              name: 'Loading...'
            });
          }
        }
      }

      return {
        ...message,
        files: processedFiles
      };
    });
  }, [messageList, fileCache, fetchFileData, api, extractFileInfoFromUrl]);

  // Enhanced file download handler
  const handleFileDownload = useCallback(async (file, messageId) => {
    try {
      const downloadUrl = file.downloadUrl || file.url;

      if (!downloadUrl) {
        console.error('No download URL available for file:', file);
        return;
      }

      // For files that need authentication
      if (file.requiresAuth !== false) {
        const response = await fetch(downloadUrl, {
          headers: {
            'Authorization': `${user?.token}`
          }
        });

        console.log("download URL : ", downloadUrl)

        if (!response.ok) {
          throw new Error(`Download failed: ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // For public files, use direct download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = file.name || 'download';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      // You might want to show a toast notification here
    }
  }, [user?.token]);

  // Prefetch files for visible messages
  useEffect(() => {
    const prefetchFiles = async () => {
      const filesToFetch = [];

      processedMessages.forEach(message => {
        // Handle files array
        if (message.files && Array.isArray(message.files)) {
          message.files.forEach(file => {
            if (typeof file === 'string' && !fileCache.has(file) && !loadingFiles.has(file)) {
              filesToFetch.push({ fileId: file, messageId: message.id || message._id });
            }
          });
        }

        // Handle single file URL
        if (message.file && typeof message.file === 'string' &&
          message.file.startsWith('http') &&
          !fileCache.has(message.file) &&
          !loadingFiles.has(message.file)) {
          filesToFetch.push({ fileId: message.file, messageId: message.id || message._id });
        }
      });

      // Limit concurrent fetches
      const batchSize = 3;
      for (let i = 0; i < filesToFetch.length; i += batchSize) {
        const batch = filesToFetch.slice(i, i + batchSize);
        await Promise.all(
          batch.map(({ fileId, messageId }) => fetchFileData(fileId, messageId))
        );
      }
    };

    if (processedMessages.length > 0) {
      prefetchFiles();
    }
  }, [processedMessages, fetchFileData, fileCache, loadingFiles]);

  // Memoized message grouping by date
  const groupedMessages = useMemo(() => {
    const groups = {};

    processedMessages.forEach(message => {
      if (!message.date) return;

      const messageDate = new Date(message.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey;
      if (messageDate.toDateString() === today.toDateString()) {
        dateKey = 'Today';
      } else if (messageDate.toDateString() === yesterday.toDateString()) {
        dateKey = 'Yesterday';
      } else {
        dateKey = messageDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  }, [processedMessages]);

  // Memoized callback for scroll handling
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const threshold = 100;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < threshold;

    setIsAtBottom(isNearBottom);
    setShouldAutoScroll(isNearBottom);
  }, []);

  // Optimized scroll to bottom function
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior,
        block: 'end'
      });
    }
  }, []);

  // Auto-scroll logic with improved conditions
  useEffect(() => {
    if (shouldAutoScroll && processedMessages.length > 0) {
      const behavior = processedMessages.length === 1 ? 'auto' : 'smooth';
      scrollToBottom(behavior);
    }
  }, [processedMessages.length, shouldAutoScroll, scrollToBottom]);

  // Memoized message edit handler
  const handleEditMessage = useCallback(async (messageId, newContent) => {
    if (!onEditMessage) {
      console.warn('No edit handler provided');
      return;
    }

    try {
      await onEditMessage(messageId, newContent);
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  }, [onEditMessage]);

  // Memoized message delete handler
  const handleDeleteMessage = useCallback(async (messageId) => {
    if (!onDeleteMessage) {
      console.warn('No delete handler provided');
      return;
    }

    try {
      await onDeleteMessage(messageId);

      // Clean up file cache for deleted message
      const deletedMessage = processedMessages.find(m =>
        (m.id || m._id) === messageId
      );
      if (deletedMessage && deletedMessage.files) {
        deletedMessage.files.forEach(file => {
          if (file.id) {
            setFileCache(prev => {
              const newCache = new Map(prev);
              newCache.delete(file.id);
              return newCache;
            });
          }
        });
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  }, [onDeleteMessage, processedMessages]);

  // Memoized retry handler
  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  }, [onRetry]);

  // Handle send message - now integrated into ChatBody
  const handleSendMessage = useCallback(async (messageData) => {
    if (!onSendMessage) {
      console.warn('No send message handler provided');
      return;
    }

    try {
      await onSendMessage(messageData);
      // Clear reply state after sending
      setReplyToMessage(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [onSendMessage]);

  // Loading state component
  const LoadingState = () => (
    <div className={style.messagesContainer}>
      <div className={style.loadingState}>
        <div className={style.loadingSpinner}></div>
        <span>Loading messages...</span>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className={style.messagesContainer}>
      <div className={style.errorState}>
        <span>Error loading messages: {error}</span>
        <button
          className={style.retryButton}
          onClick={handleRetry}
          type="button"
        >
          Retry
        </button>
      </div>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className={style.messagesContainer}>
      <div className={style.emptyState}>
        <div className={style.emptyIcon} role="img" aria-label="Chat icon">💬</div>
        <h3>No messages yet</h3>
        <p>Start a conversation by sending a message!</p>
      </div>
    </div>
  );

  // Render different states
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (processedMessages.length === 0) return <EmptyState />;

  return (
    <div className={style.Chat}>
      <div
        className={style.messagesContainer}
        ref={containerRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {Object.entries(groupedMessages).map(([dateKey, dayMessages]) => (
          <div key={dateKey} className={style.dateGroup}>
            <div className={style.dateIndicator} role="separator">
              <span>{dateKey}</span>
            </div>
            {dayMessages.map((message, index) => {
              const prevMessage = dayMessages[index - 1];
              const isConsecutive = prevMessage &&
                prevMessage.senderId === message.senderId &&
                (new Date(message.date) - new Date(prevMessage.date)) < 300000;

              return (
                <Message
                  key={message.id || message._id || `${message.senderId}-${message.date}-${index}`}
                  messageId={message.id || message._id}
                  senderName={message.senderName}
                  senderId={message.senderId}
                  date={message.date}
                  content={message.content}
                  img={message.img}
                  files={message.files} // Now properly processed
                  currentUserId={user?.userId}
                  isConsecutive={isConsecutive}
                  showAvatar={!isConsecutive}
                  replyTo={message.replyTo}
                  onEditMessage={handleEditMessage}
                  onDeleteMessage={handleDeleteMessage}
                  onFileDownload={handleFileDownload} // Pass file download handler
                  onReply={() => {
                    setReplyToMessage({
                      id: message.id || message._id,
                      content: message.content || '',
                      senderName: message.senderName || 'Unknown'
                    });
                  }}
                  onReplyMessage={(message) => setReplyToMessage(message)}
                />
              );
            })}
          </div>
        ))}

        {/* Scroll to bottom button */}
        {!isAtBottom && (
          <button
            className={style.scrollToBottom}
            onClick={() => scrollToBottom('smooth')}
            aria-label="Scroll to bottom"
            type="button"
          >
            <span role="img" aria-label="Down arrow">↓</span>
          </button>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* CreateMess component moved here */}
      <CreateMess
        onSendMessage={handleSendMessage}
        attachments={attachments}
        onFileSelect={onFileSelect}
        onRemoveAttachment={onRemoveAttachment}
        onClearAttachments={onClearAttachments}
        isUploading={isUploading}
        replyTo={replyToMessage}
        clearReply={() => setReplyToMessage(null)}
        replyingMessageContent={replyToMessage?.content}
        replyingMessageSenderName={replyToMessage?.senderName}
      />
    </div>
  );
};

export default React.memo(ChatBody);