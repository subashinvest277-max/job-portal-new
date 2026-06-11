import React from "react";
import { Footer } from "../Components-LandingPage/Footer";
import "./JobEmployerHelp.css";
import SubscriptionImg from "../assets/Subscriptionissues.png";
import { FHeader } from "./FHeader";

export const SubscriptionIssuesHelp = () => {
  const subscriptionData = {
    title: "Subscription & Billing Support",
    updatedDate: "Updated 27 Feb 2026",
    intro: "Managing your membership effectively is key to avoiding unwanted charges. Follow this guide to locate, manage, or cancel your active subscriptions effectively.",

    summary: [
      "<strong>Identify Method:</strong> App Store, Google Play, or Direct Web.",
      "<strong>Payment Method:</strong> UPI, Card Payments, Mobile App Store Payments, Electronic Transfers, and Bank Account Linking etc...",
      "<strong>Billing Settings:</strong> Locate the 'Subscription' tab in your profile.",
      "<strong>Cancel Early:</strong> Stop auto-renew at least 24h before the cycle.",
      "<strong>Proof of Action:</strong> Save confirmation emails and screenshots.",
      "<strong>Verify Status:</strong> Ensure your account shows 'Cancelled' or 'Expired'.",
      "<strong>Support Ticket:</strong> Contact help if the 'Cancel' button is missing.",
      "<strong>Refund Request:</strong> File within 48 hours for accidental renewals."
    ],

    sections: [
      {
        title: "1. Locate and Manage Your Subscription",
        list: [
          "<strong>Identify Your Platform:</strong> Determine if you subscribed through our website (Credit Card/Stripe) or via the Apple App Store or Google Play Store. The cancellation must happen on the platform where you started the trial.",
          "<strong>Log In and Check Settings:</strong> Sign in to your account, navigate to your profile, and check the <strong>'Billing'</strong> or <strong>'Subscription'</strong> section to view your current plan and renewal date.",
          "<strong>The Cancellation Process:</strong> Locate the 'Cancel Subscription' button. If you are on mobile, you likely need to go to your phone's 'Subscribed Apps' list in system settings to toggle it off."
        ]
      },
      {
        title: "2. Verification and Evidence",
        list: [
          "<strong>Confirm via Email:</strong> Always ensure you receive a confirmation email. If you don't see one in your inbox or spam, the cancellation might not have been successful.",
          "<strong>Gather Proof:</strong> Take screenshots of your dashboard showing the 'Cancelled' status. This is your primary evidence if a billing error occurs later.",
          "<strong>Block Charges:</strong> If charges continue despite proof of cancellation, contact your bank immediately to block future transactions from the service."
        ]
      },
      {
        title: "3. Refund and Support Policies",
        list: [
          "<strong>Requesting a Refund:</strong> If you were charged after a confirmed cancellation, contact customer support via the official form immediately. Include your account email and the date of cancellation.",
          "<strong>Trial Conversions:</strong> Be aware that most $0.01 trials convert to full-price monthly plans automatically. We recommend cancelling immediately after starting a trial if you do not wish to continue.",
          "<strong>App Deletion vs. Cancellation:</strong> ⚠️ <em>Important:</em> Uninstalling the app from your phone <strong>does not</strong> stop the billing cycle. You must manually cancel the subscription in settings."
        ]
      },
      {
        title: "Billing Policies & Legal Protections",
        list: [
          "<strong>No Refunds Policy:</strong> Many premium job features have a 'no refund' policy for changes of mind; timely cancellation is critical.",
          "<strong>Authorized Payments:</strong> If a subscription fails, check that your bank allows recurring international/online payments.",
          "<strong>Consumer Rights:</strong> If the service remains unresponsive to cancellation requests, file a complaint on consumer protection platforms to enforce your rights."
        ]
      }
    ]
  };

  return (
    <>
      <FHeader />
      <div className="jobemployerhelp-page">
        <div className="jobemployerhelp-container">
          <h1 className="jobemployerhelp-title">{subscriptionData.title}</h1>
          <p className="jobemployerhelp-updated">{subscriptionData.updatedDate}</p>
          <p className="jobemployerhelp-intro">{subscriptionData.intro}</p>

          <div className="jobemployerhelp-layout" style={{ display: 'flex', gap: '30px', marginBottom: '40px', flexWrap: 'wrap' }}>
            <div className="jobemployerhelp-left" style={{ flex: '1 1 400px' }}>
              <img
                src={SubscriptionImg}
                alt="Subscription Management Illustration"
                className="jobemployerhelp-hero-img"
                style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
              />
            </div>

            <div className="jobemployerhelp-right" style={{ flex: '1 1 300px', backgroundColor: '#fff9f0', padding: '25px', borderRadius: '12px', border: '1px solid #ffeeba' }}>
              <h2 style={{ marginTop: 0, color: '#856404' }}>Quick Checklist</h2>
              <ul className="jobemployerhelp-summary-list" style={{ listStyle: 'none', padding: 0 }}>
                {subscriptionData.summary.map((item, index) => (
                  <li key={index} style={{ marginBottom: '12px', display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ color: '#ffc107', marginRight: '10px' }}>💳</span>
                    <span dangerouslySetInnerHTML={{ __html: item }} />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="jobemployerhelp-content">
            {subscriptionData.sections.map((section, index) => (
              <div key={index} className="jobemployerhelp-section" style={{ marginBottom: '40px' }}>
                <h2 style={{ borderBottom: '2px solid #ffc107', display: 'inline-block', paddingBottom: '5px', marginBottom: '20px' }}>
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