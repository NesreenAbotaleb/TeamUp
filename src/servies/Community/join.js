import axios from "axios";
import api from "./../../api/API";

const handelJoin = async (editdata, setCommunities, setJoin) => {
    console.log("handelJoin called");
    
    // Validate input
    if (!editdata.code || !editdata.code.trim()) {
        throw new Error("Please enter a valid community code");
    }

    const communityCode = editdata.code.trim();
    console.log("Joining community with code:", communityCode);

    try {
        const token = localStorage.getItem('token');
        console.log("Token:", token ? "Present" : "Missing");
        
        if (!token) {
            throw new Error("You are not logged in. Please log in again.");
        }

        // Make the API call
        const response = await axios.post(
            `${api}/community/join/${communityCode}`, 
            {}, // Empty body since code is in URL
            {
                headers: { 'Authorization': `${token}` }
            }
        );

        console.log("Join Response:", response.data);

        // Validate response structure
        if (!response.data?.community) {
            throw new Error("Failed to join community. Unexpected response format.");
        }

        const joinedCommunity = response.data.community;
        console.log("Joined Community:", joinedCommunity);

        // Update communities state with the new community
        setCommunities(prevCommunities => [...prevCommunities, joinedCommunity]);
        
        // Close the join modal
        setJoin(false);

        // Return the joined community for potential use
        return joinedCommunity;

    } catch (err) {
        console.error("Join Error:", err);
        
        // Handle specific error cases
        if (err.response) {
            // Server responded with error status
            const status = err.response.status;
            const message = err.response.data?.message;
            
            if (status === 401) {
                // Token expired or invalid
                localStorage.removeItem("token");
                throw new Error("Session expired. Please log in again.");
            } else if (status === 404) {
                // Community not found
                throw new Error(message || "Community not found. Please check the code and try again.");
            } else if (status === 409) {
                // Already a member
                throw new Error(message || "You are already a member of this community.");
            } else if (status === 400) {
                // Bad request (invalid code format)
                throw new Error(message || "Invalid community code format.");
            } else if (status === 403) {
                // Forbidden (community is private, invitation required, etc.)
                throw new Error(message || "You don't have permission to join this community.");
            } else if (status >= 500) {
                // Server error
                throw new Error("Server error. Please try again later.");
            } else {
                // Other HTTP errors
                throw new Error(message || `Failed to join community (Error ${status})`);
            }
        } else if (err.request) {
            // Network error
            throw new Error("Network error. Please check your connection and try again.");
        } else if (err.message) {
            // Re-throw validation errors and other custom errors
            throw err;
        } else {
            // Unknown error
            throw new Error("An unexpected error occurred while joining the community.");
        }
    }
};

export default handelJoin;