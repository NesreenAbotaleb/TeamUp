import axios from "axios";
import api from "./../../api/API";

const deleteComm = async (code_Comm, navigate) => {
    console.log("📌 Navigate Function:", navigate);

    if (typeof navigate !== "function") {
        console.error("❌ Navigate is not a function!");
        return;
    }

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You are not logged in. Please log in again.");
            navigate("/login");
            return;
        }

        const response = await axios.delete(`${api}/community/delete/${code_Comm}`, {
            headers: { 'Authorization': `${token}` }
        });

        console.log("✅ Community deleted successfully:", response);
        navigate("/community");  // Make sure navigate is called only if it's a function
    } catch (err) {
        console.error("❌ Delete Error:", err);
        alert(err.response?.data?.message || "Failed to delete community. Please try again.");
    }
};

export default deleteComm;
