import React, { useState } from "react";
import style from './style.module.css';
import { Link } from "react-router-dom";

const TeamMember = ({ member , code_Comm , teams ,users ,usersTeam}) => {

    console.log('users in the team : ' ,usersTeam)
   
    
    // State to track image loading error
    const [imageError, setImageError] = useState(false);
    if (!member) return null;
    
    // The API returns only memberID, not the full member details
    // We need to adapt our component to handle this minimal data
    const memberName = member.name || member.LeaderName || "Team Member";
    const isLeader = member.leaderID === member.memberID || member.leader;
    
    // Default image path
    const defaultImage = "/default-avatar.png";
    
    // Only try to show an image if we have a valid image path and no error has occurred
    const imageSrc = member.image || null;

    console.log(member)
    
    return (
        <Link to={`/community/${code_Comm}/${member.memberID}`} state={{ teams: teams, users :users ,usersTeam:usersTeam}} >
        <div className={style.member}>
            {imageSrc && (
                <img
                className={style.memImage}
                src={imageSrc}
                alt={`${memberName}'s profile`}
                onError={() => {
                    console.log("Image failed to load, using default");
                    setImageError(true);
                }}
            />
            )}
            <div className={style.memInfo}>
                <h2 className={style.Name}>{memberName}</h2>
                
                {isLeader && (
                    <div className={style.leader}>
                        {/* Icon for leadership */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <div className={style.hiddenInfo}>
                            <h4>Leader</h4>
                            <h4>{memberName}</h4>
                        </div>
                    </div>
                )}
                
                <div className={style.Info}>
                    <h3>{memberName}</h3>
                    {member.username && <h3>{member.username}</h3>}
                    {member.email && <h3>{member.email}</h3>}
                    
                </div>
            </div>
        </div>
        </Link>
    );
};

export default TeamMember;