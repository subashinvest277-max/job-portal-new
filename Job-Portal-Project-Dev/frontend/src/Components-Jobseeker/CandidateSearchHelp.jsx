import React from "react";
import { Footer } from "../Components-LandingPage/Footer";
import "./JobEmployerHelp.css";
import CandidateSearchImg from "../assets/Candidatesearch.png";
import { FHeader } from './FHeader';

export const CandidateSearchHelp = () => {
  const candidateData = {
    title: "How to Use Candidate Search",
    updatedDate: "Updated 27 Feb 2026",
    intro: "Finding the right talent requires a strategic approach. Use our search tools to identify, engage, and secure high-quality candidates for your team.",
    
    summary: [
      "<strong>Define Needs:</strong> Outline roles, skills, and qualifications.",
      "<strong>Source Strategy:</strong> Choose the best channels for the role.",
      "<strong>Search Passive Talent:</strong> Look beyond active applicants.",
      "<strong>Shortlist:</strong> Use filters to identify top qualifications.",
      "<strong>Structured Interviews:</strong> Standardize questions for fairness.",
      "<strong>Engage Talent:</strong> Communicate quickly and transparently.",
      "<strong>Secure Hires:</strong> Make competitive, detailed offers fast."
    ],

    sections: [
      {
        title: "1. Preparation and Strategy",
        list: [
          "<strong>Define Hiring Needs:</strong> Clearly outline the job title, daily responsibilities, mandatory skills, and educational background before starting your search.",
          "<strong>Draft an Impactful JD:</strong> Create a compelling Job Description that highlights growth opportunities and company culture to give candidates a realistic view of the position.",
          "<strong>Employer Branding (EVP):</strong> Define your Employer Value Proposition—what makes your company a great place to work—to attract high-quality passive candidates."
        ]
      },
      {
        title: "2. Sourcing and Identification",
        list: [
          "<strong>Determine Sourcing Strategy:</strong> Identify the best channels for the role, whether it's niche job boards, social media, or campus hiring.",
          "<strong>Utilize Employee Referrals:</strong> Leverage your team's professional network. Referred candidates often fit the company culture better and are hired faster.",
          "<strong>Search for Passive Talent:</strong> Actively look for high-skilled professionals who may not be actively searching for jobs but are open to the right opportunity."
        ]
      },
      {
        title: "3. Screening and Engagement",
        list: [
          "<strong>Optimize the Application:</strong> Ensure your application process is mobile-friendly and simple to reduce candidate drop-off rates.",
          "<strong>Shortlist with Precision:</strong> Review resumes for key qualifications. Use screening calls to filter top applicants before moving to the interview stage.",
          "<strong>Conduct Structured Interviews:</strong> Use a standardized set of behavioral and competency-based questions for all candidates to ensure fairness and reduce bias."
        ]
      },
      {
        title: "4. Closing the Deal",
        list: [
          "<strong>Secure Talent:</strong> Offer a great experience through quick, transparent communication. Move quickly to make a competitive, detailed offer once a choice is made.",
          "<strong>Build Relationships:</strong> Invest in a 'warm bench' of potential candidates even when you don't have an immediate open role."
        ]
      },
      {
        title: "💡 Key Tips for Success",
        list: [
          "<strong>Prioritize Diversity (DEI):</strong> Actively search diverse talent pools and use inclusive language in your job descriptions to reach a broader audience.",
          "<strong>Data-Driven Decisions:</strong> Track metrics like 'time-to-fill' and 'source-of-hire' to see which platforms provide the best ROI for your recruitment budget.",
          "<strong>The Need for Speed:</strong> Top talent is often off the market in days. Aim for a 24-48 hour response time for initial candidate outreach."
        ]
      }
    ]
  };

  return (
    <>
      <FHeader />
      <div className="jobemployerhelp-page">
        <div className="jobemployerhelp-container">
          <h1 className="jobemployerhelp-title">{candidateData.title}</h1>
          <p className="jobemployerhelp-updated">{candidateData.updatedDate}</p>
          <p className="jobemployerhelp-intro">{candidateData.intro}</p>

          <div className="jobemployerhelp-layout" style={{ display: 'flex', gap: '30px', marginBottom: '40px', flexWrap: 'wrap' }}>
            <div className="jobemployerhelp-left" style={{ flex: '1 1 400px' }}>
              <img
                src={CandidateSearchImg}
                alt="Candidate Search Strategy"
                className="jobemployerhelp-hero-img"
                style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
              />
            </div>

            <div className="jobemployerhelp-right" style={{ flex: '1 1 300px', backgroundColor: '#f0f4f8', padding: '25px', borderRadius: '12px', border: '1px solid #d1d9e0' }}>
              <h2 style={{ marginTop: 0, color: '#24292e' }}>Search Summary</h2>
              <ul className="jobemployerhelp-summary-list" style={{ listStyle: 'none', padding: 0 }}>
                {candidateData.summary.map((item, index) => (
                  <li key={index} style={{ marginBottom: '12px', display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ color: '#0366d6', marginRight: '10px' }}>🔍</span>
                    <span dangerouslySetInnerHTML={{ __html: item }} />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="jobemployerhelp-content">
            {candidateData.sections.map((section, index) => (
              <div key={index} className="jobemployerhelp-section" style={{ marginBottom: '40px' }}>
                <h2 style={{ borderBottom: '2px solid #0366d6', display: 'inline-block', paddingBottom: '5px', marginBottom: '20px' }}>
                  {section.title}
                </h2>
                {section.list && (
                  <ul className="jobemployerhelp-list" style={{ listStyleType: 'none', paddingLeft: '0' }}>
                    {section.list.map((item, i) => (
                      <li key={i} style={{ marginBottom: '15px', lineHeight: '1.7', color: '#444' }} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};