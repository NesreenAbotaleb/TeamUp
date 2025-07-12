import axios from "axios";
import api from "./../../api/API";

const FetchTeam = async ({ code, team_Code }) => {
    console.log("FetchTeam service called with:", { code, team_Code });
   
    // Validate parameters
    if (!code || !team_Code) {
        console.error("Missing required parameters:", { code, team_Code });
        return null;
    }
    
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
        console.error("No authentication token found");
        return null;
    }
    
    try {
        // Build the URL for the API call
        const url = `${api}/teams/${team_Code}`;
        console.log("API endpoint:", url);
        
        // Make the API call
        console.log("Making API request with token:", token.substring(0, 10) + "...");
        const response = await axios.get(url, {
            headers: { Authorization: `${token}` }
        });
        
       
        // Check response data
        if (!response || !response.data) {
            console.warn("API returned empty response");
            return null;
        }
       
        console.log("Team data retrieved successfully:", response.data);
        return response.data;
        
    } catch (error) {
        // Detailed error logging
        console.error("FetchTeam API call failed");
        
        if (error.response) {
            console.error("Response error:", {
                status: error.response.status,
                data: error.response.data
            });
        } else if (error.request) {
            console.error("No response received:", error.request);
        } else {
            console.error("Error:", error.message);
        }
        
        throw error; // Re-throw to allow component to handle the error
    }
};

export default FetchTeam;