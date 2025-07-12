import axios from "axios";
import api from "../api/API";

const GetUser = async (communityCode, id) => {


    try {
        const token = localStorage.getItem('token');
        console.log("Auth Token:", token);

        
        if (!token) {
            console.error("No authentication token found");
            return null;
        }
        
        // Log the exact URL we're trying to access
        const url = `${api}/community/${communityCode}`;
        console.log("Attempting to access URL:", url, "with userId query param:", id);
        
        // const config = {
        //     headers: {
        //         'Authorization': `${token}`
        //     },
        //     params: { userId: id }
        // };
        // const payload = {
        //     // myId : myId,
        //     // wantedUserId : userId,
        // }
        
        const response = await axios.get(
            `${api}/community/${communityCode}/user?userId=${id}`,
            {
              headers: { Authorization: `${token}` }
            }
          );
          
        console.log("get user : " , response.data.user)
        return response.data.user;
        
    } catch (error) {
        console.error("Error fetching user:", error.response.data);
        console.error("Failed URL:", `${api}/community/${communityCode}/user?userId=${id}`);
        
        // Log more detailed error information
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
        } else if (error.request) {
            console.error("No response received:", error.request);
        } else {
            console.error("Error message:", error.message);
        }
        
        return null;
    }
};

export default GetUser;