import React, { useState, useContext } from 'react';
import style from './style.module.css';
import { ReactComponent as Profile } from './../../assets/svgs/menu/profile.svg';
import { ReactComponent as Cross } from './../../assets/svgs/Cross.svg';
import Comment from '../../servies/Posts/comment';
import UserContext from '../../context/Usercontext';
import { useNavigate } from 'react-router-dom';

const CreateComment = ({ postId, onCommentCreated, onCommentSubmit, isModal = false, onClose , setShowCreateComment}) => {
  const [commentText, setCommentText] = useState('');
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
 
  const handleSubmit = async (e) => {
    e.preventDefault();
   
    if (!commentText.trim() || isSubmitting) return;
   
    setIsSubmitting(true);
    setError('');
   
    try {
      // Simplified call to Comment service - only pass what it needs
      const result = await Comment({
        navigate,
        commentText,
        postId
      });
     
      
      if (result && result.success) {
        
        if (onCommentSubmit && typeof onCommentSubmit === 'function') {
          onCommentSubmit(commentText);
        }
        setShowCreateComment(false)
        
        if (onCommentCreated && typeof onCommentCreated === 'function') {
          onCommentCreated(commentText);
        }
       
        
        setCommentText('');
       
        
        if (isModal && onClose) {
          onClose();
          
        }
      } else {
        // Don't close the modal if there was an error
        setError('Failed to create comment. Please try again.');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={isModal ? style.commentModalContent : style.createCommentContainer}>
      {isModal && (
        <>
          <div className={style.modalHeader}>
            <p>Write a comment</p>
            <div className={style.top}>
              <Cross className={style.cross} onClick={onClose} />
            </div>
          </div>
          <hr />
        </>
      )}
     
      <div className={style.commentFormContainer}>
        <div className={style.userInfo}>
          <Profile className={style.photo} />
          <span>{user?.name || 'You'}</span>
        </div>
       
        <textarea
          className={style.commentInput}
          placeholder="Write your comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        ></textarea>
       
        {error && <div className={style.errorMessage}>{error}</div>}
       
        <button
          className={style.commentButton}
          onClick={handleSubmit}
          disabled={!commentText.trim() || isSubmitting}
        >
          {isSubmitting ? 'Posting...' : 'Comment'}
        </button>
      </div>
    </div>
  );
};

export default CreateComment;