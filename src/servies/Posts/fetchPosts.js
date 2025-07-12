import axios from "axios";
import api from "./../../api/API";

/**
 * Fetches posts from a community
 * @param {Object} options - The options for fetching posts
 * @param {string} options.comm_Code - The community code
 * @param {function} options.navigate - The navigation function
 * @param {function} options.setPosts - Function to set posts state
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=10] - Number of posts per request
 * @returns {Promise} - The fetch response
 */
const FetchPosts = async ({ comm_Code, navigate, setPosts, page = 1, limit = 20 }) => {
    if (!comm_Code) {
        console.error("Community code is required");
        return;
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("No authentication token found");
        navigate("/login");
        return;
    }
    
    const url = `${api}/community/posts/${comm_Code}`;
    
    try {
        const response = await axios.get(url, {
            headers: { Authorization: `${token}` },
            params: { page, limit }
        });
        
        console.log('Response data:', response.data);
        
        if (response.data && response.data.posts) {
            // Sort posts by date in descending order (newest first)
            const sortedPosts = response.data.posts.sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            
            setPosts(sortedPosts);
            return response.data;
        } else {
            console.error("Invalid response format", response.data);
            setPosts([]);
            return null;
        }
    } catch (error) {
        console.error("Posts fetch error:", error);
        
        // Handle unauthorized error
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
        }
        
        // Handle other errors
        setPosts([]);
        throw error;
    }
};

export default FetchPosts;