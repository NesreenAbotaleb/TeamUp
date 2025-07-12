import { NavLink } from "react-router-dom";
import style from "./style.module.css";

function Sidebar() {

    return (
        <div className={style.sidebar}>
            {/* <br /><br /><br /><br /><br />
            <h2>Settings</h2>
            <br /><br />

            <ul>

                <li>
                    <NavLink to="/notificationSettings">
                        Notification
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/privacy">
                        Privacy
                    </NavLink>
                </li>

                <li className={style.menuWrapper}>
                    <NavLink to="/profile?edit=true" className={style.sidebarLink}>
                        Profile
                    </NavLink>
                    <div className={style.hintMenu}>Edit your profile</div>
                </li>

                <li>
                    <NavLink to="communities">
                        Communities
                    </NavLink>
                </li>

                <li>
                    <NavLink to="teams">
                        Teams
                    </NavLink>
                </li>

                <li>
                    <NavLink to="post">
                        Posts
                    </NavLink>
                </li>

            </ul> */}

        </div>
    );
}

export default Sidebar;
{/* <li className={style.menuWrapper}>
  <NavLink to="/profile?edit=true" className={style.sidebarLink}>
    Profile
  </NavLink>
  <div className={style.hintMenu}>Edit your profile</div>
</li>

<li className={style.menuWrapper}>
  <NavLink to="/notificationSettings" className={style.sidebarLink}>
    Notification
  </NavLink>
  <div className={style.hintMenu}>Manage your notifications</div>
</li>

<li className={style.menuWrapper}>
  <NavLink to="/privacy" className={style.sidebarLink}>
    Privacy
  </NavLink>
  <div className={style.hintMenu}>Control who sees your info</div>
</li>

<li className={style.menuWrapper}>
  <NavLink to="/communities" className={style.sidebarLink}>
    Communities
  </NavLink>
  <div className={style.hintMenu}>Your joined communities</div>
</li>

<li className={style.menuWrapper}>
  <NavLink to="/teams" className={style.sidebarLink}>
    Teams
  </NavLink>
  <div className={style.hintMenu}>Your team collaborations</div>
</li>

<li className={style.menuWrapper}>
  <NavLink to="/post" className={style.sidebarLink}>
    Posts
  </NavLink>
  <div className={style.hintMenu}>Your activity posts</div>
</li> */}
