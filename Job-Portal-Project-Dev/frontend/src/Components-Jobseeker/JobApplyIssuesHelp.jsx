import React from "react";
import "./JobApplyIssuesHelp.css"; 
import { Footer } from "../Components-LandingPage/Footer";
import JobApplyImg from "../assets/Jobapply_issue_help.png";
import { FHeader } from './FHeader';

export const JobApplyIssuesHelp = () => {
  const applyHelpData = {
    title: "Job Apply Issues & Troubleshooting",
    updatedDate: "Updated 06 Feb 2026",
    intro: "Technical glitches or parsing errors shouldn't stand between you and your next role. Follow this guide to resolve common portal issues and ensure your application is submitted successfully.",
    summary: [
      "<strong>Technical Check:</strong> If the page isn't loading, switch to Chrome/Firefox and clear cache.",
      "<strong>Ad-Block Check:</strong> Disable extensions like AdBlock that may stop pop-ups.",
      "<strong>Parsing Test:</strong> If data is jumbled, simplify resume to a single-column layout.",
      "<strong>Form Audit:</strong> Check for hidden 'Terms & Conditions' checkboxes or character limits.",
      "<strong>Screening Gate:</strong> Ensure 'Yes' is selected for mandatory 'Knock-out' questions.",
      "<strong>Failure Protocol:</strong> If 'Submit' fails, take a screenshot and email HR directly."
    ]
  };

  return (
    <>
      <FHeader />
      <div className="jobApplyissuesHelp-page">
        <div className="jobApplyissuesHelp-container">
          <h1 className="jobApplyissuesHelp-title">{applyHelpData.title}</h1>
          <p className="jobApplyissuesHelp-updated">{applyHelpData.updatedDate}</p>
          <p className="jobApplyissuesHelp-intro">{applyHelpData.intro}</p>

          <div className="jobApplyissuesHelp-layout">
            <div className="jobApplyissuesHelp-left">
              <img 
                src={JobApplyImg} 
                alt="Troubleshooting Job Applications" 
                className="jobApplyissuesHelp-hero-img"
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }} 
              />
            </div>

            <div className="jobApplyissuesHelp-right">
              <div className="jobApplyissuesHelp-steps-container" style={{ marginTop: 0 }}>
                <h2>Troubleshooting Summary</h2>
                <ul className="jobApplyissuesHelp-steps-list">
                  {applyHelpData.summary.map((item, index) => (
                    <li 
                      key={index} 
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="jobApplyissuesHelp-detailed-steps">
            <h2>Detailed Troubleshooting Guide:</h2>

            <div className="jobApplyissuesHelp-detailed-step">
              <h3>1. Technical Troubleshooting</h3>
              <p>If the "Apply" button isn't working or the page keeps crashing, try these quick fixes:</p>
              <ul>
                <li><strong>Browser Compatibility:</strong> Many older ATS struggle with Safari or Brave. Switch to Google Chrome or Firefox for the best compatibility.</li>
                <li><strong>Clear Cache/Cookies:</strong> Corrupted site data is the #1 cause of "infinite loading" loops.</li>
                <li><strong>File Format & Size:</strong> Stick to .pdf or .docx. Most portals have a 5MB or 10MB limit.</li>
                <li><strong>Ad-Blockers:</strong> Disable extensions like uBlock Origin or AdBlock.</li>
              </ul>
            </div>

            <div className="jobApplyissuesHelp-detailed-step">
              <h3>2. Resume Parsing Issues</h3>
              <p>If the portal "reads" your resume but fills the form with garbled text or incorrect dates:</p>
              <ul>
                <li><strong>Simplify the Design:</strong> ATS systems struggle with two-column layouts and complex graphics.</li>
                <li><strong>Use Standard Headings:</strong> Stick to "Work Experience," "Education," and "Skills."</li>
                <li><strong>The "Text Test":</strong> Copy and paste your resume into Notepad to check for jumbled text.</li>
              </ul>
            </div>

            <div className="jobApplyissuesHelp-detailed-step">
              <h3>3. Submission Errors (The "Missing Field" Trap)</h3>
              <ul>
                <li><strong>Hidden Checkboxes:</strong> Look for small "Agree to Terms" checkboxes at the very bottom.</li>
                <li><strong>Address Validation:</strong> Select your city/state from the dropdown list.</li>
                <li><strong>Character Limits:</strong> Ensure text doesn't exceed the limit (often 2,000–4,000 characters).</li>
              </ul>
            </div>

            <div className="jobApplyissuesHelp-detailed-step">
              <h3>4. Application Status Issues</h3>
              <ul>
                <li><strong>The "Knock-out" Questions:</strong> Answering "No" to mandatory requirements may trigger auto-rejection.</li>
                <li><strong>Keywords:</strong> Ensure your resume uses exact phrases found in the job description.</li>
              </ul>
            </div>

            <div className="jobApplyissuesHelp-detailed-step">
              <h3>5. What to do if an application fails mid-way</h3>
              <ol className="jobApplyissuesHelp-steps-list" style={{ paddingLeft: '24px' }}>
                <li><strong>Don't Re-apply Immediately:</strong> Multiple attempts can flag you as spam.</li>
                <li><strong>Check Your Email:</strong> Look for a "Finish your application" link in your inbox.</li>
                <li><strong>Find a Contact:</strong> Email the company's HR directly with your resume attached.</li>
              </ol>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};