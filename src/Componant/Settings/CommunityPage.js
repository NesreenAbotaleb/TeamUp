import style from "./style.module.css";
import { useCommunity } from "../../context/CommunityContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Leave from "../../servies/Community/leave";
import { ReactComponent as Cross } from "./../../assets/svgs/Cross.svg";


const Communities = () => {
    const [leave, setLeave] = useState(false);
    const [communityCode, setCommunityCode] = useState("");
    const [communityName, setCommunityName] = useState("");
    const navigate = useNavigate();
    const {
        allCommunities, 
        removeCommunityFromCache,
        fetchAllCommunities,
        // updateCommunityCache
    } = useCommunity();

    const handleLeaveCommunity = async () => {
    try {
        await Leave(communityCode, communityName, navigate);
        
        // Remove from cache after successful leave
        removeCommunityFromCache(communityCode);
        
        // Also refresh the communities list to ensure global state is updated
        await fetchAllCommunities(true);
        
        console.log("Successfully left community and updated cache");
    } catch (error) {
        console.error("Error leaving community:", error);
    }
};

    console.log("All Communities:", allCommunities);
    return (
        <div className={style.communitiesContainer}>
            <h2>Your Communities</h2>
            <div className={style.cardsGrid}>
                {allCommunities?.map((community) => (
                    <div key={community.id} className={style.card}>
                        <h3>{community.communityName}</h3>
                        <p>{community.description}</p>
                        <button className={style.viewBtn}>View</button>
                        <button 
                            className={style.leaveBtn} 
                            onClick={() => {
                                setCommunityCode(community.code_Comm);
                                setCommunityName(community.communityName);
                                setLeave(true);
                                
                                }}>
                                    Leave
                        </button>
                    </div>
                ))}
            </div>
            {leave && (
                <div className={style.btnsContainer}>
                    <div className={style.overlay}>
                        <div className={style.box}>
                            <div className={style.top}>
                                <Cross className={style.cross} onClick={() => setLeave(false)} />
                            </div>
                            <div className={style.mid}>
                                <h4>Leave Community</h4>
                                <h2>Are you sure you want to leave this community?!</h2>
                            </div>
                            <div className={style.bottom}>
                                <button 
                                    className={style.leaveBtn} 
                                    onClick={() => {
                                        setLeave(false);
                                        handleLeaveCommunity();
                                    }}
                                >
                                    Leave
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Communities;
