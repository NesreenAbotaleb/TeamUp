import React from "react";
import TeamCard from "./TeamCard";
import style from "./style.module.css";

const TeamsList = ({ teams  , communityCode , users , usersTeam}) => {
    // console.log('users team : ' , usersTeam)
    // console.log('teams in team list : ' , teams)
    return (
        <div className={style.membersContainer}>
            <h2 className={style.membersTitle}>Teams</h2>
            <div className={style.list}>
                {teams && teams.length > 0 ? (
                    teams.map((team, index) => (
                        <TeamCard 
                            key={index} 
                            id={team._id} 
                            name={team.teamName} 
                            code_Comm={communityCode} 
                            users={users}
                            usersTeam={usersTeam?.teams}
                            teams = {teams}
                        />
                    ))
                ) : (
                    <p>No teams found.</p>
                )}
            </div>
        </div>
    );
};

export default TeamsList;
