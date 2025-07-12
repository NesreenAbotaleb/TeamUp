import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import style from './Report.module.css';
import ReportsList from "../../Componant/Reports/ReportsList";
import GetAll from "../../servies/Reports/getAll";
import UserContext from "../../context/Usercontext";
import Header from './../../Componant/Header/Header'
import GetReports from "../../servies/Admin/GetReports";

function Report() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentCategory, setCurrentCategory] = useState('all');
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const { code } = useParams();
    const isNotAdmin = user && (user.role !== 1 && user.userRole !== 1);

    console.log('Community code:', code);
    
    useEffect(() => {
        if (!user) {
            setError("User not authenticated");
            navigate("/login");
            return;
        }
    }, [user, navigate]);

    const fetchReports = async (category = 'all') => {
        try {
            setLoading(true);
            setError(null);
           
            const token = localStorage.getItem('token');
           
            if (!token) {
                navigate("/login");
                return;
            }

            // Check if user is authenticated
            if (!user) {
                setError("User not authenticated");
                navigate("/login");
                return;
            }
            
            let result;
            
            if (isNotAdmin) {
                // For admin users, pass category parameter to GetAll
                result = await GetAll(token, navigate, setReports, code, category);
            } else {
                // For non-admin users, use GetReports
                result = await GetReports(navigate, setReports, category);
            }
            
            // Filter reports based on category if the API doesn't handle it
            if (result) {
                let filteredReports = result;
                if (category === 'pending') {
                    filteredReports = result.filter(report => 
                        (report.reportStatus || 'pending').toLowerCase() === 'pending'
                    );
                }
                setReports(filteredReports);
            }
           
        } catch (err) {
            console.error("Error fetching reports:", err);
            setError(err.message || "Failed to fetch reports");
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
    }, [user, navigate]);

    useEffect(() => {
        // Only fetch if we have a user
        if (user) {
            fetchReports(currentCategory);
        }
    }, [user, code, currentCategory]);

    const handleRefresh = () => {
        fetchReports(currentCategory);
    };

    const handleCategoryChange = (category) => {
        setCurrentCategory(category);
        // fetchReports will be called automatically due to useEffect dependency
    };

    // Show loading state for initial load
    if (loading && reports.length === 0 && !error) {
        return (
            <div className={style.pageContainer}>
                <Header />
                <div className={style.loadingContainer}>
                    <div className={style.loadingSpinner}>
                        <div className={style.spinner}></div>
                        <h2>Loading Reports Dashboard</h2>
                        <p>Please wait while we fetch the community reports...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={style.pageContainer}>
            <Header />
            
            <main className={style.mainContent}>
                <div className={style.pageHeader}>
                    <div className={style.headerContent}>
                        <h1 className={style.pageTitle}>Reports Dashboard</h1>
                        {(user?.role !== 1) ? (
                            <p className={style.pageSubtitle}>
                                Manage and review community reports
                                {code && <span className={style.communityCode}> • Community: {code}</span>}
                            </p>
                        ) : (
                            <p className={style.pageSubtitle}>
                                Manage and review reports
                            </p>
                        )}
                    </div>
                </div>

                <div className={style.reportsSection}>
                    <ReportsList
                        reports={reports}
                        loading={loading}
                        error={error}
                        onRefresh={handleRefresh}
                        onCategoryChange={handleCategoryChange}
                    />
                </div>
            </main>
        </div>
    );
}

export default Report;