import api from "./../../api/API";
import axios from "axios";
const UserTeams = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${api}/profile/me/teams`, {
            headers: { Authorization: `${token}` }
        });

        console.log('User teams response:', response.data);
        return response.data; // <-- return the data
    } catch (error) {
        console.error("Error in UserTeams:", error);

        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login"; // fallback redirect
        }

        return [];
    }
};
export default UserTeams;
