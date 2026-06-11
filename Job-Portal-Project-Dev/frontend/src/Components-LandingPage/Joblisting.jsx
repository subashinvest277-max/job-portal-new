import React, { useEffect, useState } from 'react';
import './Joblisting.css';
import { JoblistingCard } from './JoblistingCard';
import { useJobs } from "../JobContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
 
export const Joblisting = () => {
  const navigate = useNavigate();
  const { jobs } = useJobs();
 
  const [latestJobs, setLatestJobs] = useState([]);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
 
  const allJobsPath = "/Job-portal/jobseeker/jobs";
 
  useEffect(() => {
    if (jobs && jobs.length > 0) {
      setLatestJobs(jobs.slice(0, 6));
      return;
    }
 
    api.get("/jobs/")
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
          ? res.data.results
          : Array.isArray(res.data?.jobs)
          ? res.data.jobs
          : [];
 
        setLatestJobs(data.slice(0, 6));
      })
      .catch((err) => {
        console.error("Error fetching jobs:", err);
        setLatestJobs([]);
      });
  }, [jobs]);
 
  const handleViewAllJobs = () => {
    const isLoggedIn =
      !!sessionStorage.getItem("access") &&
      sessionStorage.getItem("userRole") === "jobseeker";
 
    if (isLoggedIn) {
      navigate(allJobsPath);
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
      state: { redirectTo: allJobsPath }
    });
  };
 
  const handleSignupClick = () => {
    setShowLoginPopup(false);
    navigate("/Job-portal/jobseeker/signup", {
      state: { redirectTo: allJobsPath }
    });
  };
 
  return (
    <>
      <section className="job-listings-container">
        <h2 className="job-listings-heading">Latest Job Listings</h2>
 
        <div className="jobs-container-wrapper">
          {latestJobs.map((job) => (
            <JoblistingCard job={job} key={job.id} />
          ))}
        </div>
 
        <button
          className="view-all-button"
          onClick={handleViewAllJobs}
        >
          View All Jobs
        </button>
      </section>
 
      {showLoginPopup && (
        <div className="login-popup-overlay" onClick={handleClosePopup}>
          <div
            className="login-popup-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Login or sign up to explore all jobs</h3>
 
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
 