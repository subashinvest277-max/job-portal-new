import React, { useEffect, useState } from 'react'
import './Afterloginlanding.css'
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useJobs } from "../JobContext";
import { Header } from "../Components-LandingPage/Header";
import { JMainsection } from './JMainsection';
import { Jobsbycompany } from './Jobsbycompany';
import { Opportunities } from './Opportunities';
import { Footer } from '../Components-LandingPage/Footer';

export const Afterloginlanding = () => {
    const navigate = useNavigate();
    const { jobs, loading } = useJobs();

    const [profile, setProfile] = useState(null);
    // const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Only verify profile here
                const profileRes = await api.get("profile/jobseeker/");
                setProfile(profileRes.data);
            } catch (error) {
                navigate("/Job-portal/jobseeker/login");
            } 
        };

        loadData();
    }, [navigate]);


    if (loading) {
        return <div className="page-loader">Loading...</div>;
    }

    return (
        <>
            <Header profile={profile} />

            <JMainsection />
            <section className='Opportunities-section'>
                <h2 className='Opportunities-title'>Opportunities Just For You</h2>

                {/* ✅ Using context jobs */}
                {loading ? (
                    <p>Loading opportunities...</p>
                ) : jobs.length > 0 ? (
                    <Opportunities jobs={jobs?.slice(0, 6) || []} />
                ) : (
                    <p>No opportunities available</p>
                )}


                <button
                    onClick={() => navigate('/Job-portal/jobseeker/jobs')}
                    className="Opportunities-view-more-btn"
                >
                    View More
                </button>
            </section>

            <Jobsbycompany jobs={jobs} />

            <Footer />
        </>
    )
}