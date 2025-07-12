import axios from "axios";
import api from "./../../api/API";

const SendReq = async (code_Comm , userName , teamName) => {
    try{
        const token = localStorage.getItem('token');
        console.log('code_Comm : ' , code_Comm)
        console.log('teamName : ' , teamName)
        console.log('userName : ' , userName)

        let payload = {"userName" : userName}
        const response = await axios.post(`${api}/teams/${code_Comm}/invite/${teamName}` , payload , {
            headers: { 'Authorization': token }
        })
        console.log('send req : ' , response)
        alert('success send! , wait for response')
    }catch(err){
        console.error("Send Error:", err.response || err);
        alert(err.response?.data?.message || "Failed to send invite. Please try again.");
    }
}
export default SendReq;