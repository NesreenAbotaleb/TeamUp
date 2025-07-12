import React from "react";
import style from './style.module.css';
import TeamMember from "./TeamMember";

const MemberList = ({ members  , comm_Code ,teams , users ,usersTeam}) => {
    // Add validation for members
    if (!members) {
        return (
            <div className={style.ListContainer}>
                <div className={style.emptyList}>No team members found</div>
            </div>
        );
    }
    console.log('users in the team : ' ,usersTeam)
    
    // Ensure members is always treated as an array
    const memberArray = Array.isArray(members) ? members : [members];
    
    console.log("Rendering members list:", memberArray);
    
    if (memberArray.length === 0) {
        return (
            <div className={style.ListContainer}>
                <div className={style.emptyList}>No team members found</div>
            </div>
        );
    }
   
    return (
        <div className={style.ListContainer}>
            {memberArray.map((member, index) => (
                <TeamMember member={member} key={member.memberID || member._id || index}  code_Comm={comm_Code} teams={teams} users={users} usersTeam={usersTeam}/>
            ))}
        </div>
    );
};

export default MemberList;