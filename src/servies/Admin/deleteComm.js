import axios from "axios";
import api from "../../api/API";

const DeleteComm = async (navigate  , communityId) => {
    try{
        const token = localStorage.getItem("token");
        console.log('communityId :' , communityId)
        
        if (!token) {
            navigate("/login");
            return [];
        }

        const response = await axios.delete(`${api}/admin/deleteCommunity/${communityId}` , {
            headers: {
                'Authorization': token
            }
        })
       console.log('API delete community from admin :' ,response.data)
        return response
    }catch(error){
        console.error("Error in delete Community:", error);
        
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
        } else if (error.response?.status === 404) {
            console.error(`Users endpoint not found: ${api}/admin/deleteCommunity/${communityId}`);
        }
        
        return [];
    }
    
}
export default DeleteComm