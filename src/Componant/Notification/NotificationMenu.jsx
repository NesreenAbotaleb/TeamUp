import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import style from './style.module.css';
import axios from 'axios';
import api from '../../api/API';
import { ReactComponent as Cross } from './../../assets/svgs/Cross.svg';
import { ReactComponent as Settings } from './../../assets/svgs/menu/setting.svg';


const NotificationMenu = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [processingInvitations, setProcessingInvitations] = useState(new Set());

  // Format the Notification date
  const formatNotifyDate = (dateString) => {
    if (!dateString) return "";
   
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
   
    if (diffMinutes < 1) {
      return "Just now";
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Handle invitation response
  const handleInvitationResponse = async (answerUrl, notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // Add to processing set to show loading state
      setProcessingInvitations(prev => new Set(prev).add(notificationId));

      console.log('answerUrl : ', answerUrl);
      
      // Use GET request instead of POST since your backend expects GET
      await axios.get(answerUrl, {
        headers: {
          Authorization: token
        }
      });

      // Remove the notification from the list after successful response
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
    } catch (err) {
      console.error(`Error responding to invitation:`, err);
      setError(`Failed to respond to invitation. Please try again.`);
    } finally {
      // Remove from processing set
      setProcessingInvitations(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!open) return;

        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        console.log('API base URL:', api);
        
        if (!token) {
          setError('No authentication token found');
          return;
        }

        setLoading(true);
        setError(null);
        
        const requestUrl = `${api}/profile/me/notifications`;
        
        const response = await axios.get(requestUrl, {
          headers: {
            Authorization: token
          }
        });

        console.log('Notifications response:', response.data);
        
        // Handle different response structures
        let notificationData = [];
        
        if (Array.isArray(response.data)) {
          notificationData = response.data;
        } else if (response.data && Array.isArray(response.data.notifications)) {
          notificationData = response.data.notifications;
        } else if (response.data && Array.isArray(response.data.data)) {
          notificationData = response.data.data;
        } else if (response.data && typeof response.data === 'object') {
          notificationData = [response.data];
        }
        
        console.log('Processed notification data:', notificationData);
        setNotifications(notificationData);

      } catch (err) {
        console.error('Error: Failed to fetch notifications');
        console.error('Error details:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          url: err.config?.url,
          headers: err.config?.headers
        });
        
        if (err.response?.status === 400) {
          setError('Bad request - please check your authentication');
        } else if (err.response?.status === 401) {
          setError('Authentication failed - please log in again');
        } else if (err.response?.status === 403) {
          setError('Access denied');
        } else if (err.response?.status >= 500) {
          setError('Server error - please try again later');
        } else {
          setError('Failed to load notifications');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [open]);

  return (
    <div className={style.menuContainer}>
      <div className={style.topBar}>
        <Settings className={style.settingsButton} onClick={() => {
            onClose();
            navigate('/settings/notificationSettings');
          }} />
        

        <button className={style.closeButton} onClick={onClose}>
          <Cross />
        </button>
      </div>

      {open && (
        <div className={style.container}>
          <div className={style.profile}>
            <h3>Notifications</h3>
          </div>

          <div className={style.notificationsList}>
            {loading ? (
              <div className={style.statusMessage}>Loading...</div>
            ) : error ? (
              <div className={style.errorMessage}>
                {error}
                <button 
                  onClick={() => window.location.reload()} 
                  className={style.retryButton}
                  style={{ marginLeft: '10px', padding: '5px 10px', fontSize: '0.8rem' }}
                >
                  Retry
                </button>
              </div>
            ) : Array.isArray(notifications) && notifications.length === 0 ? (
              <div className={style.statusMessage}>No notifications yet.</div>
            ) : Array.isArray(notifications) ? (
              <ul className={style.notificationList}>
                {notifications.map((notif, index) => (
                  <li key={notif.id || index} className={style.notificationItem}>
                    <div className={style.notificationContent}>
                      {notif.content || 'Notification'}
                    </div>
                    
                    {/* Date display */}
                    {(notif.createdAt || notif.date || notif.created_at) && (
                      <div className={style.notificationTime}>
                        {formatNotifyDate(notif.createdAt || notif.date || notif.created_at)}
                      </div>
                    )}
                    
                    {/* Invitation buttons - only show if isInvitation is true */}
                    {notif.isInvitation && (
                      <div className={style.invitationButtons}>
                        <button
                          className={`${style.acceptButton} ${processingInvitations.has(notif.id) ? style.processing : ''}`}
                          onClick={() => handleInvitationResponse(notif.joinTeamString, notif.id)}
                          disabled={processingInvitations.has(notif.id)}
                        >
                          {processingInvitations.has(notif.id) ? 'Processing...' : 'Accept'}
                        </button>
                        <button
                          className={`${style.denyButton} ${processingInvitations.has(notif.id) ? style.processing : ''}`}
                          onClick={() => handleInvitationResponse(notif.declineTeamString, notif.id)}
                          disabled={processingInvitations.has(notif.id)}
                        >
                          {processingInvitations.has(notif.id) ? 'Processing...' : 'Deny'}
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className={style.statusMessage}>
                Invalid notification data format
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationMenu;