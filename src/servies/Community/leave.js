import axios from "axios";
import api from "./../../api/API";

const Leave = async(code_Comm , communityName ,navigate) =>{
    let payload ={
        communityName : communityName
    }
    try{
        const token = localStorage.getItem('token');
        const response = await axios.post(`${api}/community/leave/${code_Comm}` , payload , {
            headers: { 'Authorization': `${token}` }
        })
        console.log({response})
        navigate("/community")
    }catch(err){
        console.error("Join Error:", err.response);
        alert(err.response?.data?.message || "Failed to leave community. Please try again.");
    }
}
export default Leave;