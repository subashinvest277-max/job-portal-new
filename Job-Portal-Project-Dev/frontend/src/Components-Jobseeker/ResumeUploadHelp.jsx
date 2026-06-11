import React from "react";
import { Footer } from "../Components-LandingPage/Footer";
import { FHeader } from "./FHeader";
import ResumeHelpImg from "../assets/Resume_upload_image.png";
import "./ResumeUploadHelp.css";

export const ResumeUploadHelp = () => {

  const resumeHelpData = {
    updatedDate: "Updated 26 Feb 2026",
    intro:
      "A well-uploaded and professionally named resume is the bridge between your profile and a recruiter's shortlist. Follow this guide to ensure your document is processed correctly by the portal's applicant tracking system."
  };

  const resumeUploadSteps = [
    "Sign up or sign in to the portal using your credentials.",
    "After successful login, you will be redirected to the Home page.",
    "Click on the Profile menu available at the top-right corner.",
    "From the dropdown options, select Profile.",
    "In the Profile section, click on the Resume option from the left-side menu.",
    "Click on Upload Resume.",
    "Choose your resume file from your device (PDF, DOC, or DOCX).",
    "Click on Save & Continue to complete the upload process.",
    "Your resume will be successfully saved to your profile."
  ];

  return (
    <>
      <FHeader />
      <div className="profilehelp-page">
        <div className="profilehelp-container">
          <h1 className="profilehelp-title">
             Resume Upload
          </h1>

          <p className="profilehelp-updated">
            {resumeHelpData.updatedDate}
          </p>
          <p className="profilehelp-intro">
            {resumeHelpData.intro}
          </p>

          <div className="profilehelp-layout">
            <div className="profilehelp-left">
               <img 
                src={ResumeHelpImg} 
                alt="Resume Upload Process" 
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }} 
              />
            </div>

            <div className="profilehelp-right">
              <div className="profilehelp-steps-container" style={{ marginTop: 0 }}>
                <h2>Resume Upload Summary</h2>
                <ul className="profilehelp-steps-list">
                  {resumeUploadSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="profilehelp-detailed-steps">
            <h2>Step-by-Step Resume Guidelines:</h2>
            
            <div className="detailed-step">
              <h3>1. Accessing the Profile Area</h3>
              <ul>
                <li><strong>Navigating the Interface:</strong> Following the Top-Right Profile Icon → Profile → Left-Side Resume Menu path is the standard industry layout for user experience (UX).</li>
              </ul>
            </div>

            <div className="detailed-step">
              <h3>2. Preparing the File (The "Pre-Upload" Check)</h3>
              <ul>
                <li><strong>Naming Convention:</strong> Rename your file professionally before uploading. 
                  <br/><em>Bad: resume_final_v2_updated.pdf</em>
                  <br/><em>Good: Firstname_Lastname_Developer_Resume.pdf</em>
                </li>
                <li><strong>Format Selection:</strong> 
                  <br/><strong>PDF:</strong> Best for preserving layout and fonts across all devices.
                  <br/><strong>DOCX:</strong> Best if the portal uses older parsing systems to extract text.
                </li>
                <li><strong>Size Constraint:</strong> Ensure your file is under 5MB. Use a PDF compressor if you have many images or icons to avoid rejection.</li>
              </ul>
            </div>

            <div className="detailed-step">
              <h3>3. The Upload Action</h3>
              <ul>
                <li><strong>File Selection:</strong> Ensure you aren't selecting a "temporary" or "cached" version of your document from your file explorer.</li>
                <li><strong>Portfolio/Website Link:</strong> Use the relevant section to provide direct links to your LinkedIn, or Personal Portfolio website.</li>
              </ul>
            </div>

            <div className="detailed-step">
              <h3>4. Saving and Validation</h3>
              <ul>
                <li><strong>Save & Continue:</strong> This is the most vital step. Clicking "Upload" often only puts the file in temporary storage; clicking Save & Continue commits it to your permanent record.</li>
                <li><strong>Success Verification:</strong> Once the "Uploaded Successfully" message appears, click "View" or "Download" to see how the portal rendered your document. If it looks garbled, you may need to simplify your resume's design.</li>
              </ul>
            </div>
          </div>

        </div>
        <Footer />
      </div>
    </>
  );
};