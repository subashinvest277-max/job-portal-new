import React from "react";
import { Footer } from "../Components-LandingPage/Footer";
import "./TechnicalIssues.css";
import LoginSupportImg from "../assets/loginissue.png";
import { FHeader } from "./FHeader";

export const LoginIssuesHelp = () => {
  const loginIssueData = {
    title: "Common Login Issues & Root Causes",
    updatedDate: "Updated 06 Feb 2026",
    intro: "Having trouble accessing your account? Review these common login difficulties and their technical root causes to get back online quickly.",
    issues: [
      {
        problem: "Incorrect Email or Password",
        why: "User cannot log in despite entering credentials.",
        rootCause: "Typing errors, incorrect password, changed password not remembered, or using an unregistered email ID."
      },
      {
        problem: "Account Not Verified",
        why: "User signs up but cannot log in.",
        rootCause: "Email verification link not clicked, verification link expired, or incorrect email entered during registration."
      },
      {
        problem: "Account Locked",
        why: "Account temporarily locked after failed attempts.",
        rootCause: "Multiple failed login attempts triggering security protection."
      },
      {
        problem: "OTP Not Received",
        why: "User does not receive OTP during login.",
        rootCause: "Network delay, incorrect mobile number, SMS blocked, or temporary delivery failure."
      },
      {
        problem: "Social Login Failure",
        why: "Login via Google or LinkedIn fails.",
        rootCause: "Browser pop-up blocked, social account not verified, or login session interrupted."
      },
      {
        problem: "Session Expired Automatically",
        why: "User gets logged out unexpectedly.",
        rootCause: "Security session timeout due to inactivity or login from another device."
      },
      {
        problem: "Access Denied After Login",
        why: "User logs in but cannot access certain pages.",
        rootCause: "Role mismatch, incomplete profile, or account restriction."
      },
      {
        problem: "Login Button Not Responding",
        why: "Clicking login does nothing.",
        rootCause: "Slow internet connection, browser issue, or temporary system error."
      },
      {
        problem: "Multiple Account Confusion",
        why: "System indicates account already exists.",
        rootCause: "Account previously created using a different login method."
      },
      {
        problem: "Suspicious Activity Detected",
        why: "Additional verification requested during login.",
        rootCause: "Login attempt from new device, unusual location, or security monitoring triggered."
      }
    ]
  };

  return (
      <>
      <FHeader />
      <div className="technicalhelp-page">
      <div className="technicalhelp-container">
        <h1 className="technicalhelp-title">{loginIssueData.title}</h1>
        <p className="technicalhelp-updated">{loginIssueData.updatedDate}</p>
        <p className="technicalhelp-intro">{loginIssueData.intro}</p>

        <div className="technicalhelp-hero">
          <img
            src={LoginSupportImg}
            alt="Login Support Illustration"
            className="technicalhelp-hero-img"
          />
        </div>

        <div className="technicalhelp-content">
          <div className="technicalissue-grid">
            {loginIssueData.issues.map((item, index) => (
              <div key={index} className="technicalissue-card">
                <h3>{item.problem}</h3>
                <p><strong>Why this happens:</strong> {item.why}</p>
                <p><strong>Root Cause:</strong> {item.rootCause}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
    </>
  );
}