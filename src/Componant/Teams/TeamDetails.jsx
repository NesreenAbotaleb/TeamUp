import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import MemberList from "./MemberList";
import style from "./style.module.css";

const TeamDetails = () => {
    const { teamId } = useParams();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const res = await axios.get(`/api/teams/${teamId}`);
                setTeam(res.data);
            } catch (err) {
                console.error("Failed to fetch team:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, [teamId]);

    if (loading) return <p>Loading team details...</p>;
    if (!team) return <p>Team not found.</p>;

    return (
        <div className={style.teamDetailsContainer}>
            <h2>{team.teamName || "Unnamed Team"}</h2>
            <h3>Team Members</h3>
            <MemberList
                members={team.members || []}
                comm_Code={team.community?.code_Comm || ""}
                teams={[team]}
            />
        </div>
    );
};

export default TeamDetails;
