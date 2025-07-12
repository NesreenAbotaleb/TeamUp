import { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import style from './style.module.css';
import { ReactComponent as Profile } from './../../assets/svgs/menu/profile.svg';
import { ReactComponent as Edit } from './../../assets/svgs/icons/Edit.svg';
import { ReactComponent as Reply } from './../../assets/svgs/icons/reply-solid.svg';
import LikeComment from '../../servies/Posts/likeComment';
import ReplyJ from "../../servies/Posts/Reply";
import { useNavigate } from "react-router-dom";

import UserContext from '../../context/Usercontext';
import EditComment from '../../servies/Posts/EditComment';

const Comment = ({ comment, postId, refreshComments, setComments, allComments }) => {
  const { users, user } = useContext(UserContext);
  const [edit, setEdit] = useState(false);
  const [editedContent, setEditedContent] = useState(comment?.comment || '');
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyError, setReplyError] = useState('');
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  const [likeCount, setLikeCount] = useState(comment?.likes?.count || 0);
  useEffect(() => {
    if (comment?.likes?.users) {
      const isLiked = comment.likes.users.some(
        uid => uid === user._id || uid?._id === user._id
      );
      setLiked(isLiked);
      setLikeCount(comment.likes.count || 0);
    }
  }, [comment, user]);

  // const handleLikeClick = async () => {
  //   try {
  //     const res = await axios.post(
  //       `http://localhost:3008/posts/likeComment/${postId}/${comment._id}`,
  //       {},
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem('token')}`,
  //         },
  //       }
  //     );
  //     const updatedLikes = res.data.likes;
  //     setLikeCount(updatedLikes.count);
  //     setLiked(updatedLikes.users.includes(user._id));
  //   } catch (error) {
  //     console.error('Error liking comment:', error);
  //   }
  // };
  const handleLikeClick = async () => {
    try {
      const updated = await LikeComment(postId, comment._id);

      setLikeCount(updated.count);
      setLiked(updated.users.includes(user._id));
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const [likedReplies, setLikedReplies] = useState(() =>
    comment?.replies?.map(r =>
      r.likes?.users?.some(uid => uid === user._id || uid?._id === user._id)
    ) || []
  );

  const [replyLikesCount, setReplyLikesCount] = useState(() =>
    comment?.replies?.map(r => r.likes?.count || 0) || []
  );


  const usera = Array.isArray(users)
    ? users.find(user => user._id === comment.userName)
    : null;
  const name = usera ? usera.name : 'Unknown User';
  const creator = user.name === name;

  const formatCommentDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleEditSubmit = async () => {
    if (!editedContent) return alert('Comment content cannot be empty');

    try {
      await EditComment(editedContent, postId, comment._id);
      setEdit(false);
      refreshComments?.();
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  // const handleReplySubmit = async () => {
  //   if (!replyText.trim()) {
  //     setReplyError('Reply cannot be empty.');
  //     return;
  //   }

  //   setReplyError('');

  //   const newReply = {
  //     reply: replyText,
  //     userName: user.name,
  //     createdAt: new Date().toISOString(),
  //   };

  //   const updatedComments = allComments.map((c) => {
  //     if (c._id === comment._id) {
  //       return {
  //         ...c,
  //         replies: [...(c.replies || []), newReply],
  //       };
  //     }
  //     return c;
  //   });

  //   setComments?.(updatedComments);
  //   setReplyText('');
  //   setShowReplyInput(false);

  //   try {
  //     await axios.post(
  //       `http://localhost:3008/posts/replyComment/${postId}/${comment._id}`,
  //       { reply: replyText },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem('token')}`,
  //         },
  //       }
  //     );
  //   } catch (error) {
  //     console.error('Error submitting reply:', error);
  //   }
  // };



  const handleReplySubmit = async () => {
    if (!replyText.trim()) {
      setReplyError("Reply cannot be empty.");
      return;
    }

    setReplyError("");

    try {
      const res = await ReplyJ({
        postId,
        commentId: comment._id,
        replyText,
        navigate,
        userName: user.name
      });

      if (res.success) {
        const newReply = {
          reply: replyText,
          userName: user.name,
          createdAt: new Date().toISOString(),
          likes: { count: 0, users: [] },
        };

        const updatedComments = allComments.map((c) => {
          if (c._id === comment._id) {
            return {
              ...c,
              replies: [...(c.replies || []), newReply],
            };
          }
          return c;
        });

        setComments?.(updatedComments);
        setReplyText("");
        setShowReplyInput(false);
      }

    } catch (err) {
      console.error("Error submitting reply:", err);
    }
  };

  const handleReplyLike = (index) => {
    setLikedReplies(prev => {
      const updated = [...prev];
      const wasLiked = prev[index];

      setReplyLikesCount(prevLikes => {
        const updatedLikes = [...prevLikes];
        const currentCount = Number.isFinite(updatedLikes[index]) ? updatedLikes[index] : 0;

        updatedLikes[index] = wasLiked
          ? Math.max(0, currentCount - 1)
          : currentCount + 1;

        return updatedLikes;
      });

      updated[index] = !wasLiked;
      return updated;
    });
  };



  if (!comment) return null;

  return (
    <div className={style.commentItem}>
      <div className={style.commentAvatar}>
        {comment.user?.profileImage ? (
          <img src={comment.user.profileImage} alt={comment.user.name} className={style.commentAvatarImg} />
        ) : (
          <Profile className={style.commentAvatarIcon} />
        )}
      </div>

      <div className={style.commentContent}>
        <div className={style.commentBubble}>
          <div className={style.commentHeader}>
            <span className={style.commentUsername}>{name}</span>
          </div>

          {creator && (
            <>
              <div className={style.menuWrapper}>
                <Edit onClick={() => setEdit(!edit)} className={style.edit} />
                <div className={style.hintMenu}>edit post</div>
              </div>
              {edit && (
                <div className={style.overlay}>
                  <div className={style.editContainer}>
                    <h3>Edit Comment</h3>
                    <textarea
                      className={style.editTextarea}
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    />
                    <div className={style.buttonGroup}>
                      <button className={style.saveButton} onClick={handleEditSubmit}>Save</button>
                      <button className={style.cancelButton} onClick={() => setEdit(false)}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className={style.commentText}>{comment.comment}</div>

          <div className={style.replyIconWrapper}>
            {!showReplyInput && (
              <Reply onClick={() => setShowReplyInput(true)} className={style.replyIcon} />
            )}
          </div>

          <div className={style.commentActions}>
            <span className={style.commentTime}>{formatCommentDate(comment.createdAt)}</span>

            {likeCount > 0 ? (
              <div className={style.likeBtnWrapper}>
                <button
                  className={`${style.likeBtn} ${liked ? style.liked : ''}`}
                  onClick={handleLikeClick}
                >
                  {liked ? '❤️' : '🤍'}
                  {likeCount}
                </button>
                {/* <div className={style.tooltip}>
                  {comment.likes.users?.map(u =>
                    typeof u === 'object' ? u.name : 'User'
                  ).join(', ')}
                </div> */}
              </div>
            ) : (
              <div className={style.likeBtnWrapper}>
                <button
                  className={style.likeBtn}
                  onClick={handleLikeClick}
                >
                  🤍 {likeCount}
                </button>
                <div className={style.tooltip}>No likes yet</div>
              </div>
            )}
          </div>
        </div>

        {showReplyInput && (
          <div className={style.replyInputBox}>
            <input
              type="text"
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => {
                setReplyText(e.target.value);
                if (replyError) setReplyError('');
              }}
              className={style.replyInput}
            />

            {/* Error message */}
            {replyError && (
              <p className={style.replyError}>
                {replyError}
              </p>
            )}

            <div className={style.replyButtons}>
              <button
                onClick={handleReplySubmit}
                className={style.replySendBtn}
              >
                Send
              </button>
              <button
                onClick={() => {
                  setReplyText('');
                  setShowReplyInput(false);
                  setReplyError('');
                }}
                className={style.replyCancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!showReplyInput && comment.replies?.length > 0 && (
          <div className={style.repliesSection}>
            {comment.replies.map((reply, idx) => {
              const likeCount = Number.isFinite(replyLikesCount[idx]) ? replyLikesCount[idx] : 0;

              return (
                <div key={idx} className={style.singleReply}>
                  <p>{reply.reply}</p>
                  <small>by: {typeof reply.userName === 'string' ? reply.userName : 'User'}</small>

                  <button
                    className={`${style.likeBtn} ${likedReplies[idx] ? style.liked : ''}`}
                    onClick={() => handleReplyLike(idx)}
                  >
                    {likedReplies[idx] ? '❤️' : '🤍'} {likeCount}
                  </button>
                  <div className={style.tooltip}>
                    {reply.likes?.users?.map(u => typeof u === 'object' ? u.name : 'User').join(', ') || 'No likes yet'}
                  </div>
                </div>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;
