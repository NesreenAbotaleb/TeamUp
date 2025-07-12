import axios from "axios";
import api from "../../api/API";

const ResolveReport = async (reportId, actionTaken = '') => {
    try {
        const token = localStorage.getItem("token");
        
        if (!token) {
            // Note: navigate is not available here, you might want to handle this differently
            // or pass navigate as a parameter
            throw new Error('No authentication token found');
        }
        
        // Validate required parameters
        if (!reportId) {
            throw new Error('Report ID is required');
        }
        
        let payload = {
            actionTaken: actionTaken
        };

        // Make API call to resolve report
        const response = await axios.put(`${api}/report/resolveReport/${reportId}`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
        });

        // With axios, the response data is already parsed
        const data = response.data;

        return {
            success: true,
            message: data.message,
            report: data.report
        };

    } catch (error) {
        console.error('Error resolving report:', error);
        
        // Handle axios errors
        if (error.response) {
            // Server responded with error status
            return {
                success: false,
                message: error.response.data?.message || `HTTP error! status: ${error.response.status}`,
                error: error
            };
        } else if (error.request) {
            // Network error
            return {
                success: false,
                message: 'Network error. Please check your connection.',
                error: error
            };
        } else {
            // Other error
            return {
                success: false,
                message: error.message || 'Failed to resolve report',
                error: error
            };
        }
    }
};
export default ResolveReport