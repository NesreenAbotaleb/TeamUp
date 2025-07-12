import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import EmojiPicker from 'emoji-picker-react';
import style from './style.module.css';
import { ReactComponent as Attach } from './../../assets/svgs/icons/tdesign_attach.svg';
import { ReactComponent as Send } from './../../assets/svgs/icons/send.svg';
import { Paperclip, X, Smile } from 'lucide-react';

const CreateMess = ({
  onSendMessage,
  onAttach,
  onFileSelect,
  attachments,
  isUploading,
  onRemoveAttachment,
  onClearAttachments,
  replyTo,
  replyingMessageContent,
  clearReply,
  replyingMessageSenderName,
}) => {

  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isReplying, setIsReplying] = useState(false);

  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Handle clicks outside emoji picker to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEmojiPicker]);

  // Handle emoji selection
  const handleEmojiClick = useCallback((emojiData) => {
    const emoji = emojiData.emoji;
    const newMessage = message.slice(0, cursorPosition) + emoji + message.slice(cursorPosition);
    setMessage(newMessage);

    // Update cursor position after emoji insertion
    const newCursorPosition = cursorPosition + emoji.length;
    setCursorPosition(newCursorPosition);

    // Focus back to input and set cursor position
    if (inputRef.current) {
      inputRef.current.focus();
      setTimeout(() => {
        inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    }

    // Keep emoji picker open for multiple selections
    // setShowEmojiPicker(false); // Uncomment if you want to close after selection
  }, [message, cursorPosition]);

  // Track cursor position in input
  const handleInputChange = useCallback((e) => {
    setMessage(e.target.value);
    setCursorPosition(e.target.selectionStart);
    if (replyTo && !isReplying && e.target.value.trim() !== '') {
      setIsReplying(true);
    }
  }, [replyTo, isReplying]);


  // Handle cursor position changes
  const handleInputClick = useCallback((e) => {
    setCursorPosition(e.target.selectionStart);
  }, []);

  const handleInputKeyUp = useCallback((e) => {
    setCursorPosition(e.target.selectionStart);
  }, []);

  // Toggle emoji picker
  const toggleEmojiPicker = useCallback(() => {
    setShowEmojiPicker(prev => !prev);
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart);
    }
  }, []);

  // Memoize the send handler to prevent recreation on every render
  const handleSend = useCallback(() => {
    const hasContent = message.trim() ||
      (attachments && (attachments.files.length > 0 || attachments.images.length > 0));
    setIsReplying(false);

    if (hasContent && !isUploading) {
      onSendMessage({
        text: message,
        attachments,
 replyTo: replyTo?.id || null,
      });

      setMessage('');
      setCursorPosition(0);
      setShowEmojiPicker(false);

      if (onClearAttachments) {
        onClearAttachments();
      }
      if (clearReply) {
        clearReply();
      }
    }
  }, [message, attachments, isUploading, onSendMessage, onClearAttachments, replyTo, clearReply]);

  // Memoize key press handler
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Close emoji picker on Escape
    if (e.key === 'Escape') {
      setShowEmojiPicker(false);
    }
  }, [handleSend]);

  // Memoize attach click handler
  const handleAttachClick = useCallback(() => {
    if (onFileSelect) {
      onFileSelect();
    } else if (onAttach) {
      onAttach();
    }
  }, [onFileSelect, onAttach]);

  // Memoize helper functions
  const getFileIcon = useCallback((fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    if (fileType.includes('zip') || fileType.includes('rar')) return '🗜️';
    if (fileType.includes('text')) return '📋';
    return '📎';
  }, []);

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Memoize attachment preview component
  const attachmentPreview = useMemo(() => {
    if (!attachments) return null;

    const hasAttachments = attachments.files?.length > 0 || attachments.images?.length > 0;

    if (!hasAttachments && !isUploading) return null;

    return (
      <div className={style.attachmentPreview}>
        {isUploading && (
          <div className={style.uploadingIndicator}>
            <div className={style.uploadingText}>📤 Uploading files...</div>
          </div>
        )}

        {/* Image previews */}
        {attachments.images?.map((image, index) => (
          <div key={`image-${index}`} className={style.attachmentItem}>
            <img
              src={image.preview} // Use the preview URL instead of base64
              alt={image.name}
              className={style.imagePreview}
            />
            <div className={style.attachmentInfo}>
              <span className={style.attachmentName}>{image.name}</span>
              <span className={style.fileSize}>{formatFileSize(image.size)}</span>
            </div>
            <button
              className={style.removeAttachment}
              onClick={() => onRemoveAttachment('images', index)}
              aria-label="Remove image"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {/* File previews */}
        {attachments.files?.map((file, index) => (
          <div key={`file-${index}`} className={style.attachmentItem}>
            <div className={style.fileIcon}>
              {getFileIcon(file.type)}
            </div>
            <div className={style.attachmentInfo}>
              <span className={style.attachmentName}>{file.name}</span>
              <span className={style.fileSize}>{formatFileSize(file.size)}</span>
            </div>
            <button
              className={style.removeAttachment}
              onClick={() => onRemoveAttachment('files', index)}
              aria-label="Remove file"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {hasAttachments && (
          <button
            className={style.clearAllButton}
            onClick={onClearAttachments}
            title="Clear all attachments"
          >
            Clear All
          </button>
        )}
      </div>
    );
  }, [attachments, isUploading, formatFileSize, getFileIcon, onRemoveAttachment, onClearAttachments]);


  // Memoize hasContent calculation
  const hasContent = useMemo(() => {
    return message.trim() ||
      (attachments && (attachments.files?.length > 0 || attachments.images?.length > 0));
  }, [message, attachments]);

  return (
    <div className={style.createMessWrapper}>
      {attachmentPreview}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className={style.emojiPickerContainer} ref={emojiPickerRef}>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme="light"
            width={350}
            height={400}
            previewConfig={{
              showPreview: false
            }}
            searchDisabled={false}
            skinTonesDisabled={false}
            autoFocusSearch={false}
            emojiStyle="native"
            lazyLoadEmojis={true}
            suggestedEmojisMode="recent"
            customEmojis={[]}
          />
        </div>
      )}


      <div className={style.SendingContainer}>
        <div className={style.customInput}>
          <Paperclip
            className={`${style.attach} ${isUploading ? style.attachDisabled : ''}`}
            onClick={handleAttachClick}
            style={{
              cursor: isUploading ? 'not-allowed' : 'pointer',
              opacity: isUploading ? 0.5 : 1
            }}
          />

          

          <input
            ref={inputRef}
            type="text"
            placeholder="Message , ,"
            value={message}
            onChange={handleInputChange}
            onClick={handleInputClick}
            onKeyUp={handleInputKeyUp}
            onKeyPress={handleKeyPress}
            disabled={isUploading}
            className={isUploading ? style.inputDisabled : ''}
          />
          <Smile
            className={`${style.emojiButton} ${showEmojiPicker ? style.active : ''} ${isUploading ? style.attachDisabled : ''}`}
            onClick={toggleEmojiPicker}
            style={{
              cursor: isUploading ? 'not-allowed' : 'pointer',
              opacity: isUploading ? 0.5 : 1
            }}
            title="Add emoji"
          />
        </div>
        {replyTo && (
            <div className={style.replyPreviewContainer}>
              <div className={style.replyHeader}>
                <span className={style.replyToName}>
                  Replying to {replyingMessageSenderName || "Unknown"}:
                </span>
                {!isReplying && (
                  <button onClick={clearReply} className={style.cancelReplyButton}>
                    ✕
                  </button>
                )}
              </div>
              <div className={style.replyContent}>
                {replyingMessageContent}
              </div>
            </div>
          )}
        <button
          className={`${style.send} ${!hasContent || isUploading ? style.sendDisabled : ''}`}
          onClick={handleSend}
          disabled={!hasContent || isUploading}
        >
          {isUploading ? (
            <div className={style.loadingSpinner}>⏳</div>
          ) : (
            <Send className={style.sendbtn} />
          )}
        </button>
      </div>
    </div>
  );
};

export default React.memo(CreateMess);