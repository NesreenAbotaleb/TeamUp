import axios from "axios";
import api from "../../api/API";

const LikeComment = async (postId, commentId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${api}/posts/likecomment/${postId}/${commentId}`,
      {},
      {
        headers: { Authorization: `${token}` },
      }
    );

    return response.data;
  } catch (err) {
    console.error("Like Comment Error:", err.response || err);
    alert(err.response?.data?.message || "Failed to like comment.");
    throw err;
  }
};

export default LikeComment;
