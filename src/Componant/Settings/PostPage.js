import { useContext } from "react";
import UserContext from "../../context/Usercontext";
import Posts from "../Posts/posts";
import style from './style.module.css';
import useCommunityCache from "../../hooks/useCommunityCash";
import { useLocation } from "react-router-dom";

const PostsPage = () => {
    const { user, users } = useContext(UserContext);
    const { getCachedCommunity } = useCommunityCache();
    
    const cachedCommunity = getCachedCommunity();
   
    // const code_Comm = cachedCommunity?.community?.code_Comm;

    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const code_Comm = params.get("code_Comm");

    return (
        <div className={style.posts_content_settings}>
            <h2>Your Posts</h2>
            {user ? (
                <Posts 
                    userId={user._id} 
                    communityCode={code_Comm}  
                    create={false} 
                    users={users} 
                />
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default PostsPage;
