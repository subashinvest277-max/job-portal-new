import React from 'react'
import './Newsletter.css'
import api from '../api/axios'

export const Newsletter = () => {
  async function newsletterHandler(e) {
    e.preventDefault();
    // Get form data from the event
    const formData = new FormData(e.target);
    const email = formData.get("emailForNewsletter");

    try {
      const res = await api.post('subscribe/', { email: email });
      // Check what your API returns and adjust accordingly
      if (res.data.message) {
        alert(res.data.message); // If API returns {message: "Success"}
      } else {
        alert("Subscribed successfully!");
      }
      // Optionally clear the form
      e.target.reset();
    } catch (error) {
      // Better error handling
      if (error.response) {
        // Server responded with error
        alert(error.response.data.detail || error.response.data.message || "Subscription failed");
      } else if (error.request) {
        // Request made but no response
        alert("Network error. Please check your connection.");
      } else {
        // Something else happened
        alert("An error occurred. Please try again.");
      }
      console.error("Subscription error:", error);
    }
  }

  return (
    <section className="newsletter-section">
      <h2 className="newsletter-title">“Be The First To Know”</h2>
      <p className="newsletter-subtitle">
        Subscribe To Our Newsletter For Fresh Job Openings And Expert Career Tips—Straight To Your Inbox.
      </p>
      <form
        className="newsletter-form"
        onSubmit={newsletterHandler}
        method="POST"  // Added method
      >
        <input
          type="email"
          name="emailForNewsletter"
          aria-label="email for newsletter"
          placeholder="Enter your email"
          className='newsletter-input'
          required  // Added required attribute
        />
        <button className='newsletter-button' type="submit">Subscribe</button>
      </form>
    </section>
  )
}