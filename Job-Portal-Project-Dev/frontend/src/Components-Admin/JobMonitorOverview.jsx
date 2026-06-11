import React, { useState } from 'react';
import { useJobs } from '../JobContext';
import api from '../api/axios';
import starIcon from '../assets/Star_icon.png';
import time from '../assets/opportunity_time.png';
import experience from '../assets/opportunity_bag.png';
import place from '../assets/opportunity_location.png';

export const JobMonitorOverview = ({ jobId, setSelectedJobId }) => {
    const { jobs, setJobs, deleteJob } = useJobs();
    const [actionLoading, setActionLoading] = useState(false);
    const currentId = jobId;
    const selectedJob = jobs.find(job => job.id === currentId);

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this job?");
        if (confirmDelete) {
            try {
                setActionLoading(true);
                // ✅ API call to backend
                await api.delete(`/admin/jobs/${currentId}/delete/`);
                
                // Update frontend state
                deleteJob(currentId);
                if (typeof setSelectedJobId === 'function') {
                    setSelectedJobId(null);
                }
                alert("Job deleted successfully!");
            } catch (error) {
                console.error("Delete failed:", error);
                alert(error.response?.data?.message || "Failed to delete job. Please try again.");
            } finally {
                setActionLoading(false);
            }
        }
    };

    if (!selectedJob) {
        return (
            <div className='opp-overview-main'>
                <p style={{ marginTop: '20px' }}>Job is deleted or not found.</p>
            </div>
        );
    }

    const handleApprove = async () => {
        if (window.confirm("Do you want to approve this job?")) {
            try {
                setActionLoading(true);
                // ✅ API call to backend
                await api.patch(`/admin/jobs/${currentId}/approve/`);
                
                // Update frontend state
                setJobs(prev => prev.map(j => 
                    j.id === currentId ? { ...j, approval_status: 'approved', is_published: true } : j
                ));
                alert("Job approved successfully!");
            } catch (error) {
                console.error("Approval failed:", error);
                alert(error.response?.data?.error || "Failed to approve job. Please try again.");
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleReject = async () => {
        if (window.confirm("Do you want to reject this job?")) {
            try {
                setActionLoading(true);
                // ✅ API call to backend
                await api.patch(`/admin/jobs/${currentId}/reject/`);
                
                // Update frontend state
                setJobs(prev => prev.map(j => 
                    j.id === currentId ? { ...j, approval_status: 'rejected', is_published: false } : j
                ));
                alert("Job rejected successfully!");
            } catch (error) {
                console.error("Rejection failed:", error);
                alert(error.response?.data?.error || "Failed to reject job. Please try again.");
            } finally {
                setActionLoading(false);
            }
        }
    };

    const handleToggleFlag = async () => {
        try {
            setActionLoading(true);
            const newFlagStatus = !selectedJob.flagged;
            
            // ✅ API call to backend
            await api.patch(`/admin/jobs/${currentId}/flag/`);
            
            // Update frontend state
            setJobs(prev => prev.map(j => 
                j.id === currentId ? { ...j, flagged: newFlagStatus } : j
            ));
            alert(newFlagStatus ? "Job flagged successfully!" : "Job unflagged successfully!");
        } catch (error) {
            console.error("Flag update failed:", error);
            alert(error.response?.data?.error || "Failed to update flag status. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    // Get company name from employer relationship
    const getCompanyName = () => {
        if (selectedJob.company?.company_name) return selectedJob.company.company_name;
        if (selectedJob.employer?.employer_profile?.company?.company_name) {
            return selectedJob.employer.employer_profile.company.company_name;
        }
        return 'N/A';
    };

    // Get company logo
    const getCompanyLogo = () => {
        if (selectedJob.company?.company_logo) return selectedJob.company.company_logo;
        if (selectedJob.company_logo) return selectedJob.company_logo;
        if (selectedJob.logo) return selectedJob.logo;
        return null;
    };

    // Get ratings and reviews
    const getRatings = () => {
        if (selectedJob.company?.average_rating) return selectedJob.company.average_rating;
        if (selectedJob.employer?.employer_profile?.company?.average_rating) {
            return selectedJob.employer.employer_profile.company.average_rating;
        }
        if (selectedJob.ratings) return selectedJob.ratings;
        return 'N/A';
    };

    const getTotalReviews = () => {
        if (selectedJob.company?.total_reviews) return selectedJob.company.total_reviews;
        if (selectedJob.employer?.employer_profile?.company?.total_reviews) {
            return selectedJob.employer.employer_profile.company.total_reviews;
        }
        if (selectedJob.reviewNo) return selectedJob.reviewNo;
        return 0;
    };

    // Get location as string
    const getLocationString = () => {
        if (Array.isArray(selectedJob.location)) {
            return selectedJob.location.join(', ');
        }
        if (typeof selectedJob.location === 'string') {
            return selectedJob.location;
        }
        return 'N/A';
    };

    // Get salary
    const getSalary = () => {
        const salaryValue = selectedJob.salary || 'Not Disclosed';
        return salaryValue.toString().replace('Lpa', '').trim();
    };

    // Safely get arrays with fallbacks
    const tags = selectedJob.industry_type || selectedJob.tags || [];
    const jobHighlights = selectedJob.job_highlights || selectedJob.JobHighlights || [];
    const responsibilities = selectedJob.responsibilities || selectedJob.Responsibilities || [];
    const industryType = selectedJob.industry_type || selectedJob.IndustryType || [];
    const department = selectedJob.department || selectedJob.Department || [];
    const keySkills = selectedJob.key_skills || selectedJob.KeySkills || [];

    // Get status display value
    const getStatusDisplay = () => {
        const status = selectedJob.approval_status || selectedJob.status;
        if (status === 'approved') return 'Approved';
        if (status === 'Approved') return 'Approved';
        if (status === 'rejected') return 'Rejected';
        if (status === 'Rejected') return 'Rejected';
        return 'Pending';
    };

    const currentStatus = getStatusDisplay();
    const isApproved = selectedJob.approval_status === 'approved' || selectedJob.status === 'Approved';
    const isRejected = selectedJob.approval_status === 'rejected' || selectedJob.status === 'Rejected';
    const isFlagged = selectedJob.flagged || selectedJob.isFlagged;

    return (
        <div className='opp-overview-main'>
            <div className="opp-job-main">
                <div className="opp-overview-job-card">
                    <div className="Opportunities-job-header">
                        <div>
                            <h2 className="opp-topcard-job-title">{selectedJob.job_title || selectedJob.title || 'N/A'}</h2>
                            <h5 className="Opportunities-job-company">
                                {getCompanyName()} <span className="Opportunities-divider">|</span>
                                <span className="star"><img src={starIcon} alt="star" /></span> {getRatings()}
                                <span className="Opportunities-divider">|</span>
                                <span className="opp-reviews"> {getTotalReviews()} Reviews</span>
                            </h5>
                        </div>
                        {getCompanyLogo() ? (
                            <img src={getCompanyLogo()} alt={getCompanyName()} className="Opportunities-job-logo" />
                        ) : (
                            <div className="Opportunities-job-logo-placeholder">
                                {getCompanyName().charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="Opportunities-job-details">
                        <p className='Opportunities-detail-line'>
                            <img src={time} className='card-icons' alt="time" />
                            {selectedJob.work_duration || selectedJob.duration || 'N/A'}
                            <span className="Opportunities-divider">|</span>
                            ₹ {getSalary()} Lpa
                        </p>
                        <p className='Opportunities-detail-line'>
                            <img src={experience} className='card-icons' alt="exp" />
                            {selectedJob.experience || '0'} years of experience
                        </p>
                        <p className='Opportunities-detail-line'>
                            <img src={place} className='card-icons' alt="loc" />
                            {getLocationString()}
                        </p>
                    </div>

                    <div className='Opportunities-details-bottom'>
                        <div className="Opportunities-job-tags">
                            {tags.length > 0 ? tags.map((tag, index) => (
                                <span key={index} className={`Opportunities-job-tag ${String(tag).toLowerCase()}`}>
                                    {tag}
                                </span>
                            )) : <span className="Opportunities-job-tag">No tags</span>}
                        </div>
                        <div className="Opportunities-job-type">
                            {selectedJob.work_type || selectedJob.WorkType || 'N/A'}
                        </div>
                    </div>
                    <hr className="Opportunities-separator" />
                    
                    <div className="opp-job-highlights">
                        <h3>Job Highlights</h3>
                        <ul>
                            {jobHighlights.length > 0 ? 
                                jobHighlights.map((item, i) => <li key={i}>{item}</li>) : 
                                <li>No highlights available</li>
                            }
                        </ul>
                    </div>

                    <h3>Company Overview</h3>
                    <p>{selectedJob.company?.about || selectedJob.companyOverview || selectedJob.about || 'No company overview available.'}</p>

                    <h3>Job Description</h3>
                    <p>{selectedJob.job_description || selectedJob.jobDescription || 'No job description available.'}</p>

                    <h3>Responsibilities</h3>
                    <ul>
                        {responsibilities.length > 0 ? 
                            responsibilities.map((item, i) => <li key={i}>{item}</li>) : 
                            <li>No responsibilities listed</li>
                        }
                    </ul>

                    <h3>Key Details:</h3>
                    <p><strong>Role:</strong> {selectedJob.job_title || selectedJob.title || 'N/A'}</p>
                    <p><strong>Industry Type:</strong> {industryType.length > 0 ? industryType.join(", ") : 'N/A'}</p>
                    <p><strong>Department:</strong> {department.length > 0 ? department.join(", ") : 'N/A'}</p>
                    <p><strong>Job Type:</strong> {selectedJob.work_type || selectedJob.WorkType || 'N/A'}</p>
                    <p><strong>Location:</strong> {getLocationString()}</p>
                    <p><strong>Shift:</strong> {selectedJob.shift || selectedJob.Shift || 'General'}</p>
                    <p><strong>Openings:</strong> {selectedJob.openings || 'N/A'}</p>
                    <p><strong>Last Date to Apply:</strong> {selectedJob.last_date_to_apply || 'Not specified'}</p>

                    <h3>Key Skills</h3>
                    <div className="opp-key-skills-container">
                        {keySkills.length > 0 ? 
                            keySkills.map((item, i) => <span key={i}>{item}</span>) : 
                            <span>No skills listed</span>
                        }
                    </div>
                    
                    <div className='Monitoring-Overview-Action'>
                        <button 
                            onClick={handleDelete} 
                            disabled={actionLoading}
                            style={{ 
                                background: "#f44d4d", 
                                cursor: actionLoading ? "not-allowed" : "pointer", 
                                color: "white",
                                opacity: actionLoading ? 0.7 : 1
                            }}
                        >
                            {actionLoading ? "Deleting..." : "Delete"}
                        </button>

                        <button
                            onClick={handleToggleFlag}
                            disabled={actionLoading}
                            style={{
                                background: isFlagged ? "#d9a111" : "#fdc01b",
                                cursor: actionLoading ? "not-allowed" : "pointer",
                                fontWeight: isFlagged ? "bold" : "normal",
                                opacity: actionLoading ? 0.7 : 1
                            }}
                        >
                            {actionLoading ? "Updating..." : (isFlagged ? "Flagged" : "Flag")}
                        </button>

                        <button
                            onClick={handleReject}
                            disabled={isRejected || actionLoading}
                            style={{
                                background: isRejected ? "#8c8c8b" : "#dc3545",
                                color: "white",
                                cursor: (isRejected || actionLoading) ? "not-allowed" : "pointer",
                                opacity: (isRejected || actionLoading) ? 0.7 : 1
                            }}
                        >
                            {actionLoading ? "Processing..." : (isRejected ? "Rejected" : "Reject")}
                        </button>

                        <button
                            onClick={handleApprove}
                            disabled={isApproved || actionLoading}
                            style={{
                                background: isApproved ? "#0f4a25" : "#166534",
                                color: 'white',
                                cursor: (isApproved || actionLoading) ? "not-allowed" : "pointer",
                                opacity: (isApproved || actionLoading) ? 0.7 : 1
                            }}
                        >
                            {actionLoading ? "Processing..." : (isApproved ? "Approved" : "Approve")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};