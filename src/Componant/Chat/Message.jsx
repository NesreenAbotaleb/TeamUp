import { useState, useRef, useEffect } from "react";
import style from './style.module.css';
import formatDate from './../../servies/formatDate'
import EditList from "./editList";
import { ReactComponent as List } from './../../assets/svgs/icons/bi_three-dots-vertical-colored.svg';
import { ReactComponent as Download } from './../../assets/svgs/icons/Download.svg';
import axios from 'axios';


const Message = ({
  senderName,
  senderId,
  date,
  content,
  img,
  files,
  currentUserId,
  messageId,
  onEditMessage,
  onDeleteMessage,
  onReplyMessage,
  onFileDownload // Add this new prop
}) => {
  // Local state for this specific message
  const [openList, setOpenList] = useState(false);
  const [edit, setEdit] = useState(false);
  const [delet, setDelete] = useState(false);
  const [editedContent, setEditedContent] = useState(content || '');
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null); // For file preview modal
  const [filePreviewError, setFilePreviewError] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const [replyTo, setReplyTo] = useState(null);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [isReplying, setIsReplying] = useState(false);

  const dropdownRef = useRef(null);
  const listButtonRef = useRef(null);

  const isOwnMessage = senderId === currentUserId;
  const formattedDate = formatDate(date);
  const displayName = senderName || 'Unknown User';
  const displayContent = content || '';
  const hasImage = img && !imageError;
  const hasFiles = files && Array.isArray(files) && files.length > 0;
  const hasAttachments = hasImage || hasFiles;

  const handleReplyChange = (e) => {
    setReplyContent(e.target.value);
    if (!isReplying) setIsReplying(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        listButtonRef.current &&
        !listButtonRef.current.contains(event.target)
      ) {
        setOpenList(false);
      }
    };

    if (openList) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openList]);

  // Reset edited content when edit modal opens
  useEffect(() => {
    if (edit) {
      setEditedContent(content || '');
    }
  }, [edit, content]);

  // Close preview with Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && previewFile) {
        closeFilePreview();
      }
    };

    if (previewFile) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewFile]);

  const handleListToggle = () => {
    setOpenList(!openList);
  };

  const handleEditClick = () => {
    setEdit(true);
    setOpenList(false);
  };

  const handleDeleteClick = () => {
    setDelete(true);
    setOpenList(false);
  };

  const handleEditSubmit = () => {
    if (onEditMessage && editedContent.trim()) {
      onEditMessage(messageId, editedContent.trim());
    }
    setEdit(false);
    setEditedContent('');
  };

  const handleDeleteSubmit = () => {
    if (onDeleteMessage) {
      onDeleteMessage(messageId);
    }
    setDelete(false);
  };

  const handleEditCancel = () => {
    setEdit(false);
    setEditedContent(content || '');
  };

  const handleDeleteCancel = () => {
    setDelete(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageClick = () => {
    if (hasImage) {
      window.open(img, '_blank');
    }
  };

  // Enhanced file type detection
  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    const audioTypes = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'];
    const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
    const spreadsheetTypes = ['xls', 'xlsx', 'csv'];
    const presentationTypes = ['ppt', 'pptx'];
    const codeTypes = ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go'];

    if (imageTypes.includes(extension)) return 'image';
    if (videoTypes.includes(extension)) return 'video';
    if (audioTypes.includes(extension)) return 'audio';
    if (documentTypes.includes(extension)) return 'document';
    if (spreadsheetTypes.includes(extension)) return 'spreadsheet';
    if (presentationTypes.includes(extension)) return 'presentation';
    if (codeTypes.includes(extension)) return 'code';
    if (extension === 'zip' || extension === 'rar' || extension === '7z') return 'archive';

    return 'other';
  };

  const getFileIcon = (fileName) => {
    const fileType = getFileType(fileName);
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (fileType) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎬';
      case 'audio':
        return '🎵';
      case 'document':
        return extension === 'pdf' ? '📄' : '📝';
      case 'spreadsheet':
        return '📊';
      case 'presentation':
        return '📽️';
      case 'code':
        return '💻';
      case 'archive':
        return '🗜️';
      default:
        return '📎';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Check if file can be previewed
  const canPreviewFile = (fileName) => {
    const fileType = getFileType(fileName);
    return ['image', 'video', 'audio', 'document'].includes(fileType);
  };

  // Handle file preview
  const handleFilePreview = (file) => {
    if (canPreviewFile(file.name)) {
      setPreviewFile(file);
      setFilePreviewError(null);
      setPreviewLoading(true);
    } else {
      // For non-previewable files, just download
      handleFileDownload(file);
    }
  };

  const handleFileDownload = (file) => {
    if (onFileDownload) {
      // Use the parent's download handler if provided
      onFileDownload(file, messageId);
      console.log('url : ', file)
    } else {
      // Fallback to simple download
      const link = document.createElement('a');
      link.href = file.url || file.downloadUrl;
      link.download = file.name;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const closeFilePreview = () => {
    setPreviewFile(null);
    setFilePreviewError(null);
    setPreviewLoading(false);
  };

  const handlePreviewError = () => {
    setFilePreviewError('Unable to preview this file');
    setPreviewLoading(false);
  };

  const handlePreviewLoad = () => {
    setPreviewLoading(false);
  };

  // Render file preview content based on file type
  const renderFilePreview = (file) => {
    if (!file) return null;

    const fileType = getFileType(file.name);
    const fileUrl = file.url || file.downloadUrl;

    if (!fileUrl) {
      return (
        <div className={style.previewError}>
          <p>File URL not available</p>
          <button
            onClick={closeFilePreview}
            className={style.downloadPreviewButton}
          >
            Close
          </button>
        </div>
      );
    }

    switch (fileType) {
      case 'image':
        return (
          <div className={style.imagePreview}>
            {previewLoading && (
              <div className={style.previewLoading}>
                <div className={style.loadingSpinner}></div>
                <p>Loading image...</p>
              </div>
            )}
            <img
              src={fileUrl}
              alt={file.name}
              className={style.previewImage}
              onLoad={handlePreviewLoad}
              onError={handlePreviewError}
              style={{ display: previewLoading ? 'none' : 'block' }}
            />
          </div>
        );

      case 'video':
        return (
          <div className={style.videoPreview}>
            {previewLoading && (
              <div className={style.previewLoading}>
                <div className={style.loadingSpinner}></div>
                <p>Loading video...</p>
              </div>
            )}
            <video
              src={fileUrl}
              controls
              className={style.previewVideo}
              onLoadedData={handlePreviewLoad}
              onError={handlePreviewError}
              style={{ display: previewLoading ? 'none' : 'block' }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'audio':
        return (
          <div className={style.audioPreview}>
            <div className={style.audioInfo}>
              <div className={style.audioIcon}>🎵</div>
              <div className={style.audioDetails}>
                <h4>{file.name}</h4>
                <p>{formatFileSize(file.size)}</p>
              </div>
            </div>
            {previewLoading && (
              <div className={style.previewLoading}>
                <div className={style.loadingSpinner}></div>
                <p>Loading audio...</p>
              </div>
            )}
            <audio
              src={fileUrl}
              controls
              className={style.previewAudio}
              onLoadedData={handlePreviewLoad}
              onError={handlePreviewError}
              style={{ display: previewLoading ? 'none' : 'block' }}
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        );

      case 'document':
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (extension === 'pdf') {
          return (
            <div className={style.documentPreview}>
              {previewLoading && (
                <div className={style.previewLoading}>
                  <div className={style.loadingSpinner}></div>
                  <p>Loading document...</p>
                </div>
              )}
              <iframe
                src={fileUrl}
                className={style.previewFrame}
                title={file.name}
                onLoad={handlePreviewLoad}
                onError={handlePreviewError}
                style={{ display: previewLoading ? 'none' : 'block' }}
              />
            </div>
          );
        } else if (extension === 'txt') {
          return (
            <div className={style.textPreview}>
              <TextFilePreview fileUrl={fileUrl} fileName={file.name} />
            </div>
          );
        } else {
          return (
            <div className={style.documentNotSupported}>
              <div className={style.documentIcon}>📄</div>
              <h4>{file.name}</h4>
              <p>Preview not supported for this document type</p>
              <button
                onClick={() => handleFileDownload(file)}
                className={style.downloadPreviewButton}
              >
                Download to view
              </button>
            </div>
          );
        }

      default:
        return (
          <div className={style.unsupportedPreview}>
            <div className={style.fileTypeIcon}>{getFileIcon(file.name)}</div>
            <h4>{file.name}</h4>
            <p>Preview not supported for this file type</p>
            <button
              onClick={() => handleFileDownload(file)}
              className={style.downloadPreviewButton}
            >
              Download file
            </button>
          </div>
        );
    }
  };

  // Component for previewing text files
  const TextFilePreview = ({ fileUrl, fileName }) => {
    const [textContent, setTextContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchTextContent = async () => {
        try {
          const response = await fetch(fileUrl);
          if (!response.ok) {
            throw new Error('Failed to load text file');
          }
          const text = await response.text();
          setTextContent(text);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchTextContent();
    }, [fileUrl]);

    if (loading) {
      return (
        <div className={style.previewLoading}>
          <div className={style.loadingSpinner}></div>
          <p>Loading text file...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={style.previewError}>
          <p>Error loading text file: {error}</p>
        </div>
      );
    }

    return (
      <div className={style.textContent}>
        <div className={style.textHeader}>
          <h4>{fileName}</h4>
        </div>
        <pre className={style.textPreview}>{textContent}</pre>
      </div>
    );
  };

  // Render file item with improved UI
  const renderFileItem = (file, index) => {
    const isLoading = file.isLoading || false;

    return (
      <div key={file.id || index} className={style.fileItem}>
        <div className={style.fileIcon}>
          {isLoading ? '⏳' : getFileIcon(file.name)}
        </div>
        <div className={style.fileInfo}>
          <span className={style.fileName}>
            {isLoading ? 'Loading...' : file.name}
          </span>
          <span className={style.fileSize}>
            {isLoading ? '' : formatFileSize(file.size)}
          </span>
          {!isLoading && canPreviewFile(file.name) && (
            <span className={style.previewable}>• Previewable</span>
          )}
        </div>
        <div className={style.fileActions}>
          {!isLoading && canPreviewFile(file.name) && (
            <button
              onClick={() => handleFilePreview(file)}
              className={style.previewButton}
              title="Preview file"
              disabled={isLoading}
            >
              View
            </button>
          )}
          <button
            onClick={() => handleFileDownload(file)}
            className={style.downloadButton}
            title="Download file"
            disabled={isLoading}
          >
            {isLoading ? '⏳' : (
              <Download />
            )}
          </button>
        </div>
      </div>
    );
  };

  const handleReplySubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("content", replyContent);

      await axios.post(
        `http://localhost:3008/chat/replyToMessage/${messageId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setShowReplyInput(false);
      setReplyContent('');

    } catch (error) {
      console.error("Failed to send reply:", error);
    }
  };



  return (
    <>
      <div className={`${style.sender} ${isOwnMessage ? style.own : ''}`}>
        <div className={style.icon}>
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className={style.Message}>
          <h3 className={style.senderName}>{displayName}</h3>
          <div className={style.listContainer}>
            <List
              ref={listButtonRef}
              onClick={handleListToggle}
              className={style.list}
            />

            {openList && (
              <div ref={dropdownRef} className={style.dropdownContainer}>
                <EditList
                  isCurrentUser={senderId === currentUserId}
                  setEdit={isOwnMessage ? handleEditClick : null}
                  setDelete={isOwnMessage ? handleDeleteClick : null}
                  onReply={() => {
                    setReplyTo({ id: messageId, content, senderName });
                    setShowReplyInput(true);
                    if (onReplyMessage) {
                      onReplyMessage({ id: messageId, content, senderName });
                    }
                  }}

                  isFile={hasFiles}
                  isImage={hasImage}
                />

              </div>
            )}
          </div>


          {/* Message content */}
          {displayContent && (
            <p className={style.content}>{displayContent}</p>
          )}

          {/* Image attachment */}
          {hasImage && (
            <div className={style.imageContainer}>
              {imageLoading && (
                <div className={style.imageLoading}>
                  <div className={style.loadingSpinner}></div>
                </div>
              )}
              <img
                src={img}
                alt="Shared image"
                className={style.messageImage}
                onLoad={handleImageLoad}
                onError={handleImageError}
                onClick={handleImageClick}
                style={{ display: imageLoading ? 'none' : 'block' }}
              />
            </div>
          )}

          {/* Enhanced File attachments */}
          {hasFiles && (
            <div className={style.filesContainer}>
              {files.map((file, index) => renderFileItem(file, index))}
            </div>
          )}

          {/* Show placeholder if no content and no attachments */}
          {!displayContent && !hasAttachments && (
            <p className={style.content}>No message content</p>
          )}
        </div>
        <div className={style.date}>
          <span title={date ? new Date(date).toLocaleString() : 'No timestamp'}>
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Enhanced File Preview Modal */}
      {previewFile && (
        <div className={style.previewOverlay} onClick={closeFilePreview}>
          <div className={style.previewContainer} onClick={(e) => e.stopPropagation()}>
            <div className={style.previewHeader}>
              <div className={style.previewTitleContainer}>
                <h4 className={style.previewTitle}>{previewFile.name}</h4>
                <span className={style.previewFileSize}>
                  {formatFileSize(previewFile.size)}
                </span>
              </div>
              <div className={style.previewActions}>
                <button
                  onClick={() => handleFileDownload(previewFile)}
                  className={style.downloadPreviewButton}
                  title="Download file"
                >
                  <Download />
                </button>
                <button
                  onClick={closeFilePreview}
                  className={style.closePreviewButton}
                  title="Close preview (ESC)"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className={style.previewContent}>
              {filePreviewError ? (
                <div className={style.previewError}>
                  <p>{filePreviewError}</p>
                  <button
                    onClick={() => handleFileDownload(previewFile)}
                    className={style.downloadPreviewButton}
                  >
                    Download instead
                  </button>
                </div>
              ) : (
                renderFilePreview(previewFile)
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Overlay */}
      {edit && (
        <div className={style.overlay} onClick={handleEditCancel}>
          <div className={style.editContainer} onClick={(e) => e.stopPropagation()}>
            <h5>Edit Message</h5>
            <textarea
              className={style.editTextarea}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              placeholder="Enter your message..."
              autoFocus
            />
            <div className={style.buttonGroup}>
              <button
                className={style.saveButton}
                onClick={handleEditSubmit}
                disabled={!editedContent.trim()}
              >
                Save
              </button>
              <button
                className={style.cancelButton}
                onClick={handleEditCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Overlay */}
      {delet && (
        <div className={style.overlay} onClick={handleDeleteCancel}>
          <div className={style.Delete} onClick={(e) => e.stopPropagation()}>
            <h5>Delete Message</h5>
            <p>Are you sure you want to delete this message?</p>
            <div className={style.buttonGroup}>
              <button
                className={style.deleteButton}
                onClick={handleDeleteSubmit}
              >
                Delete
              </button>
              <button
                className={style.cancelButton}
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showReplyInput && (
        <div className={style.replyInputBox}>
          
          {replyTo && (
            <div className={style.replyBox}>
              <span className={style.replyToName}>{replyTo.senderName}</span>
              <div className={style.replyContent}>{replyTo.content}</div>
            </div>
          )}


        </div>
      )}


    </>
  );
};

export default Message;