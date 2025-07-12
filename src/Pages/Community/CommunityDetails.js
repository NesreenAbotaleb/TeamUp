import React, { useState, useEffect, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "./../../Componant/Header/Header";
import Posts from "./../../Componant/Posts/posts"; 
import Userslist from './../../Componant/Users/userslist';
import style from './style.module.css'
import { ReactComponent as Cross } from './../../assets/svgs/Cross.svg'
import TeamsList from '../../Componant/Teams/TeamsList';

import UserContext from "../../context/Usercontext";
// ✅ FIXED: Use centralized community context instead of separate hook
import { useCommunity } from "../../context/CommunityContext";

import Leave from "../../servies/Community/leave";
import deleteComm from "../../servies/Community/deleteComm";
import createTeam from "../../servies/Teams/createTeam";
import UserTeams from "../../servies/Teams/UserTeams";

function CommunityDetail() {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const { users, setUsers } = useContext(UserContext);
    
    // ✅ FIXED: Use centralized community context
    const {
        fetchCommunity,
        getCachedCommunity,
        updateCommunityCache,
        removeCommunityFromCache
    } = useCommunity();
    
    const [owner, setOwner] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [community, setCommunity] = useState(null);
    
    const { code } = useParams();
    const location = useLocation();
    const params = useParams();
    
    const name = location.state?.name || "";
    const [communityName, setCommunityName] = useState("");
    const [communityCode, setCommunityCode] = useState(code);
   
    const [leave, setLeave] = useState(false);
    const [del, setDel] = useState(false);
    const [team, setTeam] = useState(false);
    
    const [teamName, setTeamName] = useState("");
    const [usersTeam, setUsersTeam] = useState('');
    const [teamIds, setTeamIds] = useState([]);
    const [join, setJoin] = useState(false);
    const [teams, setTeams] = useState([]);
    const [communityId, setCommunityId] = useState(null);

    // ✅ FIXED: Centralized community loading function
    const loadCommunity = async (forceRefresh = false) => {
        if (!code) {
            setError("No community code provided");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            // First check cache
            const cachedCommunity = getCachedCommunity(code);
            if (cachedCommunity && !forceRefresh) {
                console.log("Using cached community data");
                setCommunity(cachedCommunity);
                setLoading(false);
                return;
            }

            // Fetch from API if not in cache or force refresh
            console.log("Fetching community from API");
            const communityData = await fetchCommunity(code, forceRefresh);
            setCommunity(communityData);
            
        } catch (err) {
            console.error("Error loading community:", err);
            setError(err.message || "Failed to load community");
        } finally {
            setLoading(false);
        }
    };

    // ✅ FIXED: Refetch function for cache updates
    const refetch = () => {
        loadCommunity(true);
    };

    // Initialize community loading
    useEffect(() => {
        loadCommunity();
    }, [code]);

    // ✅ FIXED: Enhanced community data processing
    useEffect(() => {
        if (community) {
            // Extract community data based on structure
            const communityData = community.community || community;
            const communityInfo = community;

            setCommunityName(communityData?.name || communityInfo?.name || "");
            setUsers(communityInfo?.membersInfo || []);
            
            // Extract community ID with multiple fallbacks
            const extractedId = communityData?._id || 
                               communityInfo?._id || 
                               communityData?.id ||
                               communityInfo?.id;
            
            console.log("🆔 Setting Community ID:", extractedId);
            if (extractedId) {
                setCommunityId(extractedId);
            }
            
            // Handle user teams
            const userTeams = communityInfo?.userTeams || [];
            if (userTeams.length > 0) {
                setUsersTeam(userTeams[0].teamName || '');
                const allTeamIds = userTeams
                    .map(team => team.teamID)
                    .filter(id => id !== null && id !== undefined);
                setTeamIds(allTeamIds);
                console.log('Setting team IDs:', allTeamIds);
            } else {
                setUsersTeam('');
                setTeamIds([]);
            }

            // Check if user is the owner
            const isOwner = user && (
                communityData?.creatorId === user.userId ||
                communityData?.creatorId === user.id 
               
            );
            setOwner(isOwner);
            // console.log("Is user owner:", user.id);
            // console.log('Community data:', communityData);
            // console.log('Community info:', communityInfo);
        }
    }, [community, user, setUsers]);

    // Fetch user teams
    useEffect(() => {
        const fetchUserTeams = async () => {
            try {
                const teams = await UserTeams();
                setUsersTeam(teams || []);
            } catch (error) {
                console.error('Error fetching user teams:', error);
                setUsersTeam([]);
            }
        };

        if (user) {
            fetchUserTeams();
        }
    }, [user, teams]);

    // Authentication check
    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    // ✅ FIXED: Team and post creation handlers with proper cache updates
    const handlePostCreated = () => {
        // Update cache and refetch
        refetch();
    };

    const handleTeamCreated = () => {
        // Update cache and refetch
        refetch();
    };

    // ✅ FIXED: Enhanced team creation with cache update
    const handleCreateTeam = async () => {
        if (!teamName.trim()) {
            alert("Please enter a team name");
            return;
        }
        
        try {
            await createTeam({
                teamName, 
                code, 
                setTeam, 
                setJoin, 
                teams, 
                setTeams,
                refetch,
                onSuccess: () => {
                    console.log("Team creation successful, updating cache...");
                    setTeamName(""); 
                    setTeam(false);
                    handleTeamCreated();
                }
            });
        } catch (error) {
            console.error("Error creating team:", error);
            alert("Failed to create team. Please try again.");
        }
    };

    // ✅ FIXED: Enhanced leave community handler
    const handleLeaveCommunity = async () => {
        try {
            await Leave(communityCode, communityName, navigate);
            // Remove from cache after successful leave
            removeCommunityFromCache(communityCode);
        } catch (error) {
            console.error("Error leaving community:", error);
        }
    };

    // ✅ FIXED: Enhanced delete community handler
    const handleDeleteCommunity = async () => {
        try {
            await deleteComm(communityCode, navigate);
            // Remove from cache after successful deletion
            removeCommunityFromCache(communityCode);
        } catch (error) {
            console.error("Error deleting community:", error);
        }
    };

    // Compute derived data
    const comm_teams = community?.allTeams || [];
    const commTeamIDs = Array.isArray(comm_teams) ? comm_teams.map(t => t._id) : [];

    const filteredUsers = Array.isArray(users) ? users.filter(u => {
        if (!u || !user) return false;
        const isDifferentUser = u.name !== user.name;
        const teamCondition = !Array.isArray(u.teams) || 
            u.teams.every(teamId => commTeamIDs.includes(teamId));
        return isDifferentUser && teamCondition;
    }) : [];

    // Debug logging
    console.log('Community data:', community);
    console.log('Community ID:', communityId);
    console.log('Team IDs:', teamIds);

    // Loading state
    if (loading) {
        return (
            <div className={style.community_layout}>
                <div className={style.loading}>
                    <p>Loading community...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={style.community_layout}>
                <div className={style.error}>
                    <h3>Error Loading Community</h3>
                    <p>{error}</p>
                    <button onClick={() => refetch()}>Try Again</button>
                </div>
            </div>
        );
    }
    
    // No community found
    if (!community) {
        return (
            <div className={style.community_layout}>
                <div className={style.error}>
                    <p>No community found.</p>
                    <button onClick={() => navigate(-1)}>Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className={style.community_layout}>
            <Header
                comm_name={communityName}
                data={users || []}
                communityCode={communityCode}
                setLeave={setLeave}
                owner={owner}
                setDelete={setDel}
                setTeam={setTeam}
                inTeam={usersTeam}
                teamIds={teamIds} 
                teams={comm_teams}
                communityId={communityId}
            />
            {user ? (
                <>
                    {filteredUsers && Array.isArray(filteredUsers) ? (
                        <Userslist
                            users={filteredUsers} 
                            code_Comm={communityCode || ''} 
                            className={style.listUsers} 
                            usersTeam={usersTeam?.teams || ''}
                            teams={comm_teams || []}
                            userRole={user?.userRole || ''}
                            unfilteredUsers={users || []}
                            teamIds={teamIds}
                        />
                    ) : (
                        <div>No users to display</div>
                    )}
                    
                    <TeamsList
                        teams={comm_teams || []} 
                        communityCode={code || ''} 
                        users={users || []} 
                        onTeamUpdate={handleTeamCreated}
                        usersTeam={usersTeam || ''}
                        teamIds={teamIds}
                    />
                    
                    <div className={style.community_main_content}>
                        <Posts 
                            communityCode={communityCode}
                            create={true}
                            users={users || []}
                            onCreate={handlePostCreated}
                            communityId={communityId}
                            teamIds={teamIds}
                        />
                    </div>
                </>
            ) : (
                <p>Loading user data...</p>
            )}

            {/* Leave Community Modal */}
            {leave && (
                <div className={style.btnsContainer}>
                    <div className={style.overlay}>
                        <div className={style.box}>
                            <div className={style.top}>
                                <Cross className={style.cross} onClick={() => setLeave(false)} />
                            </div>
                            <div className={style.mid}>
                                <h4>Leave Community</h4>
                                <h2>Are you sure you want to leave this community?!</h2>
                            </div>
                            <div className={style.bottom}>
                                <button 
                                    className={style.joinbtn} 
                                    onClick={() => {
                                        setLeave(false);
                                        handleLeaveCommunity();
                                    }}
                                >
                                    Leave
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Delete Community Modal */}
            {del && (
                <div className={style.btnsContainer}>
                    <div className={style.overlay}>
                        <div className={style.box}>
                            <div className={style.top}>
                                <Cross className={style.cross} onClick={() => setDel(false)} />
                            </div>
                            <div className={style.mid}>
                                <h4>Delete Community</h4>
                                <h2>Are you sure you want to Delete this community?!</h2>
                            </div>
                            <div className={style.bottom}>
                                <button 
                                    className={style.joinbtn} 
                                    onClick={() => {
                                        setDel(false);
                                        handleDeleteCommunity();
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Create Team Modal */}
            {team && (
                <div className={style.btnsContainer}>
                    <div className={style.overlay}>
                        <div className={style.box}>
                            <div className={style.top}>
                                <Cross className={style.cross} onClick={() => setTeam(false)} />
                            </div>
                            <div className={style.mid}>
                                <h4>Team Creation</h4>
                                <p>creating your own team</p>
                                <input
                                    className={style.input}
                                    placeholder="Team Name..."
                                    type="text"
                                    value={teamName}
                                    onChange={(e) => {setTeamName(e.target.value.trim())}}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleCreateTeam();
                                        }
                                    }}
                                />
                            </div>
                            <div className={style.bottom}>
                                <button 
                                    className={style.joinbtn} 
                                    onClick={handleCreateTeam}
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CommunityDetail;