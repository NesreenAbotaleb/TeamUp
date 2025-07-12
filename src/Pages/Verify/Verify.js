import React, { useEffect, useState } from "react";
import style from './style.module.css'
import Header from "../../Componant/Header/Header";
import { ReactComponent as Character} from './../../assets/svgs/verify 1.svg'
import { Link } from "react-router-dom";
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
                <Character className={style.Character}/>
            </div>

            <div className={style.text}>
                <h2>Email Verified</h2>
                <h1>SUCCESSFULLY</h1>
            </div>

            <div className={style.loginroute}>
                <button onClick={()=> navigate('/login')}>
                    {/* <Link to='/login' className={style.link}>Login</Link> */}
                    Login
                </button>
            </div>

        </div>
        </>
    )
}
