import axios from "axios";
import api from "./../../api/API";

const EditComment = async (content , postId , commentId) => {
    console.log('Update comment - Content:', content);
    console.log('Update comment - Post ID:', postId);
    console.log('Update comment - Comment ID:', commentId);
    
    if (!postId) {
        console.error("Error: No comment ID provided");
        throw new Error("comment ID is required");
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("Error: No authentication token found");
        throw new Error("Authentication required");
    }
    
    const payload = {
        comment : content
    };
    
    try {
        console.log(`Making request to: ${api}/posts/edit/${postId}/${commentId}`);
        console.log("With payload:", JSON.stringify(payload));
        
        const response = await axios.put(`${api}/posts/edit/${postId}/${commentId}`, payload, {
            headers: {
                'Authorization': token,
                // 'Content-Type': 'application/json'
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
}
export default EditComment;