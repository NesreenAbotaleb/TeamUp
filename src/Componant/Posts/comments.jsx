import React, { useState, useEffect, useContext } from 'react';
import style from './style.module.css';
import Comment from './comment';
import GetComments from '../../servies/Posts/getAllComments';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../context/Usercontext';

const Comments = ({ postId, initialComments, setComments }) => {
  const { users } = useContext(UserContext);
  const [comments, setLocalComments] = useState(initialComments || []); 
  const [visibleCount, setVisibleCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const navigate = useNavigate();


  // Function to fetch comments
  const fetchComments = async () => {
    setLoading(true);
    try {
      const fetchedComments = await GetComments(postId, navigate);
      if (Array.isArray(fetchedComments)) {
        setLocalComments(fetchedComments); 
        setComments?.(fetchedComments);    
        setAllLoaded(fetchedComments.length <= visibleCount);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial comments when component mounts
  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleLoadMore = () => {
    setVisibleCount(comments.length);
    setAllLoaded(true);
  };

  const visibleComments = comments.slice(-visibleCount);
  useEffect(() => {
    setLocalComments(initialComments || []);
  }, [initialComments]);

  return (
    <div className={style.commentsContainer}>
      {comments.length > 0 ? (
        <>
          <div className={style.commentsList}>
            {visibleComments.map((comment, index) => (
              <Comment
                comment={comment}
                postId={postId}
                refreshComments={fetchComments} 
                setComments={setLocalComments}
                allComments={comments}
              />

            ))}

          </div>
          {!allLoaded && comments.length > visibleCount && (
            <button
              className={style.viewMoreButton}
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : `View ${comments.length - visibleCount} more comment(s)`}
            </button>
          )}

        </>
      ) : (
        <p className={style.noComments}>No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
};

export default Comments;