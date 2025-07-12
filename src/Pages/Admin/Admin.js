import { useEffect, useState ,useContext} from "react";
import AdminDashboard from './../../Componant/Admin/AdminDashboard'
import style from './AdminStyle.module.css'
import { useNavigate } from "react-router-dom";

import GetComm from "../../servies/Admin/GetComm";
import GetUser from "../../servies/Admin/GetUsers";
import Users from "../../Componant/Admin/Users";
import Communities from './../../Componant/Admin/Communities'
import UserContext from "../../context/Usercontext";

function Admin(){
    const [users, setUsers] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCommunity, setSelectedCommunity] = useState(null);

    const [commSec, setCommSec] = useState(false);
    const [usersSec, setUsersSec] = useState(false);
    const { user } = useContext(UserContext)
    const navigate = useNavigate();

    useEffect(()=>{
            if (!user) {
                    
                    navigate("/login");
                    return;
                }
        },[user])

    useEffect(() => {
        const fetchData = async () => {
            try {
                await GetComm(navigate, setCommunities);
                await GetUser(navigate, setUsers);
            } catch (error) {
                console.error("Error fetching data", error);
                alert("Failed to load dashboard data. Please check your network or contact support.");
            }
        };

        fetchData();
    }, []);

    const handleShowUsers = () => {
        setUsersSec(true);
        setCommSec(false);
        setSelectedUser(null);
        setSelectedCommunity(null);
    };

    const handleShowCommunities = () => {
        setCommSec(true);
        setUsersSec(false);
        setSelectedUser(null);
        setSelectedCommunity(null);
    };

    const handleCloseUsers = () => {
        setUsersSec(false);
        setSelectedUser(null);
    };

    const handleCloseCommunities = () => {
        setCommSec(false);
        setSelectedCommunity(null);
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
    };

    const handleCommunitySelect = (community) => {
        setSelectedCommunity(community);
    };

    return(
        <div className={style.container}>
            <div className={style.contentArea}>
                <div className={style.dashboardSection}>
                    <AdminDashboard 
                        communities={communities}  
                        users={users} 
                        onShowUsers={handleShowUsers}
                        onShowCommunities={handleShowCommunities}
                        usersSec={usersSec}
                        commSec={commSec}
                        className={style.dashboard}
                    />
                </div>
                
                {usersSec && (
                    <div className={style.detailsSection}>
                        <Users 
                            users={users}
                            onClose={handleCloseUsers}
                            onUserSelect={handleUserSelect}
                            selectedUser={selectedUser}
                            setUsers={setUsers}
                        />
                    </div>
                )}
                
                {commSec && (
                    <div className={style.detailsSection}>
                        <Communities 
                            communities={communities}
                            onClose={handleCloseCommunities}
                            onCommunitySelect={handleCommunitySelect}
                            selectedCommunity={selectedCommunity}
                            setCommunities={setCommunities}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default Admin;