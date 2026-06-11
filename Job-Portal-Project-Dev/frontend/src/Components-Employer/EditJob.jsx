
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EHeader } from './EHeader';
import { Footer } from '../Components-LandingPage/Footer';
import time from '../assets/opportunity_time.png';
import experience from '../assets/opportunity_bag.png';
import place from '../assets/opportunity_location.png';
import './PostJobForm.css';
import { useJobs } from '../JobContext';
import starIcon from '../assets/Star_icon.png'

export const EditJob = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { editJob } = useJobs();

  // Get the job data from location state
  const jobData = location.state?.jobData || location.state || null;

  console.log('EditJob received data:', jobData);
  console.log('Job Status from backend:', jobData?.job_status);

  // Helper function to safely extract company name
  const getCompanyName = (company) => {
    if (!company) return 'Company';
    if (typeof company === 'string') return company;
    if (typeof company === 'object' && company.name) return company.name;
    if (typeof company === 'object' && company.company_name) return company.company_name;
    return 'Company';
  };

  // Extract all dynamic data from the job with safe parsing
  const jobTitle = jobData?.job_title || jobData?.title || 'Untitled Job';
  const companyName = getCompanyName(jobData?.company_name || jobData?.company);
  const ratings = jobData?.ratings || 4.2;
  const reviewCount = jobData?.review_count || jobData?.reviewNo || 100;
  const duration = jobData?.work_duration || jobData?.duration || 'Not specified';
  const salary = jobData?.salary || 0;
  const experienceYears = jobData?.experience || 'Not specified';
  const locationText = jobData?.location || 'Not specified';
  const workType = jobData?.work_type || jobData?.WorkType || 'Not specified';
  const jobCategory = jobData?.job_category || 'Full-time';
  const logo = jobData?.company.company_logo || null;

  // Tags for display
  const tags = jobData?.tags || [jobCategory];

  // Get current status from job data
  const currentJobStatus = jobData?.job_status || 'Reviewing Application';

  // Map status to type for styling
  const getStatusType = (status) => {
    if (status === 'Hiring in Progress') return 'progress';
    if (status === 'Reviewing Application') return 'reviewing';
    if (status === 'Hiring Done') return 'done';
    return 'reviewing';
  };

  const statusOptions = [
    { text: 'Hiring in Progress', type: 'progress' },
    { text: 'Reviewing Application', type: 'reviewing' },
    { text: 'Hiring Done', type: 'done' }
  ];

  const [selectedStatus, setSelectedStatus] = useState(currentJobStatus);
  const [currentDisplayStatus, setCurrentDisplayStatus] = useState(currentJobStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleSubmit = async () => {
    if (isUpdating) return;

    setIsUpdating(true);

    try {
      console.log('Updating job status to:', selectedStatus);
      console.log('Job ID:', jobData?.id);

      const updateData = {
        job_status: selectedStatus
      };

      console.log('Sending update data:', updateData);

      const result = await editJob(jobData.id, updateData);

      console.log('Update result:', result);

      // Check if update was successful (handle different response formats)
      if (result && (result.success === true || result.status === 'success')) {
        // Update the display status immediately
        setCurrentDisplayStatus(selectedStatus);

        // Also update the jobData object if it's being used elsewhere
        if (jobData) {
          jobData.job_status = selectedStatus;
        }

        alert(`Job status updated to: ${selectedStatus}`);

        // Option 1: Navigate back after delay
        setTimeout(() => {
          navigate('/Job-portal/Employer/Dashboard');
        }, 2000);

        // Option 2: Or stay on page and show success message
        // setIsUpdating(false);
        // alert('Status updated successfully!');

      } else {
        // Extract error message from response
        const errorMsg = result?.error?.job_status?.[0] ||
          result?.error ||
          result?.message ||
          'Failed to update status';
        alert(errorMsg);
        setIsUpdating(false);
      }
    } catch (error) {
      console.error('Error updating status:', error);

      let errorMessage = 'Error updating status';
      if (error.response) {
        console.error('Error response:', error.response.data);
        errorMessage = error.response.data?.error ||
          error.response.data?.message ||
          JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
      setIsUpdating(false);
    }
  };

  if (!jobData) {
    return (
      <>
        <EHeader />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", flexDirection: "column" }}>
          <h2>No Job Data Found</h2>
          <button onClick={() => navigate('/Job-portal/Employer/Dashboard')} style={{ marginTop: "20px", padding: "10px 20px" }}>
            Go Back to Dashboard
          </button>
        </div>
        <Footer />
      </>
    );
  }

  // Safe logo rendering
  const logoContent = logo ?
    (<img src={logo} alt={companyName} className="Opportunities-job-logo" />) :
    (<div className="Opportunities-job-logo-placeholder">
      {companyName && typeof companyName === 'string' && companyName.charAt(0).toUpperCase() || 'C'}
    </div>);

  return (
    <>
      <EHeader />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "100px", minHeight: "80vh", padding: "20px" }}>
        <div>
          <h2>Update Job Status</h2>
          <p style={{ color: "#666", marginTop: "5px" }}>Update the hiring status for: {jobTitle}</p>
        </div>

        <div style={{ width: "50%", minWidth: "300px" }} className="Opportunities-job-card">
          <div className="Opportunities-job-header">
            <div>
              <h3 className="Opportunities-job-title">{jobTitle}</h3>
              <p className="Opportunities-job-company">
                {companyName} <span className="Opportunities-divider">|</span>
                <span className="star"><img src={starIcon} alt="star" /></span> {ratings}
                <span className="Opportunities-divider">|</span>
                <span className="opp-reviews"> {reviewCount} Reviews</span>
              </p>
            </div>
            {logoContent}
          </div>

          <div className="Opportunities-job-details">
            <p className='Opportunities-detail-line'>
              <img src={time} className='card-icons' alt="time" />
              {duration}<span className="Opportunities-divider">|</span>₹ {salary} LPA
            </p>
            <p className='Opportunities-detail-line'>
              <img src={experience} className='card-icons' alt="exp" />
              {experienceYears} years of experience
            </p>
            <p className='Opportunities-detail-line'>
              <img src={place} className='card-icons' alt="loc" />
              <span style={{ wordBreak: 'break-word', flex: 1 }}>
                {(() => {
                  if (Array.isArray(locationText)) {
                    return locationText.join(', ');
                  }
                  if (typeof locationText === 'string') {
                    // If locations are concatenated without separators like "BangaloreHyderabadChennai"
                    if (!locationText.includes(',') && !locationText.includes(' ') && /[A-Z]/.test(locationText)) {
                      // Split by capital letters
                      const splitLocations = locationText.split(/(?=[A-Z])/);
                      return splitLocations.join(', ');
                    }
                    return locationText;
                  }
                  return locationText;
                })()}
              </span>
            </p>
          </div>

          <div className='Opportunities-details-bottom'>
            <div className="Opportunities-job-tags">
              {tags && tags.length > 0 ? (
                tags.map((tag, index) => (
                  <span key={index} className={`Opportunities-job-tag ${tag?.toLowerCase().replace(/\s+/g, '-') || 'tag'}`}>
                    {tag}
                  </span>
                ))
              ) : (
                <span className="Opportunities-job-tag full-time">Full-time</span>
              )}
            </div>
            <div className="Opportunities-job-type">
              {workType}
            </div>
          </div>

          <hr className="Opportunities-separator" />

          <div className='applied-app-status-container' style={{ padding: "15px 0" }}>
            <span className={`applied-application-status status-${getStatusType(currentDisplayStatus)}`}>
              Current Status: {currentDisplayStatus}
            </span>
          </div>
        </div>

        <div style={{ marginTop: "30px", textAlign: "center", width: "50%", minWidth: "300px" }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: "10px" }}>
            Update Job Status:
          </label>
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            disabled={isUpdating}
            style={{
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              width: "100%",
              cursor: isUpdating ? "not-allowed" : "pointer",
              marginBottom: "20px",
              fontSize: "14px",
              backgroundColor: isUpdating ? "#f5f5f5" : "white"
            }}
          >
            {statusOptions.map((opt) => (
              <option key={opt.type} value={opt.text}>
                {opt.text}
              </option>
            ))}
          </select>

          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            style={{
              padding: "12px 30px",
              backgroundColor: isUpdating ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isUpdating ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              transition: "background-color 0.3s"
            }}
            onMouseEnter={(e) => !isUpdating && (e.target.style.backgroundColor = "#0056b3")}
            onMouseLeave={(e) => !isUpdating && (e.target.style.backgroundColor = "#007bff")}
          >
            {isUpdating ? "Updating..." : "Submit Changes"}
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};