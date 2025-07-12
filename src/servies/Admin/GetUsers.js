import axios from "axios";
import api from "../../api/API";

const GetUser = async (navigate , setUsers) => {
    try{
        const token = localStorage.getItem("token");
        
        if (!token) {
            navigate("/login");
            return [];
        }

        const response = await axios.get(`${api}/admin/users` , {
            headers: {
                'Authorization': token
            }
        })
        setUsers(response.data)
        console.log("Admin Users API response:", response.data);
        return[]
    }catch(error){
        console.error("Error in GetComm:", error);
        
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
        } else if (error.response?.status === 404) {
            console.error(`Users endpoint not found: ${api}/admin/users`);
        }
        
        return [];
    }
    
}
export default GetUser