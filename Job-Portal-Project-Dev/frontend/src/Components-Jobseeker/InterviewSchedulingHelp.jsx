import React from "react";
import "./InterviewSchedulingHelp.css"; 
import { Footer } from "../Components-LandingPage/Footer";
import InterviewImg from "../assets/Interview_scheduling_help.png";
import { FHeader } from './FHeader';

export const InterviewSchedulingHelp = () => {
  const interviewData = {
    title: "Interview Scheduling",
    updatedDate: "Updated 06 Feb 2026",
    intro: "Scheduling is the first official step in the interview process. Handling this professionally sets a positive tone for your upcoming meeting with the employer.",
    summary: [
      "<strong>Access the Link:</strong> Open the scheduling link provided in your email.",
      "<strong>Time Zone Verification:</strong> Ensure the calendar matches your local time.",
      "<strong>Select a Date:</strong> Choose a day on the calendar that fits your schedule.",
      "<strong>Pick a Time Slot:</strong> Select a specific window from the list of available times.",
      "<strong>Enter Details:</strong> Provide your name, email, and required contact info.",
      "<strong>Confirm Booking:</strong> Click the 'Confirm' or 'Book' button to lock your slot.",
      "<strong>Verify Confirmation:</strong> Check your inbox for the meeting link (Zoom/Teams/Meet).",
      "<strong>Sync to Calendar:</strong> Add the event to your personal calendar immediately.",
      "<strong>Final Technical Check:</strong> Test your camera and mic 10 minutes before the start."
    ],
    troubleshooting: [
      { status: "No slots available?", solution: "Email recruiter immediately for new dates." },
      { status: "Link not working?", solution: "Switch browsers (Chrome/Firefox) or clear cache." },
      { status: "No meeting link in email?", solution: "Check the 'Location' field in the calendar invite." }
    ]
  };

  return (
    <>
    
      <FHeader />
      <div className="interviewSchedulingHelp-page">
        <div className="interviewSchedulingHelp-container">
          <h1 className="interviewSchedulingHelp-title">{interviewData.title}</h1>
          <p className="interviewSchedulingHelp-updated">{interviewData.updatedDate}</p>
          <p className="interviewSchedulingHelp-intro">{interviewData.intro}</p>

          <div className="interviewSchedulingHelp-layout">
            <div className="interviewSchedulingHelp-left">
              <img 
                src={InterviewImg} 
                alt="Interview Scheduling Process" 
                className="interviewSchedulingHelp-hero-img"
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }} 
              />
            </div>

            <div className="interviewSchedulingHelp-right">
              <div className="interviewSchedulingHelp-steps-container" style={{ marginTop: 0 }}>
                <h2>Scheduling Summary</h2>
                <ul className="interviewSchedulingHelp-steps-list">
                  {interviewData.summary.map((item, index) => (
                    <li 
                      key={index} 
                      dangerouslySetInnerHTML={{ __html: item }} 
                    />
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="interviewSchedulingHelp-detailed-steps">
            <h2>Step-by-Step Guide to Interview Scheduling</h2>

            <div className="interviewSchedulingHelp-detailed-step">
              <h3>1. Receive and Review the Invitation</h3>
              <ul>
                <li><strong>Check the Source:</strong> Employers typically reach out via email or job platforms like Indeed.</li>
                <li><strong>Confirm Details:</strong> Ensure the invite specifies the job title, format (phone, video, or in-person), and duration.</li>
                <li><strong>Research Interviewers:</strong> Identify names and titles to research them on LinkedIn beforehand.</li>
              </ul>
            </div>

            <div className="interviewSchedulingHelp-detailed-step">
              <h3>2. Confirm or Select a Time Slot</h3>
              <ul>
                <li><strong>Access the Link:</strong> Open the scheduling link (Calendly or Jobvite) provided; use Incognito mode if the page fails to load.</li>
                <li><strong>Time Zone Verification:</strong> Always verify that the displayed time zone matches your local time to avoid missed meetings.</li>
                <li><strong>Select Date & Time:</strong> Browse available dates and pick a specific time slot that fits your schedule.</li>
                <li><strong>Manual Proposals:</strong> If replying via email, suggest 2–3 specific windows to reduce back-and-forth communication.</li>
                <li><strong>Optimal Timing:</strong> Aim for mid-morning (9:00 AM – 11:00 AM) Tuesday through Thursday for better engagement.</li>
              </ul>
            </div>

            <div className="interviewSchedulingHelp-detailed-step">
              <h3>3. Finalize Logistics and Confirmation</h3>
              <ul>
                <li><strong>Enter Details:</strong> Provide your name, email, and required info like your phone number or portfolio link.</li>
                <li><strong>Confirm Booking:</strong> Click Confirm, Schedule Event, or Book to lock in your slot.</li>
                <li><strong>Verify Confirmation:</strong> Immediately check your inbox for a "Booking Confirmed" email containing the Zoom, Teams, or Google Meet link.</li>
                <li><strong>Sync to Calendar:</strong> Use the provided .ics link or calendar invite to save the meeting and prevent double-booking.</li>
              </ul>
            </div>

            <div className="interviewSchedulingHelp-detailed-step">
              <h3>4. Manage Rescheduling & Follow-ups</h3>
              <ul>
                <li><strong>Rescheduling:</strong> Only reschedule for emergencies; notify the recruiter immediately and suggest alternative times.</li>
                <li><strong>Acknowledgment:</strong> Send a brief "thank you" email once booked to confirm that you are all set.</li>
                <li><strong>Technical Check:</strong> 10 minutes before the start, click the meeting link to test your camera and microphone.</li>
              </ul>
            </div>

            <div className="interviewSchedulingHelp-detailed-step">
              <h3>Quick Troubleshooting Guide</h3>
              <ul className="interviewSchedulingHelp-steps-list">
                {interviewData.troubleshooting.map((item, index) => (
                  <li key={index}>
                    <strong>{item.status}</strong> — {item.solution}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};