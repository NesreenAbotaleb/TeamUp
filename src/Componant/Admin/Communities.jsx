import style from './style.module.css';
import DeleteComm from './../../servies/Admin/deleteComm'
import { useNavigate } from 'react-router-dom';

const Communities = ({ communities, onClose, onCommunitySelect, selectedCommunity, setCommunities }) => {
    const navigate = useNavigate();

    const handleDeleteCommunity = async (communityId, event) => {
        event.stopPropagation(); // Prevent triggering onCommunitySelect
        
        if (window.confirm('Are you sure you want to delete this community?')) {
            try {
                const response = await DeleteComm(navigate, communityId);
                if (response && response.status === 200) {
                    // // Remove the deleted community from the list
                    setCommunities(prevCommunities => prevCommunities.filter(comm => comm._id !== communityId));
                    
                    // // Clear selected community if it was the deleted one
                    // if (selectedCommunity && selectedCommunity._id === communityId) {
                    //     onCommunitySelect(null);
                    // }
                    
                    alert('Community deleted successfully');
                }
            } catch (error) {
                console.error('Error deleting community:', error);
                alert('Failed to delete community');
            }
        }
    };

    return (
        <div className={style.mainContainer}>
            <div className={style.listContainer}>
                <div className={style.sectionHeader}>
                    <h3 className={style.sectionTitle}>All Communities</h3>
                    <button className={style.closeButton} onClick={onClose}>
                        Close
                    </button>
                </div>

                {communities.length > 0 ? (
                    <ul className={style.itemList}>
                        {communities.map(comm => (
                            <li 
                                key={comm._id} 
                                className={`${style.itemCard} ${selectedCommunity?._id === comm._id ? style.selected : ''}`}
                                onClick={() => onCommunitySelect(comm)}
                            >
                                <button className={style.itemButton}>
                                    <div className={style.communityListInfo}>
                                        <div className={style.communityIcon}>🏘️</div>
                                        <div className={style.communityInfo}>
                                            <h4 className={style.itemName}>{comm.communityName}</h4>
                                            <p className={style.itemSubtext}>Code: {comm.code_Comm}</p>
                                            <p className={style.itemSubtext}>
                                                {comm.members?.length || 0} members • {comm.teams?.length || 0} teams
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        className={style.deleteButton}
                                        onClick={(e) => handleDeleteCommunity(comm._id, e)}
                                        title="Delete Community"
                                    >
                                        🗑️
                                    </button>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className={style.emptyState}>
                        <div className={style.emptyStateIcon}>🏘️</div>
                        <p className={style.emptyStateText}>No communities found or failed to load communities.</p>
                    </div>
                )}
            </div>

            {selectedCommunity && (
                <div className={style.detailsContainer}>
                    <div className={style.selectedItemDetails}>
                        <div className={style.detailsHeader}>
                            <div className={style.communityDetailsIcon}>🏘️</div>
                            <h4 className={style.detailsTitle}>{selectedCommunity.communityName}</h4>
                            <button 
                                className={style.deleteButtonDetails}
                                onClick={(e) => handleDeleteCommunity(selectedCommunity._id, e)}
                                title="Delete Community"
                            >
                                🗑️ Delete Community
                            </button>
                        </div>

                        <div className={style.detailsGrid}>
                            <div className={style.detailItem}>
                                <p className={style.detailLabel}>Community Code</p>
                                <p className={style.detailValue}>{selectedCommunity.code_Comm}</p>
                            </div>
                            <div className={style.detailItem}>
                                <p className={style.detailLabel}>Community ID</p>
                                <p className={style.detailValue}>{selectedCommunity._id}</p>
                            </div>
                            {selectedCommunity.description && (
                                <div className={style.detailItem}>
                                    <p className={style.detailLabel}>Description</p>
                                    <p className={style.detailValue}>{selectedCommunity.description}</p>
                                </div>
                            )}
                            {selectedCommunity.createdAt && (
                                <div className={style.detailItem}>
                                    <p className={style.detailLabel}>Created At</p>
                                    <p className={style.detailValue}>
                                        {new Date(selectedCommunity.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            {selectedCommunity.updatedAt && (
                                <div className={style.detailItem}>
                                    <p className={style.detailLabel}>Last Updated</p>
                                    <p className={style.detailValue}>
                                        {new Date(selectedCommunity.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Members Section */}
                        <div className={style.detailSection}>
                            <h5 className={style.sectionSubtitle}>👥 Members</h5>
                            <div className={style.detailItem}>
                                <p className={style.detailLabel}>Total Members</p>
                                <p className={style.detailValue}>{selectedCommunity.members?.length || 0}</p>
                            </div>
                            {selectedCommunity.members && selectedCommunity.members.length > 0 && (
                                <div className={style.itemsGrid}>
                                    {selectedCommunity.members.map(member => (
                                        <div key={member._id} className={style.itemChip}>
                                            <span className={style.chipText}>
                                                Member ID: {member.memberId}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Teams Section */}
                        <div className={style.detailSection}>
                            <h5 className={style.sectionSubtitle}>🚀 Teams</h5>
                            <div className={style.detailItem}>
                                <p className={style.detailLabel}>Total Teams</p>
                                <p className={style.detailValue}>{selectedCommunity.teams?.length || 0}</p>
                            </div>
                            {selectedCommunity.teams && selectedCommunity.teams.length > 0 ? (
                                <div className={style.itemsGrid}>
                                    {selectedCommunity.teams.map(team => (
                                        <div key={team._id} className={style.itemChip}>
                                            <span className={style.chipText}>
                                                {team.teamName}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={style.emptyText}>No teams in this community</div>
                            )}
                        </div>

                        {/* Posts Section */}
                        <div className={style.detailSection}>
                            <h5 className={style.sectionSubtitle}>📝 Posts</h5>
                            <div className={style.detailItem}>
                                <p className={style.detailLabel}>Total Posts</p>
                                <p className={style.detailValue}>{selectedCommunity.posts?.length || 0}</p>
                            </div>
                            {selectedCommunity.posts && selectedCommunity.posts.length > 0 && (
                                <div className={style.itemsGrid}>
                                    {selectedCommunity.posts.map(post => (
                                        <div key={post._id} className={style.itemChip}>
                                            <span className={style.chipText}>
                                                Post: {post.postId.substring(0, 8)}...
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Creator Section */}
                        {selectedCommunity.creatorId && (
                            <div className={style.detailSection}>
                                <h5 className={style.sectionSubtitle}>👑 Creator</h5>
                                <div className={style.detailItem}>
                                    <p className={style.detailLabel}>Creator ID</p>
                                    <p className={style.detailValue}>{selectedCommunity.creatorId}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Communities;