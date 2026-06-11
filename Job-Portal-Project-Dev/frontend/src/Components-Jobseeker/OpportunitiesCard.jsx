import React from 'react';
import api from "../api/axios";
import './OpportunitiesCard.css';
import time from '../assets/opportunity_time.png';
import experience from '../assets/opportunity_bag.png';
import place from '../assets/opportunity_location.png';
import { useJobs } from "../JobContext";
import { useNavigate } from 'react-router-dom';

export function formatPostedDate(dateString) {
    const postedDate = new Date(dateString);
    const today = new Date();
    const diffInDays = Math.floor((today - postedDate) / (1000 * 60 * 60 * 24));


    if (diffInDays === 0) return "Posted: today";
    if (diffInDays === 1) return "Posted: 1 day ago";
    if (diffInDays > 1 && diffInDays <= 30) return `Posted: ${diffInDays} days ago`;
    if (diffInDays > 30 && diffInDays <= 60) return `Posted: 1+ month ago`;
    if (diffInDays > 60 && diffInDays <= 90) return `Posted: 2+ months ago`;

    return "Posted: Long ago";
}

export const OpportunitiesCard = ({ job }) => {
    const navigate = useNavigate();
    const { isJobSaved, saveJob, isJobApplied } = useJobs();

    const isSaved = isJobSaved(job.id);

    const handleSave = async (e) => {
        e.stopPropagation();

        if (isSaved) return;

        const result = await saveJob(job.id);

        if (result === "already") {
            alert("Job already saved");
        }
    };




    const isApplied = isJobApplied(job.id);

    const handleApply = (e) => {
        e.stopPropagation();

        if (isApplied) return;

        navigate(`/Job-portal/jobseeker/jobapplication/${job.id}`);
    };
    const handleClick = () => {
        const jobId = job?.id || job?.job?.id;

        if (!jobId) {
            console.error("Job ID missing:", job);
            return;
        }

        navigate(`/Job-portal/jobseeker/OpportunityOverview/${jobId}`);
    };

    console.log(job);

    const formatLocation = (location) => {

        if (!location) return "Location not specified";

        if (Array.isArray(location)) {
            return location.join(", ");
        }
        return location;
    };

    const locationDisplay = formatLocation(job.location);

    return (
        <div className="Opportunities-job-card">
            <div onClick={() => handleClick()}>
                <div className="Opportunities-job-header">
                    <div>
                        <h3 className="Opportunities-job-title">{job.job_title}</h3>
                        <p className="Opportunities-job-company">
                            {job.company?.company_name}
                        </p>
                    </div>
                    {job.company.logo || job.company.company_logo ? (
                        <img
                            src={job.company.logo || job.company.company_logo}
                            alt={job.company?.company_name}
                            className="Opportunities-job-logo"
                        />
                    ) : (

                        <div className="Opportunities-job-logo-placeholder">
                            {job.company?.company_name?.charAt(0).toUpperCase()}

                        </div>

                    )}
                </div>

                <div className="Opportunities-job-details">
                    <p className='Opportunities-detail-line'><img src={time} className='card-icons' />{job.work_duration}<span className="Opportunities-divider">|</span>₹ {job.salary} Lpa</p>
                    <p className='Opportunities-detail-line'><img src={experience} className='card-icons' />{job.experience} years of experience</p>
                    <p className='Opportunities-detail-line'><img src={place} className='card-icons' />{locationDisplay}</p>
                </div>

                <div className='Opportunities-details-bottom'>
                    <div className="Opportunities-job-tags">
                        {job.job_category && (
                            <span className={`Opportunities-job-tag ${job.job_category.toLowerCase()}`}>
                                {job.job_category}
                            </span>
                        )}
                    </div>
                    <div className="Opportunities-job-type">
                        {job.work_type}
                    </div>
                </div>
            </div>

            <hr className="Opportunities-separator" />

            <div className="Opportunities-job-footer">
                <div className="Opportunities-job-meta">
                    <p>{formatPostedDate(job?.posted_date)} <span className="Opportunities-divider">|</span> Openings: {job.openings} <span className="Opportunities-divider">|</span> Applicants: {job.applicants_count}</p>
                </div>

                <div className="Opportunities-job-actions">
                    <button className={`Opportunities-save-btn ${isSaved ? "saved" : ""}`} onClick={handleSave}>{isSaved ? "Saved" : "Save"}</button>

                    <button
                        className="Opportunities-apply-btn"
                        onClick={handleApply}
                        disabled={isApplied}
                        style={{
                            opacity: isApplied ? 0.6 : 1,
                            cursor: isApplied ? "not-allowed" : "pointer"
                        }}
                    >
                        {isApplied ? "Applied" : "Apply"}
                    </button>
                </div>
            </div>
        </div>
    );
};
