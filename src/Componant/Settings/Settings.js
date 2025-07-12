import { Outlet } from "react-router-dom";
import style from "./style.module.css";
import Header from "../Header/Header";
// import Sidebar from "./Sidebar";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
import useCommunityCache from '../../hooks/useCommunityCash';

const Settings = () => {
    const { getCachedCommunity } = useCommunityCache()
    const cachedCommunity = getCachedCommunity()
    const location = useLocation()
    const code_Comm = location?.state?.code_Comm ||location?.state?.code || location?.state?.communityCode
    console.log('cached : ' , code_Comm)


    return (

        <div className={style.settingsContainer}>
            <Header code_Comm={cachedCommunity?.community.code_Comm}/>
            <div className={style.sidebar}>
                <br /><br /><br /><br />
                <h2>Settings</h2>
                <br /><br />

                <ul>

                    <li>
                        <NavLink
                            to="notificationSettings"
                            className={({ isActive }) => isActive ? style.activeLink : undefined}>
                            Notification
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="privacy"
                            className={({ isActive }) => isActive ? style.activeLink : undefined}>
                            Privacy
                        </NavLink>
                    </li>


                    <li className={style.menuWrapper}>
                        <NavLink to="profile?edit=true&fromSettings=true"
                            className={({ isActive }) => isActive ? style.activeLink : undefined}>

                            Profile
                        </NavLink>
                        <div className={style.hintMenu}>Edit your profile</div>
                    </li>

                    <li>
                        <NavLink
                            to="communities"
                            className={({ isActive }) => isActive ? style.activeLink : undefined}>
                            Communities
                        </NavLink>

                    </li>

                    <li>
                        <NavLink to="team"
                            className={({ isActive }) => isActive ? style.activeLink : undefined}>
                            Teams
                        </NavLink>
                    </li>

                    {code_Comm && (
                        <li>
                            <NavLink
                                to={`post?code_Comm=${code_Comm}`}
                                className={({ isActive }) => isActive ? style.activeLink : undefined}
                                >
                                Posts
                            </NavLink>

                        </li>
                    )}

                </ul>

            </div>

            <div className={style.settingsContent}>
                <Outlet />
            </div>
        </div>
    );
};

export default Settings;
