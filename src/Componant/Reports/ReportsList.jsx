import React, { useState , useContext } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import style from './ReportStyle.module.css';
import { ReactComponent as No} from './../../assets/svgs/community/NoFile1 1.svg'
import  Assign  from './../../servies/Admin/Assign';
import  ResolveReport  from './../../servies/Admin/ResolveRep';
import UserContext from "../../context/Usercontext";
import Resolve from './Resolve'

const ReportsList = ({ reports, loading, error, onRefresh, onCategoryChange }) => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [assigningReports, setAssigningReports] = useState(new Set()); // Track which reports are being assigned
    const [selectedReport, setSelectedReport] = useState(null); // Track selected report for resolution
    const [showResolveModal, setShowResolveModal] = useState(false); // Control resolve modal visibility
    const { user } = useContext(UserContext);
    const navigate = useNavigate(); // Add navigate hook
    const isNotAdmin = user && (user.role !== 1 && user.userRole !== 1);

    const handleReport = async (reportId) => {
        // Add the report to the assigning set to show loading state
        setAssigningReports(prev => new Set(prev).add(reportId));
        
        try {
            // Call Assign with the correct parameters
            const result = await Assign({ reportId, navigate });
            
            if (result.success) {
                console.log('Assignment successful:', result.message);
                
                // Optionally refresh the reports list after assignment
                if (onRefresh) {
                    onRefresh();
                }
                
                // You could also show a success notification here
                // toast.success(result.message);
            } else {
                console.error('Assignment failed:', result.message);
                // Handle different error types
                switch (result.errorType) {
                    case 'validation':
                        // Show validation error (e.g., report already assigned)
                        alert(result.message);
                        break;
                    case 'not_found':
                        // Handle not found error
                        alert('Report or user not found');
                        break;
                    case 'network':
                        // Handle network error
                        alert('Network error. Please check your connection.');
                        break;
                    default:
                        alert('An error occurred while assigning the report');
                }
            }
        } catch (error) {
            console.error('Error assigning report:', error);
            alert('An unexpected error occurred');
        } finally {
            // Remove the report from the assigning set
            setAssigningReports(prev => {
                const newSet = new Set(prev);
                newSet.delete(reportId);
                return newSet;
            });
        }
    };

    // Handle report click for non-admin users
    const handleReportClick = (report) => {
        if (isNotAdmin) {
            setSelectedReport(report);
            setShowResolveModal(true);
        }
    };

    // Handle resolve submission
    const handleResolveSubmit = async (actionTaken) => {
        if (!selectedReport) return;

        try {
            const result = await ResolveReport(selectedReport._id, actionTaken);
            
            if (result.success) {
                console.log('Resolution successful:', result.message);
                
                // Close modal
                setShowResolveModal(false);
                setSelectedReport(null);
                
                // Refresh reports list
                if (onRefresh) {
                    onRefresh();
                }
                
                // You could show a success notification here
                alert('Report resolved successfully!');
            } else {
                console.error('Resolution failed:', result.message);
                alert(result.message || 'Failed to resolve report');
            }
        } catch (error) {
            console.error('Error resolving report:', error);
            alert('An unexpected error occurred while resolving the report');
        }
    };

    // Handle modal close
    const handleResolveCancel = () => {
        setShowResolveModal(false);
        setSelectedReport(null);
    };

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        if (onCategoryChange) {
            onCategoryChange(category);
        }
    };

    if (loading) {
        return (
            <div className={style.container}>
                <div className={style.loadingSpinner}>
                    <div className={style.spinner}></div>
                    <p>Loading reports...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={style.container}>
                <div className={style.errorMessage}>
                    <div className={style.errorIcon}>⚠️</div>
                    <h3>Error Loading Reports</h3>
                    <p>{error}</p>
                    {onRefresh && (
                        <button 
                            onClick={onRefresh} 
                            className={style.retryButton}
                        >
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={style.container}>
            {/* Category Filter Buttons */}
            <div className={style.categoryFilters}>
                <button 
                    onClick={() => handleCategoryChange('all')}
                    className={`${style.categoryButton} ${activeCategory === 'all' ? style.active : ''}`}
                >
                    All Reports
                </button>
                <button 
                    onClick={() => handleCategoryChange('pending')}
                    className={`${style.categoryButton} ${activeCategory === 'pending' ? style.active : ''}`}
                >
                    Pending Reports
                </button>
            </div>

            <div className={style.listHeader}>
                <h2 className={style.listTitle}>
                    {activeCategory === 'pending' ? 'Pending Reports' : 'All Reports'} 
                    {reports && ` (${reports.length})`}
                </h2>
            </div>

            {!reports || reports.length === 0 ? (
                <div className={style.emptyState}>
                    <No className={style.emptyIcon}/>
                    <h3>No Reports Found</h3>
                    <p>
                        {activeCategory === 'pending' 
                            ? 'No pending reports found in this community.' 
                            : 'No reports found in this community yet.'
                        }
                    </p>
                </div>
            ) : (
                <div className={style.reportsList}>
                    {reports.map((report, index) => {
                        const isPending = (report.reportStatus || 'pending').toLowerCase() === 'pending';
                        const isAssigning = assigningReports.has(report._id);
                        
                        return (
                            <div 
                                key={report._id || index} 
                                className={`${style.reportCard} ${isNotAdmin ? style.clickable : ''}`}
                                onClick={() => handleReportClick(report)}
                            >
                                <div className={style.reportHeader}>
                                    <div className={style.reportTitleSection}>
                                        <h3 className={style.reportTitle}>
                                            Report #{report._id ? report._id.slice(-6) : index + 1}
                                        </h3>
                                        <span className={style.reportId}>
                                            ID: {report._id || `temp-${index + 1}`}
                                        </span>
                                    </div>
                                    <div className={style.reportMeta}>
                                        <span className={style.reportDate}>
                                            {report.createdAt 
                                                ? new Date(report.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })
                                                : 'No date'
                                            }
                                        </span>
                                    </div>
                                </div>

                                <div className={style.reportContent}>
                                    <p className={style.reportDescription}>
                                        {report.report || 'No content available'}
                                    </p>
                                </div>

                                <div className={style.reportDetails}>
                                    <div className={style.reporterInfo}>
                                        <span className={style.label}>Reporter:</span>
                                        <span className={style.value}>
                                            {report.reporter?.reporterName || 'Unknown'}
                                        </span>
                                    </div>
                                    
                                    {report.reportReviewer && (
                                        <div className={style.reviewerInfo}>
                                            <span className={style.label}>Reviewer:</span>
                                            <span className={style.value}>
                                                {report.reportReviewer.reviewerName} 
                                                {report.reportReviewer.reviewerRole === 1 && ' (Admin)'}
                                            </span>
                                        </div>
                                    )}

                                    {report.teamId && (
                                        <div className={style.teamInfo}>
                                            <span className={style.label}>Team ID:</span>
                                            <span className={style.value}>{report.teamId}</span>
                                        </div>
                                    )}

                                    {report.postId && (
                                        <div className={style.postInfo}>
                                            <span className={style.label}>Post ID:</span>
                                            <span className={style.value}>{report.postId}</span>
                                        </div>
                                    )}

                                    {report.actionTaken && (
                                        <div className={style.actionInfo}>
                                            <span className={style.label}>Action Taken:</span>
                                            <span className={style.value}>{report.actionTaken}</span>
                                        </div>
                                    )}
                                </div>

                                <div className={style.reportFooter}>
                                    <div className={style.reportStatus}>
                                        <span className={`${style.statusBadge} ${style[`status-${(report.reportStatus || 'pending').toLowerCase().replace(' ', '-')}`]}`}>
                                            {report.reportStatus || 'Pending'}
                                        </span>
                                    </div>
                                    
                                    <div className={style.reportActions}>
                                        {/* Only show assign button for admin users and pending reports */}
                                        {!isNotAdmin && isPending && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent card click when button is clicked
                                                    handleReport(report._id);
                                                }}
                                                className={style.assignButton}
                                                disabled={!report._id || isAssigning}
                                            >
                                                {isAssigning ? 'Assigning...' : 'Assign'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Resolve Modal */}
            {showResolveModal && selectedReport && (
                <Resolve
                    report={selectedReport}
                    onSubmit={handleResolveSubmit}
                    onCancel={handleResolveCancel}
                />
            )}
        </div>
    );
};

export default ReportsList;