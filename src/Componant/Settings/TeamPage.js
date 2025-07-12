import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import style from './style.module.css';
import UserContext from "../../context/Usercontext";

const Teams = () => {
    const { user } = useContext(UserContext);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.teams && Array.isArray(user.teams)) {
            setTeams(user.teams);
        } else {
            setTeams([]);
        }
        setLoading(false);
    }, [user]);

    if (loading) return <p>Loading teams...</p>;

    return (
        <div className={style.teamsContainer}>
            <h2>Your Teams</h2>
            {teams.length === 0 ? (
                <p>No teams found.</p>
            ) : (
                <ul className={style.teamsList}>
                    {teams.map(team => (
                        <li key={team._id} className={style.teamItem}>
                            <strong>{team.teamName}</strong>
                            {team.TeamLeader === user._id && (
                                <span className={style.leaderBadge}> (Leader)</span>
                            )}
                            <button
                                className={style.viewButton}
                                onClick={() => navigate(`/teams/${team._id}`)}
                            >
                                View
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Teams;
