import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import style from './Style.module.css';
import Header from "../../Componant/Header/Header";
import UserContext from "../../context/Usercontext";
import FetchTeam from "../../servies/Teams/fetchTeamProf";
import MemberList from "../../Componant/Teams/MemberList";
import LeaveTeam from "../../servies/Teams/leaveTeam";
import DeleteTeam from "../../servies/Teams/deleteTeam";
import { ReactComponent as Cross } from './../../assets/svgs/Cross.svg';

function TeamProfile() {
    const { code, team_Code } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    
    const {users} = useContext(UserContext)
    
    
    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState(null);
    const [members, setMembers] = useState([]);
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState({});
    const [leader, setLeader] = useState(false);
    const [leave, setLeave] = useState(false);
    const [delet, setDelete] = useState(false);
    const [inTeam, setInTeam] = useState(false);
    const [teamId, setTeamId] = useState(location.state?.teamIds || []);
    

    // console.log('team_id : ', team_Code);
    const teams_comm = location.state?.teams|| []
    const usersTeam = location.state?.usersTeam|| []
    
    const fetchData = useCallback(async () => {
        try {
            console.log("entered");
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Authentication error: No token found");
            }

            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("API call timed out")), 10000)
            );

            const teamDataPromise = FetchTeam({ code, team_Code });
            const teamData = await Promise.race([teamDataPromise, timeoutPromise]);
            
            console.log("teamDataPromise :", teamDataPromise);
            if (!teamData) {
                throw new Error("Team data not found");
            }
            console.log('teamData : ', teamData);

            setTeam(teamData);

            if (teamData.members) {
                const leaderInfo = teamData.TeamLeader || {};
                const leaderID = leaderInfo.leaderID;
                const leaderName = leaderInfo.LeaderName;
                setLeader(leaderID === user?.userId);
                setTeamId(teamData._id);
                // Process members and map them to users
                console.log('All users:', users);
                console.log('Team members:', teamData.members);
                console.log('Leader ID:', leaderID);
                
                const processedMembers = teamData.members.map((member, index) => {
                    const isLeader = member.memberID === leaderID;
                    
                    console.log(`Processing member ${index + 1}:`, {
                        memberID: member.memberID,
                        isLeader,
                        memberIDType: typeof member.memberID
                    });
                    
                    // Find the matching user with multiple fallback strategies
                    let matchedUser = users.find(user1 => String(user1._id) === String(member.memberID));
                    
                    // If not found, try without string conversion
                    if (!matchedUser) {
                        matchedUser = users.find(user1 => user1.userId === member.memberID);
                    }
                    
                    console.log('users : ' , users)

                    // Set display name with multiple fallback options
                    let displayName;
                    if (isLeader) {
                        displayName = leaderName;
                    } else if (matchedUser) {
                        // Try different name properties
                        displayName = matchedUser.name || 
                                    matchedUser.userName || 
                                    matchedUser.username || 
                                    matchedUser.displayName ||
                                    matchedUser.fullName ||
                                    "Unknown User";
                    } else {
                        displayName = "Unknown";
                    }

                    // Enhanced debugging information
                    console.log(`Member ${index + 1} processing result:`, {
                        memberID: member.memberID,
                        matchedUser: matchedUser ? 'Found' : 'Not Found',
                        matchedUserData: matchedUser,
                        displayName,
                        isLeader
                    });

                    if (!matchedUser && !isLeader) {
                        console.warn(`No matching user found for memberID: ${member.memberID}`);
                        console.warn('Available user IDs:', users.map(u => ({ id: u._id, name: u.name || u.userName })));
                    }

                    return {
                        ...member,
                        leader: isLeader,
                        name: displayName,
                        ...matchedUser // Add user data if available
                    };
                });

                if (processedMembers.some(m => m.memberID === user?.userId)) {
                    setInTeam(true);
                }

                console.log('in team : ', processedMembers.some(m => m.memberID === user?.userId));

                // Add the leader as a member if not already present
                if (leaderID && leaderName && !processedMembers.some(m => m.memberID === leaderID)) {
                    processedMembers.push({
                        memberID: leaderID,
                        leader: true,
                        name: leaderName
                    });
                }

                setMembers(processedMembers);
                console.log('processedMembers : ', processedMembers);
            }

            setLoading(false);
        } catch (err) {
            console.error("Error fetching team data:", err);
            setError("Failed to load team data: " + (err.message || "Unknown error"));
            setDebugInfo(prev => ({
                ...prev,
                error: err.message,
                errorType: err.name,
                errorStack: err.stack
            }));
            setLoading(false);
        }
    }, [code, team_Code, users, user?.userId]); // Only depend on specific user property

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (!code || !team_Code || team_Code === 'undefined') {
            setError("Invalid team parameters");
            setLoading(false);
            return;
        }

        fetchData();
    }, [user, code, team_Code, fetchData, navigate]);

    // Memoize handlers to prevent recreation
    const leavehandle = useCallback(async () => {
        LeaveTeam(team_Code, navigate, code);
    }, [team_Code, navigate, code]);

    const delethandle = useCallback(async () => {
        DeleteTeam(team_Code, navigate, code);
    }, [team_Code, navigate, code]);

    if (loading) {
        return (
            <div className={style.TeamContainer}>
                <Header name="Loading..." />
                <div className={style.content}>
                    <div className={style.loader}>Loading team information...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={style.TeamContainer}>
                <Header name="Error" />
                <div className={style.content}>
                    <div className={style.error}>
                        <p>{error}</p>
                        {Object.keys(debugInfo).length > 0 && (
                            <details>
                                <summary>Debug Information</summary>
                                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                            </details>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (!team) {
        return (
            <div className={style.TeamContainer}>
                <Header name="Team Not Found" />
                <div className={style.content}>
                    <div className={style.notFound}>
                        <p>The requested team could not be found.</p>
                        <p>Debug info: Route contains code={code}, id={team_Code || "undefined"}</p>
                        {Object.keys(debugInfo).length > 0 && (
                            <details>
                                <summary>API Debug Information</summary>
                                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                            </details>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={style.TeamContainer}>
           <Header 
                teamName={team.teamName || "Team Profile"} 
                setLeave={setLeave} 
                leader={leader} 
                setDelete={setDelete}
                inTeam={inTeam}
                teamIds={[teamId]}
                communityCode={code}
            />
            <div className={style.content}>
                {/* <h3>Team Members</h3> */}
                {members && members.length > 0 ? (
                    <MemberList members={members} comm_Code={code} teams ={teams_comm} users={users} usersTeam={usersTeam}/>
                ) : (
                    <div className={style.noMembers}>No team members found</div>
                )}
            </div>
            {leave && (
                <div className={style.btnsContainer}>
                    <div className={style.overlay}>
                        <div className={style.box}>
                            <div className={style.top}>
                                <Cross className={style.cross} onClick={() => setLeave(false)} />
                            </div>
                            <div className={style.mid}>
                                <h4>Leave Team</h4>
                                <h2>Are you sure you want to leave {team.teamName}?!</h2>
                            </div>
                            <div className={style.bottom}>
                                <button className={style.joinbtn} onClick={leavehandle}>
                                    Leave
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {delet && (
                <div className={style.btnsContainer}>
                    <div className={style.overlay}>
                        <div className={style.box}>
                            <div className={style.top}>
                                <Cross className={style.cross} onClick={() => setDelete(false)} />
                            </div>
                            <div className={style.mid}>
                                <h4>Delete Team</h4>
                                <h2>Are you sure you want to delete {team.teamName}?!</h2>
                            </div>
                            <div className={style.bottom}>
                                <button className={style.joinbtn} onClick={delethandle}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TeamProfile;