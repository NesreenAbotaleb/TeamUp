import axios from "axios";
import api from "./../../api/API";

const GetComments = async (postId, navigate, setComments) => {
    console.log("GetComments received postId:", postId);
    
    try {
        const token = localStorage.getItem("token");
        
        if (!token) {
            navigate("/login");
            return [];
        }
        
        // Debug the URL being called
        console.log(`Calling API endpoint: ${api}/posts/comments/${postId}`);
        
        const response = await axios.get(`${api}/posts/comments/${postId}`, {
            headers: {
                'Authorization': token
            }
        });
        
        // Check what the response contains
        console.log("Comments API response:", response.data);
        
        // Update state if setComments is provided
        if (setComments) {
            setComments(prevComments => ({
                ...prevComments,
                [postId]: response.data.comments || []
            }));
        }
        
        // Return the comments array for use in fetchComments
        return response.data.comments || [];
    } catch (error) {
        console.error("Error in GetComments:", error);
        
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
        } else if (error.response?.status === 404) {
            console.error(`Comments endpoint not found: ${api}/posts/comments/${postId}`);
        }
        
        return [];
    }
};

export default GetComments;