import axios from "axios";
import api from "./../../api/API";

const UpdatePost = async (content, postId) => {
    console.log('Update post - Content:', content);
    console.log('Update post - Post ID:', postId);
    
    if (!postId) {
        console.error("Error: No post ID provided");
        throw new Error("Post ID is required");
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("Error: No authentication token found");
        throw new Error("Authentication required");
    }
    
    const payload = {
        "content": content, // Using the correct property name
        "img": null,
        "file": null,
    };
    
    try {
        console.log(`Making request to: ${api}/posts/update/${postId}`);
        console.log("With payload:", JSON.stringify(payload));
        
        const response = await axios.put(`${api}/posts/update/${postId}`, payload, {
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Update successful:', response.data);
        return response.data;
    } catch (err) {
        console.error("Update Error Details:", {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            message: err.message
        });
        
        throw err;
    }
};

export default UpdatePost;