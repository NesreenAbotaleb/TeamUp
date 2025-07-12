import axios from "axios";
import api from "./../../api/API";

const createTeam = async ({teamName, setTeam, setJoin , code , refetch , setTeams}) => {
    console.log("createTeam called");
    

    let payload = { teamName: teamName };

    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${api}/teams/${code}/create`, payload, {
            headers: { 'Authorization': `${token}` }
        });

        console.log("Join Response:", response);

        if (response.data) {
            alert("Joined successfully!");

            // Update communities state with the new community
            const newTeam = response.data;
            setTeams(prev => [...prev, newTeam]);
            console.log('new team : ' , newTeam)
            setTeam(false)
            // Close the join modal
            setJoin(false);
            refetch()
        }
    } catch (err) {
        console.error("Join Error:", err.response);
        alert(err.response?.data?.message || "Failed to create team. Please try again.");
    }
};

export default createTeam;
