import style from "./style.module.css";
import useCommunityCache from "../../hooks/useCommunityCash";

const dummyCommunities = [
    {
        id: "c1",
        name: "AI Enthusiasts",
        description: "A community for AI and ML discussions.",
    },
    {
        id: "c2",
        name: "Frontend Masters",
        description: "All about React, Vue, and frontend frameworks.",
    },
    {
        id: "c3",
        name: "Cyber Security",
        description: "Stay safe online and learn ethical hacking.",
    },
];

const Communities = () => {
    const { allCommunities } = useCommunityCache();
    console.log("All Communities:", allCommunities);
    return (
        <div className={style.communitiesContainer}>
            <h2>Your Communities</h2>
            <div className={style.cardsGrid}>
                {dummyCommunities.map((community) => (
                    <div key={community.id} className={style.card}>
                        <h3>{community.name}</h3>
                        <p>{community.description}</p>
                        <button className={style.viewBtn}>View</button>
                        <button className={style.leaveBtn}>Leave</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Communities;
