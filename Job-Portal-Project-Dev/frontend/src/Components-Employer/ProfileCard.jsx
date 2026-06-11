
import React from 'react';
import './ProfileCard.css'; 
import call from '../assets/Employer/Call.png'
import Mail from '../assets/Employer/EMail.png'
import Location from '../assets/Employer/Location.png'
import home from "../assets/home_icon.png"

import { useNavigate } from 'react-router-dom';

export const ProfileCard = ({ user, showActions = false }) => {
  const navigate = useNavigate();
  
  if (!user) return null;

  // Debug log to see user structure
  console.log("ProfileCard - user data:", {
    id: user.id,
    full_name: user.full_name,
    current_job_title: user.current_job_title,
    email: user.email,
    skills: user.skills,
    languages: user.languages,
    educations: user.educations
  });

  // Extract user data based on your backend structure
  const userId = user.id;
  const fullName = user.full_name || user.profile?.full_name || "Unknown User";
  const jobTitle = user.current_job_title || user.profile?.current_job_title || "Not specified";
  
  // Calculate experience
  let experience = "Fresher";
  let expNumber = 0;
  
  if (user.total_experience_years !== undefined) {
    expNumber = parseFloat(user.total_experience_years);
    experience = expNumber > 0 ? `${expNumber} years` : "Fresher";
  } else if (user.profile?.total_experience_years) {
    expNumber = parseFloat(user.profile.total_experience_years);
    experience = expNumber > 0 ? `${expNumber} years` : "Fresher";
  }

  // Extract contact information
  const email = user.email || user.user?.email || user.profile?.user?.email || "Not provided";
  const phone = user.phone || user.user?.phone || user.profile?.user?.phone || "Not provided";
  
  // Extract location
  const location = user.current_location || user.profile?.current_location || "";
  const city = user.city || user.profile?.city || "";
  const state = user.state || user.profile?.state || "";
  
  // Format location string
  let locationString = "Location not specified";
  if (location) {
    locationString = location;
  } else if (city && state) {
    locationString = `${city}, ${state}`;
  } else if (city) {
    locationString = city;
  } else if (state) {
    locationString = state;
  }

  // Get initials for avatar
  const nameArray = fullName.trim().split(" ");
  const initials = nameArray.length > 1 
    ? (nameArray[0][0] + nameArray[nameArray.length - 1][0]).toUpperCase()
    : (nameArray[0]?.[0] || "U").toUpperCase();

  // Calculate when resume was updated (mock for now - you can add this to your backend)
  const getResumeUpdateText = () => {
    if (user.resume_file || user.profile?.resume_file) {
      return "Resume available";
    }
    return "No resume uploaded";
  };

  // Handle view profile
  const handleViewProfile = () => {
    if (userId) {
      navigate(`/Job-portal/Employer/FindTalent/ProfileOverview/${userId}`);
    }
  };

  return (
    <div className="FindTalent-profile-card-container">
      <div className="FindTalent-card-header">
        <div className="FindTalent-name-and-title">
          <h1 className="FindTalent-name">{fullName}</h1> 
          <p className="FindTalent-job-title">
            {jobTitle} • {experience}
          </p>
        </div>
        
        <div className="FindTalent-profile-image-container">
          <span className="FindTalent-profile-initials">{initials}</span>
        </div>
      </div>

      <div className="FindTalent-contact-info-container">
        
        <div className="FindTalent-contact-item">
          <img src={Mail} alt="Email" className="FindTalent-info-icon" />
          <span>{email}</span> 
        </div>
        
        <div className="FindTalent-contact-item">
          <img src={call} alt="Phone" className="FindTalent-info-icon" /> 
          <span>{phone}</span> 
        </div>
        
        <div className="FindTalent-contact-item">
          <img src={Location} alt="Location" className="FindTalent-info-icon" /> 
          <span>{locationString}</span> 
        </div>
      </div>

      {/* Skills section - optional, can be added if you want to show skills */}
      {/* {user.skills && user.skills.length > 0 && (
        <div className="FindTalent-skills-container">
          <p className="FindTalent-skills-label">Skills:</p>
          <div className="FindTalent-skills-list">
            {user.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="FindTalent-skill-tag">
                {skill.name || skill}
              </span>
            ))}
            {user.skills.length > 3 && (
              <span className="FindTalent-skill-tag more">
                +{user.skills.length - 3}
              </span>
            )}
          </div>
        </div>
      )} */}
      
      {showActions && (
        <div className="FindTalent-card-bottom">
          <p className="FindTalent-timestamp">{getResumeUpdateText()}</p>
          <div className="FindTalent-actions">
            <button 
              onClick={handleViewProfile} 
              className="FindTalent-btn-view"
            >
              View profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};