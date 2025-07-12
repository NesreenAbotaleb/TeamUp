import style from './style.module.css';
import DeleteUser from './../../servies/Admin/deleteUser';
import { useNavigate } from 'react-router-dom';

const Users = ({ users, onClose, onUserSelect, selectedUser, setUsers }) => {
    const navigate = useNavigate();

    const handleDeleteUser = async (userId, event) => {
        event.stopPropagation(); // Prevent triggering onUserSelect
        
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                // Fixed: Remove setUsers parameter that doesn't exist in DeleteUser function
                const response = await DeleteUser(navigate, userId);
                
                // Check for success using the success property
                if (response && response.success) {
                    // Remove the deleted user from the list
                    setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
                    
                    // Clear selected user if it was the deleted one
                    if (selectedUser && selectedUser._id === userId) {
                        onUserSelect(null);
                    }
                    
                    alert('User deleted successfully');
                } else {
                    // Handle failure cases
                    const errorMessage = response?.error || 'Failed to delete user';
                    console.error('Delete user failed:', errorMessage);
                    alert(`Failed to delete user: ${errorMessage}`);
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user. Please try again.');
            }
        }
    };

    return (
        <div className={style.mainContainer}>
            <div className={style.listContainer}>
                <div className={style.sectionHeader}>
                    <h3 className={style.sectionTitle}>All Users</h3>
                    <button className={style.closeButton} onClick={onClose}>
                        Close
                    </button>
                </div>
                {users.length > 0 ? (
                    <ul className={style.itemList}>
                        {users.map(user => (
                            <li
                                key={user._id}
                                className={`${style.itemCard} ${selectedUser?._id === user._id ? style.selected : ''}`}
                                onClick={() => onUserSelect(user)}
                            >
                                <div className={style.itemButton}>
                                    <div className={style.userListInfo}>
                                        {user.img && (
                                            <img 
                                                src={user.img} 
                                                alt={user.name}
                                                className={style.userListAvatar}
                                            />
                                        )}
                                        <div>
                                            <h4 className={style.itemName}>{user.name}</h4>
                                            <p className={style.itemSubtext}>{user.email}</p>
                                        </div>
                                    </div>
                                    <button 
                                        className={style.deleteButton}
                                        onClick={(e) => handleDeleteUser(user._id, e)}
                                        title="Delete User"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className={style.emptyState}>
                        <div className={style.emptyStateIcon}>👤</div>
                        <p className={style.emptyStateText}>No users found or failed to load users.</p>
                    </div>
                )}
            </div>
            {selectedUser && (
                <div className={style.detailsContainer}>
                    <div className={style.selectedItemDetails}>
                        <div className={style.detailsHeader}>
                            {selectedUser.img && (
                                <img 
                                    src={selectedUser.img} 
                                    alt={selectedUser.name}
                                    className={style.userDetailsAvatar}
                                />
                            )}
                            <h4 className={style.detailsTitle}>User Details</h4>
                            <button 
                                className={style.deleteButtonDetails}
                                onClick={(e) => handleDeleteUser(selectedUser._id, e)}
                                title="Delete User"
                            >
                                🗑️ Delete User
                            </button>
                        </div>
                        
                        <div className={style.detailsGrid}>
                            <div className={style.detailItem}>
                                <p className={style.detailLabel}>Name</p>
                                <p className={style.detailValue}>{selectedUser.name}</p>
                            </div>
                            <div className={style.detailItem}>
                                <p className={style.detailLabel}>Username</p>
                                <p className={style.detailValue}>{selectedUser.userName || 'N/A'}</p>
                            </div>
                            <div className={style.detailItem}>
                                <p className={style.detailLabel}>Email</p>
                                <p className={style.detailValue}>{selectedUser.email}</p>
                            </div>
                            <div className={style.detailItem}>
                                <p className={style.detailLabel}>User ID</p>
                                <p className={style.detailValue}>{selectedUser._id}</p>
                            </div>
                            <div className={style.detailItem}>
                                <p className={style.detailLabel}>Role</p>
                                <p className={style.detailValue}>{selectedUser.role || selectedUser.userRole || 'User'}</p>
                            </div>
                            {selectedUser.createdAt && (
                                <div className={style.detailItem}>
                                    <p className={style.detailLabel}>Created At</p>
                                    <p className={style.detailValue}>
                                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Teams Section */}
                        <div className={style.detailSection}>
                            <h5 className={style.sectionSubtitle}>Teams</h5>
                            {selectedUser.teams && selectedUser.teams.length > 0 ? (
                                <div className={style.itemsGrid}>
                                    {selectedUser.teams.map((team, index) => (
                                        <div key={team._id || index} className={style.itemChip}>
                                            <span className={style.chipText}>
                                                Team ID: {team.teamID}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={style.emptyText}>No teams assigned</p>
                            )}
                        </div>

                        {/* Communities Section */}
                        <div className={style.detailSection}>
                            <h5 className={style.sectionSubtitle}>Communities</h5>
                            {selectedUser.communities && selectedUser.communities.length > 0 ? (
                                <div className={style.itemsGrid}>
                                    {selectedUser.communities.map((community, index) => (
                                        <div key={community._id || index} className={style.itemChip}>
                                            <span className={style.chipText}>
                                                Community ID: {community.commID}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={style.emptyText}>No communities joined</p>
                            )}
                        </div>

                        {/* Posts Section */}
                        <div className={style.detailSection}>
                            <h5 className={style.sectionSubtitle}>Posts</h5>
                            <p className={style.detailValue}>
                                {selectedUser.posts ? selectedUser.posts.length : 0} posts
                            </p>
                        </div>

                        {/* Chats Section */}
                        <div className={style.detailSection}>
                            <h5 className={style.sectionSubtitle}>Chats</h5>
                            <p className={style.detailValue}>
                                {selectedUser.chats ? selectedUser.chats.length : 0} chats
                            </p>
                        </div>

                        {/* Links Section */}
                        {selectedUser.links && selectedUser.links.length > 0 && selectedUser.links[0] !== "" && (
                            <div className={style.detailSection}>
                                <h5 className={style.sectionSubtitle}>Links</h5>
                                <div className={style.linksContainer}>
                                    {selectedUser.links.map((link, index) => (
                                        link && link.trim() !== "" && (
                                            <a 
                                                key={index}
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={style.linkItem}
                                            >
                                                {link}
                                            </a>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;