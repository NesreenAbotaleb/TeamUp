import axios from "axios";
import api from "./../../api/API";

const SetPost = async ({ content, imageFile, file, code_Comm, setPostContent, setShowModal, navigate, fetchPosts }) => {
    console.log("SetPost called with:", { 
        content: content || "No content", 
        imageFile: imageFile?.name || "No image", 
        file: file?.name || "No file", 
        code_Comm 
    });
    
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You are not logged in. Please log in again.");
            navigate("/login");
            return;
        }

        // Create FormData object for multipart/form-data
        const formData = new FormData();
        
        // Add content if provided
        if (content && content.trim()) {
            formData.append('content', content);
        }
        
        // Add image file if provided
        if (imageFile) {
            formData.append('img', imageFile);
        }
        
        // Add other file if provided
        if (file) {
            formData.append('file', file);
        }

        // Make sure at least one field is provided
        if (!content?.trim() && !imageFile && !file) {
            alert("Please provide content, image, or file to create a post.");
            return;
        }

        console.log("Sending request to:", `${api}/posts/create/${code_Comm}`);

        const response = await axios.post(
            `${api}/posts/create/${code_Comm}`,
            formData,
            {
                headers: { 
                    Authorization: `${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        console.log("Response:", response.data);

        if (response.data) {
            // Clear form
            setPostContent("");
            setShowModal(false);
            
            // Refresh posts
            if (fetchPosts) {
                fetchPosts();
            }
            
            alert("Post created successfully!");
        }
    } catch (err) {
        console.error("Create Error:", err.response?.data || err.message);
        alert(err.response?.data?.message || "Failed to create post. Please try again.");
    }
};

export default SetPost;