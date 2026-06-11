import React, { useState, useEffect } from 'react'
import starIcon from '../assets/Star_icon.png'
import time from '../assets/opportunity_time.png'
import experience from '../assets/opportunity_bag.png'
import place from '../assets/opportunity_location.png'
import breifcase from '../assets/header_case.png';
import { Header } from '../Components-LandingPage/Header'
import twitter from '../assets/socials-x.png'
import linkedin from '../assets/socials-linkedin.png'
import facebook from '../assets/socials-facebook.png'
import './AppliedJobsOverview.css'
import { useNavigate, useParams } from 'react-router-dom'
import { useJobs } from '../JobContext'
import { Stepper, Step, StepLabel, StepConnector, Typography, Box } from '@mui/material'
import { styled } from '@mui/material/styles';
import api from "../api/axios";

const AnimatedConnector = styled(StepConnector)(({ theme }) => ({
  '& .MuiStepConnector-line': {
    borderColor: '#eaeaf0',
    borderLeftWidth: 3,
    minHeight: 40,
    transition: 'border-color 1.50s ease-in',
  },
  '&.Mui-active .MuiStepConnector-line': {
    borderColor: '#1976d2',

  },
  '&.Mui-completed .MuiStepConnector-line': {
    borderColor: '#1976d2',
  },
}));

