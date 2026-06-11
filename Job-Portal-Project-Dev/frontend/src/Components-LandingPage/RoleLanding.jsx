import React from "react";
import { Link } from "react-router-dom";
import "./RoleLanding.css";

const JobSeekerIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Z" />
    <path d="M4 20c0-3.31 3.58-6 8-6s8 2.69 8 6v1H4v-1Z" />
  </svg>
);

const EmployerIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 6V4c0-1.1.9-2 2-2h2c1.1 0 2 .9 2 2v2h3c1.1 0 2 .9 2 2v3.5c0 .83-.5 1.55-1.22 1.84L14 15.25V14h-4v1.25l-4.78-1.91A1.98 1.98 0 0 1 4 11.5V8c0-1.1.9-2 2-2h3Zm2 0h2V4h-2v2Z" />
    <path d="M4 15.2 10 17.6V18h4v-.4l6-2.4V20c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-4.8Z" />
  </svg>
);

const AdminIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Z" />
    <path d="M4 20c0-3.31 3.58-6 8-6 1.25 0 2.43.22 3.45.62-.34.56-.55 1.21-.6 1.9-.86-.33-1.82-.52-2.85-.52-3.31 0-6 1.79-6 4H4Z" />
    <path d="M19 15.5c.18 0 .35.02.52.05l.41-.82 1.34.77-.48.78c.22.26.39.56.5.89l.91.06v1.54l-.91.06c-.11.33-.28.63-.5.89l.48.78-1.34.77-.41-.82c-.17.03-.34.05-.52.05s-.35-.02-.52-.05l-.41.82-1.34-.77.48-.78c-.22-.26-.39-.56-.5-.89l-.91-.06v-1.54l.91-.06c.11-.33.28-.63.5-.89l-.48-.78 1.34-.77.41.82c.17-.03.34-.05.52-.05Zm0 1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
  </svg>
);

const roles = [
  {
    title: "Job Seeker",
    description: "Search jobs, apply quickly, and track your applications.",
    path: "/Job-portal/jobseeker/login",
    Icon: JobSeekerIcon,
    className: "jobseeker-card",
  },
  {
    title: "Employer",
    description: "Post jobs, manage applicants, and hire the right talent.",
    path: "/Job-portal/employer/login",
    Icon: EmployerIcon,
    className: "employer-card",
  },
  {
    title: "Admin",
    description: "Manage users, jobs, employers, and platform activities.",
    path: "/Job-portal/Admin/login",
    Icon: AdminIcon,
    className: "admin-card",
  },
];

const RoleLanding = () => {
  return (
    <div className="role-landing-page">
      <header className="role-header">
        <Link to="/" className="role-logo">
          Job portal
        </Link>

        <Link to="/" className="role-back-btn">
          ← Back to Home
        </Link>
      </header>

      <main className="role-main">
        <div className="role-content">
          <span className="role-badge">Welcome to Job Portal</span>

          <h1>Select your account type</h1>

          <p>Choose your role to continue with login or signup.</p>
        </div>

        <div className="role-card-grid">
          {roles.map(({ title, description, path, Icon, className }) => (
            <Link to={path} className={`role-card ${className}`} key={title}>
              <div className="role-icon">
                <Icon />
              </div>

              <h2>{title}</h2>

              <p>{description}</p>

              <span className="role-card-action">Continue</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default RoleLanding;