import { useEffect, useState, useContext} from "react";
import style from "./style.module.css"
import profileIcon from "../../assets/svgs/header/Profile_white.svg";
import Header from "../Header/Header";
import { Link, useNavigate} from "react-router-dom";

import UserContext from "../../context/Usercontext";

const AdminDashboard = ({
    communities, 
    users, 
    onShowUsers, 
    onShowCommunities, 
    usersSec, 
    commSec
}) => {
    const { user } = useContext(UserContext);
    console.log('user : ' ,user)

    return (
        <div className={style.settingsContainer}>
            <Header />

            <aside className={style.sidebar}>
                <div className={style.profile}>
                    <img 
                        src={user?.img || profileIcon} 
                        alt="Profile" 
                        className={style.profileIcon}
                        onError={(e) => {
                            e.target.src = profileIcon;
                        }}
                    />
                    <p>
                        <Link className={style.profile} to='/profile'>
                            {user?.name || "Admin"}
                        </Link>
                    </p>
                </div>
            </aside>

            <div className={style.settingsContent}>
                <h2>Admin Dashboard</h2>

                <div className={style.cardsGrid}>
                    <div 
                        className={`${style.card} ${usersSec ? style.active : ''}`}
                        onClick={onShowUsers}
                    >
                        <p># Users</p>
                        <h3>{users?.length}</h3>
                    </div>
                    <div 
                        className={`${style.card} ${commSec ? style.active : ''}`}
                        onClick={onShowCommunities}
                    >
                        <p># Communities</p>
                        <h3>{communities?.length}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;