export const AppliedJobsOverview = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const { setAppliedJobs, refreshAppliedJobs } = useJobs();

  const [appliedJob, setAppliedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(-1);

  // Fetch application by ID
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await api.get(`/jobs/applications/${id}/`);
        setAppliedJob(res.data);
      } catch (err) {
        console.error("Error fetching application:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  // Withdraw
  const withdrawApplication = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to withdraw this application?"
    );
    if (!confirmed) return;

    try {
      await api.patch(`/jobs/applications/${appliedJob.id}/withdraw/`);
      // Update local page state
      setAppliedJob(prev => ({
        ...prev,
        status: "withdrawn"
      }));

      // Refresh applied jobs in context
      await refreshAppliedJobs();

      alert("Application withdrawn successfully");
      navigate("/Job-portal/jobseeker");
    } catch (err) {
      console.error(err);
      alert("Failed to withdraw application");
    }
  };

  // Stepper logic
  const statusOrder = [
    "applied",
    "resume_screening",
    "recruiter_review",
    "shortlisted",
    "interview_called",
  ];

  useEffect(() => {
    if (!appliedJob?.status) return;

    const index = statusOrder.indexOf(appliedJob.status);
    setActiveStep(index === -1 ? 0 : index);
  }, [appliedJob]);

  // Loading guards
  if (loading) return <p>Loading...</p>;
  if (!appliedJob) return <p>Application not found</p>;

  const job = appliedJob.job;

  const formatLocation = (location) => {

    if (!location) return "Location not specified";

    if (Array.isArray(location)) {
      return location.join(", ");
    }
    return location;
  };

  const locationDisplay = formatLocation(job.location);

  const viewJob = {
    title: job.job_title,
    company: job.company?.company_name || "Company",
    ratings: job.company?.rating || 0,
    reviewNo: job.company?.review_count || 0,
    WorkType: job.work_type,
    experience: job.experience,
    salary: job.salary,
    location: locationDisplay,
    logo: job.company.logo || job.company.company_logo,
    tags: job.job_category || "",
    JobHighlights: job.job_highlights || [],
    Responsibilities: job.responsibilities || [],
    KeySkills: job.key_skills || [],
    jobDescription: job.job_description,
    companyOverview: job.company?.about || "",
    status: {
      type: appliedJob.job.job_status.toLowerCase(),
      text: appliedJob.job.job_status
        .replace(/_/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase()),
    },
  };


  const applicationStatus = [
    {
      label: 'Application Submitted',
      sub: "Your profile, resume, and cover letter have successfully entered the company's database."
    },
    {
      label: 'Resume Screening',
      sub: "Your resume is currently being reviewed."
    },
    {
      label: 'Recruiter Review',
      sub: "A hiring manager reviews your experience."
    },
    {
      label: 'Shortlisted',
      sub: "You have passed the initial review stages."
    },
    {
      label: 'Interview Called',
      sub: "The hiring team has reached out to you."
    },
  ];

  return (

    <div >
      <Header />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }} className='appliedjobsO-job-card'>
        <div >
          <div className="myjobs-card-header">
            <div><h2 className="myjobs-job-title">{viewJob.title}</h2></div>

          </div>
          <div style={{ marginTop: "20px" }} className="myjobs-company-sub">
            <p className="myjobs-company-name"> {viewJob.company} <span className="Opportunities-divider">|</span><span className="star"><img src={starIcon} /></span> {viewJob.ratings}<span className="Opportunities-divider">|</span><span>{viewJob.reviewNo}</span></p>
          </div>
          <div style={{ marginTop: "20px" }} className="Opportunities-job-details">
            <p className='Opportunities-detail-line'><img src={time} className='card-icons' />{viewJob.WorkType} <span className="Opportunities-divider">|</span> <span>{viewJob.salary}</span><span className="Opportunities-divider">|</span> <img src={experience} className='card-icons' />{viewJob.experience} years of experience <span className="Opportunities-divider">|</span><img src={place} className='card-icons' /> Coimbatore </p>
          </div>
          <div style={{ marginTop: "20px", alignItems: "center", display: "flex", justifyContent: "space-between" }} className="Applied-job-tags">
            {viewJob.tags && (
              <div>
                <span className={`Opportunities-job-tag ${viewJob.tags?.toLowerCase()}`}>
                  {viewJob.tags}
                </span>
              </div>
            )}
            <span className={`applied-application-status status-${viewJob.status.type}`}>
              {viewJob.status.text}
            </span>
          </div>
          <hr className="Opportunities-separator" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "end", paddingRight: "50px" }}>

          {viewJob.logo ? (
            <img
              width={150}
              style={{ marginTop: "50px" }}
              src={viewJob.logo}
              alt={viewJob.company}
            />
          ) : (
            <div className="Opportunities-job-logo-placeholder">
              {viewJob.company.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div className='AppliedJobs-overview-main'>
        <div className='opp-job-main'>
          <div className="opp-job-details-card">
            {/* Job Highlights */}
            <div className="opp-job-highlights">
              <h3>Job Highlights</h3>
              <ul>
                {viewJob.JobHighlights.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <h3>Company Overview</h3>
            <p>{viewJob.companyOverview}</p>


            <h3>Job Description</h3>
            <p>
              {viewJob.jobDescription}
            </p>

            <h3>Responsibilities</h3>
            <ul>
              {viewJob.Responsibilities.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <h3>Key Details:</h3>
            <p><strong>Role:</strong> {viewJob.title}</p>
            <p><strong>Job Type:</strong> {viewJob.WorkType}</p>
            <p><strong>Location:</strong> {viewJob.location}</p>
            <p><strong>Experience:</strong> {viewJob.experience}</p>
            <p><strong>Salary:</strong> {viewJob.salary}</p>

            <h3>Key Skills</h3>
            <div className="opp-key-skills-container">
              {viewJob.KeySkills.map((item, i) => (
                <span key={i}>{item}</span>
              ))}
            </div>

            <hr className="Opportunities-separator" />

            <div className="opp-share-job">
              <div>
                <p>Share This job</p>
                <div className='opp-socials'>
                  <div><img src={linkedin} className='opp-socials-icon' title='LinkedIn' alt="linkedin" /></div>
                  <div><img src={facebook} className='opp-socials-icon' title='Facebook' alt="facebook" /></div>
                  <div><img src={twitter} className='opp-socials-icon' title='Twitter' alt="twitter" /></div>
                </div>
              </div>
              <button onClick={() => navigate(`/Job-portal/jobseeker/ReportAJob/${job.id}`)} className="opp-report-btn">Report this job</button>
            </div>
          </div>
        </div>
        <div className="status-container">
          <div className="status-header">
            <img src={breifcase} className='card-icons' />
            <h3>Application status</h3>
          </div>

          <Box sx={{ width: '100%' }}>
            <Stepper
              orientation="vertical"
              activeStep={activeStep}
              connector={<AnimatedConnector />}
            >
              {applicationStatus.map((step, index) => (
                <Step key={index}>
                  <StepLabel
                    optional={
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                        {step.sub}
                      </Typography>
                    }
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontWeight: index <= activeStep ? 700 : 400,
                        color: index <= activeStep ? '#1976d2' : 'inherit',
                        transition: 'color 1.50s ease'
                      }
                    }}
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          {appliedJob.status?.toLowerCase() === "applied" && (
            <button
              style={{
                border: "none",
                outline: "none",
                marginTop: "50px",
                padding: "10px 20px",
                borderRadius: "10px",
                background: "#d32f2f",
                color: "white",
                cursor: "pointer",
              }}
              onClick={withdrawApplication}
            >
              Withdraw
            </button>
          )}

        </div>
        {appliedJob.status?.toLowerCase() !== "applied" && (
          <p style={{ color: "gray", fontSize: "12px" }}>
            Withdrawal not allowed after screening
          </p>
        )}

      </div>
    </div>

  );
};