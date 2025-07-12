// Updated Community.js component using the extended cache context
import React, { useState, useEffect, useContext } from "react";
import UserContext from "./../../context/Usercontext";
import { useCommunity } from "./../../context/CommunityContext";
import { useNavigate } from 'react-router-dom';
import Header from "./../../Componant/Header/Header";
import List from './../../Componant/items/list';
import axios from "axios";
import api from "../../api/API";
import style from './style.module.css';

// Import your SVG components
import { ReactComponent as Character } from './../../assets/svgs/joinus 1 1.svg';
import { ReactComponent as Cross } from './../../assets/svgs/Cross.svg';
import { ReactComponent as Copy } from './../../assets/svgs/Copy.svg';
import { ReactComponent as AlertCircle } from './../../assets/svgs/AlertCircle.svg';
import { ReactComponent as CheckCircle } from './../../assets/svgs/CheckCircle.svg';

// Enhanced Toast Component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className={style.toastIcon} />;
            case 'error':
                return <AlertCircle className={style.toastIcon} />;
            default:
                return null;
        }
    };

    return (
        <div className={`${style.toast} ${style[`toast${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}>
            {getIcon()}
            <span className={style.toastMessage}>{message}</span>
            <button className={style.toastClose} onClick={onClose}>×</button>
        </div>
    );
};

// Loading Spinner Component
const LoadingSpinner = () => (
    <div className={style.loadingContainer}>
        <div className={style.spinner}></div>
        <p className={style.loadingText}>Loading communities...</p>
    </div>
);

// Error Boundary Component
const ErrorDisplay = ({ error, onRetry }) => (
    <div className={style.errorContainer}>
        <AlertCircle className={style.errorIcon} />
        <h3 className={style.errorTitle}>Oops! Something went wrong</h3>
        <p className={style.errorMessage}>{error}</p>
        <button className={style.retryButton} onClick={onRetry}>
            Try Again
        </button>
    </div>
);

