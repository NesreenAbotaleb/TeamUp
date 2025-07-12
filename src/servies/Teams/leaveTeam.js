import axios from "axios";
import api from "./../../api/API";

const LeaveTeam = async (team_Code, navigate, code) => {
    try {
        const token = localStorage.getItem('token');
        
        // Validate inputs
        if (!team_Code) {
            throw new Error('Team code is required');
        }
        
        if (!token) {
            throw new Error('Authentication token not found. Please log in again.');
        }
        
        console.log('team code:', team_Code);
        console.log('API endpoint:', `${api}/teams/${team_Code}/leave`);
        
        const response = await axios.post(
            `${api}/teams/${team_Code}/leave`, 
            {}, 
            {
                headers: { 
                    'Authorization': token,
                   
                },
                timeout: 10000 // 10 second 
            }
        );
        
        console.log('Leave team response:', response.data);
        
        
        alert('Successfully left the team!');
        
        
        navigate(`/community/${code}`);
        
    } catch (err) {
        console.error("Leave Team Error:", err);
        
        
        if (err.response) {
            
            const statusCode = err.response.status;
            const errorMessage = err.response.data?.message || err.response.data?.error || 'Unknown server error';
            
            console.error(`Server Error ${statusCode}:`, errorMessage);
            console.error('Full error response:', err.response.data);
            
            switch (statusCode) {
                case 400:
                    alert('Bad request. Please check your team membership status.');
                    break;
                case 401:
                    alert('Authentication failed. Please log in again.');
                   
                    break;
                case 403:
                    alert('You do not have permission to leave this team.');
                    break;
                case 404:
                    alert('Team not found. It may have been deleted.');
                    break;
                case 500:
                    alert(`Server error: ${errorMessage}. Please try again later or contact support.`);
                    break;
                default:
                    alert(`Error ${statusCode}: ${errorMessage}`);
            }
        } else if (err.request) {
            
            console.error('Network Error:', err.request);
            alert('Network error. Please check your connection and try again.');
        } else if (err.code === 'ECONNABORTED') {
            
            console.error('Request timeout');
            alert('Request timed out. Please try again.');
        } else {
            
            console.error('Unexpected Error:', err.message);
            alert(`Error: ${err.message}`);
        }
    }
};

export default LeaveTeam;