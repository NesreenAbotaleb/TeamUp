import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import UserContext from "./../../context/Usercontext";
import style from './style.module.css'
import Header from "./../../Componant/Header/Header";
import { jwtDecode } from "jwt-decode";
import def from "../../assets/img/def.jpg";
import { ReactComponent as Left_login } from '../../assets/svgs/Login/left login.svg';
import { ReactComponent as Left_plant } from '../../assets/svgs/Login/left plant.svg';
import { ReactComponent as Right_login } from '../../assets/svgs/Login/rightlogin.svg';
import { ReactComponent as Character_login } from '../../assets/svgs/Login/Character_login_.svg';
import { ReactComponent as Speech_login } from '../../assets/svgs/Login/Speech_login.svg';
import api from "../../api/API";

function Login() {
    const navigate = useNavigate();
    const { loginUser } = useContext(UserContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Enhanced error state management
    const [errors, setErrors] = useState({
        email: "",
        password: "",
        general: ""
    });

    // Form validation states
    const [validationState, setValidationState] = useState({
        emailValid: true,
        passwordValid: true,
        emailTouched: false,
        passwordTouched: false
    });

    let initialData = {
        name: "",
        email: "",
        image: def,
        code: "",
        skills: [],
        links: [],
        password: ""
    };

    const [editdata, setEditdata] = useState(initialData);

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    // Enhanced validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return {
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            noSpaces: !/\s/.test(password),
            isValid: password.length >= 8 && /[A-Z]/.test(password) && !/\s/.test(password)
        };
    };

    // Handle input changes with real-time validation
    const handleEmailChange = (e) => {
        const value = e.target.value.trim();
        setEmail(value);
        
        const isValid = validateEmail(value);
        setValidationState(prev => ({ 
            ...prev, 
            emailValid: isValid || value === "",
            emailTouched: true 
        }));
        
        setErrors(prev => ({
            ...prev,
            email: !isValid && value !== "" ? "Please enter a valid email address" : "",
            general: ""
        }));
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value.trim();
        setPassword(value);
        
        const validation = validatePassword(value);
        setValidationState(prev => ({ 
            ...prev, 
            passwordValid: validation.isValid || value === "",
            passwordTouched: true 
        }));
        
        let passwordError = "";
        if (value !== "" && !validation.isValid) {
            if (!validation.minLength) passwordError = "Password must be at least 8 characters long";
            else if (!validation.hasUpperCase) passwordError = "Password must contain at least one uppercase letter";
            else if (!validation.noSpaces) passwordError = "Password cannot contain spaces";
        }
        
        setErrors(prev => ({
            ...prev,
            password: passwordError,
            general: ""
        }));
    };

    // Enhanced login handler
    const handleLogin = async (e) => {
        e.preventDefault();
        
        // Clear previous errors
        setErrors({ email: "", password: "", general: "" });
        
        // Validate before submitting
        const emailValid = validateEmail(email);
        const passwordValidation = validatePassword(password);
        
        if (!emailValid) {
            setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
            return;
        }
        
        if (!passwordValidation.isValid) {
            setErrors(prev => ({ ...prev, password: "Password must be at least 8 characters with uppercase letter and no spaces" }));
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(`${api}/login`, { email, password });
            
            const userData = response.data.user;
            const token = response.data.token;

            // Decode token to get user_id
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.user_id || decodedToken.id || decodedToken._id;

            // Store user and token
            loginUser({ ...userData, userId });
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify({ ...userData, userId }));

            // Navigate based on role
            if (userData.role === 1) {
                navigate('/Admin');
            } else {
                navigate("/community");
            }

        } catch (err) {
            console.error("Login Error:", err.response);
            
            // Enhanced error handling
            const status = err.response?.status;
            const serverMessage = err.response?.data?.message || err.response?.data?.error;
            
            let errorMessage = "";
            
            switch (status) {
                case 400:
                    errorMessage = "Invalid request. Please check your input.";
                    break;
                case 401:
                    if (serverMessage === "User doesn't exist") {
                        errorMessage = "No account found with this email address.";
                    } else if (serverMessage === "Invalid password") {
                        errorMessage = "Incorrect password. Please try again.";
                    } else {
                        errorMessage = "Invalid credentials. Please check your email and password.";
                    }
                    break;
                case 403:
                    errorMessage = "Account access denied. Please contact support.";
                    break;
                case 429:
                    errorMessage = "Too many login attempts. Please try again later.";
                    break;
                case 500:
                    errorMessage = "Server error. Please try again later.";
                    break;
                default:
                    errorMessage = serverMessage || "Login failed. Please try again.";
            }
            
            setErrors(prev => ({ ...prev, general: errorMessage }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className={style.header}>
                <Header />
            </div>
            
            <div className={style.container}>
                <div className={style.left}>
                    <Left_login />
                    <Left_plant className={style.leftPhoto} />
                </div>

                <div className={style.center}>
                    <div className={style.screenWrapper}>
                        {/* <Screen_login className={style.screen} /> */}
                        <h2 className={style.centerHeading}>Welcome Back</h2>

                        <div className={style.content}>
                            <form onSubmit={handleLogin} className={style.loginForm}>
                                {/* Email Field */}
                                <div className={style.inputGroup}>
                                    <label className={style.inputLabel}>Email Address</label>
                                    <input 
                                        type="email" 
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        className={`${style.inputField} ${
                                            validationState.emailTouched && !validationState.emailValid ? style.inputError : ''
                                        }`}
                                        disabled={isLoading}
                                    />
                                    {errors.email && (
                                        <div className={style.errorMessage}>
                                            <span className={style.errorIcon}>⚠</span>
                                            {errors.email}
                                        </div>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div className={style.inputGroup}>
                                    <label className={style.inputLabel}>Password</label>
                                    <input 
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        className={`${style.inputField} ${
                                            validationState.passwordTouched && !validationState.passwordValid ? style.inputError : ''
                                        }`}
                                        disabled={isLoading}
                                    />
                                    {errors.password && (
                                        <div className={style.errorMessage}>
                                            <span className={style.errorIcon}>⚠</span>
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                {/* Forgot Password Link */}
                                <div className={style.forgotPasswordContainer}>
                                    <Link to="/forgotPassword" className={style.forgotLink}>
                                        Forgot Password?
                                    </Link>
                                </div>

                                {/* General Error Message */}
                                {errors.general && (
                                    <div className={style.generalError}>
                                        <span className={style.errorIcon}>❌</span>
                                        {errors.general}
                                    </div>
                                )}

                                {/* Login Button */}
                                <button 
                                    type="submit" 
                                    className={`${style.loginBtn} ${isLoading ? style.loading : ''}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className={style.loadingSpinner}></span>
                                            Signing In...
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>

                                {/* Divider */}
                                <div className={style.divider}>
                                    <span>or</span>
                                </div>

                                {/* Create Account Button */}
                                <button 
                                    type="button"
                                    className={style.createAccountBtn}
                                    onClick={toggleModal}
                                    disabled={isLoading}
                                >
                                    Create New Account
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className={style.right}>
                    <Right_login className={style.photo} />
                    <Speech_login className={style.speech} />
                    <Character_login className={style.character} />
                </div>
            </div>

            {/* Enhanced Modal */}
            {showModal && (
                <div className={style.modalOverlay} onClick={toggleModal}>
                    <div className={style.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={style.modalHeader}>
                            <h3>Choose Account Type</h3>
                            <button 
                                className={style.modalCloseBtn}
                                onClick={toggleModal}
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className={style.modalBody}>
                            <p>Select the type of account you want to create:</p>
                            
                            <div className={style.accountTypeButtons}>
                                <Link 
                                    to='/register' 
                                    state={{ userRole: 3 }}
                                    className={style.accountTypeBtn}
                                >
                                    <div className={style.accountTypeIcon}>🎓</div>
                                    <div>
                                        <h4>Member</h4>
                                        <p>Access courses and learning materials</p>
                                    </div>
                                </Link>
                                
                                <Link 
                                    to='/register' 
                                    state={{ userRole: 2 }}
                                    className={style.accountTypeBtn}
                                >
                                    <div className={style.accountTypeIcon}>👨‍🏫</div>
                                    <div>
                                        <h4>Supervisor</h4>
                                        <p>Create and manage courses</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Login;