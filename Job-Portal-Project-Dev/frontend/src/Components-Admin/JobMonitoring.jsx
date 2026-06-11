import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios';
import './JobMonitoring.css';
import { JobPreviewModal } from './JobPreviewModal';

export const JobMonitoring = () => {

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);


    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ONLY CHANGE 1: Updated normalizeStatus
    const normalizeStatus = (approval_status) => {
        if (approval_status === 'pending') return 'Posted';
        if (approval_status === 'approved') return 'Approved';
        if (approval_status === 'rejected') return 'Rejected';
        if (approval_status === 'highlighted') return 'Highlighted';

        return 'Posted';
    };



    const fetchJobs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('admin/jobs/');
            const rawJobs = response.data.jobs || response.data;
            // const normalized = rawJobs.map(job => ({
            //     id: job.id,
            //     role: job.job_title,
            //     company: job.company_name || 'N/A',
            //     status: normalizeStatus(job.is_published, job.job_status),
            //     date: job.created_at ? job.created_at.split('T')[0] : '',
            //     isFlagged: job.flagged ?? false,
            //     location: Array.isArray(job.location) ? job.location.join(', ') : job.location || '',
            //     experience: job.experience || '',
            //     salary: job.salary ? `₹ ${parseFloat(job.salary).toLocaleString('en-IN')}` : '',
            //     type: job.work_type || '',
            //     openings: job.openings || 0,
            //     applicants: job.applicants_count !== undefined ? `${job.applicants_count}+` : '0',
            //     skills: job.key_skills || [],
            //     job_description: job.job_description || '',
            //     employer_email: job.employer_email || '',
            // }));

            const normalized = rawJobs.map(job => ({
                id: job.id,
                role: job.job_title,
                company: job.company?.company_name || job.company_name || 'N/A',
                status: filterType === 'Updated'
                    ? job.job_status
                    : normalizeStatus(job.approval_status),
                approval_status: job.approval_status,

                date: job.created_at ? job.created_at.split('T')[0] : '',
                created_at: job.created_at,
                isFlagged: job.flagged ?? false,
                location: Array.isArray(job.location) ? job.location.join(', ') : job.location || '',
                experience: job.experience || '',
                salary: job.salary ? `₹ ${parseFloat(job.salary).toLocaleString('en-IN')}` : '',
                type: job.work_type || '',
                openings: job.openings || 0,
                applicants: job.applicants_count !== undefined ? `${job.applicants_count}` : '0',
                skills: job.key_skills || [],
                job_description: job.job_description || '',
                responsibilities: job.responsibilities || [],
                shift: job.shift,
                work_duration: job.work_duration || '',
                education: job.education || [],
                job_highlights: job.job_highlights || [],
                job_status: job.job_status,
                is_highlighted: job.is_highlighted ?? false,
                plan_type: job.plan_type || '',  // 'premium' | 'gold' | ''

                company_logo: job.company?.logo || job.company_logo || null,

            }));
            console.log(normalized)
            setJobs(normalized);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load jobs. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);


    const [activeMenu, setActiveMenu] = useState(null);
    const menuRef = useRef(null);
    const [filterType, setFilterType] = useState('Recent');


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeMenu !== null && menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeMenu]);

    // --- PAGINATION LOGIC ---
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedJob, setSelectedJob] = useState(null);
    const postsPerPage = 10;



    // --- LOGIC: FILTERING & SORTING  ---
    const filteredJobs = useMemo(() => {
        let result = [...jobs];
        const now = new Date();

        const getDaysDiff = (dateStr) => {
            const date = new Date(dateStr);
            return (now - date) / (1000 * 60 * 60 * 24);
        };

        switch (filterType) {
            case 'Recent': 
                result.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'Last 10': result = result.slice(0, 10); break;
            case 'Last 20': result = result.slice(0, 20); break;
            case 'Flagged': result = result.filter(j => j.isFlagged); break;
            case 'Rejected': result = result.filter(j => j.approval_status === 'rejected'); break;
            case 'Approved': result = result.filter(j => j.approval_status === 'approved'); break;
            case 'Posted': result = result.filter(j => j.approval_status === 'pending'); break;
            case 'Highlighted': result = result.filter(j => j.is_highlighted === true); break;
            // case 'Updated': result = result.filter(j => j.status === 'Updated'); break;
            case 'Updated':

                result = result.filter(j => j.job_status);

                break;

            case '1 Day': result = result.filter(j => getDaysDiff(j.date) <= 1); break;
            case '2 Days': result = result.filter(j => getDaysDiff(j.date) <= 2); break;
            case '3 Days': result = result.filter(j => getDaysDiff(j.date) <= 3); break;
            case '1 Week': result = result.filter(j => getDaysDiff(j.date) <= 7); break;
            case '1 Month': result = result.filter(j => getDaysDiff(j.date) <= 30); break;
            case '1 Year': result = result.filter(j => getDaysDiff(j.date) <= 365); break;
            default: break;
        }
        return result;
    }, [jobs, filterType]);

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredJobs.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(filteredJobs.length / postsPerPage);


    useEffect(() => {
        setCurrentPage(1);
    }, [filterType]);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        setActiveMenu(null);
    };


    // const handleApprove = (id) => {
    //     setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'Approved' } : j));
    // };

    // const handleReject = (id) => {
    //     if (window.confirm("Reject this job?")) {
    //         setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'Rejected' } : j));
    //     }
    // };

    // const handleToggleFlag = (id) => {
    //     setJobs(prev => prev.map(j => j.id === id ? { ...j, isFlagged: !j.isFlagged } : j));
    //     setActiveMenu(null);
    // };

    // const handleDelete = (id) => {
    //     if (window.confirm("Permanent delete?")) {
    //         setJobs(prev => prev.filter(j => j.id !== id));
    //     }
    // };

    const handleApprove = async (id) => {
        setActionLoading(id);
        setActiveMenu(null);
        try {
            await api.patch(`admin/jobs/${id}/approve/`);
            // setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'Approved' } : j));
            setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'Approved', approval_status: 'approved' } : j));
            showToast('Job approved successfully!');
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to approve job.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Reject this job?")) return;
        setActionLoading(id);
        setActiveMenu(null);
        try {
            await api.patch(`admin/jobs/${id}/reject/`);
            // setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'Rejected' } : j));
            setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'Rejected', approval_status: 'rejected' } : j));
            showToast('Job rejected successfully!');
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to reject job.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleFlag = async (id) => {
        setActionLoading(id);
        setActiveMenu(null);
        try {
            const response = await api.patch(`admin/jobs/${id}/flag/`);
            const newFlagged = response.data.flagged;
            setJobs(prev => prev.map(j => j.id === id ? { ...j, isFlagged: newFlagged } : j));
            showToast(`Job ${newFlagged ? 'flagged' : 'unflagged'} successfully.`);
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to update flag.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Permanent delete?")) return;
        setActionLoading(id);
        setActiveMenu(null);
        try {
            await api.delete(`admin/jobs/${id}/delete/`);
            setJobs(prev => prev.filter(j => j.id !== id));
            showToast('Job deleted successfully.');
        } catch (err) {
            showToast(err.response?.data?.error || 'Failed to delete job.', 'error');
        } finally {
            setActionLoading(null);
        }
    };




    // return (
    //     <div className="job-monitoring-component">
    // AFTER
    if (loading) return (
        <div className="job-monitoring-component">
            <p style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading jobs...</p>
        </div>
    );

    if (error) return (
        <div className="job-monitoring-component">
            <p style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>{error}</p>
            <div style={{ textAlign: 'center' }}>
                <button onClick={fetchJobs} style={{ padding: '8px 20px', cursor: 'pointer' }}>Retry</button>
            </div>
        </div>
    );

    return (
        <div className="job-monitoring-component">
            {toast && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
                    padding: '12px 20px', borderRadius: '8px', color: '#fff', fontSize: '13px',
                    background: toast.type === 'error' ? '#ef4444' : '#10b981',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    {toast.message}
                </div>
            )}

            <div className="monitoring-header-top">
                <div className="header-text-group">
                    <h1 className="main-title">Job Monitoring</h1>
                    <p className="sub-title">Monitor and manage all job postings, application activity, and overall platform performance</p>
                </div>
                <div className="sort-group">
                    <span>Sort by:</span>
                    <select className="sort-select" onChange={(e) => setFilterType(e.target.value)}>
                        {/* <option value="Newest">Newest</option> */}
                        <option value="Recent">Recent</option>
                        <option value="Last 10">Last 10</option>
                        <option value="Last 20">Last 20</option>
                        <option value="Flagged">Flagged</option>
                        <option value="Approved">Verified/Approved</option>
                        <option value="Rejected">Deactivated/Rejected</option>
                        <option value="Posted">Posted Jobs</option>
                        <option value="Highlighted">⭐ Highlighted Jobs</option>
                        <option value="Updated">Updated Jobs</option>
                        <option value="1 Day">Last 1 Day</option>
                        <option value="2 Days">Last 2 Days</option>
                        <option value="3 Days">Last 3 Days</option>
                        <option value="1 Week">Last 1 Week</option>
                        <option value="1 Month">Last 1 Month</option>
                        <option value="1 Year">Last 1 Year</option>
                    </select>
                </div>
            </div>

            <div className="monitoring-container">
                <div className="table-header">
                    <div className="header-cell role-col">Roles</div>
                    <div className="header-cell company-col">Companies</div>
                    <div className="header-cell status-col">Status</div>
                    <div className="header-cell date-col">Date</div>
                    <div className="header-cell actions-col">Actions</div>
                </div>

                {currentPosts.length > 0 ? (
                    currentPosts.map((job) => (
                        // <div key={job.id} className={`job-row ${job.isFlagged ? 'flagged-row' : ''}`}>
                        // <div key={job.id} className={`job-row ${job.isFlagged ? 'flagged-row' : ''}`}
                        //     style={actionLoading === job.id ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
                       <div key={job.id} className={`job-row ${job.isFlagged ? 'flagged-row' : job.is_highlighted ? 'highlighted-row' : ''}`}
                            style={actionLoading === job.id ? { opacity: 0.5, pointerEvents: 'none' } : {}}>



                            <div className="cell role-col">
                                <span className="text-role">{job.role}</span>
                                {job.isFlagged && <span className="flag-indicator">🚩</span>}
                                {job.is_highlighted && (
                                    <span style={{
                                        fontSize: '11px', padding: '2px 7px',
                                        borderRadius: '4px', marginLeft: '6px',
                                        background: '#fef3c7', color: '#92400e',
                                        border: '1px solid #fcd34d', fontWeight: 500
                                    }}>
                                        {/* ⭐ {job.plan_type || 'Highlighted'} */}
                                        ⭐
                                    </span>
                                )}
                            </div>




                            <div className="cell company-col text-company">{job.company}</div>
                            <div className="cell status-col">
                                {/* <span className={`status-pill ${job.status.toLowerCase()}`}>{job.status}</span> */}
                                <span className={`status-pill ${(filterType === 'Updated' ? job.job_status : normalizeStatus(job.approval_status)).toLowerCase()
                                    }`}>
                                    {filterType === 'Updated'
                                        ? job.job_status
                                        : normalizeStatus(job.approval_status)}
                                </span>
                            </div>
                            <div className="cell date-col text-date">{job.date}</div>
                            <div className="cell actions-col">
                                <div className="action-icons-container">
                                    {/* <button onClick={() => handleApprove(job.id)} className="btn-icon check">✔</button>
                                    <button onClick={() => handleReject(job.id)} className="btn-icon cross">✖</button>
                                    <button onClick={() => handleDelete(job.id)} className="btn-icon trash">🗑</button>
                                    <button onClick={() => setSelectedJob(job)} className="btn-icon eye">👁</button> */}
                                    <div className="more-component" ref={activeMenu === job.id ? menuRef : null}>
                                        <button onClick={() => setActiveMenu(activeMenu === job.id ? null : job.id)} className="btn-icon more">•••</button>
                                        {activeMenu === job.id && (
                                            <div className="action-dropdown">
                                                {/* <button onClick={() => alert('Edit Mode')}>Edit Job</button> */}
                                                <button onClick={() => handleToggleFlag(job.id)}>
                                                    {job.isFlagged ? 'Unflag' : 'Flag Employer'}
                                                </button>
                                                <button onClick={() => handleApprove(job.id)} >Approve / Verify</button>
                                                <button onClick={() => handleReject(job.id)} >Reject / Deactivate</button>
                                                <button onClick={() => handleDelete(job.id)} >Delete</button>
                                                <button onClick={() => setSelectedJob(job)} >Quick View</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-results">No jobs match this filter.</div>
                )}

                {/* Pagination Section */}
                {totalPages > 0 && (
                    <div className="pagination-bar">
                        <button
                            className="page-nav-btn"
                            disabled={currentPage === 1}
                            onClick={() => paginate(currentPage - 1)}
                        > &lt; </button>

                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index + 1}
                                className={`page-num-btn ${currentPage === index + 1 ? 'active' : ''}`}
                                onClick={() => paginate(index + 1)}
                            >
                                {index + 1}
                            </button>
                        ))}

                        <button
                            className="page-nav-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => paginate(currentPage + 1)}
                        > &gt; </button>
                    </div>
                )}
            </div>
            {selectedJob && <JobPreviewModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
        </div>
    );
};  
