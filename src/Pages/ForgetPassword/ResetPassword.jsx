import React, { useState, useEffect } from 'react';
import axios from 'axios';
import style from './style.module.css';
import Header from '../../Componant/Header/Header';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import api from '../../api/API';

function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // State management
    const [email, setEmail] = useState(location.state?.email || '');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Error states
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    
    // Resend functionality
    const [resendDisabled, setResendDisabled] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    
    // Password validation states
    const [passwordValidation, setPasswordValidation] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        noSpaces: true
    });
    

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
    }, [email, resetCode, newPassword, confirmPassword]);

    // Validate email format
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Validate password
    const validatePassword = (password) => {
        const validation = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            noSpaces: !/\s/.test(password)
        };
        setPasswordValidation(validation);
        return Object.values(validation).every(Boolean);
    };

    // Handle password change
    const handlePasswordChange = (value) => {
        setNewPassword(value);
        validatePassword(value);
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!resetCode.trim()) {
            newErrors.resetCode = 'Reset code is required';
        } else if (resetCode.length < 4) {
            newErrors.resetCode = 'Reset code must be at least 4 characters';
        }

        if (!newPassword) {
            newErrors.newPassword = 'New password is required';
        } else if (!validatePassword(newPassword)) {
            newErrors.newPassword = 'Password does not meet requirements';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    
    // Handle password reset
    const handleResetPassword = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            const res = await axios.post(`${api}/forgotPassword/resetPassword`, {
                email: email.trim(),
                resetCode: resetCode.trim(),
                newPassword,
            });
            
            setSuccessMessage('Password reset successfully! Redirecting to login...');
            
            // Clear form
            setEmail('');
            setResetCode('');
            setNewPassword('');
            setConfirmPassword('');
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (err) {
            console.error('Error resetting password:', err);
            
            if (err.response?.status === 400) {
                const errorMessage = err.response.data?.message || err.response.data?.error;
                if (errorMessage?.toLowerCase().includes('code')) {
                    setErrors({ resetCode: 'Invalid or expired reset code' });
                } else if (errorMessage?.toLowerCase().includes('email')) {
                    setErrors({ email: 'Email address not found' });
                } else {
                    setErrors({ general: errorMessage || 'Invalid reset information' });
                }
            } else if (err.response?.status === 429) {
                setErrors({ general: 'Too many attempts. Please try again later.' });
            } else if (err.response?.status >= 500) {
                setErrors({ general: 'Server error. Please try again later.' });
            } else {
                setErrors({ 
                    general: err.response?.data?.message || err.response?.data?.error || 'Failed to reset password. Please try again.' 
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        handleResetPassword();
    };

    return (
        <>
            <Header />
            <div className={style.container}>
                <div className={style.formSection}>
                    <h2 className={style.title}>Reset Password</h2>
                    
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
                            />
                            {errors.email && <span className={style.fieldError}>{errors.email}</span>}
                        </div>

                        {/* Reset Code Field */}
                        <div className={style.inputGroup}>
                            <label className={style.label}>Reset Code</label>
                            <input
                                className={`${style.input} ${errors.resetCode ? style.inputError : ''}`}
                                type="text"
                                value={resetCode}
                                onChange={(e) => setResetCode(e.target.value)}
                                placeholder="Enter the reset code from your email"
                                disabled={loading}
                            />
                            {errors.resetCode && <span className={style.fieldError}>{errors.resetCode}</span>}
                        </div>

                        {/* New Password Field */}
                        <div className={style.inputGroup}>
                            <label className={style.label}>New Password</label>
                            <div className={style.passwordContainer}>
                                <input
                                    className={`${style.input} ${style.passwordInput} ${errors.newPassword ? style.inputError : ''}`}
                                    type={'password'}
                                    value={newPassword}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    placeholder="Enter your new password"
                                    disabled={loading}
                                />
                              
                            </div>
                            {errors.newPassword && <span className={style.fieldError}>{errors.newPassword}</span>}
                            
                            {/* Password Requirements */}
                            {newPassword && (
                                <div className={style.passwordRequirements}>
                                    <div className={`${style.requirement} ${passwordValidation.length ? style.valid : style.invalid}`}>
                                        {passwordValidation.length ? '✓' : '✗'} At least 8 characters
                                    </div>
                                    <div className={`${style.requirement} ${passwordValidation.uppercase ? style.valid : style.invalid}`}>
                                        {passwordValidation.uppercase ? '✓' : '✗'} One uppercase letter
                                    </div>
                                    <div className={`${style.requirement} ${passwordValidation.lowercase ? style.valid : style.invalid}`}>
                                        {passwordValidation.lowercase ? '✓' : '✗'} One lowercase letter
                                    </div>
                                    <div className={`${style.requirement} ${passwordValidation.number ? style.valid : style.invalid}`}>
                                        {passwordValidation.number ? '✓' : '✗'} One number
                                    </div>
                                    <div className={`${style.requirement} ${passwordValidation.noSpaces ? style.valid : style.invalid}`}>
                                        {passwordValidation.noSpaces ? '✓' : '✗'} No spaces
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div className={style.inputGroup}>
                            <label className={style.label}>Confirm New Password</label>
                            <div className={style.passwordContainer}>
                                <input
                                    className={`${style.input} ${style.passwordInput} ${errors.confirmPassword ? style.inputError : ''}`}
                                    type={ 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm your new password"
                                    disabled={loading}
                                />
                            </div>
                            {errors.confirmPassword && <span className={style.fieldError}>{errors.confirmPassword}</span>}
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className={`${style.button} ${style.primaryButton}`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className={style.buttonLoader}>
                                    <div className={style.spinner}></div>
                                    <span>Resetting Password...</span>
                                </div>
                            ) : (
                                'Reset Password'
                            )}
                        </button>

                        {/* Resend Code Button */}
                        {/* <button
                            type="button"
                            className={`${style.button} ${style.secondaryButton}`}
                            onClick={handleSendCode}
                            disabled={resendDisabled || loading}
                        >
                            {loading ? (
                                <div className={style.buttonLoader}>
                                    <div className={style.spinner}></div>
                                    <span>Sending...</span>
                                </div>
                            ) : resendDisabled ? (
                                `Resend Code (${resendTimer}s)`
                            ) : (
                                'Resend Reset Code'
                            )}
                        </button> */}
                    </form>

                    {/* Back to Login Link */}
                    <div className={style.linkContainer}>
                        <Link to="/login" className={style.backLink}>
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ResetPassword;