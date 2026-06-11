import React from 'react'
import "./Footer.css";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
 
export const Footer = () => {
  const navigate = useNavigate()
  
  
  const accessToken = sessionStorage.getItem("access");
  const userRole = sessionStorage.getItem("userRole");
  const isJobseeker = accessToken && userRole === "jobseeker";
  const isEmployer = accessToken && userRole === "Employer";
  const isLoggedIn = !!accessToken;
 
  // If logged in, go to path. If not, force redirect to login.
  const protectedNavigate = (path,state, targetTabName = '') => {
    if (isLoggedIn) {
      navigate(path, state,{ state: { fromFooter: true, targetTab: targetTabName } });
    } else {
      if (path.toLowerCase().includes('employer')) {
        navigate('/Job-portal/employer/login', {
          state: { fromFooter: true, intendedPath: '/Job-portal/Employer/Dashboard', targetTab: targetTabName || 'Dashboard' }
        });
      } else {
        // Only added this state object mapping fallback to your existing redirect
        navigate('/Job-portal/jobseeker/login', {
          state: { fromFooter: true, intendedPath: path, targetTab: targetTabName || 'Profile' }
        });
      }
    }
  };
 
  return (
    <footer className="footer-section">
      <div className="footer-top">
        <div className="footer-link-section">
          <h2 className="footer-logo">Job portal</h2>
          <p className="tagline">Where Ambition Meets<br />Opportunity</p>
          <div>
            <i className="fab fa-linkedin-in social-icon"></i>
            <i className="fab fa-facebook-f social-icon"></i>
            <i className="fab fa-x-twitter social-icon"></i>
            <i className="fab fa-instagram social-icon"></i>
          </div>
        </div>
 
        <div className="footer-link-section">
          <h3>Quick Links</h3>
          <ul>
            <li><span onClick={() => navigate('/Job-portal/jobseeker/aboutus')}>About Us</span></li>
            <li><span onClick={() => navigate('/Job-portal/jobseeker/ContactUs')}>Contact Us</span></li>
            <li><span onClick={() => { navigate('/Job-portal/jobseeker/FAQ') }} >FAQs</span></li>
            <li><span onClick={() => { navigate('/Job-portal/jobseeker/Blogs') }}>Blog</span></li>
          </ul>
        </div>
 
 
        {(!isLoggedIn || isJobseeker) && (
          <div className="footer-link-section">
            <h3>Job Seekers</h3>
            <ul>
              <li><span onClick={() => protectedNavigate('/Job-portal/jobseeker/myprofile', 'Profile')}>Create Profile</span></li>
              <li><span onClick={() => navigate('/Job-portal/jobseeker/jobs')}>Browse Jobs</span></li>
              <li><span onClick={() => protectedNavigate('/Job-portal/jobseeker/myjobs', { state: { activeTab: 'saved' } })}>Saved Jobs</span></li>
              <li><span onClick={() => protectedNavigate('/Job-portal/jobseeker/myjobs', { state: { activeTab: 'applied' } })}> Applied Jobs </span></li>
            </ul>
          </div>
        )}
 
        {(!isLoggedIn || isEmployer) && (
          <div className="footer-link-section">
            <h3>Employers</h3>
            <ul>
              <li><span onClick={() => {
                if (isLoggedIn) {
                  navigate('/Job-portal/Employer/Dashboard', {
                    state: { fromFooter: true, targetTab: 'Post a Job' }
                  });
                } else {
                  navigate('/Job-portal/employer/login', {
                    state: { fromFooter: true, intendedPath: '/Job-portal/Employer/Dashboard', targetTab: 'Post a Job' }
                  });
                }
              }}>Post a Job</span></li>
 
              <li><span onClick={() => {
                if (isLoggedIn) {
                  navigate('/Job-portal/Employer/Dashboard', {
                    state: { fromFooter: true, targetTab: 'Find Talent' }
                  });
                } else {
                  navigate('/Job-portal/employer/login', {
                    state: { fromFooter: true, intendedPath: '/Job-portal/Employer/Dashboard', targetTab: 'Find Talent' }
                  });
                }
              }}>
                Find Talent
              </span></li>
 
              <li><span onClick={() => {
                if (isLoggedIn) {
                  navigate('/Job-portal/Employer/Dashboard', {
                    state: { fromFooter: true, targetTab: 'Dashboard' }
                  });
                } else {
                  navigate('/Job-portal/employer/login', {
                    state: { fromFooter: true, intendedPath: '/Job-portal/Employer/Dashboard', targetTab: 'Dashboard' }
                  });
                }
              }}>Employer Dashboard</span></li>
            </ul>
          </div>
        )}
      </div>
 
 
      <div className="footer-bottom">
        <p>&#169; 2025 JobPortal. All rights reserved.</p>
      </div>
    </footer>
  )
}