import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Header from "../../Componant/Header/Header";
import style from './Style.module.css';
import UserContext from "../../context/Usercontext";
import GetUser from "../../servies/getuser";
import def from "./../../assets/img/def.jpg"
import Posts from "../../Componant/Posts/posts";
import SendReq from "../../servies/Teams/SendReq";
import useCommunityCache from '../../hooks/useCommunityCash';

function UsersProfile() {
    const [profileData, setProfileData] = useState({
        name: "",
        code: "",
        mail: "",
        skills: [],
        links: [],
        team: ""
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [send, setSend] = useState(false);
    const [superV, setSuperV] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const { user } = useContext(UserContext);
    const { id, code } = useParams();
    const { users } = useContext(UserContext);
    const { currentUserTeamContext } = useContext(UserContext);

    const { getCachedCommunity } = useCommunityCache();
    const cachedCommunity = getCachedCommunity(code);

    // Get user's team from location state if available
    const usersTeam = location.state?.usersTeam || "No Team";
    const teams_comm = location.state?.teams || [];
    const [teams, setTeams] = useState([]);
    const [isLeader, setIsLeader] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate("/login", { replace: true });
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                console.log("Fetching user with:", { code, id });

                const userData = await GetUser(code, id, user.userId);
                console.log('userData:', userData);
                
                let teamName = "No Team";
                let currentIsLeader = false;

                // Handle teams matching
                if (userData.teams && userData.teams.length > 0 && teams_comm.length > 0) {
                    const matchingTeams = teams_comm.filter(team =>
                        userData.teams.some(userTeam => userTeam.teamID === team._id)
                    );

                    if (matchingTeams.length > 0) {
                        setTeams(matchingTeams);
                    } else {
                        console.log('No matching teams found');
                        setTeams([]);
                    }
                } else {
                    setTeams([]);
                }

                // Check if user is supervisor
                if (userData.userRole === 2) {
                    setSuperV(true);
                }

                // Check if current user is leader - FIXED LOGIC
                if (usersTeam && Array.isArray(usersTeam) && usersTeam.length > 0) {
                    console.log("Checking leadership for usersTeam:", usersTeam);
                    
                    // Check each team to see if current user is the leader
                    usersTeam.forEach(team => {
                        console.log(`Checking team: ${team.teamName}`);
                        console.log(`Team leader ID: ${team.TeamLeader?.leaderID}`);
                        console.log(`Current user ID: ${user.userId}`);
                        
                        if (team.TeamLeader && team.TeamLeader.leaderID === user.userId) {
                            console.log(`Current user IS the leader of team: ${team.teamName}`);
                            currentIsLeader = true;
                        } else {
                            console.log(`Current user is NOT the leader of team: ${team.teamName}`);
                        }
                    });
                }

                // Update states
                setIsLeader(currentIsLeader);
                
                // FIXED: Calculate send state based on the actual leadership status
                console.log('teams :', teams);
                const shouldShowSendButton = (user?.role === 3) && (superV ? true : currentIsLeader && !(teams.length > 0)) ;
                setSend(shouldShowSendButton);

                console.log('Final values:');
                console.log('currentIsLeader:', currentIsLeader);
                console.log('superV:', superV);
                console.log('user.role:', user?.role);
                console.log('shouldShowSendButton:', shouldShowSendButton);

                if (userData) {
                    setProfileData({
                        name: userData.name || "",
                        userName: userData.userName || "",
                        mail: userData.email || userData.mail || "",
                        skills: userData.skills || [],
                        links: userData.links || [],
                        team: teamName || 'No Team',
                        image: userData.img || null
                    });
                } else {
                    setError("Failed to load user data");
                }
            } catch (err) {
                console.error("Error in fetchUserData:", err);
                setError("An error occurred while fetching user data");
            } finally {
                setLoading(false);
            }
        };

        if (code && id && user) {
            fetchUserData();
        } else if (!code || !id) {
            setError("Missing community code or user ID");
            setLoading(false);
        }
    }, [code, id, user, usersTeam]);

    const handleSendRequest = async () => {
        console.log("Send request clicked");
        SendReq(code, profileData?.userName, usersTeam[0]?.teamName);
    };

    return (
        <>
            <Header communityCode={cachedCommunity?.community.code_Comm} />
            <div className={style.containerpf}>
                {loading ? (
                    <div className={style.loadingState}>Loading user profile...</div>
                ) : error ? (
                    <div className={style.errorState}>{error}</div>
                ) : (
                    <div className={style.profileSection}>
                        <div className={style.profileContent}>
                            <div className={style.leftColumn}>
                                <div className={style.avatarContainer}>
                                    <div className={style.avatar}>
                                        {profileData.image ? (
                                            <img src={profileData.image} alt="profile" />
                                        ) : (
                                            <img src={def} alt="default profile" />
                                        )}
                                    </div>
                                </div>

                                <div className={style.sectionContainer}>
                                    <div className={style.sectionLabel}>Teams</div>
                                    <div className={style.teamsGrid}>
                                        {Array.isArray(teams) && teams.length > 0 ? (
                                            <ul>
                                                {teams.map((team, index) => (
                                                    <div className={style.cell} key={index}>
                                                        <li>{team.teamName || team.name || "Unknown Team"}</li>
                                                    </div>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className={style.text_bar}>
                                                <h5>Not part of any team</h5>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={style.fieldContainer}>
                                    <div className={style.name}>
                                        <h4>Name</h4>
                                        <div className={style.text_bar}>
                                            <h5>{profileData?.name || "No name set"}</h5>
                                        </div>
                                    </div>
                                </div>

                                <div className={style.fieldContainer}>
                                    <div className={style.name}>
                                        <h4>Username</h4>
                                        <div className={style.text_bar}>
                                            <h5>{profileData?.userName || "No username set"}</h5>
                                        </div>
                                    </div>
                                </div>

                                <div className={style.fieldContainer}>
                                    <div className={style.name}>
                                        <h4>Email</h4>
                                        <div className={style.text_bar}>
                                            <h5>{profileData?.mail || "No email set"}</h5>
                                        </div>
                                    </div>
                                </div>

                                <div className={style.sectionContainer}>
                                    <div className={style.sectionLabel}>Skills</div>
                                    <div className={style.skillsGrid}>
                                        <ul>
                                            {profileData.skills?.map((str, index) => (
                                                <div className={style.cell} key={index}>
                                                    <li>{str}</li>
                                                </div>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className={style.sectionContainer}>
                                    <div className={style.sectionLabel}>Links</div>
                                    <div className={style.linksContainer}>
                                        <ul>
                                            {profileData.links?.map((str, index) => (
                                                <div className={style.cell} key={index}>
                                                    <li>{str}</li>
                                                </div>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {send && (
                                    <button className={style.sendRequestButton} onClick={handleSendRequest}>
                                        Send Request
                                    </button>
                                )}
                            </div>

                            <div className={style.rightColumn}>
                                {user && profileData && (
                                    <Posts userId={id} communityCode={code} create={false} users={users} />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default UsersProfile;