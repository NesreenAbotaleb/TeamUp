import { useNavigate } from "react-router-dom";
import { Switch } from "antd";
import style from './style.module.css'
import Header from "../Header/Header";
import UserContext from "../../context/Usercontext";
import { useState, useContext, useEffect } from "react";

function Notification() {

    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate("/login");
        console.log({ user })

    }, [user, navigate]);
    //test
    const [settings, setSettings] = useState({
        email: true,
        posts: true,
        teamChat: false,
        professorChat: true,
        sound: false,
        theme: false,
        call: true
    });
    useEffect(() => {
        const savedSettings = localStorage.getItem("userSettings");
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("userSettings", JSON.stringify(settings));
    }, [settings]);

    return (
        <>

            <div className={style.notificationContainer}>
                {/* <Header /> */}
                <br></br>
                <br></br>

                <div className={style.content}>
                    <span>Send to mail</span>
                    <Switch
                        className={style.switchBtn}
                        checked={settings.email}
                        onChange={(checked) =>
                            setSettings((prev) => ({ ...prev, email: checked }))
                        }
                    />
                </div>   {/* content */}
                <div className={style.content}>
                    <span>Posts notification</span>
                    <Switch className={style.switchBtn} />
                </div>   {/* content */}
                <div className={style.content}>
                    <span>Team chat notification</span>
                    <Switch
                        className={style.switchBtn}
                        checked={settings.teamChat}
                        onChange={(checked) =>
                            setSettings((prev) => ({ ...prev, teamChat: checked }))
                        }
                    />
                </div>   {/* content */}
                <div className={style.content}>
                    <span>Professor chat notification</span>
                    <Switch className={style.switchBtn} />
                </div>   {/* content */}
                <div className={style.content}>
                    <span>Sounds</span>
                    <Switch className={style.switchBtn} />
                </div>    {/* content */}
                <div className={style.content}>
                    <span>Theme mode</span>
                    <Switch className={style.switchBtn} />
                </div>    {/* content */}
                <div className={style.content}>
                    <span>Call income</span>
                    <Switch className={style.switchBtn} />
                </div>    {/* content */}
            </div>   {/*notificationContainer */}
        </>
    );
}

export default Notification;