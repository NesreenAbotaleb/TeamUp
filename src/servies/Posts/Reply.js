////////////////////by id
// import axios from "axios";
// import api from "./../../api/API";

// const Reply = async ({ postId, commentId, replyText, navigate }) => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//         alert("You are not logged in. Please log in again.");
//         navigate("/login");
//         return { success: false, error: "No token" };
//     }

//     try {
//         console.log("Sending reply to API:", {
//             url: `${api}/posts/replyComment/${postId}/${commentId}`,
//             payload: { reply: replyText },
//             hasToken: !!token
//         });

//         const payload = { reply: replyText };

//         const response = await axios.post(
//             `${api}/posts/replyComment/${postId}/${commentId}`,
//             payload,
//             {
//                 headers: { Authorization: `${token}` }
//             }
//         );

//         console.log("Reply sent successfully:", response.data);

//         return {
//             success: true,
//             data: response.data,
//             replyText
//         };

//     } catch (err) {
//         console.error("Reply Error:", err);

//         if (err.response) {
//             alert(err.response?.data?.message || "Failed to reply. Please try again.");
//         } else if (err.request) {
//             alert("Network error. Please check your connection and try again.");
//         } else {
//             alert("Failed to reply. Please try again.");
//         }

//         return { success: false, error: err };
//     }
// };

// export default Reply;
import axios from "axios";
import api from "./../../api/API";

const Reply = async ({ postId, commentId, replyText, navigate, userName }) => {  // 👈 استقبل userName
    const token = localStorage.getItem("token");

    if (!token) {
        alert("You are not logged in. Please log in again.");
        navigate("/login");
        return { success: false, error: "No token" };
    }

    try {
        console.log("Sending reply to API:", {
            url: `${api}/posts/replyComment/${postId}/${commentId}`,
            payload: { reply: replyText, userName }, // 👈 أضف الاسم هنا
            hasToken: !!token
        });

        const payload = { 
            reply: replyText,
            userName: userName      // 👈 أضف الاسم للباي لود
        };

        const response = await axios.post(
            `${api}/posts/replyComment/${postId}/${commentId}`,
            payload,
            {
                headers: { Authorization: `${token}` }
            }
        );

        console.log("Reply sent successfully:", response.data);

        return {
            success: true,
            data: response.data,
            replyText
        };

    } catch (err) {
        console.error("Reply Error:", err);

        if (err.response) {
            alert(err.response?.data?.message || "Failed to reply. Please try again.");
        } else if (err.request) {
            alert("Network error. Please check your connection and try again.");
        } else {
            alert("Failed to reply. Please try again.");
        }

        return { success: false, error: err };
    }
};

export default Reply;
