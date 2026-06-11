import React from 'react';
import api from '../api/axios';
import starIcon from '../assets/Star_icon.png';
import time from '../assets/opportunity_time.png';
import experience from '../assets/opportunity_bag.png';
import place from '../assets/opportunity_location.png';
import calender from '../assets/calender_card.png';
import './SavedJobsCard.css';
import { useJobs } from '../JobContext';
import { formatPostedDate } from './OpportunitiesCard';
import { useNavigate } from "react-router-dom";

export const SavedJobsCard = ({ job, onRemoved }) => {
    // const { applyForJob, toggleSaveJob, appliedJobs } = useJobs();

    const { isJobApplied } = useJobs();
    const { unsaveJob } = useJobs();
    const isApplied = isJobApplied(job.id);

    const navigate = useNavigate();
    if (!job) return null;

    const handleUnsave = async () => {
        try {
            await unsaveJob(job.id);
            onRemoved?.(job.id);
            alert("Job removed from saved list");
        } catch (err) {
            alert("Failed to remove saved job");
        }
    };

    const handleApply = () => {
        if (isApplied) return;

        navigate(`/Job-portal/jobseeker/jobapplication/${job.id}`);
    };

    const HandleClick = () => {
        navigate(`/Job-portal/jobseeker/OpportunityOverview/${job.id}`)
    }

    const formatLocation = (location) => {

        if (!location) return "Location not specified";

        if (Array.isArray(location)) {
            return location.join(", ");
        }
        return location;
    };

    const locationDisplay = formatLocation(job.location);

    return (
        <div className="myjobs-job-card">
            <div onClick={() => HandleClick()}>
                <div className="myjobs-card-header">
                    <div>
                        <h2 className="myjobs-job-title">{job.job_title}</h2>
                        {/* <span className="menu-dots">⋮</span> */}
                    </div>
                </div>
                <div className="myjobs-company-sub">
                    <p className="myjobs-company-name">
                        {job.company?.company_name}
                        <span className="Opportunities-divider">|</span>
                        <span className="star">
                            <img src={starIcon} alt="rating" />
                        </span>
                        {job.company?.rating || 0}
                        <span className="Opportunities-divider">|</span>
                        {job.company?.review_count || 0} reviews
                    </p>
                </div>

                <div className="Opportunities-job-details">
                    <p className="Opportunities-detail-line">
                        <img src={time} className="card-icons" alt="" />
                        <span className={`Opportunities-job-type ${job.work_type?.toLowerCase().replace(/\s/g, '-')}`}>
                            {job.work_type}
                        </span>
                        <span className="Opportunities-divider">|</span>
                        ₹ {job.salary} Lpa
                    </p>

                    <p className="Opportunities-detail-line">
                        <img src={experience} className="card-icons" alt="" />
                        {job.experience} years of experience
                    </p>

                    <p className="Opportunities-detail-line">
                        <img src={place} className="card-icons" alt="" />
                        {locationDisplay}
                    </p>

                    <p className="Opportunities-detail-line">
                        <img src={calender} className="card-icons" alt="" />
                        {formatPostedDate(job?.posted_date)}
                        <span className="Opportunities-divider">|</span>
                        Openings: {job.openings}
                        <span className="Opportunities-divider">|</span>
                        Applicants: {job.applicants_count}
                    </p>
                </div>

                <div className="Opportunities-job-tags">
                    {job.job_category && (
                        <span className={`Opportunities-job-tag ${job.job_category.toLowerCase().replace(/\s+/g, '-')}`}>
                            {job.job_category}
                        </span>
                    )}
                </div>
            </div>
            <hr className="Opportunities-separator" />

            <div className="Opportunities-job-footer">
                <p className='myjobs-saved-date'>{job.savedDate || "Saved date not available"}</p>

                <div className="Opportunities-job-actions">
                    <button
                        className="myjobs-btn"
                        onClick={handleUnsave}
                    >
                        Remove
                    </button>

                    <button
                        className="myjobs-btn"
                        disabled={isApplied}
                        style={{
                            opacity: isApplied ? 0.6 : 1,
                            cursor: isApplied ? 'not-allowed' : 'pointer',
                            backgroundColor: isApplied ? '#ccc' : ''
                        }}
                        onClick={handleApply}
                    >
                        {isApplied ? "Applied" : "Apply"}
                    </button>
                </div>
            </div>
        </div>
    );
};