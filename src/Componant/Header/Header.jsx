import React, { useState , useContext} from 'react';
import { useLocation } from 'react-router-dom';
import style from './style.module.css';
import { ReactComponent as Icon } from '../../assets/svgs/teamup_logoname.svg';
import useCommunityCache from '../../hooks/useCommunityCash';
import { ReactComponent as Chat } from '../../assets/svgs/header/Chat_white.svg';
import { ReactComponent as Profile } from '../../assets/svgs/header/Profile_white.svg';
import { ReactComponent as Notification } from '../../assets/svgs/header/Notification_white.svg';
import { ReactComponent as Report } from './../../assets/svgs/icons/reports.svg';
import UserContext from '../../context/Usercontext';
import MenuComponent from './../menu/menu';
import Search from './../Search/Search'

import { useNavigate } from 'react-router-dom';
import NotificationMenu from './../Notification/NotificationMenu';

const Header = (props) => {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const navigate = useNavigate();
    const { getCachedCommunity } = useCommunityCache()
    const cachedCommunity = getCachedCommunity(props.communityCode || props.code_Comm)

    // console.log('id in header : ' , props.communityId)
    const { user }= useContext(UserContext)
    // console.log('chached Community : ' ,cachedCommunity)
    // Define which sections are available for each route
    const routeSections = {
        '/': {
            logo: true,
            name: false,
            home: true,
            about: true,
            contact: true,
            login: true,
            notification: false,
            chat: false,
            profile: false,
            search: false,
            menu: false
        },
        '/register': {
            logo: true,
            name: false,
            home: false,
            about: false,
            contact: false,
            login: false,
            notification: false,
            chat: false,
            profile: false,
            search: false,
            menu: false
        },

        '/login': {
            logo: true,
            name: false,
            home: false,
            about: false,
            contact: false,
            login: false,
            notification: false,
            chat: false,
            profile: false,
            search: false,
            menu: false
        },

        '/verify': {
            logo: true,
            name: false,
            home: false,
            about: false,
            contact: false,
            login: false,
            notification: false,
            chat: false,
            profile: false,
            search: false,
            menu: false
        },
        '/verifyError': {
            logo: true,
            name: false,
            home: false,
            about: false,
            contact: false,
            login: false,
            notification: false,
            chat: false,
            profile: false,
            search: false,
            menu: false
        },
        '/settings': {
            logo: true,
            name: false,
            home: false,
            about: false,
            contact: false,
            login: false,
            notification: false,
            chat: false,
            profile: false,
            search: false,
            menu: true
        },
        '/settings/privacy': {
            logo: true,
            name: false,
            home: false,
            about: false,
            contact: false,
            login: false,
            notification: false,
            chat: false,
            profile: false,
            search: false,
            menu: true
        },

        '/settings/profile': {
            logo: true,
            name: false,
            home: false,
            about: false,
            contact: false,
            login: false,
            notification: false,
            chat: false,
            profile: false,
            search: false,
            menu: true
        },
        '/settings/team': {
            logo: true,
            name: false,
            home: false,
            about: false,
            contact: false,
            login: false,
            notification: false,
            chat: false,
            profile: false,
            search: false,
            menu: true
        },
        '/settings/post': {
            logo: true,
            name: false,
            home: false,
            about: false,
            contact: false,
            login: false,
            notification: false,
            chat: false,
            profile: false,
            search: false,
            menu: true
        },
        '/settings/notificationSettings': {
            logo: true,
            name: false,
            home: false,
            about: false,
            contact: false,
            login: false,
            notification: false,
            chat: false,
            profile: false,
            search: false,
            menu: true
        },
        '/settings/communities': {
            logo: true,
            name: false,
            home: false,
            about: false,
            contact: false,
            login: false,
            notification: false,
            chat: false,
            profile: false,
            search: false,
            menu: true
        },
        '/profile': {
            logo: true,
            name: false,
            home: false,
            about: false,
            contact: false,
            login: false,
            notification: false,
            chat: false,
            profile: false,
            search: false,
            menu: true
        },
        '/community': {
            logo: true,
            name: true,
            home: false,
            about: false,
            contact: false,
            login: false,
            notification: false,
            chat: false,
            profile: false,
            search: true,
            menu: true
        },
        '/community/:code': {
            logo: false,
            name: true,
            home: false,
            about: false,
            contact: false,
            login: false,
            notification: true,
            chat: props.inTeam,
            profile: true,
            search: true,
            menu: true,
            report: true

        },
        '/community/:code/:id': {
            logo: true,
            name: false,
            home: false,
            about: false,
            contact: false,
            login: false,
            notification: false,
            chat: false,
            profile: false,
            search: false,
            menu: true,
            
        },
        '/community/:code/team/:id': {
            logo: false,
            name: true,
            home: false,
            about: false,
            contact: false,
            login: false,
            notification: true,
            chat: props.inTeam,
            profile: true,
            search: false,
            join: false,
            menu: true,
            report: true
        },
        '/community/:code/team/:id/chat': {
            logo: false,
            name: true,
            home: false,
            about: false,
            contact: false,
            login: false,
            notification: false,
            chat: false,
            profile: false,
            search: false,
            join: false,
            menu: true
        },
        '/posts': {
            logo: false,
            name: true,
            home: false,
            about: false,
            contact: false,
            login: false,
            notification: false,
            chat: false,
            profile: false,
            search: true,
            menu: true
        },
        '/forgotPassword': {
            logo: true,
            name: true,
            home: false,
            about: false,
            contact: false,
            login: false,
            notification: false,
            chat: false,
            profile: false,
            search: false,
            menu: false
        },
        '/reset-password': {
            logo: true,
            name: true,
            home: false,
            about: false,
            contact: false,
            login: false,
            notification: false,
            chat: false,
            profile: false,
            search: false,
            menu: false
        },

        '/Admin': {
            logo: true,
            name: false,
            home: false,
            about: false,
            contact: false,
            login: false,
            notification: false,
            chat: false,
            profile: false,
            search: false,
            menu: true,
            report: true
        },
    };

    const normalizedPath = location.pathname.replace(/\/$/, '');

    const isCommunityTeamPath = /^\/community\/[^/]+\/team\/[^/]+$/.test(location.pathname);
    const isCommunityPath = /^\/community\/[^/]+$/.test(normalizedPath);
    const isCommunityPostPath = /^\/community\/[^/]+\/[^/]+$/.test(location.pathname);
    const isCommunityTeamChatPath = /^\/community\/[^/]+\/team\/[^/]+\/chat$/.test(location.pathname);

    const currentPath = isCommunityTeamChatPath
        ? "/community/:code/team/:id/chat"
        : isCommunityTeamPath
            ? "/community/:code/team/:id"
            : isCommunityPostPath
                ? "/community/:code/:id"
                : isCommunityPath
                    ? "/community/:code"
                    : location.pathname;

    const currentSections = routeSections[currentPath] || routeSections["/"];

    // Scroll to section handler
    const scrollToSection = (sectionId) => {
        if (location.pathname === '/') {
            window.location.href = `/#${sectionId}`;
            return;
        }

        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMenuOpen(false);
        }
    };
    console.log('teams : ' , props.inTeam?.teams)

    return (
        <div className={style.headerContainer}>
            {/* LEFT SECTION - Menu + Logo/Name */}
            <div className={style.leftSection}>
                {currentSections.menu && (
                    <div className={style.menuWrapper}>
                        <MenuComponent
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            open={isMenuOpen}
                            setOpen={setIsMenuOpen}
                            setJoin={props.setJoin}
                            setCreate={props.setCreate}
                            comm_code={cachedCommunity?.community.code_Comm}
                            setLeave={props.setLeave}
                            setDelete={props.setDelete}
                            owner={props.owner}
                            setTeam={props.setTeam}
                            inTeam={props.inTeam}
                            leader={props.leader}
                            teams = {props.inTeam?.teams}
                            communityId = {props.communityId}
                        />
                        <div className={style.hintMenu}>Menu</div>
                    </div>
                )}

                {currentSections.logo && (
                    <div className={style.icon}>
                        <Icon />
                    </div>
                )}

                {currentSections.name && (
                    <div className={style.name}>
                        {props.teamName ? (
                            <h3 title={typeof props.teamName === 'string' ? props.teamName : JSON.stringify(props.teamName)}>
                                {typeof props.teamName === 'string' ? props.teamName : JSON.stringify(props.teamName)}
                            </h3>
                        ) : (
                            <h3 title={typeof props.comm_name === 'string' ? props.comm_name : JSON.stringify(props.comm_name)}>
                                {typeof props.comm_name === 'string' ? props.comm_name : JSON.stringify(props.comm_name)}
                            </h3>
                        )}
                    </div>
                )}
            </div>

            {/* CENTER SECTION - Navigation */}
            <div className={style.centerSection}>
                {currentSections.search && (
                    <div className={style.searchContainer}>
                        <Search
                            data={props.data}
                            code_Comm={props.communityCode}
                            teams={props.teams}
                            userTeams ={props.inTeam?.teams}
                        />
                    </div>
                )}
               


            </div>

            {/* RIGHT SECTION - Search + Icons */}
            <div className={style.rightSection}>
                 <nav className={`${style.nav} ${isMenuOpen ? style.open : ''}`}>
                    {currentSections.home && (
                        <button
                            className={style.navLink}
                            onClick={() => scrollToSection('homeContainer')}
                        >
                            Home
                        </button>
                    )}

                    {currentSections.about && (
                        <button
                            className={style.navLink}
                            onClick={() => scrollToSection('about')}
                        >
                            About Us
                        </button>
                    )}

                    {currentSections.contact && (
                        <button
                            className={style.navLink}
                            onClick={() => scrollToSection('contact')}
                        >
                            Contact Us
                        </button>
                    )}
                </nav>
                {currentSections.login && (
                    <button
                        className={style.login}
                        onClick={() => window.location.href = '/login'}
                    >
                        Login
                    </button>
                )}

                <div className={style.headerIcons}>
                    {props.inTeam > 0 && currentSections.chat && (
                        <div className={style.menuWrapper}>
                            <Chat
                                onClick={() => navigate(`/community/${props.communityCode}/team/${props.teamIds[0]}/chat`, { state: { teams: props.inTeam?.teams } })}
                                style={{ cursor: 'pointer' }}
                            />
                            <div className={style.hintMenu}>Chat</div>
                        </div>
                    )}

                    {currentSections.notification && (
                        <div className={style.menuWrapper}>
                            <Notification
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                style={{ cursor: 'pointer' }}
                            />
                            <div className={style.hintMenu}>Notifications</div>
                            {isNotificationOpen && (
                                <div className={style.profile}>
                                    <NotificationMenu
                                        open={isNotificationOpen}
                                        onClose={() => setIsNotificationOpen(false)}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {currentSections.profile && (
                        <div className={style.menuWrapper}>
                            <Profile
                            onClick={() =>
                                navigate('/profile', {
                                state: { teams: props.inTeam?.teams },
                                })
                            }
                            />
                            <div className={style.hintMenu}>Profile</div>
                        </div>
                    )}
                    {/* {currentSections.report && props.owner && (
                        <div className={style.menuWrapper}>
                            <Report onClick={() => navigate('/report/community')} />
                            <div className={style.hintMenu}>report</div>
                        </div>
                    )} */}
                    {currentSections.report  && (user?.role|| user?.userRole === 2 || user?.role|| user?.userRole === 1)&&(
                        <div className={style.menuWrapper}>
                            <Report onClick={() => navigate(`/community/${props.communityCode}/reports`)} />
                            <div className={style.hintMenu}>report</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile menu button */}
            {/* <button 
                className={style.menuButton}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
            >
                ☰
            </button> */}
        </div>
    );
};

export default Header;