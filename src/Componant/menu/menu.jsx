import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import UserContext from '../../context/Usercontext';
import style from './style.module.css';

import { ReactComponent as Profile } from './../../assets/svgs/menu/profile.svg';
import { ReactComponent as MenuIcon } from './../../assets/svgs/menu/menue.svg';
import { ReactComponent as Settings } from './../../assets/svgs/menu/setting.svg';
import { ReactComponent as Logout } from './../../assets/svgs/menu/logout.svg';
import { ReactComponent as Community } from './../../assets/svgs/menu/community_icon.svg';
import { ReactComponent as Notification } from './../../assets/svgs/menu/notification.svg';
import { ReactComponent as PrivacyIcon } from './../../assets/svgs/menu/privacy.svg';
import { ReactComponent as Join } from './../../assets/svgs/plus_colored_icon.svg';
import { ReactComponent as Cross } from './../../assets/svgs/Cross.svg';
import { ReactComponent as Delete } from './../../assets/svgs/trash.svg';
import { ReactComponent as Back } from './../../assets/svgs/menu/Back.svg';
import { ReactComponent as Report } from './../../assets/svgs/icons/Menu-Reports.svg';

import { useParams } from "react-router-dom";

const MenuComponent = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const open = props.open
    const onClick = props.onClick

    const { logoutUser } = useContext(UserContext);
    const { user } = useContext(UserContext);
    const userRole_ = user && user.userRole === 2;
    const userState = (user && user.role === 2) || userRole_;
    
    // Check if user is admin (you may need to adjust this based on your user structure)
    const isAdmin = user && (user.role !== 1 && user.userRole !== 1 );

    const code = useParams().code || localStorage.getItem('lastCommunityCode');
    console.log('menu in team : ' , props.inTeam?.teams?.length)
    console.log('owner : ' , props.owner)
    const routeSections = {
        '/community': {
            profile: true,
            logout: true,
            join: true,
            setting: true,
            notification: false,
            privacy: false,
            community: false,
        },
        '/community/:code': {
            profile: true,
            logout: true,
            join: false,
            setting: true,
            leave: !props.owner,
            delete: props.owner,
            team: props.inTeam?.teams?.length === 0,
            notification: false,
            privacy: false,
            community: true,
            report: true
        },
        '/profile': {
            profile: false,
            logout: true,
            join: false,
            setting: true && isAdmin,
            notification: false,
            privacy: false,
            community: true && isAdmin,
            back:true,
        },
        '/community/:code/reports': {
            profile: true,
            logout: true,
            join:false,
            setting: false,
            notification: false,
            privacy: false,
            community: false,
            back: true,
        },
        '/settings/communities': {
            profile: false,
            logout: true,
            join: true,
            setting: true,
            back: true,
            notification: false,
            privacy: false,
            community: true,
        },
        '/forgot-password': {
            profile: true,
            logout: true,
            join: true,
            setting: true,
            notification: false,
            privacy: false,
            community: true,
        },
        '/settings/profile': {
            profile: false,
            logout: true,
            join: true,
            setting: true,
            back: true,
            notification: false,
            privacy: false,
            community: true,
        }, 
        '/settings/team': {
            profile: false,
            logout: true,
            join: true,
            setting: true,
            back: true,
            notification: false,
            privacy: false,
            community: true,
        }, 
        '/settings/post': {
            profile: false,
            logout: true,
            join: true,
            setting: true,
            back: true,
            notification: false,
            privacy: false,
            community: true,
        },
        '/settings/privacy': {
            profile: true,
            logout: true,
            join: true,
            setting: true,
            back: true,
            notification: false,
            privacy: false,
            community: true,
        },
        '/settings': {
            profile: true,
            logout: true,
            join: true,
            setting: false,
            back: true,
            notification: false,
            privacy: false,
            community: true,
        },
        '/notification': {
            profile: true,
            logout: true,
            join: true,
            setting: true,
            notification: true,
            privacy: true,
            community: true,
        }, 
        '/settings/notificationSettings': {
            profile: true,
            logout: true,
            join: true,
            setting: false,
            back: true,
            notification: false,
            privacy: false,
            community: true,
        },
        '/posts': {
            profile: true,
            logout: true,
            join: true,
            setting: true,
            notification: false,
            privacy: false,
            community: true,
        },
        '/community/:code/:id': {
            profile: true,
            logout: true,
            join: false,
            setting: true,
            notification: false,
            privacy: false,
            community: true,
            back: true,
        },
        '/community/:code/team/:id': {
            profile: true,
            logout: true,
            join: false,
            setting: true,
            back: true,
            notification: false,
            privacy: false,
            community: true,
            leaveTeam: props.inTeam,
            deleteTeam: props.leader
        },
        '/community/:code/team/:id/chat': {
            profile: true,
            logout: true,
            join: false,
            setting: true,
            back: true,
            notification: false,
            privacy: false,
            community: true,
            leaveTeam: props.inTeam,
            deleteTeam: props.leader
        },
        '/Admin': {
            profile: true,
            logout: true,
            join: false,
            setting: false,
            back: false,
            notification: false,
            privacy: false,
            community: false,
            leaveTeam: false,
            deleteTeam: false,
            // Admin-specific options
            adminPanel: true,
        },
        '/ChatList': {
            profile: true,
            logout: true,
            join: false,
            setting: true,
            notification: true,
            privacy: false,
            community: true,
        },
    };

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
        onClick();
    };

    console.log('menu : ', props.inTeam)
    const isCommunityTeamPath = /^\/community\/[^/]+\/team\/[^/]+$/.test(location.pathname);
    const isCommunityPath = /^\/community\/[^/]+$/.test(location.pathname);
    const isCommunityPostPath = /^\/community\/[^/]+\/[^/]+$/.test(location.pathname);
    const isCommunityTeamChatPath = /^\/community\/[^/]+\/team\/[^/]+\/chat$/.test(location.pathname);
    const isCommunityReportsPath = /^\/community\/[^/]+\/reports$/.test(location.pathname);
    const isAdminPath = location.pathname.startsWith('/admin');

    const currentPath = isCommunityTeamChatPath
        ? "/community/:code/team/:id/chat"
        : isCommunityTeamPath
            ? "/community/:code/team/:id"
            : isCommunityReportsPath
                ? "/community/:code/reports"
                : isCommunityPostPath
                    ? "/community/:code/:id"
                    : isCommunityPath
                        ? "/community/:code"
                        : isAdminPath
                            ? "/admin"
                            : location.pathname;

    const currentSections = routeSections[currentPath] || {};

    useEffect(() => {
        if (code) {
            localStorage.setItem('lastCommunityCode', code);
        }
    }, [code]);

    return (
        <div className={style.menuContainer}>
            <button onClick={onClick} >
                <MenuIcon />
            </button>

            {open && (
                <div className={style.container}>
                    {currentSections.notification && (
                        <Link className={style.profile} to='/notificationMenu'>
                            <Notification className={style.icon} />
                            <h3>Notification</h3>
                        </Link>
                    )}
                    {currentSections.profile && (
                        <Link className={style.profile} to= {'/profile' } state = {{teams : props.inTeam?.teams}}>
                            <Profile className={style.icon} />
                            <h3>Profile</h3>
                        </Link>
                    )}
                    {currentSections.community && (
                        <div className={style.menuWrapper}>
                            <Link className={style.community} to='/community'>
                                <Community className={style.icon} />
                                <h3>Community</h3>
                            </Link>
                            <div className={style.hintMenu}>to communities list</div>
                        </div>
                    )}

                    {currentSections.setting && (
                        <Link className={style.profile} to={`/settings`} state={{ code } || props.communityCode || props.code_Comm}>
                            <Settings className={style.icon} />
                            <h3>Settings</h3>
                        </Link>
                    )}

                    {/* Admin Panel Link - only show for admins */}
                    {currentSections.adminPanel && isAdmin && (
                        <div className={style.menuWrapper}>
                            <Link className={style.profile} to='/admin'>
                                <Settings className={style.icon} />
                                <h3>Admin Panel</h3>
                            </Link>
                            <div className={style.hintMenu}>administration dashboard</div>
                        </div>
                    )}

                    {currentSections.join && (
                        <>
                            <button className={style.profile} onClick={() => {
                                props.setJoin(true);
                                props.setOpen(false)
                            }}>
                                <Join className={style.icon} />
                                <h3>Join</h3>
                            </button>
                            {userState && (
                                <>
                                    <button className={style.profile} onClick={() => {
                                        props.setCreate(true);
                                        props.setOpen(false)
                                    }}>
                                        <Join className={style.icon} />
                                        <h3>Create</h3>
                                    </button>
                                </>
                            )}
                        </>
                    )}
                    {currentSections.team && (
                        <button className={style.profile} onClick={() => {
                            props.setTeam(true);
                            props.setOpen(false)
                        }}>
                            <Join className={style.icon} />
                            <h3>create Team</h3>
                        </button>
                    )}
                    {currentSections.back && (
                        <>
                        {isAdmin ? (
                            
                            <div className={style.menuWrapper}>
                                <Link className={style.profile} to={
                                    isAdminPath ? '/community' : 
                                    code ? `/community/${code}` : '/community'
                                }>
                                    <Back className={style.icon} />
                                    <h3>back</h3>
                                </Link>
                                <div className={style.hintMenu}>
                                    {isAdminPath ? 'to communities' : 'to your current community'}
                                </div>
                            </div>
                        ):(
                            
                            <div className={style.menuWrapper}>
                                <Link className={style.profile} to={
                                    '/Admin'
                                }>
                                    <Back className={style.icon} />
                                    <h3>back</h3>
                                </Link>
                                <div className={style.hintMenu}>
                                    { 'Admin Dashboard' }
                                </div>
                            </div>
                        )}
                        </>
                    )}

                    {currentSections.privacy && (
                        <Link className={style.profile} to='/privacy'>
                            <PrivacyIcon className={style.icon} />
                            <h3>privacy</h3>
                        </Link>
                    )}

                    {currentSections.leave && (
                        <>
                            <button className={style.profile} onClick={() => {
                                props.setLeave(true);
                                props.setOpen(false)
                            }}>
                                <Cross className={style.icon} />
                                <h3>Leave</h3>
                            </button>
                        </>
                    )}
                    {currentSections.delete && (
                        <button className={style.profile} onClick={() => {
                            props.setDelete(true);
                            props.setOpen(false)
                        }}>
                            <Delete className={style.icon} />
                            <h3>Delete Community</h3>
                        </button>
                    )}
                    {currentSections.report && (
                        <button className={style.profile}onClick={() => { 
                                props.setOpen(false)
                                navigate(`/community/${props.communityId}/report`)
                                } } >
                            <Report className={style.icon}/>
                            <h4>ReportCommunity</h4>
                        </button>
                    )}
                    {currentSections.leaveTeam && (
                        <button className={style.profile} onClick={() => {
                            props.setLeave(true);
                            props.setOpen(false)
                        }}>
                            <Logout className={style.icon} />
                            <h3>LeaveTeam</h3>
                        </button>
                    )}
                    {currentSections.deleteTeam && (
                        <button className={style.profile} onClick={() => {
                            props.setDelete(true);
                            props.setOpen(false)
                        }}>
                            <Delete className={style.icon} />
                            <h3>DeleteTeam</h3>
                        </button>
                    )}
                    {currentSections.logout && (
                        <Link className={style.profile} onClick={handleLogout} >
                            <Logout className={style.icon} />
                            <h3>Logout</h3>
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};

export default MenuComponent;