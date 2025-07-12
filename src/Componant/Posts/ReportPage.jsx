import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import style from './style.module.css';
import SendReport from './../../servies/Reports/Send';

function ReportPage() {
    const { postId, communityId } = useParams(); // Add communityId to params
    const navigate = useNavigate();
    const location = useLocation();

    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Determine if this is a community report (no postId provided)
    const isCommunityReport = !postId;

    const getCommunityId = () => {
        // If communityId is in URL params, use it first
        if (communityId) {
            return communityId;
        }

        // Method 1: From URL search params (?communityId=123)
        const urlParams = new URLSearchParams(window.location.search);
        let extractedCommunityId = urlParams.get('communityId');
        
        // Method 2: From React Router location state (if passed when navigating)
        if (!extractedCommunityId && location.state?.communityId) {
            extractedCommunityId = location.state.communityId;
        }
        
        // Method 3: From URL params (if route is like /community/:communityId/report/:postId)
        if (!extractedCommunityId) {
            const urlParts = window.location.pathname.split('/');
            const communityIndex = urlParts.indexOf('community');
            if (communityIndex !== -1 && urlParts[communityIndex + 1]) {
                extractedCommunityId = urlParts[communityIndex + 1];
            }
        }

        // Method 4: From localStorage (if stored when user enters community)
        if (!extractedCommunityId) {
            extractedCommunityId = localStorage.getItem('currentCommunityId');
        }

        return extractedCommunityId;
    };

    const getReportReasons = () => {
        if (isCommunityReport) {
            return [
                { value: "Inappropriate Community Name/Description", label: "Inappropriate Community Name/Description" },
                { value: "Community Promotes Hate Speech", label: "Community Promotes Hate Speech" },
                { value: "Spam Community", label: "Spam Community" },
                { value: "Harassment by Community Members", label: "Harassment by Community Members" },
                { value: "False Information Spread", label: "False Information Spread" },
                { value: "Community Violates Platform Rules", label: "Community Violates Platform Rules" },
                { value: "Inappropriate Community Content", label: "Inappropriate Community Content" },
                { value: "Copyright Violation", label: "Copyright Violation" },
                { value: "Other", label: "Other" }
            ];
        } else {
            return [
                { value: "Inappropriate Content", label: "Inappropriate Content" },
                { value: "Spam or Scam", label: "Spam or Scam" },
                { value: "Harassment or Abuse", label: "Harassment or Abuse" },
                { value: "Hate Speech", label: "Hate Speech" },
                { value: "False Information", label: "False Information" },
                { value: "Violence or Threats", label: "Violence or Threats" },
                { value: "Copyright Violation", label: "Copyright Violation" },
                { value: "Other", label: "Other" }
            ];
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const targetCommunityId = getCommunityId();

            if (!targetCommunityId) {
                setError('Community information not found. Please navigate from within a community.');
                setLoading(false);
                return;
            }

            console.log('Using communityId:', targetCommunityId);

            // Prepare report data - keeping the same structure as your backend expects
            const reportData = {
                reportContent: isCommunityReport 
                    ? `[COMMUNITY REPORT] ${reason}: ${details}`.trim()
                    : `${reason}: ${details}`.trim(),
                communityId: targetCommunityId,
                // Only include postId for post reports, leave undefined for community reports
                ...(postId && { postId: postId })
            };

            console.log('Submitting report:', reportData);

            // Send report using the existing SendReport function
            const result = await SendReport(navigate, reportData);

            if (result.success) {
                console.log('Report sent successfully:', result.data);
                setSubmitted(true);
                
                // Navigate back after showing success message
                setTimeout(() => {
                    navigate(-1);
                }, 2000);
            } else {
                console.error('Failed to send report:', result.error);
                setError(result.error || 'Failed to submit report. Please try again.');
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    const getReportTitle = () => {
        return isCommunityReport ? "Report Community" : "Report Post";
    };

    const getReportDescription = () => {
        if (isCommunityReport) {
            const targetCommunityId = getCommunityId();
            return targetCommunityId 
                ? `You're reporting community with ID: ${targetCommunityId}`
                : "You're reporting this community";
        } else {
            return `You're reporting post with ID: ${postId}`;
        }
    };

    if (submitted) {
        return (
            <div className={style.container}>
                <div className={style.successMessage}>
                    <h2>Thank you for your report 🙏</h2>
                    <p>We will review the {isCommunityReport ? 'community' : 'post'} shortly.</p>
                    <p>Redirecting you back...</p>
                </div>
            </div>
        );
    }

    const reasons = getReportReasons();

    return (
        <div className={style.container}>
            <div className={style.header}>
                <h2>{getReportTitle()}</h2>
                <p>{getReportDescription()}</p>
            </div>

            {error && (
                <div className={style.errorContainer}>
                    <p className={style.errorMessage}>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className={style.form}>
                <div className={style.formGroup}>
                    <label htmlFor="reason" className={style.label}>
                        Reason for reporting:
                    </label>
                    <select
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        disabled={loading}
                        className={style.select}
                    >
                        <option value="">-- Select a reason --</option>
                        {reasons.map((reasonOption) => (
                            <option key={reasonOption.value} value={reasonOption.value}>
                                {reasonOption.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={style.formGroup}>
                    <label htmlFor="details" className={style.label}>
                        Additional Details:
                    </label>
                    <textarea
                        id="details"
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        rows="4"
                        placeholder={`Please provide more context about why you're reporting this ${isCommunityReport ? 'community' : 'post'}. The more details you provide, the better we can review your report.`}
                        disabled={loading}
                        required
                        className={style.textarea}
                        minLength={10}
                        maxLength={1000}
                    />
                    <small className={style.charCount}>
                        {details.length}/1000 characters
                    </small>
                </div>

                <div className={style.buttonGroup}>
                    <button 
                        type="submit" 
                        className={`${style.submitButton} ${loading ? style.loading : ''}`}
                        disabled={loading || !reason || !details.trim() || details.trim().length < 10}
                    >
                        {loading ? (
                            <>
                                <span className={style.spinner}></span>
                                Submitting...
                            </>
                        ) : (
                            'Submit Report'
                        )}
                    </button>

                    <button 
                        type="button" 
                        onClick={handleCancel}
                        className={style.cancelButton}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>

            <div className={style.disclaimer}>
                <p>
                    <small>
                        False reports may result in action against your account. 
                        Please only report content that violates community guidelines.
                    </small>
                </p>
            </div>
        </div>
    );
}

export default ReportPage;