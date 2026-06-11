import React, { useEffect, useState } from "react";
import Success from "../assets/application_success.png";
import { Footer } from "../Components-LandingPage/Footer";
import "./ApplicationStatusScreen.css";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../Components-LandingPage/Header";
import api from "../api/axios";

export const ApplicationStatusScreen = () => {
  const { id } = useParams();
    const navigate = useNavigate();

  const [appliedJob, setAppliedJob] = useState(null);


  useEffect(() => {
    const fetchAppliedJob = async () => {
      try {
        const res = await api.get("/jobs/applied/");
        const match = res.data.find(
          (item) => String(item.job.id) === String(id)
        );
        setAppliedJob(match || null);
      } catch (err) {
        console.error("Failed to load applied job:", err);
      }
    };

    fetchAppliedJob();
  }, [id]);
  const job = appliedJob
    ? {
      title: appliedJob.job?.job_title,
      company: appliedJob.job?.company?.company_name,
    }
    : {};


  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/Job-portal/jobseeker");
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="success-page">
      <Header />

      <div className="success-container">
        <img
          src={Success}
          alt="Application submitted"
          className="success-image"
        />

        <h2 className="success-title">Congratulations!</h2>

        <p className="success-text">
          You have successfully applied to the{" "}
          <span className="job-title">
            {job.title || "this job"}
          </span>{" "}
          position on {job.company || "the company"}
        </p>

        <p className="redirect-text">
          Redirecting to home in 5 seconds...
        </p>
      </div>

      <Footer />
    </div>
  );
};
