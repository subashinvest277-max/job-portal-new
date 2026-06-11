import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PostAJob from '../assets/Employer/PostAJob.png';
import time from '../assets/opportunity_time.png';
import experience from '../assets/opportunity_bag.png';
import place from '../assets/opportunity_location.png';
import twitterIcon from '../assets/socials-x.png';
import linkedinIcon from '../assets/socials-linkedin.png';
import facebookIcon from '../assets/socials-facebook.png';
import starIcon from '../assets/Star_icon.png';
import './PostJobPreview.css';
import { EHeader } from './EHeader';
import { Footer } from '../Components-LandingPage/Footer';
import { useJobs } from '../JobContext';
import api from '../api/axios';

export const PostJobPreview = () => {
  const { state } = useLocation();
  const { postJob, editJob, currentEmployer } = useJobs();
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState('preview');

  // Highlight popup states
  const [showHighlightPopup, setShowHighlightPopup] = useState(false);
  const [highlightLimit, setHighlightLimit] = useState(null);
  const [limitExceeded, setLimitExceeded] = useState(false);
  const [limitLoading, setLimitLoading] = useState(false);
  const [noPlan, setNoPlan] = useState(false);

  // ================= HELPERS =================

  const getSelectedLabels = (val) => {
    if (!val) return [];
    if (typeof val === 'object' && !Array.isArray(val)) {
      return Object.keys(val)
        .filter(key => val[key])
        .map(key => key.charAt(0).toUpperCase() + key.slice(1));
    }
    if (Array.isArray(val)) return val;
    return [val];
  };

  const formatDisplay = (val) => {
    const labels = getSelectedLabels(val);
    return labels.length > 0 ? labels.join(', ') : 'Not specified';
  };

  // Extract the most meaningful error message from a backend error response
  const extractErrorMessage = (error) => {
    if (!error) return "Something went wrong. Please try again.";

    const data = error?.response?.data;

    if (!data) {
      if (error.message === 'Network Error') {
        return "Network error. Please check your internet connection and try again.";
      }
      return error.message || "Something went wrong. Please try again.";
    }

    // Backend returned a plain string
    if (typeof data === 'string') return data;

    // Common DRF error fields
    if (data.error) return data.error;
    if (data.detail) return data.detail;
    if (data.message) return data.message;

    // Non field errors array
    if (data.non_field_errors && data.non_field_errors.length > 0) {
      return data.non_field_errors[0];
    }

    // Field-level errors — pick first one
    const firstKey = Object.keys(data)[0];
    if (firstKey) {
      const val = data[firstKey];
      if (Array.isArray(val)) return `${firstKey}: ${val[0]}`;
      if (typeof val === 'string') return `${firstKey}: ${val}`;
    }

    return "Something went wrong. Please try again.";
  };

  const job = state ? {
    job_title: state.job_title,
    company: currentEmployer?.company || "Company",
    companyId: currentEmployer?.companyId,
    ratings: 4.2,
    reviewNo: 100,
    logo: currentEmployer?.companyLogo,
    work_duration: state.work_duration,
    salary: state.salary,
    experience: state.experience,
    location: state.location,
    shift: formatDisplay(state.shift),
    work_type: state.work_type,
    job_category: state.job_category,
    posted: new Date().toISOString(),
    openings: state.openings,
    applicants: 0,
    job_highlights: state.job_highlights,
    responsibilities: state.responsibilities,
    key_skills: state.key_skills,
    industry_type: state.industry_type,
    department: state.department,
    education: state.education,
    job_description: state.job_description,
    companyOverview: currentEmployer?.companyOverview,
  } : null;

  // ================= POPUP HANDLERS =================

  // Reset all highlight states fresh every time popup opens
  const handlePostClick = () => {
    setShowHighlightPopup(true);
    setLimitExceeded(false);
    setNoPlan(false);
    setHighlightLimit(null);
    setLimitLoading(false);
  };

  // Close popup and reset all states
  const handleClosePopup = () => {
    setShowHighlightPopup(false);
    setLimitExceeded(false);
    setNoPlan(false);
    setHighlightLimit(null);
    setLimitLoading(false);
  };

  // ================= HIGHLIGHT LIMIT CHECK =================

  const handleYesHighlight = async () => {
    setLimitLoading(true);

    try {
      const res = await api.get('/jobs/highlight-limit/');
      const limit = res.data;

      console.log("Highlight Limit Response:", limit);
      setHighlightLimit(limit);

      // Case 1: No active subscription plan at all
      if (!limit.total || limit.total === 0) {
        setNoPlan(true);
        setLimitExceeded(true);
        setLimitLoading(false);
        return;
      }

      // Case 2: Plan exists but all highlights used up
      if (limit.used >= limit.total) {
        setLimitExceeded(true);
        setLimitLoading(false);
        return;
      }

      // Case 3: Highlights available — proceed
      setShowHighlightPopup(false);
      handleFinalPost(true);

    } catch (err) {
      console.error("Failed to fetch highlight limit:", err);
      setLimitLoading(false);

      const errMsg = extractErrorMessage(err);

      // API failed — give user option to still post without highlight
      const proceed = window.confirm(
        `Could not verify highlight limit.\n(${errMsg})\n\nDo you want to post this job without highlight instead?`
      );

      if (proceed) {
        setShowHighlightPopup(false);
        handleFinalPost(false);
      }
      // If user cancels — popup stays open so they can retry
    }
  };

  // ================= FINAL POST HANDLER =================

  const handleFinalPost = async (withHighlight = false) => {
    setShowHighlightPopup(false);
    setStep('loading');

    try {
      const formattedData = {
        ...state,
        industry_type: Array.isArray(state.industry_type)
          ? state.industry_type
          : state.industry_type ? [state.industry_type] : [],
        department: Array.isArray(state.department)
          ? state.department
          : state.department ? [state.department] : [],
        education: Array.isArray(state.education)
          ? state.education
          : state.education ? [state.education] : [],
        key_skills: Array.isArray(state.key_skills)
          ? state.key_skills
          : state.key_skills?.split(',').map(s => s.trim()) || [],
        job_highlights: Array.isArray(state.job_highlights)
          ? state.job_highlights
          : state.job_highlights?.split(',').map(h => h.trim()) || [],
        responsibilities: Array.isArray(state.responsibilities)
          ? state.responsibilities
          : state.responsibilities?.split(',').map(r => r.trim()) || [],
        shift: Array.isArray(state.shift) ? state.shift[0] : state.shift,
      };

      // ── EDIT flow ──
      if (state.id) {
        try {
          await editJob(state.id, formattedData);
          setStep('success');
          setTimeout(() => {
            alert("Job updated successfully!");
            navigate('/Job-portal/Employer/Dashboard');
          }, 2000);
        } catch (editError) {
          console.error("Edit job failed:", editError);
          setStep('preview');
          const msg = extractErrorMessage(editError);
          alert(`Failed to update job: ${msg}`);
        }
        return;
      }

      // ── CREATE flow ──
      // postJob in JobContext catches internally and returns { success, error }
      const res = await postJob({ ...formattedData, is_highlighted: withHighlight });

      if (res && res.success === true) {
        setStep('success');
        setTimeout(() => {
          alert("Your job has been submitted successfully and is pending admin approval.");
          navigate('/Job-portal/Employer/Dashboard');
        }, 2000);
      } else {
        // postJob returned success: false
        setStep('preview');
        const msg = res?.error || "Job could not be posted. Please try again.";
        alert(msg);
      }

    } catch (error) {
      // Catches any unexpected throw not already handled
      console.error("Unexpected error in handleFinalPost:", error);
      setStep('preview');
      const msg = extractErrorMessage(error);
      alert(msg);
    }
  };

  // ================= RENDER GUARDS =================

  if (!state || !job) {
    return (
      <>
        <EHeader />
        <div
          className="jobpost-previous-error-screen"
          style={{ padding: "50px", textAlign: "center" }}
        >
          <h2>No job data found</h2>
          <button
            className="jobpost-previous-btn-cancel"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
        <Footer />
      </>
    );
  }

  if (step === 'loading' || step === 'success') {
    return (
      <>
        <EHeader />
        <div className="jobpost-previous-status-container">
          {step === 'loading' ? (
            <div className="jobpost-previous-success-msg">
              <div className="jobpost-previous-loader"></div>
              <p className="jobpost-previous-success-title">Posting your job...</p>
            </div>
          ) : (
            <div className="jobpost-previous-success-msg">
              <img
                src={PostAJob}
                alt="Post Success"
                className="jobpost-previous-success-hero-img"
              />
              <h2 className="jobpost-previous-success-title">
                Job Posted Successfully for the position
              </h2>
              <p className="jobpost-previous-success-subtitle">{state.job_title}</p>
            </div>
          )}
        </div>
        <Footer />
      </>
    );
  }

  // ================= POPUP CONTENT HELPERS =================

  const popupTitle = () => {
    if (noPlan) return 'No Active Plan';
    if (limitExceeded) return 'Highlight Limit Reached';
    return 'Highlight this Job?';
  };

  const popupSubtitle = () => {
    if (noPlan) return 'You need an active subscription plan to use the highlight feature.';
    if (limitExceeded) return 'You have used all available highlights on your current plan.';
    return 'Highlighted jobs appear at the top of search results and get more visibility.';
  };

  // ================= MAIN RENDER =================

  return (
    <>
      <EHeader />
      <div className='jobpost-overview-content'>
        <div className='search-backbtn-container'>
          <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
          <header className="jobpost-previous-preview-header">
            <h1>Preview Job</h1>
          </header>
        </div>

        <main className="jobpost-overview-main">
          <div className="jobpost-job-main">

            {/* ── Left card ── */}
            <div className="opp-job-main">
              <div className="opp-overview-job-card">
                <div className="Opportunities-job-header">
                  <div>
                    <h2 className="opp-topcard-job-title">{job.job_title}</h2>
                    {job.is_highlighted && (
                      <div className="highlight-badge">Featured Job</div>
                    )}
                    <h5 className="Opportunities-job-company">
                      {job.company}{' '}
                      <span className="Opportunities-divider">|</span>
                      <span className="star">
                        <img src={starIcon} alt="star" />
                      </span>{' '}
                      {job.ratings}
                      <span className="Opportunities-divider">|</span>
                      <span className="opp-reviews"> {job.reviewNo} Reviews</span>
                    </h5>
                  </div>
                  {job.logo
                    ? <img src={job.logo} alt={job.company} className="Opportunities-job-logo" />
                    : (
                      <div className="Opportunities-job-logo-placeholder">
                        {job.company?.charAt(0).toUpperCase()}
                      </div>
                    )
                  }
                </div>

                <div className="Opportunities-job-details">
                  <p className='Opportunities-detail-line'>
                    <img src={time} className='card-icons' alt="time" />
                    {job.work_duration}
                    <span className="Opportunities-divider">|</span>
                    ₹ {job.salary} Lpa
                  </p>
                  <p className='Opportunities-detail-line'>
                    <img src={experience} className='card-icons' alt="exp" />
                    {job.experience} years of experience
                  </p>
                  <p className='Opportunities-detail-line'>
                    <img src={place} className='card-icons' alt="loc" />
                    {Array.isArray(job.location) ? job.location.join(", ") : job.location}
                  </p>
                </div>

                <div className='Opportunities-details-bottom'>
                  <div className="Opportunities-job-tags">
                    {getSelectedLabels(state.job_category).map((tag, index) => (
                      <span
                        key={index}
                        className={`Opportunities-job-tag ${tag.toLowerCase()}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="Opportunities-job-type">
                    {getSelectedLabels(state.work_type).join(', ') || 'Not specified'}
                  </div>
                </div>

                <hr className="Opportunities-separator" />

                <div className="Opportunities-job-footer">
                  <div className="Opportunities-job-meta1">
                    <p>
                      Just Now{' '}
                      <span className="Opportunities-divider">|</span>{' '}
                      Openings: {job.openings}{' '}
                      <span className="Opportunities-divider">|</span>{' '}
                      Applicants: {job.applicants}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right detail card ── */}
            <div className="opp-job-details-card">
              <div className="opp-job-highlights">
                <h4>Job highlights</h4>
                <ul>
                  {job.job_highlights?.filter(h => h && h.trim() !== "").map((highlight, i) => (
                    <li key={i}>{highlight}</li>
                  ))}
                  {(!job.job_highlights ||
                    job.job_highlights.length === 0 ||
                    job.job_highlights[0] === "") && (
                      <li>No specific highlights added.</li>
                    )}
                </ul>
              </div>

              <div className="jobpost-previous-section-block">
                <h4>Company Overview — {job.company}</h4>
                <p className="jobpost-previous-description-text">
                  {job.companyOverview || "No company overview available."}
                </p>
              </div>

              <div className="jobpost-previous-section-block">
                <h4>Job description</h4>
                <p className="jobpost-previous-description-text">
                  {state.job_description || "No description provided."}
                </p>
              </div>

              <div className="jobpost-previous-section-block">
                <h4>Responsibilities</h4>
                <ul className="jobpost-previous-description-list">
                  {job.responsibilities?.filter(r => r && r.trim() !== "").map((res, i) => (
                    <li key={i}>{res}</li>
                  ))}
                  {(!job.responsibilities ||
                    job.responsibilities.length === 0 ||
                    job.responsibilities[0] === "") && (
                      <li>Refer to job description.</li>
                    )}
                </ul>
              </div>

              <h4>Key Details:</h4>
              <div className="jobpost-previous-meta-info-grid">
                <p><strong>Role:</strong> {formatDisplay(job.job_title)}</p>
                <p><strong>Industry Type:</strong> {formatDisplay(state.industry_type)}</p>
                <p><strong>Department:</strong> {formatDisplay(state.department)}</p>
                <p><strong>Job Type:</strong> {formatDisplay(job.work_type)}</p>
                <p><strong>Experience level:</strong> {job.experience} years</p>
                <p>
                  <strong>Location:</strong>{' '}
                  {Array.isArray(job.location) ? job.location.join(", ") : job.location}
                </p>
                <p><strong>Shift:</strong> {job.shift}</p>
                <p><strong>Education:</strong> {formatDisplay(state.education)}</p>
              </div>

              <div className="jobpost-previous-skills-section">
                <h4>Key Skills</h4>
                <div className="jobpost-previous-skills-container">
                  {job.key_skills?.length > 0 ? (
                    job.key_skills.map((skill, i) => (
                      <span key={i} className="jobpost-previous-skill-pill">{skill}</span>
                    ))
                  ) : (
                    <span className="jobpost-previous-skill-pill">Not specified</span>
                  )}
                </div>
              </div>

              <div className="jobpost-previous-footer-actions">
                <div className="jobpost-previous-social-sharing">
                  <span>Share this job:</span>
                  <div
                    className="jobpost-previous-social-icons"
                    style={{ display: 'flex', gap: '10px', marginTop: '5px' }}
                  >
                    <img src={linkedinIcon} alt="linkedin" className="jobpost-previous-icon-in" />
                    <img src={facebookIcon} alt="facebook" className="jobpost-previous-icon-fb" />
                    <img src={twitterIcon} alt="twitter" className="jobpost-previous-icon-x" />
                  </div>
                </div>
                <div className="jobpost-previous-btn-group">
                  <button
                    className="jobpost-previous-btn-cancel"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </button>
                  <button
                    className="jobpost-previous-btn-post"
                    onClick={handlePostClick}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* ================= HIGHLIGHT POPUP ================= */}
      {showHighlightPopup && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '32px',
            maxWidth: '420px', width: '90%', textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>

            {/* Icon changes based on state */}
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>
              {noPlan ? '🚫' : limitExceeded ? '⚠️' : '⭐'}
            </div>

            {/* Title */}
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#1e293b' }}>
              {popupTitle()}
            </h3>

            {/* Subtitle */}
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 16px' }}>
              {popupSubtitle()}
            </p>

            {/* ── Info box: No plan ── */}
            {noPlan && (
              <div style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '20px',
                fontSize: '13px',
                color: '#92400e',
                textAlign: 'left',
                lineHeight: '1.8'
              }}>
                <p style={{ margin: '0 0 6px', fontWeight: 600 }}>
                  No active subscription found
                </p>
                <p style={{ margin: 0, fontSize: '12px' }}>
                  Subscribe to a plan to unlock job highlighting.
                  You can still post this job without the highlight feature.
                </p>
              </div>
            )}

            {/* ── Info box: Has plan but limit used up ── */}
            {limitExceeded && !noPlan && highlightLimit && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '20px',
                fontSize: '13px',
                color: '#dc2626',
                textAlign: 'left',
                lineHeight: '1.8'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><strong>Plan:</strong></span>
                  <span>{highlightLimit.plan}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><strong>Total Highlights:</strong></span>
                  <span>{highlightLimit.total}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><strong>Used:</strong></span>
                  <span>{highlightLimit.used}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><strong>Remaining:</strong></span>
                  <span style={{ fontWeight: 700, color: '#b91c1c' }}>
                    {highlightLimit.remaining}
                  </span>
                </div>
                <div style={{
                  marginTop: '10px',
                  paddingTop: '10px',
                  borderTop: '1px solid #fca5a5',
                  fontSize: '12px',
                  color: '#b91c1c'
                }}>
                  ⚠️ You can still post this job without the highlight feature.
                </div>
              </div>
            )}

            {/* ── Buttons ── */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>

              {/* Limit exceeded OR no plan → Cancel + Post Without Highlight */}
              {limitExceeded ? (
                <>
                  <button
                    onClick={handleClosePopup}
                    style={{
                      padding: '10px 20px', borderRadius: '8px',
                      border: '1px solid #e2e8f0', background: '#f8fafc',
                      color: '#475569', cursor: 'pointer', fontSize: '14px',
                      fontWeight: 500
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => handleFinalPost(false)}
                    style={{
                      padding: '10px 20px', borderRadius: '8px', border: 'none',
                      background: '#007bff', color: '#fff',
                      cursor: 'pointer', fontSize: '14px', fontWeight: 600
                    }}
                  >
                    Post Without Highlight
                  </button>
                </>
              ) : (
                /* Normal state → No + Yes Highlight */
                <>
                  <button
                    onClick={() => handleFinalPost(false)}
                    disabled={limitLoading}
                    style={{
                      padding: '10px 20px', borderRadius: '8px',
                      border: '1px solid #e2e8f0', background: '#f8fafc',
                      color: limitLoading ? '#cbd5e1' : '#475569',
                      cursor: limitLoading ? 'not-allowed' : 'pointer',
                      fontSize: '14px', fontWeight: 500
                    }}
                  >
                    No
                  </button>

                  <button
                    onClick={handleYesHighlight}
                    disabled={limitLoading}
                    style={{
                      padding: '10px 20px', borderRadius: '8px', border: 'none',
                      background: limitLoading ? '#e2e8f0' : '#007bff',
                      color: limitLoading ? '#94a3b8' : '#fff',
                      cursor: limitLoading ? 'not-allowed' : 'pointer',
                      fontSize: '14px', fontWeight: 600,
                      transition: 'background 0.2s'
                    }}
                  >
                    {limitLoading ? 'Checking...' : 'Yes, Highlight'}
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};