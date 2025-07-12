import axios from "axios";
import api from "./../../api/API";

const Like = async (postId) => {
    try {
        const token = localStorage.getItem('token');
        console.log('token: ', token);
        
        // The headers should be passed as a separate config object, not in the request body
        const response = await axios.post(
            `${api}/posts/like/${postId}`, 
            {}, 
            {
                headers: { 'Authorization': `${token}` }
            }
        );
        
        console.log('like response: ', response);
        return response;
    } catch (err) {
        console.error("Like Error:", err.response || err);
        alert(err.response?.data?.message || "Failed to like post. Please try again.");
        throw err; 
    }
};

export default Like;