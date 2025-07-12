import React , { useContext , useEffect}from "react";
import { useNavigate } from "react-router-dom";
import { Switch } from "antd";
import style from './style.module.css'
import Header from "../Header/Header";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import UserContext from "../../context/Usercontext";
function Privacy() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) navigate("/login");
        console.log({user})
        
    }, [user, navigate]);


    return (
        <>
            <div className={style.privacyContainer}>
                {/* <Header /> */}
                <br></br>
                <br></br>
                <div className={style.content}>
                    <span>Change password</span>
                </div>    {/* content */}
                <div className={style.content}>
                    <span>Active devices</span>

                </div>    {/* content */}
                <div className={style.content}>
                    <span>Show mail in profile</span>
                    <Switch className={style.switchBtn} />
                </div>   {/* content */}
                <div className={style.content}>
                    <span>Verification mails</span>

                </div>  {/* content */}
            </div>   {/*privacyContainer */}
           
        </>
    );
}

export default Privacy;