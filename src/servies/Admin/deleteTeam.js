import axios from "axios";
import api from "../../api/API";

const DeleteTeam = async (navigate  , teamId) => {
    try{
        const token = localStorage.getItem("token");
        
        if (!token) {
            navigate("/login");
            return [];
        }

        const response = await axios.delete(`${api}/admin/deleteUser/${userId}` , {
            headers: {
                'Authorization': token
            }
        })
       console.log('API delete User from admin :' ,response.data)
        return response
    }catch(error){
        console.error("Error in User:", error);
        
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
        } else if (error.response?.status === 404) {
            console.error(`Users endpoint not found: ${api}/admin/deleteUser/${userId}`);
        }
        
        return [];
    }
    
}
export default DeleteTeam