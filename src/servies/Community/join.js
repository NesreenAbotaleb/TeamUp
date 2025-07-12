import axios from "axios";
import api from "./../../api/API";

const handelJoin = async (editdata, setCommunities, setJoin) => {
    console.log("handelJoin called");
    if (!editdata.code) {
        alert("Please enter a valid code");
        return;
    }
    
    let payload = { code_Comm: editdata.code };
    
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${api}/community/join/${payload.code_Comm}`, payload, {
            headers: { 'Authorization': `${token}` }
        });

        console.log("Join Response:", response);
        
        if (response.data.community) {
            alert("Joined successfully!");

            // Update communities state with the new community
            setCommunities(prevCommunities => [...prevCommunities, response.data.community]);

            // Close the join modal
            setJoin(false);
        }
    } catch (err) {
        console.error("Join Error:", err.response);
        alert(err.response?.data?.message || "Failed to join community. Please try again.");
    }
};

export default handelJoin;
