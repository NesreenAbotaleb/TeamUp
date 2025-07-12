import React from "react";
import style from './style.module.css'
import { ReactComponent as Profile } from './../../assets/svgs/menu/profile.svg';
// import { Link } from "react-router-dom";
import GetUser from "../../servies/getuser";
import { Link } from "react-router-dom";
// import { useNavigate } from "react-router-dom";


const Users = ({ name = "Unknown", userName = "N/A", image , id , code_Comm  , usersTeam , teams_comm }) => {
    // Use this approach instead of useState in this case
    const hasProfileImage = Boolean(image);
    // const navigate = useNavigate();
    // console.log("users  in users", users)
    // if(userRole === 3){

    // }
  
    console.log('usersTeam in user:', usersTeam);
    console.log('Type of usersTeam:', typeof usersTeam);
    // console.log('Has teams property:', 'teams' in usersTeam);
    // console.log('Teams value:', usersTeam.teams);
    return (
        
        <Link to={`/community/${code_Comm}/${id}`} state={{ usersTeam: usersTeam , teams: teams_comm}} >

        
                <div className={style.profile} >
                    {hasProfileImage ? (
                        <img src={image} alt={name} className={style.icon}/>
                    ) : (
                        <Profile className={style.icon} />
                    )}
                    <div className={style.info}>
                        <h3>{name}</h3>
                        <p>@{userName}</p>
                    </div>
                </div>
            </Link>
        
    );
};

export default Users;