function Community() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    
    // Use the extended community cache context
    const {
        // Communities list data
        allCommunities,
        userCommunities,
        communitiesLoading,
        communitiesError,
        
        // Functions
        fetchAllCommunities,
        addCommunityToCache,
        joinCommunityInCache,
        isCommunitiesListCacheExpired
    } = useCommunity();

    // Local state for UI
    const [join, setJoin] = useState(false);
    const [create, setCreate] = useState(false);
    const [copy, setCopy] = useState(false);
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [validName, setValidName] = useState(true);
    const [toast, setToast] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [editdata, setEditdata] = useState({ code: "", communities: [] });

    const userRole_ = user && user.userRole === 2;
    const userState = (user && user.role === 2) || userRole_;
    const isEmpty = allCommunities.length === 0;

    // Enhanced toast handler
    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    const closeToast = () => {
        setToast(null);
    };

    // Enhanced error handling
    const handleError = (error, context = '') => {
        let errorMessage = 'An unexpected error occurred';
        
        if (error.response) {
            if (error.response.status === 401) {
                errorMessage = 'Session expired. Please login again.';
                localStorage.removeItem('token');
                navigate('/login');
                return;
            } else if (error.response.status === 403) {
                errorMessage = 'You do not have permission to perform this action.';
            } else if (error.response.status === 404) {
                errorMessage = 'Community not found.';
            } else if (error.response.status === 409) {
                errorMessage = 'Community name already exists. Please try a different name.';
            } else if (error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else {
                errorMessage = `Server error (${error.response.status}). Please try again later.`;
            }
        } else if (error.request) {
            errorMessage = 'Network error. Please check your connection and try again.';
        } else {
            errorMessage = error.message || errorMessage;
        }

        if (context) {
            errorMessage = `${context}: ${errorMessage}`;
        }

        showToast(errorMessage, 'error');
        console.error(`Error ${context}:`, error);
    };

    // Load communities with caching
    const loadCommunities = async (forceRefresh = false) => {
        if (!user) return;

        try {
            const communities = await fetchAllCommunities(forceRefresh);
            showToast(`Loaded ${communities.length} communities`, 'success');
        } catch (error) {
            handleError(error, 'Failed to load communities');
        }
    };

    // Enhanced copy handler
    const handelCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            showToast("Code copied to clipboard!", 'success');
        } catch (err) {
            console.error('Failed to copy code:', err);
            try {
                const textArea = document.createElement("textarea");
                textArea.value = code;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast("Code copied to clipboard!", 'success');
            } catch (fallbackErr) {
                console.error('Fallback: Failed to copy code:', fallbackErr);
                showToast("Failed to copy code. Please copy manually.", 'error');
            }
        }
    };

    // Enhanced join handler with cache update
    const handleJoinCommunity = async () => {
        if (!editdata.code.trim()) {
            showToast('Please enter a community code', 'error');
            return;
        }

        setSubmitLoading(true);
        try {
            const token = user.token;
            const response = await axios.post(`${api}/community/join`, {
                code: editdata.code.trim()
            }, {
                headers: {
                    Authorization: `${token}`
                }
            });

            if (response.data && response.data.community) {
                // Update cache with joined community
                joinCommunityInCache(response.data.community.code, user.id);
                
                // If it's a new community, add it to the cache
                if (!allCommunities.find(c => c.code === response.data.community.code)) {
                    addCommunityToCache(response.data.community);
                }
                
                showToast('Successfully joined community!', 'success');
                setJoin(false);
                setEditdata({ code: "", communities: [] });
            }
        } catch (err) {
            handleError(err, 'Failed to join community');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Enhanced create handler with cache update
    const handleCreateCommunity = async () => {
        if (!name.trim()) {
            showToast('Please enter a community name', 'error');
            return;
        }

        setSubmitLoading(true);
        try {
            const token = user.token;
            const response = await axios.post(`${api}/community/create`, {
                name: name.trim(),
                description: description.trim()
            }, {
                headers: {
                    Authorization: `${token}`
                }
            });

            if (response.data && response.data.community) {
                // Update cache with new community
                addCommunityToCache(response.data.community);
                
                setCode(response.data.community.code);
                setCopy(true);
                showToast('Community created successfully!', 'success');
                setCreate(false);
                setName("");
                setDescription("");
                setValidName(true);
            }
        } catch (err) {
            if (err.response && err.response.status === 409) {
                setValidName(false);
            }
            handleError(err, 'Failed to create community');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Retry function for error state
    const handleRetry = () => {
        loadCommunities(true);
    };

    // Effects
    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        console.log({ user });
    }, [user, navigate]);

    useEffect(() => {
        loadCommunities();
    }, [user]);

    // Show loading state only if no cached data
    if (communitiesLoading && isEmpty) {
        return <LoadingSpinner />;
    }

    // Show error state only if no cached data
    if (communitiesError && isEmpty) {
        return <ErrorDisplay error={communitiesError} onRetry={handleRetry} />;
    }

    console.log('allCommunities from cache:', allCommunities);
    console.log('userCommunities from cache:', userCommunities);

    return (
        <>
            <div className={style.communityContainer}>
                {toast && (
                    <Toast 
                        message={toast.message} 
                        type={toast.type} 
                        onClose={closeToast}
                    />
                )}

                <Header 
                    setJoin={setJoin} 
                    setCreate={setCreate} 
                    data={allCommunities} 
                    communityCode={"test-code"} 
                    setLeave={() => {}} 
                    setDelete={() => {}} 
                    owner={false} 
                    setTeam={() => {}} 
                    inTeam={false} 
                    leader={false}
                />

                {/* Cache status and refresh button */}
                <div className={style.cacheControls}>
                    <div className={style.cacheStatus}>
                        <span>Cache Status: {isCommunitiesListCacheExpired() ? 'Expired' : 'Fresh'}</span>
                        <span>Communities: {allCommunities.length}</span>
                        <span>Your Communities: {userCommunities.length}</span>
                    </div>
                    <button 
                        onClick={() => loadCommunities(true)}
                        className={style.refreshButton}
                        disabled={communitiesLoading}
                    >
                        {communitiesLoading ? 'Refreshing...' : 'Refresh Communities'}
                    </button>
                </div>

                {!isEmpty ? (
                    <div className={style.listContainer}>
                        <List items={allCommunities} />
                    </div>
                ) : (
                    <div className={style.container_btns}>
                        <div className={style.buttons}>
                            <button className={style.commBtn} onClick={() => setJoin(true)}>
                                Join Community
                            </button>
                            {userState && (
                                <button className={style.commBtn} onClick={() => setCreate(true)}>
                                    Create Community
                                </button>
                            )}
                        </div>
                        <div className={style.background}>
                            <Character className={style.Character} />
                        </div>
                    </div>
                )}

                {/* Join Modal */}
                {join && (
                    <div className={style.btnsContainer}>
                        <div className={style.overlay} onClick={() => setJoin(false)}>
                            <div className={style.box} onClick={(e) => e.stopPropagation()}>
                                <div className={style.top}>
                                    <Cross className={style.cross} onClick={() => setJoin(false)} />
                                </div>

                                <div className={style.mid}>
                                    <h4>Join Community</h4>
                                    <p>Enter the community code provided by your instructor</p>

                                    <input
                                        className={style.input}
                                        placeholder="Enter community code..."
                                        type="text"
                                        value={editdata.code}
                                        onChange={(e) => setEditdata(prev => ({ ...prev, code: e.target.value.trim() }))}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !submitLoading) {
                                                handleJoinCommunity();
                                            }
                                        }}
                                        disabled={submitLoading}
                                    />
                                </div>

                                <div className={style.bottom}>
                                    <button 
                                        className={style.joinbtn} 
                                        onClick={handleJoinCommunity}
                                        disabled={submitLoading || !editdata.code.trim()}
                                    >
                                        {submitLoading ? 'Joining...' : 'Join Community'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create Modal */}
                {create && (
                    <div className={style.btnsContainer}>
                        <div className={style.overlay} onClick={() => setCreate(false)}>
                            <div className={style.box} onClick={(e) => e.stopPropagation()}>
                                <div className={style.top}>
                                    <Cross className={style.cross} onClick={() => setCreate(false)} />
                                </div>

                                <div className={style.mid}>
                                    <h4>Create Community</h4>
                                    <p>Set up your new learning community</p>

                                    <input
                                        className={style.input}
                                        placeholder="Community name..."
                                        type="text"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            setValidName(true); // Reset validation on change
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                if (!submitLoading) handleCreateCommunity();
                                            }
                                        }}
                                        disabled={submitLoading}
                                    />
                                    
                                    {!validName && (
                                        <div className={style.errorMessage}>
                                            <AlertCircle className={style.errorIcon} />
                                            This name already exists. Please try another name.
                                        </div>
                                    )}
                                    
                                    <textarea
                                        className={style.input_area}
                                        placeholder="Description (optional)..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        disabled={submitLoading}
                                    />
                                </div>

                                <div className={style.bottom}>
                                    <button 
                                        className={style.joinbtn} 
                                        onClick={handleCreateCommunity}
                                        disabled={submitLoading || !name.trim()}
                                    >
                                        {submitLoading ? 'Creating...' : 'Create Community'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Copy Code Modal */}
                {copy && (
                    <div className={style.overlay} onClick={() => setCopy(false)}>
                        <div className={style.box} onClick={(e) => e.stopPropagation()}>
                            <div className={style.top}>
                                <Cross className={style.cross} onClick={() => setCopy(false)} />
                            </div>

                            <div className={style.mid}>
                                <h4>Community Code</h4>
                                <p>Share this code with people you want to invite</p>
                                
                                <div className={`${style.input} ${style.codeDisplay}`}>
                                    <h4>{code}</h4>
                                    <Copy className={style.copyIcon} onClick={handelCopy} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default Community;