import React, { useEffect } from 'react'
import './Revoked.css'
import revokedImage from '../assets/application_revoked.png'
import { Header } from '../Components-LandingPage/Header'
import { Footer } from '../Components-LandingPage/Footer'
import { useNavigate } from 'react-router-dom'

export const Revoked = () => {

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/Job-portal/jobseeker");
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <Header />
      <div className="revoked-container">
        <div className="revoked-overlay">
          <img width={650} src={revokedImage} alt="revoked" />
        </div>
        <div className="revoked-text-container">

          <p className="revoked-message">You've chosen to remove yourself from consideration for the role.</p>
        </div>
      </div>
      <Footer />
    </>
  )


}