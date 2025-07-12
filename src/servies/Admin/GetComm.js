import axios from "axios";
import api from "../../api/API";

const GetComm = async (navigate , setCommunities) => {
    try{
        const token = localStorage.getItem("token");
        
        if (!token) {
            navigate("/login");
            return [];
        }

        const response = await axios.get(`${api}/admin/communities` , {
            headers: {
                'Authorization': token
            }
        })
        setCommunities(response.data)
        console.log("Admin Communities API response:", response.data);
        return[]
    }catch(error){
        console.error("Error in GetComm:", error);
        
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
        } else if (error.response?.status === 404) {
            console.error(`Communities endpoint not found: ${api}/admin/communities`);
        }
        
        return [];
    }
    
}
export default GetComm