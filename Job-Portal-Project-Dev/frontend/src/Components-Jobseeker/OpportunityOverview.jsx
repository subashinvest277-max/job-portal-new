import React, { useState, useEffect } from 'react'
import { Header } from "../Components-LandingPage/Header";
import { Footer } from '../Components-LandingPage/Footer';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import './OpportunityOverview.css'
import starIcon from '../assets/Star_icon.png'
import time from '../assets/opportunity_time.png'
import experience from '../assets/opportunity_bag.png'
import place from '../assets/opportunity_location.png'
import twitter from '../assets/socials-x.png'
import linkedin from '../assets/socials-linkedin.png'
import facebook from '../assets/socials-facebook.png'
import { formatPostedDate } from './OpportunitiesCard';
import { useJobs } from '../JobContext';
import { SearchBar } from './SearchBar'
import api from "../api/axios";

export const OpportunityOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // const { id } = useParams();
  const [job, setJob] = useState(null);
  const [limitedSimilarJob, setLimitedSimilarJob] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchExperience, setSearchExperience] = useState("");


  const { jobs, appliedJobs, toggleSaveJob, saveJob, isJobSaved } = useJobs();

  // const job = jobs.find(singleJob => singleJob.id === id) || appliedJobs.find(singleJob => singleJob.id === id);

  const saved = job ? isJobSaved(job.id) : false;
  // const saved = isJobSaved(job.id);
  const { isJobApplied } = useJobs();
  const isApplied = job ? isJobApplied(job.id) : false;

  const handleSave = async () => {
    // const result = await saveJob(job.id);
    try {
      await saveJob(job.id);
      alert("Job saved successfully");
    } catch (err) {
      if (err.response?.status === 400) {
        alert("Job already saved");
      } else if (err.response?.status === 401) {
        alert("Please login to save jobs");
      } else {
        alert("Failed to save job");
      }
    }
  };

  const handleApply = () => {
    if (isApplied) return;

    navigate(`/Job-portal/jobseeker/jobapplication/${job.id}`);
  };


  // const similarJobs = jobs.filter((similarJob) => {
  //   return similarJob.id !== job.id && similarJob.Department.some(item => job.Department.includes(item));
  // });

  // // const limitedSimilarJob = similarJobs.slice(0, 9);

  // const [query, setQuery] = useState('');
  // const [loc, setLoc] = useState('');
  // const [exp, setExp] = useState('');

  const handleSearch = () => {
    navigate("/Job-portal/jobseeker/searchresults", {
      state: {
        query: searchQuery,
        location: searchLocation,
        experience: searchExperience,
      },
    });
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        // 1️⃣ Fetch main job
        const jobRes = await api.get(`/jobs/${id}/`);
        setJob(jobRes.data);

        // 2️⃣ Fetch all jobs
        const allJobsRes = await api.get(`/jobs/all/`);

        // // ✅ Handle pagination safely
        // const jobsArray = Array.isArray(allJobsRes.data)
        //   ? allJobsRes.data
        //   : allJobsRes.data.results || [];
        const jobsArray = allJobsRes.data.jobs || allJobsRes.data.results || [];

        // 3️⃣ Filter similar (exclude current job)
        // const similar = jobsArray
        //   .filter(j => Number(j.id) !== Number(jobRes.data.id))
        //   .slice(0, 3);
         const similar = jobsArray
          .filter(j => Number(j.id) !== Number(jobRes.data.id))
          .filter(j => {                        
            if (jobRes.data.department && j.department) {
              const currentDept = Array.isArray(jobRes.data.department)
                ? jobRes.data.department
                : [jobRes.data.department];
              const jobDept = Array.isArray(j.department)
                ? j.department
                : [j.department];
 
              return currentDept.some(dept => jobDept.includes(dept));
            }
            return false;
          })
          .slice(0, 9);
 

        setLimitedSimilarJob(similar);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load job details");
        setLoading(false);
      }
    };

    if (id) {
      fetchJobDetails();
    }
  }, [id]);


  // ✅ Safety checks
  if (loading) return (
    <>
      <Header />
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2>Loading...</h2>
      </div>
    </>
  );

  if (error) return (
    <>
      <Header />
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2 style={{ color: "red" }}>{error}</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    </>
  );

  if (!job) {
    return (
      <>
        <Header />
        <div style={{ padding: '100px', textAlign: 'center' }}>
          <h2>Job not found</h2>
          <p>This job may have been removed or you have already applied.</p>
          <button className="back-btn" onClick={() => navigate('/Job-portal/jobseeker/jobs')}>Back to Jobs</button>
        </div>
        <Footer />
      </>
    );
  }

  // if (!job) return null;
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
      <Header />

      <div className='opp-overview-content'>
        <div className='search-backbtn-container'>
          <button className="back-btn" onClick={() => navigate(-1)}>Back</button>

          <SearchBar
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            searchLocation={searchLocation} setSearchLocation={setSearchLocation}
            searchExp={searchExperience} setSearchExp={setSearchExperience}
            onSearch={handleSearch}
          />
        </div>

        <div className='opp-overview-main'>
          <div className="opp-job-main">
            {/* Job Header  */}
            <div className="opp-overview-job-card">
              <div className="Opportunities-job-header">
                <div>
                  <h2 className="opp-topcard-job-title">{job.job_title}</h2>
                  <h5 className="Opportunities-job-company">
                    {job.company?.company_name}
                    <span className="Opportunities-divider">|</span>
                    <span className="star"><img src={starIcon} alt="star" /></span>
                    {job.company?.rating || 0}
                    <span className="Opportunities-divider">|</span>
                    <span className="opp-reviews">
                      {job.company?.review_count || 0} Reviews
                    </span>
                  </h5>
                </div>
                {job.company.logo || job.company.company_logo ? (
                  <img
                    src={job.company.logo || job.company.company_logo}
                    alt={job.company?.company_name}
                    className="Opportunities-job-logo"
                  />
                ) : (
                  <div className="Opportunities-job-logo-placeholder">
                    {job.company?.company_name?.[0]?.toUpperCase()}
                  </div>
                )}

              </div>

              <div className="Opportunities-job-details">
                <p className='Opportunities-detail-line'>
                  <img src={time} className='card-icons' alt="time" />
                  {job.work_duration}
                  <span className="Opportunities-divider">|</span>
                  {job.salary} Lpa
                </p>
                <p className='Opportunities-detail-line'>
                  <img src={experience} className='card-icons' alt="experience" />
                  {job.experience} years of experience
                </p>
                <p className='Opportunities-detail-line'>
                  <img src={place} className='card-icons' alt="location" />
                  {locationDisplay}
                </p>
              </div>

              <div className='Opportunities-details-bottom'>
                {/* <div className="Opportunities-job-tags">
                  {Array.isArray(job.tags) &&
                    job.tags.map((tag, index) => (
                      <span key={index} className="Opportunities-job-tag">
                        {tag}
                      </span>
                    ))}
                </div> */}
                <div className="Opportunities-job-tags">
                  {job.job_category && (
                    <span className={`Opportunities-job-tag ${job.job_category.toLowerCase().replace(/\s+/g, '-')}`}>
                      {job.job_category}
                    </span>
                  )}
                </div>  

                <div className="Opportunities-job-type">
                  {job.work_type}
                </div>
              </div>

              <hr className="Opportunities-separator" />

              <div className="Opportunities-job-footer">
                <div className="Opportunities-job-meta">
                  <p>
                    {formatPostedDate(job.posted_date)}
                    <span className="Opportunities-divider">|</span>
                    Openings: {job.openings}
                    <span className="Opportunities-divider">|</span>
                    Applicants: {job.applicants_count}
                  </p>
                </div>

                <div className="Opportunities-job-actions">
                  <button
                    className={saved ? "Opportunities-apply-btn" : "Opportunities-save-btn"}
                    onClick={handleSave}
                  >
                    {saved ? "Saved" : "Save"}
                  </button>

                  <button
                    className="Opportunities-apply-btn"
                    onClick={handleApply}
                    disabled={isApplied}
                    style={{
                      opacity: isApplied ? 0.6 : 1,
                      cursor: isApplied ? 'not-allowed' : 'pointer',
                      backgroundColor: isApplied ? '#6c757d' : '' // Optional grey out
                    }}
                  >
                    {isApplied ? "Applied" : "Apply"}
                  </button>
                </div>
              </div>
            </div>

            <div className="opp-job-details-card">
              <div className="opp-job-highlights">
                <h3>Job Highlights</h3>
                <ul>
                  {Array.isArray(job.job_highlights) &&
                    job.job_highlights.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                </ul>
              </div>

              <h3>Company Overview</h3>
              <p>{job.company?.about || ""}</p>


              <h3>Job Description</h3>
              <p>{job.job_description}</p>

              <h3>Responsibilities</h3>
              <ul>
                {Array.isArray(job.responsibilities) &&
                  job.responsibilities.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
              </ul>

              <h3>Key Details:</h3>
              <p><strong>Role:</strong> {job.job_title}</p>
              <p><strong>Industry Type:</strong> {Array.isArray(job.industry_type) ? job.industry_type.join(", ") : job.industry_type}</p>
              <p><strong>Department:</strong> {Array.isArray(job.department) ? job.department.join(", ") : job.department}</p>
              <p><strong>Job Type:</strong> {job.work_type}</p>
              <p><strong>Location:</strong> {locationDisplay}</p>
              <p><strong>Shift:</strong> {job.shift}</p>

              <h3>Key Skills</h3>
              <div className="opp-key-skills-container">
                {Array.isArray(job.key_skills) &&
                  job.key_skills.map((item, i) => (
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

          <div className="opp-job-sidebar">
            <h3>Similar Jobs</h3>
            {limitedSimilarJob.length > 0 ? (
              limitedSimilarJob.map((sim) => (
                <div
                  key={sim.id}
                  onClick={() => navigate(`/Job-portal/jobseeker/OpportunityOverview/${sim.id}`)}
                  className="opp-similar-job"
                >
                  <div className="Opportunities-job-header">
                    <div>
                      <h2 className="similar-job-title">{sim.job_title}</h2>
                      <p className="similar-job-company">
                        {sim.company?.company_name}
                        <span className="Opportunities-divider">|</span>
                        <span className="star"><img src={starIcon} alt="star" /></span>
                        {sim.company?.rating || 0}
                        <span className="Opportunities-divider">|</span>
                        <span>{sim.company?.review_count || 0} reviews</span>
                      </p>

                    </div>
                    {sim.company.logo || sim.company.company_logo ? (
                      <img
                        src={sim.company.logo || sim.company.company_logo}
                        alt={sim.company?.company_name}
                        className="Opportunities-job-logo"
                      />
                    ) : (
                      <div className="Opportunities-job-logo-placeholder">
                        {sim.company?.company_name?.[0]?.toUpperCase()}
                      </div>
                    )}

                  </div>
                  <div className="Opportunities-job-details">
                    <p className='Opportunities-detail-line'>
                      {Array.isArray(sim.tags) ? sim.tags.join(", ") : sim.tags}
                      {" "}- {sim.experience} years of experience
                    </p>
                    <p className='Opportunities-detail-line'>
                      <img src={place} className='card-icons' alt="location" />
                      {formatLocation(sim.location)}
                    </p>
                  </div>
                  <div className="similar-job-footer">
                    <div className="Opportunities-job-type">
                      {sim.work_type}
                    </div>
                    <p className='similar-job-footer-posted'>
                      {formatPostedDate(sim.posted_date)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div>
                <p>Currently no similar jobs available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>

  )
}