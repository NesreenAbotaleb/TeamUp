import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import style from "./style.module.css";
import def from "../../assets/img/def.jpg";
import {ReactComponent as Character} from './../../assets/svgs/signup1 1.svg'
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../Componant/Header/Header";
import api from "../../api/API";

const register_url = '/register'

// Custom Alert Component
const Alert = ({ alert, onClose }) => {
    if (!alert) return null;

    const getAlertIcon = (type) => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            default:
                return 'ℹ';
        }
    };

    return (
        <div className={`${style.alert} ${style[alert.type]}`}>
            <span className={style.alertIcon}>{getAlertIcon(alert.type)}</span>
            <div className={style.alertContent}>
                <div className={style.alertTitle}>{alert.title}</div>
                <div className={style.alertMessage}>{alert.message}</div>
            </div>
            <button className={style.closeAlert} onClick={onClose}>×</button>
        </div>
    );
};

export default function Register() {
    const location = useLocation();
    const userRole = location.state?.userRole || 3;

    // Initial state
    const initialData = {
        name: "",
        userName: "",
        email: "",
        image: def,
        skills: [],
        links: [],
        password: "",
        userRole: userRole
    };

    // State definitions
    const [editdata, setEditdata] = useState(initialData);
    const [imagePreview, setImagePreview] = useState(def);
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    
    // Validation states
    const [validations, setValidations] = useState({
        name: { isValid: true, message: '' },
        userName: { isValid: true, message: '' },
        email: { isValid: true, message: '' },
        password: { isValid: true, message: '' },
        links: { isValid: true, message: '' }
    });

    // Password strength indicators
    const [passwordStrength, setPasswordStrength] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });

    const [skill, setSkill] = useState(false);
    const [link, setLink] = useState(false);
    
    const navigate = useNavigate();

    // Dropzone configuration
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (file) {
                // Check file size (5MB limit)
                if (file.size > 5 * 1024 * 1024) {
                    showAlert('error', 'File Too Large', 'Please select an image smaller than 5MB');
                    return;
                }
                
                // Check file type
                if (!file.type.startsWith('image/')) {
                    showAlert('error', 'Invalid File Type', 'Please select a valid image file');
                    return;
                }

                const previewURL = URL.createObjectURL(file);
                setImagePreview(previewURL);
                setEditdata(prev => ({ ...prev, image: file }));
                showAlert('success', 'Image Uploaded', 'Profile image has been successfully uploaded');
            }
        },
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        maxFiles: 1,
        multiple: false
    });

    // Show alert function
    const showAlert = (type, title, message) => {
        setAlert({ type, title, message });
        setTimeout(() => setAlert(null), 5000);
    };

    // Cleanup preview URL
    useEffect(() => {
        if (imagePreview && imagePreview !== def) {
            return () => URL.revokeObjectURL(imagePreview);
        }
    }, [imagePreview]);

    // Validation functions
    const validateName = (name) => {
        if (!name) {
            return { isValid: false, message: 'Name is required' };
        }
        if (name.length < 2) {
            return { isValid: false, message: 'Name must be at least 2 characters' };
        }
        if (name.length > 50) {
            return { isValid: false, message: 'Name must be less than 50 characters' };
        }
        if (!/^[a-zA-Z\s'-]+$/.test(name)) {
            return { isValid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
        }
        return { isValid: true, message: 'Valid name' };
    };

    const validateUserName = (userName) => {
        if (!userName) {
            return { isValid: false, message: 'Username is required' };
        }
        if (userName.length < 3) {
            return { isValid: false, message: 'Username must be at least 3 characters' };
        }
        if (userName.length > 20) {
            return { isValid: false, message: 'Username must be less than 20 characters' };
        }
        if (!/^[a-zA-Z0-9_]+$/.test(userName)) {
            return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
        }
        return { isValid: true, message: 'Available username' };
    };

    const validateEmail = (email) => {
        if (!email) {
            return { isValid: false, message: 'Email is required' };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { isValid: false, message: 'Please enter a valid email address' };
        }
        return { isValid: true, message: 'Valid email address' };
    };

    const validatePassword = (password) => {
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        setPasswordStrength(checks);

        if (!password) {
            return { isValid: false, message: 'Password is required' };
        }

        const failedChecks = Object.entries(checks)
            .filter(([_, isValid]) => !isValid)
            .map(([check]) => check);

        if (failedChecks.length > 0) {
            return { isValid: false, message: 'Password does not meet requirements' };
        }

        return { isValid: true, message: 'Strong password' };
    };

    const isValidUrl = (url) => {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    };

    // Helper functions
    const handleInputChange = (field, value) => {
        setEditdata(prev => ({ ...prev, [field]: value }));

        // Real-time validation
        let validation = { isValid: true, message: '' };
        switch (field) {
            case 'name':
                validation = validateName(value);
                break;
            case 'userName':
                validation = validateUserName(value);
                break;
            case 'email':
                validation = validateEmail(value);
                break;
            case 'password':
                validation = validatePassword(value);
                break;
        }

        setValidations(prev => ({
            ...prev,
            [field]: validation
        }));
    };

    const handleAddItem = (arrayName, newItem) => {
        if (!newItem || editdata[arrayName].includes(newItem)) {
            showAlert('warning', 'Duplicate Entry', 'This item already exists in the list');
            return;
        }

        if (arrayName === 'links' && !isValidUrl(newItem)) {
            setValidations(prev => ({
                ...prev,
                links: { isValid: false, message: 'Please enter a valid URL (must start with http:// or https://)' }
            }));
            return;
        }

        if (arrayName === 'skills' && editdata.skills.length >= 10) {
            showAlert('warning', 'Limit Reached', 'You can add up to 10 skills only');
            return;
        }

        if (arrayName === 'links' && editdata.links.length >= 5) {
            showAlert('warning', 'Limit Reached', 'You can add up to 5 links only');
            return;
        }

        setEditdata(prev => ({
            ...prev,
            [arrayName]: [...prev[arrayName], newItem]
        }));

        setValidations(prev => ({
            ...prev,
            links: { isValid: true, message: '' }
        }));

        showAlert('success', 'Item Added', `${arrayName.slice(0, -1)} has been added successfully`);
    };

    const handleDeleteItem = (arrayName, itemToDelete) => {
        setEditdata(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].filter(item => item !== itemToDelete)
        }));
        showAlert('success', 'Item Removed', `${arrayName.slice(0, -1)} has been removed`);
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const validateForm = () => {
        const errors = [];

        // Check all validations
        Object.entries(validations).forEach(([field, validation]) => {
            if (!validation.isValid && editdata[field]) {
                errors.push(`${field}: ${validation.message}`);
            }
        });

        // Check required fields
        if (!editdata.name) errors.push('Name is required');
        if (!editdata.userName) errors.push('Username is required');
        if (!editdata.email) errors.push('Email is required');
        if (!editdata.password) errors.push('Password is required');

        return errors;
    };

    const onSubmit = async () => {
        const errors = validateForm();
        
        if (errors.length > 0) {
            showAlert('error', 'Form Validation Failed', errors[0]);
            return;
        }

        setIsLoading(true);

        try {
            let base64Img = "";
            if (editdata.image && typeof editdata.image !== "string") {
                base64Img = await convertToBase64(editdata.image);
            } else {
                base64Img = editdata.image;
            }

            let payload = {
                name: editdata.name.trim(),
                img: base64Img,
                userName: editdata.userName.trim(),
                password: editdata.password,
                email: editdata.email.trim().toLowerCase(),
                userRole: editdata.userRole,
                skills: editdata.skills,
                links: editdata.links
            };

            const response = await axios.post(`${api}/register`, payload, {
                withCredentials: false,
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data) {
                showAlert('success', 'Registration Successful!', 'Please check your email to verify your account');
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            }

        } catch (error) {
            console.error("Registration error:", error);
            
            let errorTitle = "Registration Failed";
            let errorMessage = "An unexpected error occurred. Please try again.";

            if (error.code === 'ECONNABORTED') {
                errorTitle = "Request Timeout";
                errorMessage = "The request took too long. Please check your connection and try again.";
            } else if (!error.response) {
                errorTitle = "Network Error";
                errorMessage = "Unable to connect to the server. Please check your internet connection.";
            } else {
                switch (error.response.status) {
                    case 400:
                        errorTitle = "Invalid Data";
                        errorMessage = error.response.data.message || "Please check all fields and try again.";
                        break;
                    case 401:
                        errorTitle = "Unauthorized";
                        errorMessage = "You are not authorized to perform this action.";
                        break;
                    case 403:
                        errorTitle = "Access Forbidden";
                        errorMessage = "Access denied. Please check your permissions.";
                        break;
                    case 409:
                        errorTitle = "Account Already Exists";
                        errorMessage = error.response.data.message || "An account with this email or username already exists.";
                        break;
                    case 422:
                        errorTitle = "Validation Error";
                        errorMessage = error.response.data.message || "Please check your input data.";
                        break;
                    case 500:
                        errorTitle = "Server Error";
                        errorMessage = "Internal server error. Please try again later.";
                        break;
                    default:
                        errorMessage = error.response.data.message || errorMessage;
                }
            }

            showAlert('error', errorTitle, errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const getPasswordRequirements = () => {
        const requirements = [
            { key: 'length', label: 'At least 8 characters', met: passwordStrength.length },
            { key: 'uppercase', label: 'One uppercase letter', met: passwordStrength.uppercase },
            { key: 'lowercase', label: 'One lowercase letter', met: passwordStrength.lowercase },
            { key: 'number', label: 'One number', met: passwordStrength.number },
            { key: 'special', label: 'One special character', met: passwordStrength.special }
        ];

        return requirements.map(req => (
            <div key={req.key} className={`${style.passwordRequirement} ${req.met ? style.met : style.unmet}`}>
                <i className={req.met ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'}></i>
                <span>{req.label}</span>
            </div>
        ));
    };

    return (
        <div className={`${style.register} ${isLoading ? style.loading : ''}`}>
            <Alert alert={alert} onClose={() => setAlert(null)} />
            
            <header className={style.header}>
                <Header/>
            </header>

            <div className={style.container}>
                <div className={style.formSection}>
                    <div className={style.profileSection}>
                        <div 
                            {...getRootProps()} 
                            className={`${style.imageUpload} ${isDragActive ? style.dragActive : ''}`}
                        >
                            <input {...getInputProps()} />
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Profile Preview"
                                    className={style.profileImage}
                                />
                            ) : (
                                <div className={style.camera}>
                                    <i className="bi bi-camera-fill"></i>
                                </div>
                            )}
                        </div>

                        <div className={style.formFields}>
                            <div className={style.inputGroup}>
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    className={`${style.input} ${
                                        validations.name.isValid === false ? style.error : 
                                        validations.name.isValid === true && editdata.name ? style.success : ''
                                    }`}
                                    placeholder="Enter your full name"
                                    value={editdata.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                />
                                {!validations.name.isValid && editdata.name && (
                                    <div className={style.errorMessage}>
                                        <i className="bi bi-exclamation-circle-fill"></i>
                                        {validations.name.message}
                                    </div>
                                )}
                                {validations.name.isValid && editdata.name && (
                                    <div className={style.successMessage}>
                                        <i className="bi bi-check-circle-fill"></i>
                                        {validations.name.message}
                                    </div>
                                )}
                            </div>

                            <div className={style.inputGroup}>
                                <label>Username</label>
                                <input
                                    type="text"
                                    className={`${style.input} ${
                                        validations.userName.isValid === false ? style.error : 
                                        validations.userName.isValid === true && editdata.userName ? style.success : ''
                                    }`}
                                    placeholder="Choose a unique username"
                                    value={editdata.userName}
                                    onChange={(e) => handleInputChange("userName", e.target.value)}
                                />
                                {!validations.userName.isValid && editdata.userName && (
                                    <div className={style.errorMessage}>
                                        <i className="bi bi-exclamation-circle-fill"></i>
                                        {validations.userName.message}
                                    </div>
                                )}
                                {validations.userName.isValid && editdata.userName && (
                                    <div className={style.successMessage}>
                                        <i className="bi bi-check-circle-fill"></i>
                                        {validations.userName.message}
                                    </div>
                                )}
                            </div>

                            <div className={style.inputGroup}>
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    className={`${style.input} ${
                                        validations.email.isValid === false ? style.error : 
                                        validations.email.isValid === true && editdata.email ? style.success : ''
                                    }`}
                                    placeholder="Enter your email address"
                                    value={editdata.email}
                                    onChange={(e) => handleInputChange("email", e.target.value)}
                                />
                                {!validations.email.isValid && editdata.email && (
                                    <div className={style.errorMessage}>
                                        <i className="bi bi-exclamation-circle-fill"></i>
                                        {validations.email.message}
                                    </div>
                                )}
                                {validations.email.isValid && editdata.email && (
                                    <div className={style.successMessage}>
                                        <i className="bi bi-check-circle-fill"></i>
                                        {validations.email.message}
                                    </div>
                                )}
                            </div>

                            <div className={style.inputGroup}>
                                <label>Password</label>
                                <input
                                    type="password"
                                    className={`${style.input} ${
                                        validations.password.isValid === false ? style.error : 
                                        validations.password.isValid === true && editdata.password ? style.success : ''
                                    }`}
                                    placeholder="Create a strong password"
                                    value={editdata.password}
                                    onChange={(e) => handleInputChange("password", e.target.value)}
                                />
                                {editdata.password && (
                                    <div className={style.passwordErrors}>
                                        {getPasswordRequirements()}
                                    </div>
                                )}
                            </div>

                            <div className={style.inputGroup}>
                                <label>Skills</label>
                                <div className={style.tagList}>
                                    {editdata.skills.map((skillItem, index) => (
                                        <span key={index} className={style.tag}>
                                            {skillItem}
                                            <button 
                                                type="button"
                                                onClick={() => handleDeleteItem("skills", skillItem)}
                                                aria-label={`Remove ${skillItem}`}
                                            >
                                                <i className="bi bi-x"></i>
                                            </button>
                                        </span>
                                    ))}
                                    {skill ? (
                                        <input
                                            type="text"
                                            className={style.tagInput}
                                            placeholder="Type skill and press Enter"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    const value = e.target.value.trim();
                                                    if (value) {
                                                        handleAddItem("skills", value);
                                                        e.target.value = "";
                                                    }
                                                    setSkill(false);
                                                }
                                                if (e.key === "Escape") {
                                                    setSkill(false);
                                                }
                                            }}
                                            onBlur={() => setSkill(false)}
                                        />
                                    ) : (
                                        <button 
                                            type="button"
                                            onClick={() => setSkill(true)} 
                                            className={style.addButton}
                                            aria-label="Add skill"
                                        >
                                            <i className="bi bi-plus"></i>
                                        </button>
                                    )}
                                </div>
                                {editdata.skills.length === 0 && (
                                    <small style={{ color: '#666', marginTop: '0.5rem' }}>
                                        Add skills to showcase your expertise
                                    </small>
                                )}
                            </div>

                            <div className={style.inputGroup}>
                                <label>Links</label>
                                <div className={style.tagList}>
                                    {editdata.links.map((linkItem, index) => (
                                        <span key={index} className={style.tag}>
                                            <a 
                                                href={linkItem} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{ color: 'inherit', textDecoration: 'none' }}
                                            >
                                                {linkItem.length > 30 ? `${linkItem.substring(0, 30)}...` : linkItem}
                                            </a>
                                            <button 
                                                type="button"
                                                onClick={() => handleDeleteItem("links", linkItem)}
                                                aria-label={`Remove ${linkItem}`}
                                            >
                                                <i className="bi bi-x"></i>
                                            </button>
                                        </span>
                                    ))}
                                    {link ? (
                                        <input
                                            type="url"
                                            className={style.tagInput}
                                            placeholder="https://example.com"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    const value = e.target.value.trim();
                                                    if (value) {
                                                        handleAddItem("links", value);
                                                        e.target.value = "";
                                                    }
                                                    setLink(false);
                                                }
                                                if (e.key === "Escape") {
                                                    setLink(false);
                                                }
                                            }}
                                            onBlur={() => setLink(false)}
                                        />
                                    ) : (
                                        <button 
                                            type="button"
                                            onClick={() => setLink(true)} 
                                            className={style.addButton}
                                            aria-label="Add link"
                                        >
                                            <i className="bi bi-plus"></i>
                                        </button>
                                    )}
                                </div>
                                {!validations.links.isValid && (
                                    <div className={style.errorMessage}>
                                        <i className="bi bi-exclamation-circle-fill"></i>
                                        {validations.links.message}
                                    </div>
                                )}
                                {editdata.links.length === 0 && (
                                    <small style={{ color: '#666', marginTop: '0.5rem' }}>
                                        Add portfolio links, social media, or personal websites
                                    </small>
                                )}
                            </div>

                            <button 
                                onClick={onSubmit} 
                                className={style.submitButton}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className={style.loadingSpinner}></div>
                                        Creating Account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className={style.illustrationSection}>
                    <Character className={style.img} />
                </div>
            </div>
        </div>
    );
}