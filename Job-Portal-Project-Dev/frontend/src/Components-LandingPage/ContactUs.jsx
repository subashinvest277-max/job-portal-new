import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FHeader } from '../Components-Jobseeker/FHeader';
import { Footer } from '../Components-LandingPage/Footer';
import ContactImage from '../assets/Contactus.png';
import './ContactUs.css';

export const ContactUs = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const initialValues = { name: "", email: "", contact: "", message: "" };
  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const token = sessionStorage.getItem('access');  // ← CHANGED

      if (!token) {
        setIsAuthenticated(false);
        setLoadingAuth(false);
        return;
      }

      try {
        const response = await api.get('/users/me/');
        const user = response.data;
        
        setIsAuthenticated(true);
        setFormValues(prev => ({
          ...prev,
          name: user.name || user.username || "",
          email: user.email || "",
          contact: user.phone || "",
        }));
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        if (error.response?.status === 401) {
          sessionStorage.removeItem('access');  // ← CHANGED
          sessionStorage.removeItem('refresh'); // ← CHANGED
        }
        setIsAuthenticated(false);
      } finally {
        setLoadingAuth(false);
      }
    };

    fetchUserData();
  }, []);

  // Rest of the code remains same...
  const handleForm = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9]*@(gmail|yahoo|outlook|hotmail)\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!formValues.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!nameRegex.test(formValues.name)) {
      newErrors.name = "Name should contain only letters";
    }

    if (!formValues.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formValues.email)) {
      newErrors.email = "Enter valid email (gmail, yahoo, outlook, hotmail)";
    }

    if (!formValues.contact.trim()) {
      newErrors.contact = "Contact number is required";
    } else if (!phoneRegex.test(formValues.contact)) {
      newErrors.contact = "Phone must be 10 digits & start with 6-9";
    }

    if (!formValues.message.trim()) {
      newErrors.message = "Message cannot be empty";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setServerMessage("");

      const response = await api.post("contact/create/", formValues, {
        headers: { "Content-Type": "application/json" }
      });

      setServerMessage(response.data.message || "Message sent successfully");
      setFormValues(initialValues);

      if (isAuthenticated) {
        const userRes = await api.get('/users/me/');
        const user = userRes.data;
        setFormValues(prev => ({
          ...prev,
          name: user.name || user.username || "",
          email: user.email || "",
          contact: user.phone || "",
        }));
      }

    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setServerMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="contact-page">
        <FHeader />
        <div className="contact-container" style={{ textAlign: "center", padding: "50px" }}>
          Loading...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="contact-page">
      <FHeader />
      <div className="contact-container">
        <div className="contact-left">
          <img src={ContactImage} loading="eager" alt="Contact Us" />
        </div>
        <div className="contact-right">
          <h2>Contact Us</h2>
          <p className="contact-subtitle">Send us messages</p>
          <p className="contact-desc">
            Do you have a question? or need any help
          </p>
          {serverMessage && (
            <p style={{ color: "green", textAlign: "center" }}>
              {serverMessage}
            </p>
          )}
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="contact-form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formValues.name}
                onChange={handleForm}
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>
            <div className="contact-form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email ID"
                value={formValues.email}
                onChange={handleForm}
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>
            <div className="contact-form-group">
              <label>Contact number</label>
              <input
                type="tel"
                name="contact"
                placeholder="Enter your number"
                value={formValues.contact}
                maxLength={10}
                inputMode="numeric"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[6-9]?\d{0,9}$/.test(value)) {
                    handleForm(e);
                  }
                }}
                className={errors.contact ? "input-error" : ""}
              />
              {errors.contact && <span className="error-msg">{errors.contact}</span>}
            </div>
            <div className="contact-form-group">
              <label>Message</label>
              <textarea
                name="message"
                placeholder="Type something..."
                value={formValues.message}
                onChange={handleForm}
                className={errors.message ? "input-error" : ""}
              />
              {errors.message && <span className="error-msg">{errors.message}</span>}
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
              <button
                type="submit"
                className="contact-submit-btn"
                style={{ width: "100px", padding: "15px" }}
                disabled={loading}
              >
                {loading ? "Sending..." : "Submit"}
              </button>
            </div>
          </form>
          {isAuthenticated && (
            <p style={{ fontSize: "12px", color: "#666", textAlign: "center", marginTop: "15px" }}>
              Your profile information has been auto-filled. You can edit if needed.
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};