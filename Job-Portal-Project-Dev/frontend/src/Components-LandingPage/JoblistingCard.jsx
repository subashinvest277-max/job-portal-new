import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Joblisting.css';
 
export const JoblistingCard = ({ job }) => {
  const navigate = useNavigate();
  const [showLoginPopup, setShowLoginPopup] = useState(false);
 
  const title = job.job_title || job.title;
  const companyName = job.company?.company_name || job.company;
  const type = job.job_type || job.type;
  const tags = job.tags || [];
 
  const redirectPath = `/Job-portal/jobseeker/OpportunityOverview/${job.id}`;
 
  const handleOpenPopup = () => {
    const isLoggedIn =
      !!sessionStorage.getItem("access") &&
      sessionStorage.getItem("userRole") === "jobseeker";
 
    if (isLoggedIn) {
      navigate(redirectPath);
      return;
    }
 
    setShowLoginPopup(true);
  };
 
  const handleClosePopup = () => {
    setShowLoginPopup(false);
  };
 
  const handleLoginClick = () => {
    setShowLoginPopup(false);
    navigate("/Job-portal/jobseeker/login", {
      state: { redirectTo: redirectPath }
    });
  };
 
  const handleSignupClick = () => {
    setShowLoginPopup(false);
    navigate("/Job-portal/jobseeker/signup", {
      state: { redirectTo: redirectPath }
    });
  };

  const formatLocation = (location) => {

        if (!location) return "Location not specified";

        if (Array.isArray(location)) {
            return location.join(", ");
        }
        return location;
    };

    const locationDisplay = formatLocation(job.location);
 
  return (
    <>
      <div className="joblisting-card">
        <h3 className="joblisting-card-title">{title}</h3>
 
        <p className="joblisting-card-company">
          {companyName} • {locationDisplay}
        </p>
 
        <p className="joblisting-card-type">{type}</p>
 
        <div className="joblisting-card-tags">
          {tags.map((tag, index) => (
            <span key={index} className="joblisting-card-tag">
              {tag}
            </span>
          ))}
        </div>
 
        <button
          className="view-joblisting-button"
          onClick={handleOpenPopup}
        >
          View details
        </button>
      </div>
 
      {showLoginPopup && (
        <div className="login-popup-overlay" onClick={handleClosePopup}>
          <div
            className="login-popup-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Login or sign up to view job details</h3>
 
            <div className="login-popup-actions">
              <button
                className="login-popup-login-btn"
                onClick={handleLoginClick}
              >
                Login
              </button>
 
              <button
                className="login-popup-signup-btn"
                onClick={handleSignupClick}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};