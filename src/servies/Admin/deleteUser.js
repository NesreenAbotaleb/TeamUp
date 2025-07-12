import axios from "axios";
import api from "../../api/API";

const DeleteUser = async (navigate, userId) => {
    console.log('User ID:', userId);
    
    try {
        const token = localStorage.getItem("token");
        
        if (!token) {
            console.warn("No token found, redirecting to login");
            navigate("/login");
            return { success: false, error: "No authentication token" };
        }

        // Validate userId before making the request
        if (!userId || userId.trim() === '') {
            console.error("Invalid user ID provided");
            return { success: false, error: "Invalid user ID" };
        }

        const response = await axios.delete(`${api}/admin/deleteUser/${userId}`, {
            headers: {
                'Authorization': token
            },
            timeout: 10000 // 10 second timeout
        });

        console.log('API delete user from admin:', response.data);
        
        // Return the response object with status and data
        return { 
            success: true, 
            status: response.status,
            data: response.data 
        };
        
    } catch (error) {
        console.error("Error deleting user:", error);
        
        // Handle different error scenarios
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const errorMessage = error.response.data?.message || "Unknown server error";
            
            switch (status) {
                case 400:
                    console.error("Bad request - Invalid user ID format");
                    return { success: false, error: "Invalid user ID format", status };
                    
                case 401:
                    console.warn("Unauthorized - removing token and redirecting");
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                    return { success: false, error: "Authentication failed", status };
                    
                case 404:
                    console.error("User not found");
                    return { success: false, error: "User not found", status };
                    
                case 500:
                    console.error("Server error:", errorMessage);
                    return { success: false, error: "Server error occurred", status };
                    
                default:
                    console.error(`Unexpected error status: ${status}`);
                    return { success: false, error: `Server error: ${status}`, status };
            }
        } else if (error.request) {
            // Network error
            console.error("Network error - no response received");
            return { success: false, error: "Network error - please check your connection" };
        } else {
            // Other error
            console.error("Request setup error:", error.message);
            return { success: false, error: "Request failed" };
        }
    }
};

export default DeleteUser;