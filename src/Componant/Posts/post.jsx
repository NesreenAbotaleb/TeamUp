import { useContext, useEffect, useState } from "react";
import style from './style.module.css';
import { ReactComponent as Profile } from './../../assets/svgs/menu/profile.svg';
import { ReactComponent as EComment } from './../../assets/svgs/posts/emptycomment.svg';
import { ReactComponent as EHeart } from './../../assets/svgs/posts/emptyheart.svg';
import { ReactComponent as Heart } from './../../assets/svgs/posts/fullheart.svg';
import { ReactComponent as List } from './../../assets/svgs/icons/bi_three-dots-vertical-colored.svg';

import UserContext from "../../context/Usercontext";
import Comments from "./comments";
import CreateComment from "./createComment";
import EditList from "./editList";
import UpdatePost from "../../servies/Posts/UpdatePost";
import DeletePost from "../../servies/Posts/deletePost";
import Like from "../../servies/Posts/like";

function Post(props) {
    const { user } = useContext(UserContext);
    
    // Extract data from the correct post structure
    const postData = props.post || props; // Handle both direct props and post object
    
    // Find publisher info from users array
    const publisherInfo = props.users ? 
        props.users.find(u => u._id === postData.publisherId) : 
        null;
    
    const [commentCount, setCommentCount] = useState(postData.comments?.length || 0);
    const [loved, setLoved] = useState(false);
    const [showComments, setShowComments] = useState(true);
    const [showCreateComment, setShowCreateComment] = useState(false);
    const [comments, setComments] = useState(postData.comments || []);
    const [openList, setOpenList] = useState(false);
    const [edit, setEdit] = useState(false);
    const [delet, setDelete] = useState(false);
    const [editedContent, setEditedContent] = useState(postData.content || "");
    const [likesList, setLikesList] = useState(postData.likes?.users || []);
    const [likeCount, setLikeCount] = useState(postData.likes?.count || 0);

    // Check if current user is the creator
    const creator = user && (postData.publisherId === user.userId || postData.publisherId === user._id);

    const checkIfUserLiked = (likesList, userId) => {
        if (!likesList || !userId) return false;
        if (likesList.length > 0 && typeof likesList[0] === 'object') {
            if (likesList[0].userId) {
                return likesList.some(like => like.userId === userId);
            } else if (likesList[0]._id) {
                return likesList.some(like => like._id === userId);
            }
        }
        return likesList.includes(userId);
    };

    useEffect(() => {
        setCommentCount(postData.comments?.length || 0);
        const userHasLiked = checkIfUserLiked(postData.likes?.users || [], user?._id || user?.userId);
        setLoved(userHasLiked);
        setComments(postData.comments || []);
        setEditedContent(postData.content || "");
        setLikesList(postData.likes?.users || []);
        setLikeCount(postData.likes?.count || 0);
    }, [postData, user]);

    const handleHeartClick = async () => {
        try {
            await Like(postData._id);
            const newLovedState = !loved;
            setLoved(newLovedState);
            if (newLovedState) {
                setLikeCount(prev => prev + 1);
                if (user) {
                    setLikesList(prev => [...prev, { userId: user._id || user.userId, ...user }]);
                }
            } else {
                setLikeCount(prev => Math.max(0, prev - 1));
                if (user) {
                    setLikesList(prev =>
                        prev.filter(like =>
                            (like.userId && like.userId !== (user._id || user.userId)) ||
                            (like._id && like._id !== (user._id || user.userId))
                        )
                    );
                }
            }
            if (props.fetchPosts) props.fetchPosts();
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const handleCommentClick = () => {
        setShowCreateComment(!showCreateComment);
        if (!showComments) setShowComments(true);
    };

    const handleNewComment = (newComment) => {
        const updatedComments = [...comments, newComment];
        setComments(updatedComments);
        setCommentCount(commentCount + 1);
        if (props.onCommentCreated) props.onCommentCreated(postData._id);
    };

    const handleEditClick = () => {
        setEdit(true);
        setOpenList(false);
    };

    const handleDeleteClick = () => {
        setDelete(true);
        setOpenList(false);
    };

    const handleEditSubmit = async () => {
        try {
            if (!editedContent) return alert("Post content cannot be empty");
            if (!postData._id) return alert("Missing post ID");
            await UpdatePost(editedContent, postData._id);
            setEdit(false);
            if (props.fetchPosts) props.fetchPosts();
        } catch (error) {
            console.error("Failed to update post:", error);
        }
    };

    const handleDeleteSubmit = async () => {
        try {
            await DeletePost(postData._id);
            if (props.fetchPosts) props.fetchPosts();
            setDelete(false);
        } catch (error) {
            console.error("Failed to delete post:", error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return `Today at ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className={style.postWrapper}>
            <div className={style.PostContainer}>
                <div className={style.creatorInfo}>
                    <div className={style.prof}>
                        {publisherInfo?.img ? (
                            <div className={style.profImg}><img src={publisherInfo.img} alt="profile" /></div>
                        ) : (
                            <Profile className={style.profImg} />
                        )}
                    </div>
                    <div className={style.Info}>
                        <h3 className={style.publisher}>{publisherInfo?.name || props.publisher || "Unknown User"}</h3>
                        <p className={style.date}>{formatDate(postData.date || postData.createdAt)}</p>
                    </div>
                </div>

                <div className={style.listConatiner}>
                    <List onClick={() => setOpenList(!openList)} className={style.list} />
                    {openList && (
                        <EditList
                            setEdit={creator ? handleEditClick : null}
                            setDelete={creator ? handleDeleteClick : null}
                            showEditDelete={creator}
                            postId={postData._id}
                            communityId={postData.commId}
                        />
                    )}
                </div>

                {creator && edit && (
                    <div className={style.overlay}>
                        <div className={style.editContainer}>
                            <h3>Edit Post</h3>
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

                {creator && delet && (
                    <div className={style.overlay}>
                        <div className={style.Delete}>
                            <h3>Delete Post</h3>
                            <p>Are you sure you want to delete this post?</p>
                            <div className={style.buttonGroup}>
                                <button className={style.deleteButton} onClick={handleDeleteSubmit}>Delete</button>
                                <button className={style.cancelButton} onClick={() => setDelete(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className={style.postContent}>
                    <div className={style.postText}><p>{postData.content}</p></div>
                    {postData.img && (
                        <div className={style.postImage}>
                            <img src={postData.img} alt="post content" />
                        </div>
                    )}
                    {postData.file && (
                        <div className={style.postFile}>
                            <a href={postData.file} target="_blank" rel="noopener noreferrer">
                                📁 Download File
                            </a>
                        </div>
                    )}
                </div>

                <div className={style.statsContainer}>
                    {commentCount > 0 && (
                        <div className={style.commentCount}>
                            {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                        </div>
                    )}
                    {likeCount > 0 && (
                        <div className={style.likeCount}>
                            {loved ? 'You' : ''}
                            {loved && likeCount > 1 ? ` and ${likeCount - 1} others` : !loved && likeCount > 0 ? `${likeCount} ${likeCount === 1 ? 'person' : 'people'}` : ''} liked this
                        </div>
                    )}
                </div>

                <div className={style.postIcons}>
                    <div className={style.iconWrapper} onClick={handleCommentClick}>
                        <EComment className={style.commentIcon} />
                        <span>Comment</span>
                    </div>
                    <div className={style.iconWrapper} onClick={handleHeartClick}>
                        {loved ? (
                            <>
                                <Heart className={style.heartIcon} />
                                <span className={style.active}>Like</span>
                            </>
                        ) : (
                            <>
                                <EHeart className={style.heartIcon} />
                                <span>Like</span>
                            </>
                        )}
                    </div>
                </div>

                <div className={style.commentSection}>
                    {showCreateComment && (
                        <CreateComment
                            postId={postData._id}
                            onCommentSubmit={handleNewComment}
                            setShowCreateComment={setShowCreateComment}
                        />
                    )}
                    <Comments
                        postId={postData._id}
                        initialComments={comments}
                        setComments={setComments}
                    />
                </div>
            </div>
        </div>
    );
}

export default Post;