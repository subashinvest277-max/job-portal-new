import React from 'react'
import starIcon from '../assets/Star_icon.png'
import time from '../assets/opportunity_time.png'
import experience from '../assets/opportunity_bag.png'
import place from '../assets/opportunity_location.png'
import calender from '../assets/calender_card.png'
import './AppliedJobCard.css'
import { useNavigate } from "react-router-dom";
import { formatPostedDate } from "./OpportunitiesCard";

export const AppliedJobCard = ({ appliedJob }) => {
  const navigate = useNavigate();

  const job = appliedJob?.job;
  if (!job) return null;
  console.log("APPLIED CARD DATA:", appliedJob);

  const formatLocation = (location) => {

        if (!location) return "Location not specified";

        if (Array.isArray(location)) {
            return location.join(", ");
        }
        return location;
    };

    const locationDisplay = formatLocation(job.location);

  // 🔹 Adapter: backend data → requirement shape
  const opp = {
    id: appliedJob.id,

    title: job.job_title,
    company: job.company?.company_name || "Company",

    ratings: job.company?.rating || 0,
    reviewNo: job.company?.review_count || 0,

    WorkType: job.work_type || "N/A",
    salary: job.salary || "N/A",
    experience: job.experience || "N/A",
    location: locationDisplay || "N/A",

    posted: formatPostedDate(job.posted_date),
    openings: job.openings || 0,
    applicants: job.applicants_count || 0,

    tags: job.job_category || [],

    appliedDate: appliedJob.appliedDate,

    status: {
      type: appliedJob.job.job_status?.toLowerCase() || "applied",
      text: appliedJob.job.job_status || "Applied",
    },
  };

  return (
    <div className="myjobs-job-card">
      <div className="myjobs-card-header">
        <div>
          <h2 className="myjobs-job-title">{opp.title}</h2>
        </div>
      </div>
      <div className="myjobs-company-sub">
        <p className="myjobs-company-name">
          {opp.company}
          <span className="Opportunities-divider">|</span>
          <span className="star">
            <img src={starIcon} alt="rating" />
          </span>
          {opp.ratings}
          <span className="Opportunities-divider">|</span>
          <span>{opp.reviewNo} reviews</span>
        </p>
      </div>

      <div className="Opportunities-job-details">
        <p className='Opportunities-detail-line'>
          <img src={time} className='card-icons' />
          {opp.WorkType}
          <span className="Opportunities-divider">|</span>
          {opp.salary} Lpa
        </p>
        <p className='Opportunities-detail-line'>
          <img src={experience} className='card-icons' />
          {opp.experience} years of experience
        </p>
        <p className='Opportunities-detail-line'>
          <img src={place} className='card-icons' />
          {opp.location}
        </p>
        <p className='Opportunities-detail-line'>
          <img src={calender} className='card-icons' />
          {opp.posted}
          <span className="Opportunities-divider">|</span>
          Openings: {opp.openings}
          <span className="Opportunities-divider">|</span>
          Applicants: {opp.applicants}
        </p>
      </div>

      <div className="Opportunities-job-tags">
        {job.job_category && (
          <span className={`Opportunities-job-tag ${job.job_category.toLowerCase()}`}>
            {job.job_category}
          </span>
        )}
      </div>

      <hr className="Opportunities-separator" />

      <div className="Opportunities-job-footer">
        <div className="applied-app-status-container">
          <p className="myjobs-saved-date">{opp.appliedDate}</p>
          <span className="Opportunities-divider">|</span>
          <span
            className={`applied-application-status status-${opp.status.type.replace(/\s+/g, "_")}`}
          >
            {opp.status.text}
          </span>
        </div>

        <div className="Opportunities-job-actions">
          <button
            className="myjobs-btn"
            onClick={() =>
              navigate(
                `/Job-portal/jobseeker/appliedjobsoverview/${opp.id}`
              )
            }
          >
            View details
          </button>
        </div>
      </div>
    </div>
  );
};
