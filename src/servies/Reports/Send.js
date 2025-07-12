import axios from "axios";
import api from "../../api/API";

const SendReport = async (navigate, reportData) => {
    console.log('Report Data:', reportData);
    
    try {
        const token = localStorage.getItem("token");
        
        if (!token) {
            console.warn("No token found, redirecting to login");
            navigate("/login");
            return { success: false, error: "No authentication token" };
        }

        // Validate required fields before making the request
        if (!reportData || !reportData.reportContent || !reportData.communityId) {
            console.error("Missing required fields");
            return { success: false, error: "Missing required fields: reportContent and communityId are required" };
        }

        // Validate reportContent is not empty
        if (reportData.report === '') {
            console.error("Report content cannot be empty");
            return { success: false, error: "Report content cannot be empty" };
        }

        const response = await axios.post(`${api}/report/sendReport`, reportData, {
            headers: {
                'Authorization': token,
                // 'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
        });

        console.log('API send report response:', response.data);
        
        // Return the response object with status and data
        return { 
            success: true, 
            status: response.status,
            data: response.data,
            message: response.data.message || "Report sent successfully"
        };
        
    } catch (error) {
        console.error("Error sending report:", error);
        
        // Handle different error scenarios
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const errorMessage = error.response.data?.message || error.response.data || "Unknown server error";
            
            switch (status) {
                case 400:
                    console.error("Bad request - Missing required fields");
                    return { success: false, error: errorMessage, status };
                    
                case 401:
                    console.warn("Unauthorized - removing token and redirecting");
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                    return { success: false, error: "Authentication failed", status };
                    
                case 403:
                    console.error("Forbidden:", errorMessage);
                    return { success: false, error: errorMessage, status };
                    
                case 404:
                    console.error("Not found:", errorMessage);
                    return { success: false, error: errorMessage, status };
                    
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

export default SendReport;