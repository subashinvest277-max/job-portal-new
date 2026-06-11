import React, { useState } from 'react';
import time from '../assets/opportunity_time.png';
import experience from '../assets/opportunity_bag.png';
import place from '../assets/opportunity_location.png';
import { formatPostedDate } from './OpportunitiesCard';
import "./SearchResultsCard.css";
import { useNavigate } from 'react-router-dom';
import starIcon from '../assets/Star_icon.png';
import api from '../api/axios';
import { useJobs } from '../JobContext';

export function SearchResultsCard({ job }) {
    const navigate = useNavigate();
    const { isJobSaved, isJobApplied, saveJob } = useJobs();

    const isSaved = isJobSaved(job.id);
    const isApplied = isJobApplied(job.id);

    if (!job) return null;

    /* ---------------- NAVIGATION ---------------- */
    const handleCardClick = () => {
        navigate(`/Job-portal/jobseeker/OpportunityOverview/${job.id}`);
    };

    const handleApply = (e) => {
        e.stopPropagation();

        if (isApplied) return;

        navigate(`/Job-portal/jobseeker/jobapplication/${job.id}`);
    };

    const handleSave = async (e) => {
        e.stopPropagation();

        if (isSaved) return;

        try {
            await saveJob(job.id);
        } catch (err) {
            alert("Failed to save job");
        }
    };


    /* ---------------- LOGO ---------------- */
    const logoContent = job.company.logo || job.company.company_logo ? (
        <img
            src={job.company.logo || job.company.company_logo}
            alt={job.company.company_name}
            className="SearchResults-job-card-job-logo"
        />
    ) : (
        <div className="SearchResults-job-card-logo-placeholder">
            {job.company?.company_name?.[0] || "C"}
        </div>
    );

    const formatLocation = (location) => {

        if (!location) return "Location not specified";

        if (Array.isArray(location)) {
            return location.join(", ");
        }
        return location;
    };

    const locationDisplay = formatLocation(job.location);

    return (
        <div className="SearchResults-job-card">
            <div onClick={handleCardClick}>
                <div className="SearchResults-job-card-header">
                    <div>
                        <h3 className="SearchResults-job-card-title">
                            {job.job_title}
                        </h3>

                        <p className="SearchResults-job-card-company">
                            <span className="star">
                                <img src={starIcon} alt="rating" />
                            </span>
                            {job.company?.rating || 0} - {job.company?.company_name}
                        </p>
                    </div>

                    {logoContent}
                </div>

                <div className="SearchResults-job-card-details">
                    <p className="SearchResults-job-card-detail-line">
                        <img src={time} className="SearchResults-job-card-icons" alt="type" />
                        {job.work_duration}
                        <span className="SearchResults-job-card-divider">|</span>
                        ₹ {job.salary || "Salary not disclosed"} Lpa
                        <span className="SearchResults-job-card-divider">|</span>
                        <img src={experience} className="SearchResults-job-card-icons" alt="experience" />
                        {job.experience || "Experience not specified"} years of experience
                        <span className="SearchResults-job-card-divider">|</span>
                        <img src={place} className="SearchResults-job-card-icons" alt="location" />
                        {locationDisplay || "Location not specified"}
                    </p>

                    <p className="SearchResults-job-card-detail-line">
                        <img src={time} className='SearchResults-job-card-icons' alt='shit_type' />
                        Shift: {job.shift || "N/A"}
                        <span className="SearchResults-job-card-divider">|</span>
                        <img src={experience} className='SearchResults-job-card-icons' alt='work_type' /> 
                        {job.work_type || "Not specified"}
                    </p>
                </div>
            </div>

            <hr className="SearchResults-job-card-separator" />

            <div className="SearchResults-job-card-job-footer">
                <p>
                    {formatPostedDate(job.posted_date)}
                    <span className="SearchResults-job-card-divider">|</span>
                    Openings: {job.openings}
                    <span className="SearchResults-job-card-divider">|</span>
                    Applicants: {job.applicants_count}
                </p>

                <div className="SearchResults-job-card-actions">
                    <button
                        className={`Opportunities-save-btn ${isSaved ? "saved" : ""}`}
                        onClick={handleSave}
                        disabled={isSaved}
                    >
                        {isSaved ? "Saved" : "Save"}
                    </button>

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
        </div >
    );
}
