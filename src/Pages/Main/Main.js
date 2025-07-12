import React, { useState } from "react";
import style from './style.module.css'
import { Link } from "react-router-dom";

import Header from "./../../Componant/Header/Header";

import { ReactComponent as Wave } from './../../assets/svgs/homePage//intro/homeWave.svg'
import { ReactComponent as Rec } from './../../assets/svgs/homePage//intro/Rectangle 84.svg'
import { ReactComponent as Character } from './../../assets/svgs/homePage/intro/Collaborative Work Session 2.svg'

import { ReactComponent as Student } from './../../assets/svgs/homePage/stud prof/std.svg'
import { ReactComponent as Professor } from './../../assets/svgs/homePage/stud prof/prof.svg'

import { ReactComponent as AboutUs } from '../../assets/svgs/homePage/aboutus.svg';

import { ReactComponent as Photo } from '../../assets/svgs/homePage/reviews/review_photo.svg';
import { ReactComponent as Review } from '../../assets/svgs/homePage/reviews/background_review.svg';
import { ReactComponent as Left_review } from '../../assets/svgs/homePage/reviews/left_review.svg';
import { ReactComponent as Right_review } from '../../assets/svgs/homePage/reviews/right_review.svg';


// import { ReactComponent as Footer } from '../../assets/svgs/homePage/footer/footer.svg';
import { ReactComponent as Logo } from '../../assets/svgs/homePage/footer/up.svg';
import { ReactComponent as Instagram } from '../../assets/svgs/homePage/footer/instgram.svg';
import { ReactComponent as Youtube } from '../../assets/svgs/homePage/footer/youtube.svg';
import { ReactComponent as Twitter } from '../../assets/svgs/homePage/footer/twitter.svg';
import { ReactComponent as Facebook } from '../../assets/svgs/homePage/footer/facebook.svg';



function Main() {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = () => {
        setIsAnimating(false);  // Reset animation state
        setTimeout(() => setIsAnimating(true), 50); // Restart after a short delay
        console.log("//////////////////////////")
    };



    return (
        <>
            <div className={style.container}>
                <Header />


                <div className={style.homeContainer} id="homeContainer">

                    <div className={style.wave}>
                        <Wave className={`${style.img} ${style.wave1}`} />
                        {/* <Wave className={`${style.img} ${style.wave2}`} />
                        <Rec className={style.rec}/> */}
                    </div>
                    <Character className={style.Character} />

                    <div className={style.text}>
                        <h1 className={style.mainText}>Dream it</h1>
                        <h1 className={style.mainText}>Team it</h1>
                        <span className={style.Text}>Find your perfect team and turn ideas into reality with TeamUp</span>
                    </div>
                </div>

                <div className={style.registing} id="registing">
                    <div className={style.user}>
                        <div className={style.section}>
                            <Student className={style.Character1} />
                        </div>
                        <div className={style.button}>
                            <button>
                                <Link
                                    to="/register"
                                    state={{ userRole: 3 }}
                                    className={style.link}
                                >
                                    MEMBER
                                </Link>
                            </button>
                        </div>
                    </div>

                    <div className={style.user}>
                        <div className={style.section}>
                            <Professor className={style.Character1} />
                        </div>
                        <div className={style.button}>
                            <button>
                                <Link
                                    to="/register"
                                    state={{ userRole: 2 }}
                                    className={style.link}
                                >
                                    SUPERVISOR
                                </Link>
                            </button>
                        </div>
                    </div>

                </div>



                <div className={style.aboutus} id="about">
                    <AboutUs className={style.aboutus_image} />
                    <div className={style.aboutus_text}>

                        <h2>Team
                            <span> Up</span> </h2>
                        <p> platform designed to help
                            students and professionals
                            connect, collaborate, and form
                            the perfect teams.</p>
                        <p>
                            Showcase your skills, find
                            teammates, join projects, and
                            communicate seamlessly
                            All in one place.
                        </p>
                        <p> <span> Let's turn great ideas into
                            reality! </span></p>
                    </div>
                </div>{/* aboutus  */}




                {/* <div className={style.review} id="review">
                    <Photo className={style.review_photo} />
                    <div className={style.content_review}>
                        <Review className={style.review_background} />
                        <div className={`${style.content_review_animation1} ${isAnimating ? style.animate : ''}`}>
                            <Left_review className={style.content_review_left1} />
                            <Right_review className={style.content_review_right1} />
                        </div>
                        <div className={`${style.content_review_animation2} ${isAnimating ? style.animate : ''}`}>
                            <Left_review className={style.content_review_left2} />
                            <Right_review className={style.content_review_right2} />
                        </div>

                    </div>
                </div> */}
                {/* review  */}
                {/* <button onClick={handleClick} className={style.triggerButton}>Next</button> */}



                <div className={style.footer} id="contact">
                    <div className={style.footer_background}>
                        <div className={style.content_footer}>
                            <div className={style.left_footer}>
                                <p>Cairo University , Faculty of Science</p>
                            </div>
                            <div className={style.center_footer}>

                                <Logo className={style.center_footer_logo} />
                                {/* <Icons /> */}
                                <div className={style.icons}>
                                    <Instagram className={style.icon} />
                                    <Youtube className={style.icon} />
                                    <Twitter className={style.icon} />
                                    <Facebook className={style.icon} />
                                </div>
                            </div>
                            <div className={style.right_footer}>

                                <p>Copyright 2025</p>
                                <p>All rights reserved</p>
                            </div>
                        </div>
                    </div>
                </div>{/* footer  */}
            </div>
        </>
    );
}

export default Main;