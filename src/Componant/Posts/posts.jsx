import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import style from './style.module.css';
import Post from "./post";
import FetchPosts from "../../servies/Posts/fetchPosts";
import UserContext from "../../context/Usercontext";
import CreatePost from './createPost';
import { ReactComponent as Nopost } from './../../assets/svgs/posts 1.svg';
import GetComments from '../../servies/Posts/getAllComments';

// Add a new service to fetch a single post by ID
const fetchSinglePost = async (postId, navigate) => {
    try {
        // Replace this with your actual API call to fetch a single post
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                navigate('/login');
                return null;
            }
            throw new Error('Failed to fetch post');
        }
        
        return await response.json();
    } catch (error) {
        console.error("Error fetching single post:", error);
        return null;
    }
};

function Posts({ onCreate, users, communityCode, userId, communityId }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const observer = useRef();
    const POSTS_PER_PAGE = 5; // Number of posts to load at once
    
    // State for tracking comment counts for each post
    const [commentCounts, setCommentCounts] = useState({});
    
    // ✅ FIXED: Store communityId in state to maintain consistency
    const [currentCommunityId, setCurrentCommunityId] = useState(communityId);
    
    // ✅ ADDED: Update communityId when prop changes
    useEffect(() => {
        if (communityId && communityId !== currentCommunityId) {
            console.log('📱 Updating communityId in Posts:', communityId);
            setCurrentCommunityId(communityId);
        }
    }, [communityId, currentCommunityId]);
    
    console.log('🆔 Posts Component - Community ID:', {
        propCommunityId: communityId,
        currentCommunityId: currentCommunityId,
        finalId: currentCommunityId || communityId
    });

    // Function to fetch posts that can be called after creating a new post
    const fetchPosts = async () => {
        setLoading(true);
        try {
            await FetchPosts({
                comm_Code: communityCode,
                navigate,
                setPosts: (fetchedPosts) => {
                    // If userId is provided, filter posts by that user
                    const filteredPosts = userId 
                        ? fetchedPosts.filter(post => post.publisherId === userId)
                        : fetchedPosts;
                    
                    // Take only the first batch of posts
                    const initialPosts = filteredPosts.slice(0, POSTS_PER_PAGE);
                    setPosts(initialPosts);
                    setHasMore(filteredPosts.length > POSTS_PER_PAGE);
                    
                    console.log('initialPosts: ', initialPosts);
                    
                    // Store all posts in localStorage for pagination
                    localStorage.setItem('allPosts', JSON.stringify(filteredPosts));
                    
                    // Initialize comment counts
                    const initialCommentCounts = {};
                    initialPosts.forEach(post => {
                        initialCommentCounts[post._id] = post.comments ? post.comments.length : 0;
                    });
                    setCommentCounts(initialCommentCounts);
                }
            });
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial posts fetch
    useEffect(() => {
        fetchPosts();
    }, [communityCode, navigate, userId]);

    // Function to refresh a specific post
    const refreshPost = async (postId) => {
        try {
            // Fetch the updated post
            const updatedPost = await fetchSinglePost(postId, navigate);
            
            if (updatedPost) {
                // Update the post in the posts array
                setPosts(prevPosts => prevPosts.map(post => 
                    post._id === postId ? updatedPost : post
                ));
                
                // Also update the post in localStorage
                const allPosts = JSON.parse(localStorage.getItem('allPosts') || '[]');
                const updatedAllPosts = allPosts.map(post => 
                    post._id === postId ? updatedPost : post
                );
                localStorage.setItem('allPosts', JSON.stringify(updatedAllPosts));
                
                // Update comment count
                setCommentCounts(prev => ({
                    ...prev,
                    [postId]: updatedPost.comments ? updatedPost.comments.length : 0
                }));
            }
        } catch (error) {
            console.error("Error refreshing post:", error);
        }
    };

    // Function to update comment count for a specific post
    const updateCommentCount = async (postId) => {
        try {
            const comments = await GetComments(postId, navigate, null);
            if (comments && Array.isArray(comments)) {
                setCommentCounts(prev => ({
                    ...prev,
                    [postId]: comments.length
                }));
                
                // Refresh the entire post when comments change
                refreshPost(postId);
            }
        } catch (error) {
            console.error("Error fetching comment count:", error);
        }
    };

    // Function to format date in a readable way
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Function to check if a post is loved by current user
    const isPostLovedByUser = (post) => {
        if (!user || !post.likes || !post.likes.users) return false;
        return post.likes.users.some(postUserId => postUserId === user._id);
    };

    // Last element ref callback for intersection observer
    const lastPostElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMorePosts();
            }
        }, { threshold: 0.5 });
        
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Load more posts function
    const loadMorePosts = () => {
        setLoading(true);
        setTimeout(() => {
            const allPosts = JSON.parse(localStorage.getItem('allPosts') || '[]');
            const nextPosts = allPosts.slice(
                page * POSTS_PER_PAGE, 
                (page + 1) * POSTS_PER_PAGE
            );
            
            if (nextPosts.length > 0) {
                setPosts(prevPosts => [...prevPosts, ...nextPosts]);
                
                // Update comment counts for new posts
                const newCommentCounts = { ...commentCounts };
                nextPosts.forEach(post => {
                    newCommentCounts[post._id] = post.comments ? post.comments.length : 0;
                });
                setCommentCounts(newCommentCounts);
                
                setPage(prevPage => prevPage + 1);
                setHasMore(allPosts.length > (page + 1) * POSTS_PER_PAGE);
            } else {
                setHasMore(false);
            }
            setLoading(false);
        }, 500); // Small timeout to simulate loading
    };

    // Find publisher name from users array
    const findPublisherName = (publisherId) => {
        if (!users || !users.length) return "Unknown User";
        const publisher = users.find(user => user._id === publisherId);
        return publisher ? publisher.name || publisher.userName : "Unknown User";
    };
    
    // Determine if we should show the create post component
    const shouldShowCreatePost = () => {
        return onCreate && (!userId || (userId && user && userId === user._id));
    };

    // Handle comment created event
    const handleCommentCreated = (postId) => {
        // Update the comment count and refresh the post
        updateCommentCount(postId);
    };

    // ✅ FIXED: Ensure consistent communityId for all posts
    const finalCommunityId = currentCommunityId || communityId;
    console.log('users:', users);
    return (
        <div className={style.postsContainer}>
            {shouldShowCreatePost() && (
                <div className={style.createPostWrapper}>
                    <CreatePost 
                        communityCode={communityCode} 
                        fetchPosts={fetchPosts} 
                    />
                </div>
            )}
            
            <div className={style.container}>
                {posts.length > 0 ? (
                    posts.map((post, index) => {
                        // For the last element, attach the ref
                        if (posts.length === index + 1) {
                            return (
                                <div ref={lastPostElementRef} key={`${post._id}-${commentCounts[post._id]}`} className={style.postWrapper}>
                                    <Post 
                key={post._id}
                post={post}
                users={users}  // Pass the users array
                fetchPosts={fetchPosts}
            />
                                </div>
                            );
                        } else {
                            return (
                                <div key={`${post._id}-${commentCounts[post._id]}`} className={style.postWrapper}>
                                    <Post 
                                        key={post._id}
                                        post={post}
                                        users={users}  
                                        fetchPosts={fetchPosts}
                                    />
                                </div>
                            );
                        }
                    })
                ) : (
                    <div className={style.noPostsContainer}>
                        {userId ? (
                            <p>No posts available from this user in this community.</p>
                        ) : (
                            <Nopost className={style.noPosts}/>
                        )}
                    </div>
                )}
                
                {loading && (
                    <div className={style.loadingContainer}>
                        <div className={style.loadingSpinner}></div>
                        <p>Loading posts...</p>
                    </div>
                )}
                
                {!hasMore && posts.length > 0 && (
                    <div className={style.endOfPostsMessage}>
                        <p>You've reached the end of posts</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Posts;