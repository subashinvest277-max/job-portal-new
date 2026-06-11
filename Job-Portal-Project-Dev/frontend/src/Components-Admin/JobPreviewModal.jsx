import React from 'react';
import './JobMonitoring.css';
import place from '../assets/opportunity_location.png';
import time from '../assets/opportunity_time.png';
import starIcon from '../assets/Star_icon.png';

export const JobPreviewModal = ({ job, onClose }) => {
  if (!job) return null;

  // Helper function to format date
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  return (
    <div className="job-preview-overlay" onClick={onClose}>
      <div className="job-preview-modal" onClick={(e) => e.stopPropagation()}>
        {/* Sticky Top Bar */}
        <div className="job-preview-top-bar">
          <button className="job-preview-close" onClick={onClose}>
            ✕ Close Preview
          </button>
        </div>

        <div className="job-preview-content">
          {/* 1. Header Card */}
          <div className="job-preview-header-card">
            <div className="job-preview-header-main">
              <div className="job-preview-title-section">
                <h2 className="job-preview-role">{job.role}</h2>
                <div className="job-preview-company-row">
                  <span className="job-preview-company-name">{job.company}</span>
                  <span className="job-preview-rating">4.3 ★</span>
                  <span className="job-preview-reviews">55k+ reviews</span>
                </div>

                <div className="job-preview-meta-grid">
                  <div className="meta-item"><img src={time} className='card-icons' alt="time" /> {job.experience || ''}</div>
                  <div className="meta-item"> {job.salary}LPA</div>
                  <div className="meta-item"><img src={place} className='card-icons' alt="loc" /> {job.location || ''}</div>
                </div>

                <div className="job-preview-tags">
                  <span className="tag-outline">{job.type || ''}</span>
                  {job.shift && <span className="tag-outline">{job.shift} Shift</span>}
                  {job.work_duration && <span className="tag-outline">{job.work_duration}</span>}
                </div>
              </div>
              <div className="job-preview-logo-box">
                {job.logo || job.company_logo || job.logo_url ? (
                  <img
                    src={job.logo || job.company_logo || job.logo_url}
                    className="job-preview-logo-img"
                    alt={`${job.company || 'Company'} logo`}
                    onError={(e) => {
                      // Fallback placeholder fallback behavior if the image link breaks
                      e.target.style.display = 'none';
                      e.target.parentNode.classList.add('use-fallback-text');
                    }}
                  />
                ) : null}
                <span className="job-logo-fallback-text">
                  {job.company?.charAt(0).toUpperCase() || 'J'}
                </span>
              </div>
            </div>

            <div className="job-preview-header-footer">
              <span>Posted: {getTimeAgo(job.created_at || job.date)}</span>
              <span>Openings: {job.openings || 2}</span>
              <span>Applicants: {job.applicants || '100+'}</span>
            </div>
          </div>

          {/* 2. Job Sections */}
          <div className="job-preview-body">
            <section className="job-preview-section">
              <h3 className="section-title">Job highlights</h3>
              <ul className="job-preview-list">
                {job.job_highlights && job.job_highlights.length > 0 ? (
                  job.job_highlights.map((highlight, index) => (
                    <li key={index}>{highlight}</li>
                  ))
                ) : (
                  <>
                    <li>Candidates With {job.experience || 'Relevant'} Experience Preferred.</li>
                    <li>Proven Work Experience As A {job.role} Or In A Similar Role.</li>
                    <li>Strong Communication Skills</li>
                  </>
                )}
              </ul>
            </section>

            <section className="job-preview-section">
              <h3 className="section-title">Job description</h3>
              <p className="job-preview-text">
                {job.job_description || `We Are Looking For A Talented ${job.role} To Join Our Growing Team. The Ideal Candidate Should Have A Strong Portfolio Showcasing User-Centric Design Solutions.`}
              </p>
            </section>

            <section className="job-preview-section">
              <h3 className="section-title">Responsibilities</h3>
              <ul className="job-preview-list">
                {job.responsibilities && job.responsibilities.length > 0 ? (
                  job.responsibilities.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))
                ) : (
                  <li>Collaborate with cross-functional teams to define and implement innovative solutions.</li>
                )}
              </ul>
            </section>

            {/* Optional: Education Section */}
            {/* {job.education && job.education.length > 0 && (
              <section className="job-preview-section">
                <h3 className="section-title">Education Required</h3>
                <ul className="job-preview-list">
                  {job.education.map((edu, index) => (
                    <li key={index}>{edu}</li>
                  ))}
                </ul>
              </section>
            )} */}

            <section className="job-preview-section">
              <h3 className="section-title">Key Skills</h3>
              <div className="job-preview-skills-cloud">
                {(job.skills && job.skills.length > 0 ? job.skills : ['Figma', 'Wireframing', 'UI Design']).map((skill, index) => (
                  <span key={index} className="skill-chip">{skill}</span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};