import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserIcon from "../assets/Employer/User.png";
import { useJobs } from "../JobContext";
import api from "../api/axios";
import "./ViewApplicants.css";

export const ViewApplicants = ({ job, onBack }) => {
  const {
    updateApplicantStatus,
    addChatToSidebar,
    Alluser
  } = useJobs();

  const [viewMode, setViewMode] = useState("list");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobseekerProfile, setJobseekerProfile] = useState(null);
  const navigate = useNavigate();

  // Fetch applications for this job
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        console.log("Fetching applications for job:", job?.id);

        const response = await api.get('jobs/applications/');
        console.log("All applications:", response.data);

        const jobApplications = response.data.filter(
          app => app.job.id === job?.id
        );

        console.log("Filtered applications for this job:", jobApplications);
        setApplications(jobApplications);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    if (job?.id) {
      fetchApplications();
    }
  }, [job]);

  // ✅ REMOVED fetchFullApplicationDetails - not needed since we have all data

  const statusOptions = [
    "applied",
    "resume_screening",
    "recruiter_review",
    "shortlisted",
    "interview_called",
    "offered",
    "hired",
    "rejected"
  ];

  const statusLabels = {
    "applied": "Application Submitted",
    "resume_screening": "Resume Screening",
    "recruiter_review": "Recruiter Review",
    "shortlisted": "Shortlisted",
    "interview_called": "Interview Called",
    "offered": "Offered",
    "rejected": "Rejected",
    "hired": "Hired"
  };

  const calculateJobStats = () => {
    const getCount = (statusName) => {
      return applications.filter(app => app.status === statusName).length;
    };

    return {
      total: applications.length,
      shortlisted: getCount("shortlisted"),
      rejected: getCount("rejected"),
      interview: getCount("interview_called"),
      screening: getCount("resume_screening")
    };
  };

  const stats = calculateJobStats();

  const handleStatusChange = async (applicationId, newStatus) => {

    const currentIndex = statusOptions.indexOf(selectedApplication?.status);
    const newIndex = statusOptions.indexOf(newStatus);


    if (newIndex < currentIndex) {
      alert("Cannot move applicant to a previous stage!");
      return; // ← API call stops
    }
    try {
      console.log("Updating status for application:", applicationId, "to:", newStatus);

      const response = await api.patch(`jobs/applications/${applicationId}/status/`, {
        status: newStatus
      });

      console.log("Status updated:", response.data);

      setApplications(prev => prev.map(app =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));

      if (selectedApplication) {
        setSelectedApplication(prev => ({ ...prev, status: newStatus }));
      }

    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handleMessageUser = (userId) => {
    addChatToSidebar(userId);
    navigate(`/Job-portal/employer-chat/${userId}`);
  };

  // ✅ FIXED handleViewDetails - no extra API call needed
  const handleViewDetails = (application) => {
    console.log("Viewing details for application:", application);

    // Set selected application directly from the data we have
    setSelectedApplication(application);

    // Find jobseeker profile from Alluser
    // const jobseeker = Alluser.find(user => user.id === application.user.id);
    const jobseeker = Alluser.find(user =>
      user.user?.id === application.user.id
    );

    if (jobseeker) {
      console.log("Jobseeker profile found in Alluser:", jobseeker);
      console.log("Skills:", jobseeker.skills);
      console.log("Education:", jobseeker.educations);
      setJobseekerProfile(jobseeker);
    } else {
      // Fallback: create basic profile from application data
      console.log("Jobseeker not found in Alluser, using application data");
      setJobseekerProfile({
        id: application.user.id,
        full_name: application.user.username || application.user.full_name,
        email: application.user.email,
        current_job_title: application.user.current_job_title || "",
        total_experience_years: application.user.total_experience || 0,
        current_location: application.user.location || "",
        skills: application.user.skills || [],
        educations: application.user.educations || [],
        resume_file: application.resume_version || null
      });
    }

    setViewMode("detail");
  };

  const handleBack = () => {
    setViewMode("list");
    setSelectedApplication(null);
    setJobseekerProfile(null);
    if (onBack) onBack();
  };

  const getStatusClass = (status) => {
    const s = status?.toLowerCase() || 'pending';
    if (s === 'applied') return 'status-submitted';
    if (s === 'resume_screening') return 'status-screening';
    if (s === 'recruiter_review') return 'status-review';
    if (s === 'shortlisted') return 'status-shortlisted';
    if (s === 'interview_called') return 'status-interview';
    if (s === 'offered') return 'status-offered';
    if (s === 'rejected') return 'status-rejected';
    if (s === 'hired') return 'status-hired';
    return 'status-pending';
  };

  if (loading) {
    return (
      <div className="view-applicants-page">
        <div className="main-card">
          <div style={{ textAlign: "center", padding: "40px" }}>
            Loading applicants...
          </div>
        </div>
      </div>
    );
  }

  // --- TABLE VIEW ---
  if (viewMode === "list") {
    return (
      <div className="view-applicants-page">
        <div className="main-card">
          <div className="header-section">
            <div className="title-group">
              <button className="back-btn" onClick={handleBack}>← Back</button>
              {/* <h2>Applicants for {job?.jobTitle || job?.title}</h2> */}
              <h2>Applicants for {job?.job_title || job?.jobTitle || job?.title}</h2>
              <p className="subtitle">
                {stats.total} Total Applicants |
                Shortlisted: {stats.shortlisted} |
                Interview: {stats.interview} |
                Rejected: {stats.rejected}
              </p>
            </div>
          </div>

          <table className="applicants-table">
            <thead>
              <tr>
                <th>Candidate</th>
                {/* <th>Applied Date</th> */}
                <th>Experience</th>
                <th>Status for this Job</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.length > 0 ? (
                applications.map((app) => (
                  <tr key={app.id}>
                    <td className="candidate-cell">
                      {/* <img src={UserIcon} alt="avatar" className="table-avatar" /> */}
                      <img
                        src={
                          Alluser.find(u => u.user?.id === app.user.id)?.profile_photo
                          || UserIcon
                        }
                        alt="avatar"
                        className="table-avatar"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = UserIcon;
                        }}
                      />

                      <div className="name-stack">
                        <span className="name">{app.user?.username || "N/A"}</span>
                        <span className="designation">{app.user?.email}</span>
                      </div>
                    </td>
                    {/* <td>{new Date(app.applied_date).toLocaleDateString()}</td> */}
                    <td>
    {Alluser.find(u => u.user?.id === app.user.id)?.total_experience_years
        ? `${Alluser.find(u => u.user?.id === app.user.id)?.total_experience_years} Years`
        : "Fresher"}
</td>
                    <td>
                      <span className={`status-pill ${getStatusClass(app.status)}`}>
                        {statusLabels[app.status] || app.status}
                      </span>
                    </td>
                    <td>
                      <button className="view-link-btn" onClick={() => handleViewDetails(app)}>
                        View Application
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    No one has applied for this job yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- DETAIL VIEW ---
  return (
    <div className="view-applicants-page detail-view">
      <div className="detail-container">
        <div className="detail-header">
          <button className="back-btn" onClick={handleBack}>← Back to Applications</button>

          <div className="header-actions">
            <div className="status-selector-container">
              <span>Update Stage: </span>
              <select
                className="status-dropdown-box"
                value={selectedApplication?.status || "applied"}
                onChange={(e) => handleStatusChange(selectedApplication.id, e.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {statusLabels[option]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="detail-layout">
          {/* LEFT COLUMN - Profile Card */}
          <div className="detail-left">
            <div className="profile-main-card">
              {/* <img src={UserIcon} alt="Profile" className="detail-avatar" /> */}
              <img
                src={jobseekerProfile?.profile_photo || UserIcon}
                alt="Profile"
                className="detail-avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = UserIcon;
                }}
              />

              <h3>{jobseekerProfile?.full_name || selectedApplication?.user?.username}</h3>
              <p className="role-tag">
                {jobseekerProfile?.current_job_title || "Job Seeker"}
              </p>

              <div className="quick-info-list">
                <p>
                  <strong>Experience:</strong>{" "}
                  {jobseekerProfile?.total_experience_years
                    ? `${jobseekerProfile.total_experience_years} Years`
                    : "Fresher"}
                </p>
                <p>
                  <strong>Education:</strong>{" "}
                  {jobseekerProfile?.educations?.[0]?.qualification_level ||
                    jobseekerProfile?.educations?.[0]?.degree ||
                    "Bachelor's Degree"}
                </p>
                <p>
                  <strong>Current Loc:</strong>{" "}
                  {jobseekerProfile?.current_location || "Not specified"}
                </p>
              </div>

              <div className="status-badge-container">
                <p className="status-label">Application Stage:</p>
                <span className={`status-pill large ${getStatusClass(selectedApplication?.status)}`}>
                  {statusLabels[selectedApplication?.status]}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Detailed Info */}
          <div className="detail-right">
            <div className="tabs-bar">
              <span className="tab active">Profile Overview</span>
            </div>

            <div className="tab-pane">
              {/* Skills Section */}
              <div className="info-section">
                <h4>Skills</h4>
                <div className="skill-pills">
                  {jobseekerProfile?.skills?.map((skill, i) => (
                    <span key={i} className="skill-tag">
                      {typeof skill === 'object' ? skill.name : skill}
                    </span>
                  ))}
                  {(!jobseekerProfile?.skills || jobseekerProfile.skills.length === 0) && (
                    <span className="skill-tag">No skills listed</span>
                  )}
                </div>
              </div>

              {/* Resume & Documents Section */}
              <div className="info-section document-section">
                <h4>Resume & Documents</h4>
                <div className="resume-card">
                  <div className="resume-info">
                    <div className="file-details">
                      <p className="file-name">
                        {jobseekerProfile?.full_name || selectedApplication?.user?.username || "Candidate"}_Resume.pdf
                      </p>
                      <p className="file-size">1.1 MB</p>
                    </div>
                  </div>

                  {/* ✅ Resume download - from selectedApplication or jobseekerProfile */}
                  {(selectedApplication?.resume_version || jobseekerProfile?.resume_file) ? (
                    <a
                      href={selectedApplication?.resume_version || jobseekerProfile?.resume_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-btn"
                      style={{ textDecoration: 'none' }}
                    >
                      Download Resume
                    </a>
                  ) : (
                    <div style={{ padding: "10px", color: "#999", textAlign: "center" }}>
                      No resume uploaded
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Letter Section */}
              <div className="info-section">
                <h4>Cover Letter / Experience Summary</h4>
                <div className="cover-letter-box">
                  <p>{selectedApplication?.cover_letter || "No cover letter provided."}</p>
                </div>
              </div>

              {/* Education Summary */}
              {/* <div className="info-section">
                <h4>Education</h4> */}
              {/* {jobseekerProfile?.educations?.map((edu, i) => (
                  <div key={i} className="edu-item">
                    <p><strong>{edu.qualification_level || edu.degree}</strong></p>
                    <p className="sub-text">
                      {edu.institution} |
                      {edu.completion_year || edu.end_year?.split('-')[0] || "2024"}
                    </p>
                  </div>
                ))}
                {(!jobseekerProfile?.educations || jobseekerProfile.educations.length === 0) && (
                  <div className="edu-item">
                    <p><strong>Bachelor's Degree</strong></p>
                    <p className="sub-text">Not specified</p>
                  </div>
                )} */}

              {/* {(() => {
                  const priorityOrder = [
                    'Doctorate',
                    'Post-Graduation',
                    'Graduation',
                    'Diploma',
                    'HSC',
                    'SSLC'
                  ];

                  const highest = priorityOrder
                    .map(level => jobseekerProfile?.educations?.find(
                      edu => edu.qualification_level === level
                    ))
                    .find(edu => edu !== undefined);

                  return highest ? (
                    <div className="edu-item">
                      <p><strong>{highest.qualification_level}</strong></p>
                      <p className="sub-text">
                        {highest.institution} |{" "}
                        {highest.completion_year
                          ? new Date(highest.completion_year).getFullYear()
                          : highest.end_year?.split('-')[0] || "N/A"}
                      </p>
                    </div>
                  ) : (
                    <div className="edu-item">
                      <p><strong>Bachelor's Degree</strong></p>
                      <p className="sub-text">Not specified</p>
                    </div>
                  );
                })()}



              </div> */}

              {/* Education Summary */}
              <div className="info-section">
                <h4>Education</h4>
                <div className="edu-item">
                  <p>
                    <strong>
                      {jobseekerProfile?.highest_qualification || "No education details provided"}
                    </strong>
                  </p>
                  {jobseekerProfile?.highest_qualification && (
                    <p className="sub-text">
                      {/* Institute name and year will come here if available */}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="message-action-footer">
          <button
            className="btn-message-center"
            onClick={() => handleMessageUser(selectedApplication?.user?.id)}
          >
            Send Message to {jobseekerProfile?.full_name?.split(' ')[0] || "Candidate"}
          </button>
        </div>
      </div>
    </div>
  );
};