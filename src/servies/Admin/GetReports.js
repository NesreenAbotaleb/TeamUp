import axios from "axios";
import api from "../../api/API";

const GetReports = async ( navigate, setReports, code_Comm) => {
    try {
        const token = localStorage.getItem("token");
        
        if (!token) {
            navigate("/login");
            return [];
        }

       

        const response = await axios.get(`${api}/report/getReports/admins`, {
            headers: { 
                Authorization: `${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('API Response Reports:', response.data);
        
        // Handle successful response
        if (response.data && Array.isArray(response.data)) {
            setReports(response.data);
            return response.data;
        } else {
            console.warn('Unexpected response format:', response.data);
            setReports([]);
            return [];
        }

    } catch(error) {
        console.error("Error in GetReports:", error);
        
        // Handle different error scenarios
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;
            
            // Check if it's the specific "no reports found" message
            if (data === "No reports found for this community") {
                console.log("No reports found for this community - returning empty array");
                setReports([]);
                return [];
            }
            
            switch (status) {
                case 401:
                    console.error("Authentication failed");
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                    break;
                    
                case 403:
                    console.error("Access forbidden:", data);
                    // Could show a message that user doesn't have professor privileges
                    break;
                    
                case 404:
                    console.log("No reports found or community not found:", data);
                    // This is not necessarily an error - just empty results
                    break;
                    
                case 500:
                    console.error("Server error while fetching reports");
                    throw new Error("Server error occurred");
                    
                default:
                    console.error(`Unexpected error status ${status}:`, data);
                    throw new Error(`Server error: ${status}`);
            }
        } else if (error.request) {
            // Network error - no response received
            console.error("Network error - no response received:", error.request);
            throw new Error("Network error - please check your connection");
        } else {
            // Something else went wrong
            console.error("Unexpected error:", error.message);
            throw new Error("An unexpected error occurred");
        }
        
        // Always set empty reports for any error
        setReports([]);
        return [];
    }
};

export default GetReports;