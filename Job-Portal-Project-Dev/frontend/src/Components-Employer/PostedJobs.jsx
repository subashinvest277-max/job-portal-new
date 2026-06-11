import React, { useState, useEffect } from 'react';
import './PostedJobs.css';
import place from '../assets/opportunity_location.png'
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../JobContext';
import api from "../api/axios";

export const PostedJobs = ({ onViewApplicants }) => {
  const navigate = useNavigate();
  const { jobs, getJobStats, currentEmployer, deleteJob, setCurrentEmployer, setAlluser } = useJobs();
  
  const [activeMenu, setActiveMenu] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const PostedJob = currentEmployer?.jobPosted || [];

  // Fetch applications from API for accurate stats
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get('jobs/applications/');
        console.log("PostedJobs - Applications:", response.data);
        setApplications(response.data || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, []);

  // Calculate stats for each job using actual application data
  const getJobApplicationStats = (jobId) => {
    if (!applications.length) {
      return { total: 0, new: 0, shortlisted: 0, interview: 0, rejected: 0 };
    }
    
    const jobApplications = applications.filter(app => 
      String(app.job?.id) === String(jobId)
    );
    
    return {
      total: jobApplications.length,
      new: jobApplications.filter(app => app.status?.toLowerCase() === 'applied').length,
      shortlisted: jobApplications.filter(app => 
        app.status?.toLowerCase() === 'shortlisted' 

      ).length,
      interview: jobApplications.filter(app => app.status?.toLowerCase() === 'interview_called').length,
      rejected: jobApplications.filter(app => app.status?.toLowerCase() === 'rejected').length
    };
  };

  const toggleMenu = (id) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  const handleEditClick = (job) => {
    setActiveMenu(null);
    navigate('/Job-portal/Employer/EditJob', { state: job });
  };

  const handleDeleteClick = async (id) => {
    setSelectedJobId(id);
    setShowDeleteModal(true);
    setActiveMenu(null);
  };

  const confirmDelete = async () => {
    try {
      await deleteJob(selectedJobId);
      setShowDeleteModal(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job");
    }
  };

  if (loading) {
    return (
      <div className="postedjobs-container">
        <h2 className="postedjobs-header">Jobs posted by you</h2>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: '50vh' }}>
          <h2>Loading jobs...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="postedjobs-container">
      <h2 className="postedjobs-header">Jobs posted by you</h2>

      {PostedJob.length > 0 ? (
        <>
          <div className="postedjobs-grid-layout postedjobs-table-header">
            <div />
            <span className="postedjobs-label">Applicants</span>
            {/* <span className="postedjobs-label">New</span> */}
            <span className="postedjobs-label" title="Candidates who applied but not yet reviewed">
              New ⓘ
            </span>
            <span className="postedjobs-label">Shortlisted</span>
            <span className="postedjobs-label">Interview</span>
            <span className="postedjobs-label">Rejected</span>
            <div />
          </div>

          <div className="postedjobs-list">
            {PostedJob.map((job) => {
              // Use actual application data for stats
              const stats = getJobApplicationStats(job.id);

              return (
                <div key={job.id} className="postedjobs-grid-layout postedjobs-card">
                  <div className="postedjobs-info">
                    <h3>{job.job_title}</h3>
                    <p className="postedjobs-loc flex items-center gap-2">
                      <img src={place} alt="location" className="post-job-locationicon" />
                      {Array.isArray(job.location) ? job.location.join(", ") : job.location || "N/A"}
                    </p>
                    {/* <small>Created on: {job.created_at ? new Date(job.created_at).toLocaleDateString() : ''}</small> */}
                    <small>Created on: {new Date(job.created_at || job.posted_date).toLocaleDateString()}</small>
                  </div>

                  <span className="postedjobs-badge">{stats.total}</span>
                  <span className="postedjobs-badge">{stats.new}</span>
                  <span className="postedjobs-badge">{stats.shortlisted}</span>
                  <span className="postedjobs-badge">{stats.interview}</span>
                  <span className="postedjobs-badge">{stats.rejected}</span>

                  <div className="postedjobs-actions">
                    <button
                      className="postedjobs-view-btn"
                      onClick={() => onViewApplicants(job)}
                    >
                      View applicants
                    </button>
                    <div className="postedjobs-menu-wrapper">
                      <button onClick={() => toggleMenu(job.id)} className="postedjobs-dots">⋮</button>
                      {activeMenu === job.id && (
                        <div className="postedjobs-dropdown">
                          <button onClick={() => handleEditClick(job)}>Edit Status</button>
                          <button onClick={() => handleDeleteClick(job.id)} className="delete-opt">Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: '50vh' }}>
          <h2>No Jobs posted by you</h2>
        </div>
      )}

      {showDeleteModal && (
        <div className="postedjobs-modal-overlay">
          <div className="postedjobs-modal">
            <p>Do you want to remove this job post?</p>
            <div className="postedjobs-modal-btns">
              <button onClick={() => setShowDeleteModal(false)} className="postedjobs-btn-cancel">Cancel</button>
              <button onClick={confirmDelete} className="postedjobs-btn-delete">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessToast && (
        <div className="postedjobs-toast">
          Your job post has been removed <span className="close-icon" onClick={() => setShowSuccessToast(false)}>X</span>
        </div>
      )}
    </div>
  );
};
 