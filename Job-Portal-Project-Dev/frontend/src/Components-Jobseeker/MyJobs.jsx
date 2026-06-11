import React, { useState, useEffect } from "react";
import "./MyJobs.css";
import { useLocation } from "react-router-dom";
import { Footer } from "../Components-LandingPage/Footer";
import { SavedJobsCard } from "./SavedJobsCard";
import { AppliedJobCard } from "./AppliedJobCard";
import { Header } from "../Components-LandingPage/Header";
import { useJobs } from '../JobContext';

export const MyJobs = () => {
    const location = useLocation();

    // Initialize tab from sessionStorage or location state or default to "saved"
    const [activeTab, setActiveTab] = useState(() => {
        // First check if we have a saved tab in sessionStorage
        const savedTab = sessionStorage.getItem("myJobs_activeTab");
        if (savedTab && (savedTab === "saved" || savedTab === "applied")) {
            return savedTab;
        }
        // Then check if location state has activeTab (from navigation)
        if (location.state?.activeTab) {
            return location.state.activeTab;
        }
        if (location.state?.state?.activeTab) {
            return location.state.state.activeTab;
        }
        // Default to saved
        return "saved";
    });

    useEffect(() => {
        const incomingTab = location.state?.activeTab || location.state?.state?.activeTab;

        if (incomingTab) {
            setActiveTab(incomingTab);
            sessionStorage.setItem("myJobs_activeTab", incomingTab);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const { savedJobs, appliedJobs, loading, unsaveJob, fetchAllJobs } = useJobs();

    // Filter out withdrawn applications
    const activeAppliedJobs = appliedJobs?.filter(
        (application) => application.status?.toLowerCase() !== "withdrawn"
    ) || [];

    const activeSavedJobs = savedJobs?.filter(
        (job) => job?.status?.toLowerCase() !== "withdrawn"
    ) || [];

    // Preserve tab state from navigation and save to sessionStorage
    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
            sessionStorage.setItem("myJobs_activeTab", location.state.activeTab);
        }
    }, [location]);

    // Save activeTab to sessionStorage whenever it changes
    useEffect(() => {
        sessionStorage.setItem("myJobs_activeTab", activeTab);
    }, [activeTab]);

    // Fetch jobs on load (important)
    useEffect(() => {
        fetchAllJobs();
    }, []);

    // Debug logging
    useEffect(() => {
        console.log("=== MyJobs Data Debug ===");
        console.log("Saved Jobs Array:", savedJobs);
        console.log("Applied Jobs Array:", appliedJobs);
        console.log("Active Applied Jobs (excluding withdrawn):", activeAppliedJobs);
        console.log("Saved Jobs Count:", savedJobs?.length);
        console.log("Applied Jobs Count:", appliedJobs?.length);
        console.log("Active Tab:", activeTab);
    }, [savedJobs, appliedJobs, activeTab, activeAppliedJobs]);

    const handleRemoveSavedJob = async (jobId) => {
        await unsaveJob(jobId);
        await fetchAllJobs();
    };

    if (loading) {
        return (
            <>
                <Header />
                <p style={{ textAlign: "center", padding: "40px" }}>
                    Loading jobs...
                </p>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />

            <main>
                {/* Top Section */}
                <div className='myjobs-main-info'>
                    <h1>My Jobs</h1>
                    <p>
                        View and manage the jobs you've saved, applied for, or shortlisted—all in one place.
                    </p>
                </div>

                {/* Tabs */}
                <div className="toggle-myjobs-main">
                    <button
                        className={`myjobs-select ${activeTab === "saved" ? "active" : ""}`}
                        onClick={() => setActiveTab("saved")}
                    >
                        Saved ({activeSavedJobs?.length || 0})
                    </button>

                    <button
                        className={`myjobs-select ${activeTab === "applied" ? "active" : ""}`}
                        onClick={() => setActiveTab("applied")}
                    >
                        Applied ({activeAppliedJobs?.length || 0})
                    </button>
                </div>

                {/* GRID CONTAINER */}
                <div className="my-jobs-common-container">

                    {/* SAVED TAB */}
                    {activeTab === "saved" && (
                        activeSavedJobs.length > 0 ? (
                            activeSavedJobs.map((job) => (
                                <SavedJobsCard
                                    key={job.id}
                                    job={job}
                                    onRemoved={handleRemoveSavedJob}
                                />
                            ))
                        ) : (
                            <div className="toggle-no-my-jobs">
                                <h2>No jobs saved yet</h2>
                                <p>Jobs you save appear here</p>
                            </div>
                        )
                    )}

                    {/* APPLIED TAB */}
                    {activeTab === "applied" && (
                        activeAppliedJobs.length > 0 ? (
                            activeAppliedJobs.map((application) => (
                                <AppliedJobCard
                                    key={application.id}
                                    appliedJob={application}
                                />
                            ))
                        ) : (
                            <div className="toggle-no-my-jobs">
                                <h2>No jobs applied yet</h2>
                                <p>Jobs you apply appear here</p>
                            </div>
                        )
                    )}

                </div>
            </main>

            <Footer />
        </>
    );
};