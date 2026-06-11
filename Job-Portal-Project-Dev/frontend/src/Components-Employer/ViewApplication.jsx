import React, { useState } from "react";
import UserIcon from "../assets/Employer/User.png";
import { useJobs } from "../JobContext";
import "./ViewApplication.css";
 
export const ViewApplication = () => {
  const { Alluser } = useJobs();
  const [viewMode, setViewMode] = useState("list");
  const [selectedUser, setSelectedUser] = useState(null);
 
  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setViewMode("detail");
  };
 
  const handleBack = () => {
    setViewMode("list");
    setSelectedUser(null);
  };
 
  const getStatusClass = (status) => {
    const s = status?.toLowerCase() || 'pending';
    if (s === 'invited') return 'status-invited';
    if (s === 'rejected') return 'status-rejected';
    return 'status-pending';
  };
 
  if (viewMode === "list") {
    return (
      <div className="view-applicants-page">
        <div className="main-card">
          <div className="header-section">
            <div className="title-group">
              <h2>View Applications</h2>
              <p className="subtitle">{Alluser.length} Total Jobseekers</p>
            </div>
          </div>
 
          <table className="applicants-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Experience</th>
                <th>Status</th>
                <th>Skills</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Alluser.map((user, index) => (
                <tr key={index}>
                  <td className="candidate-cell">
                    <img src={UserIcon} alt="avatar" className="table-avatar" />
                    <div className="name-stack">
                      <span className="name">{user.profile?.fullName || "N/A"}</span>
                      {/* Render Job Title from currentDetails */}
                      <span className="designation">{user.currentDetails?.jobTitle || "General"}</span>
                    </div>
                  </td>
                  {/* Correct Experience Path */}
                  <td>{user.currentDetails?.experience || "Fresher"}</td>
                  <td>
                    <span className={`status-pill ${getStatusClass(user.status)}`}>
                      {user.status || "Pending"}
                    </span>
                  </td>
                  <td>
                    <div className="table-skills">
                      {user.skills?.slice(0, 2).map((s, i) => (
                        <span key={i} className="mini-skill">{s}</span>
                      ))}
                      {user.skills?.length > 2 && <span className="more-count">+{user.skills.length - 2}</span>}
                    </div>
                  </td>
                  <td>
                    <button className="view-link-btn" onClick={() => handleViewDetails(user)}>
                      View Application
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
 
  return (
    <div className="view-applicants-page detail-view">
      <div className="detail-container">
        <div className="detail-header">
          <button className="back-btn" onClick={handleBack}>← Back to Applicants</button>
          <div className="header-actions">
            <button className="btn-msg">Message</button>
            <button className="btn-reject-outline">Reject</button>
            <button className="btn-invite-solid">Invite for Interview</button>
          </div>
        </div>
 
        <div className="detail-layout">
          <div className="detail-left">
            <div className="profile-main-card">
              <img src={UserIcon} alt="Profile" className="detail-avatar" />
              <h3>{selectedUser.profile?.fullName}</h3>
             
              <div style={{ marginBottom: '10px' }}>
                <span className={`status-pill ${getStatusClass(selectedUser.status)}`}>
                  {selectedUser.status || "Pending"}
                </span>
                {/* Job Type Pill (Hybrid/Remote/Full-time) */}
                <span className="work-mode-pill">
                    {selectedUser.preferences?.[0]?.jobType}
                </span>
              </div>
 
              <p className="role-tag">{selectedUser.currentDetails?.jobTitle}</p>
             
              <div className="contact-list">
                {/* Corrected paths to match JobContext.jsx */}
                <p><strong>Experience:</strong> {selectedUser.currentDetails?.experience}</p>
                <p><strong>Education:</strong> {selectedUser.education?.highestQual}</p>
                <p><strong>Location:</strong> {selectedUser.currentDetails?.currentLocation}</p>
              </div>
            </div>
          </div>
 
          <div className="detail-right">
            <div className="tabs-bar">
              <span className="tab active">Profile</span>
              <span className="tab">Resume</span>
              <span className="tab">Experience</span>
            </div>
 
            <div className="tab-pane">
              {/* Cover Letter - Placeholder based on typical flow */}
              <section className="info-section">
                <h4>Cover Letter</h4>
                <div className="cover-letter-box">
                  <p>
                    I am interested in the {selectedUser.preferences?.[0]?.role} role.
                    I have {selectedUser.currentDetails?.experience} of experience working at
                    {selectedUser.currentDetails?.company} and I'm skilled in {selectedUser.skills?.join(", ")}.
                  </p>
                </div>
              </section>
 
              {/* Resume Preview Box */}
              <section className="info-section">
                <h4>Resume</h4>
                <div className="resume-preview-card">
                   <div className="file-info">
                      <span className="file-icon"></span>
                      <div>
                        <p className="file-name">{selectedUser.profile?.fullName}_Resume.pdf</p>
                        <p className="file-size">{selectedUser.resume?.size}</p>
                      </div>
                   </div>
                   <button className="preview-btn">Preview</button>
                </div>
              </section>
 
              <section className="info-section">
                <h4>Education Details</h4>
                {selectedUser.education?.graduations?.map((edu, i) => (
                  <div key={i} className="info-block">
                    <p><strong>{edu.degree}</strong> ({edu.startYear} - {edu.endYear})</p>
                    <p className="college-name">{edu.college}</p>
                  </div>
                ))}
              </section>
 
              <section className="info-section">
                <h4>Top Skills</h4>
                <div className="skill-pills">
                  {selectedUser.skills?.map((skill, i) => (
                    <span key={i}>{skill}</span>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};