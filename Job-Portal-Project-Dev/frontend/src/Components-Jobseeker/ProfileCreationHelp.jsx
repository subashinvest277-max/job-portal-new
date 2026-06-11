import React from "react";
import { Footer } from "../Components-LandingPage/Footer";
import "./ProfileCreationHelp.css";
import { FHeader } from "./FHeader";
 
export const ProfileCreationHelp = () => {
 
  const profileHelpData = {
    updatedDate: "Updated 13 Aug 2025",
    intro:
      "An online job profile is a powerful way to tell employers about yourself by highlighting your skills and experience."
  };
 
  const profileCreationSteps = [
    "Sign up or sign in to the portal using the required details or your existing credentials.",
    "After successful login, you will be redirected to the Home page.",
    "On the Home page, navigate to the top-right corner and click on the Profile menu.",
    "From the dropdown options, select Profile.",
    "Upload your profile image.",
    "Fill in all the required fields carefully, entering your details one by one.",
    "After completing all the information, click on Save and Continue.",
    "Your profile will be created successfully."
  ];
 
  return (
    <>
      <FHeader />
      <div className="profilehelp-page">
        <div className="profilehelp-container">
          <h1 className="profilehelp-title">
            How to create an online job profile
          </h1>
 
          <p className="profilehelp-updated">
            {profileHelpData.updatedDate}
          </p>
          <p className="profilehelp-intro">
            {profileHelpData.intro}
          </p>
 
          <div className="profilehelp-layout">
           
            <div className="profilehelp-left">
              <svg viewBox="0 0 880 660" style={{ width: '100%', height: 'auto', minWidth: '550px' }}>
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#333" />
                  </marker>
                </defs>
 
                <path d="M 425 60 L 425 95" stroke="#333" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
                <path d="M 340 160 L 225 160" stroke="#333" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
                <path d="M 510 160 L 625 160" stroke="#333" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
                <path d="M 150 190 L 150 350" stroke="#333" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
                <path d="M 700 190 L 700 230" stroke="#333" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
                <path d="M 700 290 L 700 310" stroke="#333" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
               
                <path d="M 615 380 L 575 380" stroke="#333" strokeWidth="1.5" fill="none" />
                <path d="M 540 380 L 500 380" stroke="#333" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
               
                <path d="M 785 380 L 840 380 L 840 335" stroke="#333" strokeWidth="1.5" fill="none" />
                <path d="M 840 305 L 840 260 L 775 260" stroke="#333" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
               
                <path d="M 225 380 L 350 380" stroke="#333" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
                <path d="M 425 410 L 425 435" stroke="#333" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
                <path d="M 340 500 L 225 500" stroke="#333" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
                <path d="M 510 500 L 625 500" stroke="#333" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
                <path d="M 150 530 L 150 590" stroke="#333" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
                <path d="M 225 620 L 350 620" stroke="#333" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
 
                <rect x="350" y="0" width="150" height="60" rx="12" ry="12" fill="#f38d1e" stroke="#333" strokeWidth="1" />
                <rect x="75" y="130" width="150" height="60" rx="4" ry="4" fill="#4ea4ff" stroke="#333" strokeWidth="1" />
                <polygon points="425,95 510,160 425,225 340,160" fill="#0e4a83" stroke="#4ea4ff" strokeWidth="3" />
                <rect x="625" y="130" width="150" height="60" rx="4" ry="4" fill="#4ea4ff" stroke="#333" strokeWidth="1" />
                <rect x="625" y="230" width="150" height="60" rx="4" ry="4" fill="#4ea4ff" stroke="#333" strokeWidth="1" />
                <rect x="75" y="350" width="150" height="60" rx="4" ry="4" fill="#4ea4ff" stroke="#333" strokeWidth="1" />
                <rect x="350" y="350" width="150" height="60" rx="4" ry="4" fill="#4ea4ff" stroke="#333" strokeWidth="1" />
                <polygon points="700,310 785,380 700,450 615,380" fill="#0e4a83" stroke="#4ea4ff" strokeWidth="3" />
                <rect x="75" y="470" width="150" height="60" rx="4" ry="4" fill="#4ea4ff" stroke="#333" strokeWidth="1" />
                <polygon points="425,435 510,500 425,565 340,500" fill="#0e4a83" stroke="#4ea4ff" strokeWidth="3" />
                <rect x="625" y="470" width="150" height="60" rx="4" ry="4" fill="#4ea4ff" stroke="#333" strokeWidth="1" />
                <rect x="75" y="590" width="150" height="60" rx="4" ry="4" fill="#4ea4ff" stroke="#333" strokeWidth="1" />
                <rect x="350" y="590" width="150" height="60" rx="12" ry="12" fill="#f38d1e" stroke="#333" strokeWidth="1" />
 
                <text x="558" y="380" dominantBaseline="middle" textAnchor="middle" fill="black" fontSize="14" fontWeight="bold" fontFamily="sans-serif">Yes</text>
                <text x="840" y="320" dominantBaseline="middle" textAnchor="middle" fill="black" fontSize="14" fontWeight="bold" fontFamily="sans-serif">No</text>
 
                <text x="425" y="30" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Landing page</text>
                <text x="150" y="160" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Sign up</text>
                <text x="425" y="160" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Login account</text>
                <text x="700" y="160" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Login</text>
                <text x="700" y="250" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Enter mail ID and</text>
                <text x="700" y="270" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">password</text>
                <text x="150" y="370" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Fill required</text>
                <text x="150" y="390" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">details</text>
                <text x="425" y="380" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Home</text>
                <text x="700" y="360" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Valid mail ID</text>
                <text x="700" y="380" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">and</text>
                <text x="700" y="400" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">password</text>
                <text x="150" y="500" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Create profile</text>
                <text x="425" y="500" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Profile</text>
                <text x="700" y="500" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Existing profile</text>
                <text x="150" y="610" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Submit all the required</text>
                <text x="150" y="630" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">details</text>
                <text x="425" y="620" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Profile created</text>
              </svg>
            </div>
 
            <div className="profilehelp-right">
              <div className="profilehelp-steps-container" style={{ marginTop: 0 }}>
                <h2>Profile Creation Summary</h2>
                <ul className="profilehelp-steps-list">
                  {profileCreationSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
 
          </div>
 
          <div className="profilehelp-detailed-steps">
            <h2>Step-by-Step Profile Creation:</h2>
           
            <div className="detailed-step">
              <h3>1. Authentication (Sign Up/Sign In)</h3>
              <ul>
                <li><strong>New Users:</strong> Use a professional email address (e.g., firstname.lastname@email.com). Avoid using nicknames or outdated handles.</li>
                <li><strong>Social Login:</strong> If the portal allows "Sign in with Google," use it to save time, but ensure the account you link is professional and up-to-date.</li>
              </ul>
            </div>
 
            <div className="detailed-step">
              <h3>2. Initial Navigation & Profile</h3>
              <ul>
                <li><strong>The Home Page:</strong> Once logged in, the "Home" page serves as your central command center. You will see a welcoming "Welcome Back!" message and a specialized search bar to explore jobs tailored for you.</li>
                <li><strong>Profile Completion Bar:</strong> While not currently visible in the top fold of this specific image, most dashboards include a completion bar; your goal is always to reach 100% to ensure maximum visibility to recruiters.</li>
                <li><strong>The Profile Menu:</strong> To manage your account, look for the User Profile icon (represented by a blue person icon) in the top-right corner of the navigation bar.</li>
              </ul>
            </div>
 
            <div className="detailed-step">
              <h3>3. Professional Profile Image</h3>
              <ul>
                <li>Use a high-resolution photo with good lighting, a neutral background (like a white wall), and professional attire.</li>
                <li><strong>Technical Tip:</strong> Ensure the file is a JPG or PNG and usually under 2MB. Avoid "selfies," group photos, or cropped photos from social events.</li>
              </ul>
            </div>
 
            <div className="detailed-step">
              <h3>4. Entering Detailed Information</h3>
             
              <h4>Personal Info & Basic Details</h4>
              <ul>
                <li><strong>Profile Picture:</strong> Upload a professional photo in JPG, JPEG, or PNG format to make your profile stand out.</li>
                <li><strong>Core Identity:</strong> Accurately enter your Full Name, Gender, Date of Birth, Marital Status, and Nationality.</li>
                <li><strong>Location Strategy:</strong> Under Current Details, specify your Current Location and list Preferred Location(s) like Bangalore or Chennai to ensure you appear in local recruiter searches.</li>
                <li><strong>Contact Accuracy:</strong> Double-check your Mobile Number and Email ID under Contact Details so recruiters can reach you without technical delays.</li>
              </ul>
 
              <h4>2. Professional Summary & Current Status</h4>
              <ul>
                <li><strong>Elevator Pitch:</strong> While the portal asks for your Current Job Title and Current Company, use these fields to clearly define your professional identity (e.g., Software Engineer).</li>
                <li><strong>Notice Period:</strong> Be precise with your Notice Period selection, as this is a primary filter used by HR teams for urgent hiring.</li>
                <li><strong>Experience Level:</strong> Indicate your Total Experience (Years) clearly; if you are just starting out, ensure your "Current Status" is set correctly in the Work Experience section.</li>
              </ul>
 
              <h4>3. Experience & Education</h4>
              <ul>
                <li><strong>Work Experience:</strong> Under the Work Experience tab, define your Current Status (e.g., Fresher or Experienced) and confirm if you have any prior internship or work history.</li>
                <li><strong>Chronological Order:</strong> When filling out the Education Details and Work Experience menus, always list your most recent achievements first to help the system parse your current seniority level.</li>
              </ul>
 
              <h4>4. Skills & Certifications Section</h4>
              <ul>
                <li><strong>Technical Tagging:</strong> Use the Skills & Certifications dropdown to navigate to Key Skills.</li>
                <li><strong>Specific Keywords:</strong> List technical skills like Python, Django, React, or Git as individual tags so the portal's search engine can match your profile to specific job descriptions.</li>
                <li><strong>Language & Certs:</strong> Complete the Languages Known and Certifications sub-menus to provide a 360-degree view of your qualifications.</li>
              </ul>
 
              <h4>5. Finalizing the Process</h4>
              <ul>
                <li><strong>Left-Side Navigation:</strong> Use the sidebar menu to jump between sections like Resume, Education Details, and Preferences.</li>
                <li><strong>The "Reset" Safety:</strong> If you make a mistake on a specific form, use the Reset button in the top-right corner to clear the fields and start over.</li>
                <li><strong>The Final Step:</strong> Always click the blue Save & Continue button at the bottom of each page. This action locks in your data and moves you to the next required section, ensuring your profile reaches 100% completion.</li>
              </ul>
            </div>
          </div>
 
        </div>
        <Footer />
      </div>
    </> 
  );
}
 