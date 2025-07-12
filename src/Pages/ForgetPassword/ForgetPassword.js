import React, { useState, useEffect } from 'react';
import axios from 'axios';
import style from './style.module.css';
import forgetImg from '../../assets/svgs/forget.svg';
import Header from "../../Componant/Header/Header";
import api from '../../api/API';
import { Link, useNavigate } from 'react-router-dom';

function ForgetPassword() {
    const navigate = useNavigate();
    
    // State management
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Error and success states
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    
    // Resend functionality
    const [resendDisabled, setResendDisabled] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    
    // Show hint state
    const [showHint, setShowHint] = useState(false);

    // Timer effect for resend functionality
    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        } else {
            setResendDisabled(false);
        }
        return () => clearTimeout(timer);
    }, [resendTimer]);

    // Clear errors when user starts typing
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            setErrors({});
        }
    }, [email]);

    // Validate email format
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle sending reset code
    const handleSendCode = async () => {
        if (resendDisabled || loading) return;

        if (!validateForm()) return;

        setLoading(true);
        setErrors({});
        setSuccessMessage('');

        try {
            const res = await axios.post(`${api}/forgotPassword`, { email: email.trim() });
            
            setSuccessMessage('Reset code sent successfully! Please check your email and follow the link to reset your password.');
            setResendDisabled(true);
            setResendTimer(60); // 60 seconds cooldown
            
            // Navigate to reset password page after a short delay
            setTimeout(() => {
                navigate('/reset-password', { state: { email: email.trim() } });
            }, 2000);
            
        } catch (err) {
            console.error('Error sending reset code:', err);
            
            // Handle different error types
            if (err.response?.status === 404) {
                setErrors({ email: 'Email address not found. Please check and try again.' });
            } else if (err.response?.status === 429) {
                setErrors({ general: 'Too many requests. Please wait a moment before trying again.' });
                setResendDisabled(true);
                setResendTimer(60);
            } else if (err.response?.status >= 500) {
                setErrors({ general: 'Server error. Please try again later.' });
            } else if (err.response?.status === 400) {
                const errorMessage = err.response.data?.message;
                if (errorMessage?.toLowerCase().includes('email')) {
                    setErrors({ email: errorMessage });
                } else {
                    setErrors({ general: errorMessage || 'Invalid email address format.' });
                }
            } else {
                setErrors({ 
                    general: err.response?.data?.message || 'Failed to send reset code. Please try again.' 
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        handleSendCode();
    };

    return (
        <>
            <Header />
            <div className={style.container}>
                <div className={style.imageSection}>
                    <img src={forgetImg} alt="Forgot Password" className={style.image} />
                </div>
                
                <div className={style.formSection}>
                    <h2 className={style.title}>Forgot Password</h2>
                    <p className={style.subtitle}>
                        Enter your email address and we'll send you a code to reset your password.
                    </p>

                    {/* Success Message */}
                    {successMessage && (
                        <div className={style.successAlert}>
                            <div className={style.alertIcon}>✓</div>
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* General Error */}
                    {errors.general && (
                        <div className={style.errorAlert}>
                            <div className={style.alertIcon}>⚠</div>
                            <span>{errors.general}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={style.form}>
                        {/* Email Field */}
                        <div className={style.inputGroup}>
                            <label className={style.label}>Email Address</label>
                            <input
                                className={`${style.input} ${errors.email ? style.inputError : ''}`}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                disabled={loading}
                                autoComplete="email"
                            />
                            {errors.email && <span className={style.fieldError}>{errors.email}</span>}
                        </div>

                        {/* Submit Button with Hint */}
                        <div className={style.buttonWrapper}>
                            <button
                                type="submit"
                                className={`${style.button} ${style.primaryButton}`}
                                disabled={loading || resendDisabled}
                                onMouseEnter={() => setShowHint(true)}
                                onMouseLeave={() => setShowHint(false)}
                            >
                                {loading ? (
                                    <div className={style.buttonLoader}>
                                        <div className={style.spinner}></div>
                                        <span>Sending Code...</span>
                                    </div>
                                ) : resendDisabled ? (
                                    `Code Sent (${resendTimer}s)`
                                ) : (
                                    'Send Reset Code'
                                )}
                            </button>

                            {/* Hint Tooltip */}
                            {showHint && !loading && !resendDisabled && (
                                <div className={style.hintMenu}>
                                    <div className={style.hintArrow}></div>
                                    The reset code will be sent to your email. Please check your inbox and spam folder.
                                </div>
                            )}
                        </div>

                        {/* Resend Information */}
                        {resendDisabled && (
                            <div className={style.resendInfo}>
                                <p>Code sent! If you don't receive it within a few minutes, you can request a new one in {resendTimer} seconds.</p>
                            </div>
                        )}
                    </form>

                    {/* Back to Login Link */}
                    <div className={style.linkContainer}>
                        <Link to="/login" className={style.backLink}>
                            ← Back to Login
                        </Link>
                    </div>

                    {/* Help Section */}
                    <div className={style.helpSection}>
                        <h4>Need Help?</h4>
                        <ul>
                            <li>Check your spam/junk folder</li>
                            <li>Make sure you entered the correct email</li>
                            <li>Wait a few minutes for the email to arrive</li>
                            <li>Contact support if issues persist</li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ForgetPassword;