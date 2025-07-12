import axios from "axios";
import api from "./../../api/API";

const DeletePost = async (postId) => {
    if (!postId) {
        console.error("Error: No post ID provided");
        throw new Error("Post ID is required");
    }
   
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("Error: No authentication token found");
        throw new Error("Authentication required");
    }
    
    try {
        const response = await axios.delete(`${api}/posts/delete/${postId}`, {
            headers: { 'Authorization': `${token}` }
        });
        console.log('Delete successful:', response.data);
        return response.data;
    } catch (err) {
        console.error("Delete Error Details:", {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            message: err.message
        });
       
        throw err;
    }
}

export default DeletePost;