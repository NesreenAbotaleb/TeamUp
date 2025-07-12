import React from "react";
import { Link } from "react-router-dom";
import style from './../../Pages/Community/style.module.css'
import { useNavigate } from "react-router-dom";

import {ReactComponent as Object} from './../../assets/svgs/OBJECTS.svg'

const Item = (props) => {
    const navigate = useNavigate()

    const onClick = () => {
        navigate(`/community/${props.code_Comm}` , { state: { name: props.code_Comm }})
    }
    // console.log(props.description)

    return (
        <div className={style.item} onClick={ onClick}>
            <div className={style.object} >
                    <Object className={style.char}/>
            </div>
            <div className={style.link}>
                <div className={style.text}>
                    <h2 className={style.name}>{props.communityName}</h2>
                    <h4 className={style.name}>members : {props.members.length}</h4>
                    <p className={style.name}>{props.description}</p>

                </div>
            </div>
        </div>
      );
}
export default Item;
