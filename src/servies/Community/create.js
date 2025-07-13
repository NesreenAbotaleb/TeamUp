import axios from "axios";
import api from "./../../api/API";

const handelCreate = async (name, setValidName, setCode, setCopy, setCreate, setCommunities, navigate, description) => {
    // Validate name length
    if (!name || name.length < 4 || name.length > 100) {
        setValidName(false);
        throw new Error("Community name must be between 4 and 100 characters");
    }

    console.log('description:', description);

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            // Clear any existing token and redirect to login
            localStorage.removeItem("token");
            navigate("/login");
            throw new Error("You are not logged in. Please log in again.");
        }

        // Prepare payload with description
        let payload = { 
            communityName: name.trim(), 
            description: description?.trim() || "" 
        };

        const response = await axios.post(`${api}/community/create`, payload, {
            headers: { Authorization: `${token}` }
        });

        console.log("Create Response:", response.data);

        // Validate response structure
        if (!response.data?.community) {
            throw new Error("Failed to create community. Unexpected response format.");
        }

        const newCommunity = response.data.community;
        console.log("New Community:", newCommunity);

        // Update UI state
        setCreate(false);
        
        if (newCommunity.code_Comm) {
            setCopy(true);
            setCode(newCommunity.code_Comm);
        }

        // Update communities state
        setCommunities(prevCommunities => [...prevCommunities, newCommunity]);

        // Return the created community for potential use
        return newCommunity;

    } catch (err) {
        console.error("Create Error:", err);
        
        // Handle specific error cases
        if (err.response) {
            // Server responded with error status
            const status = err.response.status;
            const message = err.response.data?.message;
            
            if (status === 401) {
                // Token expired or invalid
                localStorage.removeItem("token");
                navigate("/login");
                throw new Error("Session expired. Please log in again.");
            } else if (status === 409) {
                // Community name already exists
                setValidName(false);
                throw new Error(message || "Community name already exists. Please try a different name.");
            } else if (status === 400) {
                // Bad request (validation errors)
                throw new Error(message || "Invalid community data. Please check your input.");
            } else if (status === 403) {
                // Forbidden (insufficient permissions)
                throw new Error("You don't have permission to create communities.");
            } else if (status >= 500) {
                // Server error
                throw new Error("Server error. Please try again later.");
            } else {
                // Other HTTP errors
                throw new Error(message || `Failed to create community (Error ${status})`);
            }
        } else if (err.request) {
            // Network error
            throw new Error("Network error. Please check your connection and try again.");
        } else if (err.message) {
            // Re-throw validation errors and other custom errors
            throw err;
        } else {
            // Unknown error
            throw new Error("An unexpected error occurred while creating the community.");
        }
    }
};

export default handelCreate;