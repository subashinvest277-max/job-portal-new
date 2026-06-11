import React, { useState } from 'react';
import './JsProfileOverview.css';
import { ProfileCard } from './ProfileCard';
import fileIcon from '../assets/Employer/fileIcon.png';
// import threedots from '../assets/ThreeDots.png';
import Arrow from '../assets/UpArrow.png';
import { Footer } from '../Components-LandingPage/Footer';
import { EHeader } from './EHeader';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '../JobContext';

export const JsProfileOverview = () => {
  const { Alluser, addChatToSidebar, startConversation, loading } = useJobs();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const currentUser = Alluser?.find((user) => String(user.id) === String(id));

  // Debug log - only when user exists
  if (currentUser) {
    console.log("Current User loaded:", currentUser);
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleConnect = async () => {
    if (currentUser) {
      try {
        // Get actual user ID from the user object
        const userId = currentUser.user?.id || currentUser.user_id || currentUser.id;

        if (!userId) {
          console.error("No user ID found in currentUser:", currentUser);
          alert("Unable to start conversation. User ID not found.");
          return;
        }

        // Add to sidebar
        addChatToSidebar(id);

        // Start conversation with actual user ID
        const conversationId = await startConversation(
          userId,
          `Hi ${currentUser.full_name || currentUser.profile?.fullName}, I'm interested in your profile.`
        );

        if (conversationId) {
          navigate(`/Job-portal/employer-chat/${conversationId}`);
        }
      } catch (error) {
        console.error("Failed to start conversation:", error);
        alert("Failed to start conversation. Please try again.");
      }
    }
  };
  const handleDownloadFile = () => {
    // const fileUrl = currentUser.profile?.resume_url
    const fileUrl = currentUser.resume_file || currentUser.resume_url
    const fileName = `${currentUser.profile?.fullName || "User"}_Resume.pdf`;

    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', fileName);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Loading state
  if (loading) {
    return (
      <>
        <EHeader />
        <div className="profile-wrapper">
          <div className="profile-container">
            <div className="loading-spinner">Loading profile...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!currentUser) {
    return (
      <>
        <EHeader />
        <div className="profile-wrapper">
          <div className="profile-container">
            <h3>User Profile Not Found</h3>
            <p>The user you're looking for doesn't exist or has been removed.</p>
            <button className="FindTalent-btn-view" onClick={() => navigate('/Job-portal/Employer/FindTalent')}>
              Back to Find Talent
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <EHeader />
      <div className="profile-wrapper">
        <div className="profile-container">
          <button
            className="back-btn"
            onClick={() => navigate('/Job-portal/Employer/Dashboard', {
              state: { targetTab: 'Find Talent' }
            })}
          >
            <span className="back-icon">←</span> Back to Find Talent
          </button>
          <div className="page-header">
            <h1>{currentUser.full_name || currentUser.profile?.fullName}{ currentUser.full_name ? `'s`:''} Profile Overview</h1>
          </div>

          <div className="profile-card-placeholder">
            <ProfileCard user={currentUser} />
          </div>

          <div className="resume-section">
            <h3>Resume</h3>
            <div className="resume-box">
              <div className="resume-info">
                <img src={fileIcon} alt="PDF Icon" className="POverview-Resume-File-icon" />
                <div className="file-details">
                  <p className="file-name">
                    {(currentUser.full_name || currentUser.profile?.fullName || "User")}_Resume.pdf
                  </p>
                  <p className="file-meta">
                    {/* Uploaded on: {currentUser.uploadDate || "24 Oct, 2023"} */}
                    Uploaded on: {currentUser.created_at
                      ? new Date(currentUser.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                      : "24 Oct, 2023"}
                  </p>

                </div>
              </div>
              <div className="file-actions">
                {/* <button className="file-btn-view" onClick={handleViewFile}>View</button> */}
                <button className="file-btn-download" onClick={handleDownloadFile}>Download</button>
              </div>
            </div>
          </div>

          <div className="qualifications-section">
            <div className="dropdown-header" onClick={toggleDropdown}>
              <div>
                <h3>Qualifications</h3>
                <p className="sub-text">View skills and work experience.</p>
              </div>
              <img
                src={Arrow}
                alt="Arrow"
                className={`arrow-icon ${isOpen ? '' : 'rotate'}`}
              />
            </div>

            {isOpen && (
              <div className="dropdown-content">
                <div className="info-block">
                  <div className="block-header"><h4>Education</h4></div>
                  <p>
                    {currentUser.highest_qualification
                      ? currentUser.highest_qualification
                      : "No education details provided"}
                  </p>
                </div>

                <div className="info-block">
                  <div className="block-header"><h4>Skills</h4></div>
                  <ul className="skills-list">
                    {currentUser.skills && currentUser.skills.length > 0 ? (
                      currentUser.skills.map((skill, index) => (
                        <li key={index}>{skill.name || skill}</li>
                      ))
                    ) : (
                      <li>No skills listed</li>
                    )}
                  </ul>
                </div>

                <div className="info-block">
                  <div className="block-header"><h4>Experience</h4></div>
                  <div className="faded-text">
                    {currentUser.experiences && currentUser.experiences.length > 0 ? (
                      currentUser.experiences.map((exp) => (
                        <div key={exp.id}>
                          <strong>{exp.job_title}</strong> at {exp.company_name}
                        </div>
                      ))
                    ) : (
                      "Fresher"
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="ready-to-work">
            <div className="toggle-content"><h4>Ready to work</h4></div>
            <div className="toggle-content">
              <p className="block-header">
                {currentUser.notice_period ||
                  (currentUser.ready_to_start_immediately ? "Immediately" : "Not specified")}
              </p>
            </div>
          </div>

          <div className="footer-text">
            <button className='FindTalent-btn-view' onClick={handleConnect}>
              Chat with {currentUser.full_name || currentUser.profile?.fullName}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

