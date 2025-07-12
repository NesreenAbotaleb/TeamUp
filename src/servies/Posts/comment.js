import axios from "axios";
import api from "./../../api/API"

const Comment = async (props) => {
    const token = localStorage.getItem("token");
    const navigate = props.navigate
    console.log("postId:", props.postId)
    
    if (!token) {
        alert("You are not logged in. Please log in again.");
        navigate("/login");
        return { success: false, error: "No token" };
    }

    try {
        // Log what we're attempting to send
        console.log("Sending comment to API:", {
            url: `${api}/posts/comment/${props.postId}`,
            payload: { comment: props.commentText },
            hasToken: !!token
        });
        
        let payload = {
            "comment": props.commentText
        }
        
        // Make the API call
        const response = await axios.post(`${api}/posts/comment/${props.postId}`, payload, {
            headers: { Authorization: `${token}` }
        });
        
        console.log("API Response Status:", response.status);
        console.log("API Response Data:", response.data);
        console.log("Comment posted successfully!");
        
        // IMPORTANT: Return success without trying to update comments
        // Let the component handle updating the UI
        return { 
            success: true, 
            data: response.data,
            commentText: props.commentText 
        };
        
    } catch (err) {
        console.error("Set comment Error:", err);
        
        // Provide more detailed error information
        if (err.response) {
            console.error("Error response data:", err.response.data);
            console.error("Error response status:", err.response.status);
            alert(err.response?.data?.message || "Failed to create comment. Please try again.");
        } else if (err.request) {
            // The request was made but no response was received
            console.error("No response received:", err.request);
            alert("Network error. Please check your connection and try again.");
        } else {
            // Something happened in setting up the request
            console.error("Error message:", err.message);
            alert("Failed to create comment. Please try again.");
        }
        
        // Return failure to the component
        return { success: false, error: err };
    }
}

export default Comment;