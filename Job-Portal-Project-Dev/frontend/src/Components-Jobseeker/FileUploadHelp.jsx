import React from "react";
import { Footer } from "../Components-LandingPage/Footer";
import "./TechnicalIssues.css";
import TechSupportImg from "../assets/fileuploadhelp.png";
import { FHeader } from './FHeader';

export const FileUploadHelp = () => {
  const uploadIssueData = {
    title: "File Upload Problems & Root Causes",
    updatedDate: "Updated 06 Feb 2026",
    intro: "Having trouble uploading your documents? Below is a comprehensive list of common upload issues and their technical root causes to help you troubleshoot effectively.",
    issues: [
      {
        problem: "Resume Upload Fails",
        why: "Your resume does not upload successfully.",
        rootCause: "The file format may not be supported, the file size may exceed the limit, or the internet connection may be unstable."
      },
      {
        problem: "File Format Not Supported",
        why: "The system displays an unsupported file format message.",
        rootCause: "The uploaded file is not in an accepted format such as PDF or DOCX."
      },
      {
        problem: "File Size Too Large",
        why: "The upload is rejected due to size restrictions.",
        rootCause: "The document exceeds the maximum file size allowed by the platform."
      },
      {
        problem: "Upload Stuck at Processing",
        why: "The upload bar does not complete or remains stuck.",
        rootCause: "Slow internet connection, temporary server delay, or interrupted upload process."
      },
      {
        problem: "Profile Picture Not Updating",
        why: "The new profile image does not appear after upload.",
        rootCause: "Unsupported image format, caching issue, or incomplete upload."
      },
      {
        problem: "Document Preview Not Visible",
        why: "The uploaded document cannot be previewed.",
        rootCause: "Corrupted file, unsupported format, or temporary display issue."
      },
      {
        problem: "Multiple File Upload Error",
        why: "The system does not allow uploading more than one document.",
        rootCause: "Platform restrictions allowing only one resume or document at a time."
      },
      {
        problem: "Upload Button Not Responding",
        why: "Clicking the upload button does nothing.",
        rootCause: "Browser issue, disabled scripts, or temporary system error."
      },
      {
        problem: "File Removed Automatically",
        why: "The uploaded file disappears.",
        rootCause: "File validation failure, unsupported format, or system refresh interruption."
      },
      {
        problem: "Permission Denied During Upload",
        why: "The upload is blocked by device or browser.",
        rootCause: "Storage permission not granted or browser security settings preventing upload."
      }
    ]
  };

  return (
      <>
      <FHeader />
       <div className="technicalhelp-page">
      <div className="technicalhelp-container">
        <h1 className="technicalhelp-title">{uploadIssueData.title}</h1>
        <p className="technicalhelp-updated">{uploadIssueData.updatedDate}</p>
        <p className="technicalhelp-intro">{uploadIssueData.intro}</p>

        <div className="technicalhelp-hero">
          <img
            src={TechSupportImg}
            alt="Technical Support Illustration"
            className="technicalhelp-hero-img"
          />
        </div>

        <div className="technicalhelp-content">
          <div className="technicalissue-grid">
            {uploadIssueData.issues.map((item, index) => (
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