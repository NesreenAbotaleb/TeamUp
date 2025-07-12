import React, { useState } from 'react';
import styles from './ReportStyle.module.css';

const Resolve = ({ report, onSubmit, onCancel }) => {
    const [actionTaken, setActionTaken] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAction, setSelectedAction] = useState('');

    // Predefined action options
    const actionOptions = [
        { value: 'warning_issued', label: 'Warning Issued' },
        { value: 'content_removed', label: 'Content Removed' },
        { value: 'user_suspended', label: 'User Suspended' },
        { value: 'user_banned', label: 'User Banned' },
        { value: 'no_action_required', label: 'No Action Required' },
        { value: 'referred_to_moderator', label: 'Referred to Moderator' },
        { value: 'custom', label: 'Custom Action' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!actionTaken.trim() && !selectedAction) {
            alert('Please provide an action taken or select a predefined action.');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const finalAction = selectedAction === 'custom' ? actionTaken : 
                              selectedAction ? actionOptions.find(opt => opt.value === selectedAction)?.label : 
                              actionTaken;
            
            await onSubmit(finalAction);
        } catch (error) {
            console.error('Error submitting resolution:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleActionSelect = (value) => {
        setSelectedAction(value);
        if (value !== 'custom') {
            setActionTaken('');
        }
    };

    // Close modal when clicking on backdrop
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={handleBackdropClick}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Resolve Report</h2>
                    <button 
                        className={styles.closeButton}
                        onClick={onCancel}
                        type="button"
                    >
                        ×
                    </button>
                </div>

                <div className={styles.reportSummary}>
                    <h3 className={styles.summaryTitle}>Report Details</h3>
                    <div className={styles.summaryContent}>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Report ID:</span>
                            <span className={styles.summaryValue}>
                                #{report._id ? report._id.slice(-6) : 'N/A'}
                            </span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Reporter:</span>
                            <span className={styles.summaryValue}>
                                {report.reporter?.reporterName || 'Unknown'}
                            </span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Date:</span>
                            <span className={styles.summaryValue}>
                                {report.createdAt 
                                    ? new Date(report.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })
                                    : 'No date'
                                }
                            </span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Status:</span>
                            <span className={`${styles.summaryValue} ${styles.statusBadge}`}>
                                {report.reportStatus || 'Pending'}
                            </span>
                        </div>
                    </div>
                    
                    <div className={styles.reportDescription}>
                        <span className={styles.summaryLabel}>Report Content:</span>
                        <p className={styles.reportText}>
                            {report.report || 'No content available'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={styles.resolveForm}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>
                            Select Action Taken:
                        </label>
                        <div className={styles.actionOptions}>
                            {actionOptions.map((option) => (
                                <label key={option.value} className={styles.radioOption}>
                                    <input
                                        type="radio"
                                        name="actionType"
                                        value={option.value}
                                        checked={selectedAction === option.value}
                                        onChange={(e) => handleActionSelect(e.target.value)}
                                        className={styles.radioInput}
                                    />
                                    <span className={styles.radioLabel}>{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {selectedAction === 'custom' && (
                        <div className={styles.formGroup}>
                            <label htmlFor="customAction" className={styles.formLabel}>
                                Custom Action Description:
                            </label>
                            <textarea
                                id="customAction"
                                value={actionTaken}
                                onChange={(e) => setActionTaken(e.target.value)}
                                placeholder="Describe the action taken to resolve this report..."
                                className={styles.textarea}
                                rows={4}
                                required
                            />
                        </div>
                    )}

                    <div className={styles.modalActions}>
                        <button
                            type="button"
                            onClick={onCancel}
                            className={styles.cancelButton}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isSubmitting || (!actionTaken.trim() && !selectedAction)}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    Resolving...
                                </>
                            ) : (
                                'Resolve Report'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Resolve;