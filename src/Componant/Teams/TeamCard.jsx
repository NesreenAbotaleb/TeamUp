import React from "react";
import style from './style.module.css';
import { ReactComponent as Profile } from './../../assets/svgs/menu/profile.svg';
import { Link } from "react-router-dom";

const TeamCard = ({ name = "Unknown", image, id, code_Comm, usersTeam , teams , users}) => {
    const hasProfileImage = Boolean(image); // Check if image is provided
    
    console.log('TeamCard - usersTeam:', usersTeam);
    // console.log('teams  : ' , teams)
    
    return (
        <Link
            to={`/community/${code_Comm}/team/${id}`}
            state={{ usersTeam: usersTeam , teams: teams , users}} 
            className={style.profile}
        >
            {hasProfileImage ? (
                <img src={image} alt={name} className={style.icon} />
            ) : (
                <Profile className={style.icon} /> 
            )}
            <div className={style.info}>
                <h3>{name}</h3>
            </div>
        </Link>
    );
};

export default TeamCard;