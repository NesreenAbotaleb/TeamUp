import axios from "axios";
import api from "./../../api/API";

const handelCreate = async (name, setValidName, setCode, setCopy, setCreate, setCommunities, navigate , description) => {
    if (!name || name.length < 4 || name.length > 100) {
        setValidName(false);
        alert("Community name must be between 4 and 100 characters");
        console.log({ name });
        return;
    }

    console.log('description : ' , description)

    console.log(description)

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You are not logged in. Please log in again.");
            navigate("/login");
            return;
        }
// must add description to payload
        let payload = { communityName: name , description : description };

        const response = await axios.post(`${api}/community/create`, payload, {
            headers: { Authorization: `${token}` }
        });

        console.log("Response:", response.data);

        if (response.data?.community) {
            const newCommunity = response.data.community;
            console.log("New Community:", newCommunity);

            setCreate(false);
            if (newCommunity.code_Comm) {
                setCopy(true);
                setCode(newCommunity.code_Comm);
            }

            // **Ensure setCommunities is updating the state**
            setCommunities(prevCommunities => [...prevCommunities, response.data.community]);
        } else {
            alert("Failed to create community. Unexpected response format.");
        }
    } catch (err) {
        console.error("Create Error:", err.response);
        alert(err.response?.data?.message || "Failed to create community. Please try again.");
    }
};

export default handelCreate;
