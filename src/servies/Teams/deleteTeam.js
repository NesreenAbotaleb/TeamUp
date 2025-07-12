import axios from "axios";
import api from "./../../api/API";

const DeleteTeam = async (team_Code , navigate , code)=>{
try {
        const token = localStorage.getItem('token');
        console.log('token : ' , token)
        console.log('team code : ', team_Code);
        
        // Fix: Properly set authorization headers
        const response = await axios.delete(`${api}/teams/${team_Code}`, {
            headers: { 'Authorization': `${token}` }
        });
        
        console.log('leaving : ', response);
        navigate(`/community/${code}`);  
    } catch(err) {
        console.error("Delete Error:", err.response || err);
        alert(err.response?.data?.message || "Failed to delete team. Please try again.");
    }
}
export default DeleteTeam;