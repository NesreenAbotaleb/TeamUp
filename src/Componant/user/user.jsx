import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import style from './style.module.css';

const User = ({ userRole }) => {
    const [users, setUsers] = useState("STUDENT");
    const navigate = useNavigate();

    useEffect(() => {
        if (userRole === 2) {
            setUsers("PROFESSOR");
        }
    }, [userRole]);

    const handleRegisterClick = () => {
        navigate("/register", { state: { userRole } });
    };

    return (
        <div className={style.Container}>
            <button onClick={handleRegisterClick} className={style.link}>
                {users}
            </button>
        </div>
    );
};

export default User;
