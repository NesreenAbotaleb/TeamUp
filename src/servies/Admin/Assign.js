const Assign = async ({ reportId, navigate }) => {
    try {
        // Validate input
        if (!reportId) {
            return {
                success: false,
                message: 'Report ID is required',
                errorType: 'validation'
            };
        }

        // Get token from localStorage or wherever you store it
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        
        if (!token) {
            // Redirect to login if no token
            if (navigate) {
                navigate('/login');
            }
            return {
                success: false,
                message: 'Authentication required. Please log in.',
                errorType: 'authentication'
            };
        }

        // Make API call to assign report
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reports/assign/${reportId}`, {
            method: 'PUT', // or 'PATCH' depending on your backend route
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                // Alternative auth header format if your backend uses different format:
                // 'x-auth-token': token,
            },
        });

        const data = await response.json();

        // Handle different response status codes
        if (response.ok) {
            return {
                success: true,
                message: data.message || 'Report assigned successfully',
                data: data.report,
                errorType: null
            };
        } else {
            // Handle specific error status codes
            switch (response.status) {
                case 400:
                    return {
                        success: false,
                        message: data.message || 'Report is already assigned or resolved',
                        errorType: 'validation'
                    };
                
                case 401:
                    // Token expired or invalid
                    localStorage.removeItem('token');
                    localStorage.removeItem('authToken');
                    if (navigate) {
                        navigate('/login');
                    }
                    return {
                        success: false,
                        message: 'Session expired. Please log in again.',
                        errorType: 'authentication'
                    };
                
                case 403:
                    return {
                        success: false,
                        message: 'You do not have permission to assign reports',
                        errorType: 'authorization'
                    };
                
                case 404:
                    return {
                        success: false,
                        message: data.message || 'Report or user not found',
                        errorType: 'not_found'
                    };
                
                case 500:
                    return {
                        success: false,
                        message: data.message || 'Server error occurred',
                        errorType: 'server'
                    };
                
                default:
                    return {
                        success: false,
                        message: data.message || 'An unexpected error occurred',
                        errorType: 'unknown'
                    };
            }
        }
    } catch (error) {
        console.error('Network error in Assign service:', error);
        
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return {
                success: false,
                message: 'Network error. Please check your internet connection.',
                errorType: 'network'
            };
        }
        
        return {
            success: false,
            message: 'An unexpected error occurred while assigning the report',
            errorType: 'unknown'
        };
    }
};

export default Assign;