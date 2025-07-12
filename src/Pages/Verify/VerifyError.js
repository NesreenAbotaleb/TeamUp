import React from "react";
import style from './style.module.css'
import Header from "../../Componant/Header/Header";
import { ReactComponent as Character} from './../../assets/svgs/Error.svg'

import { useNavigate } from "react-router-dom";

export default function () {
    const navigate = useNavigate();    

    return(
        <>
        <div className={style.container}>
            <div className={style.header}>
                <Header/>
            </div>

            <div className={style.image}>
                <Character className={style.CharacterError}/>
            </div>

            <div className={style.text}>
                <h2>Email Not Verified</h2>
                <h3 className={style.Error}>Something went wrong</h3>
            </div>

            <div className={style.registerroute}>
                <button onClick={()=> navigate('/register')}>
                    {/* <Link to='/login' className={style.link}>Login</Link> */}
                    Try Again
                </button>
            </div>

        </div>
        </>
    )
}
