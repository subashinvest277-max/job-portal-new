
import React, { useMemo, useEffect, useState } from "react";
import "./Analytics.css";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip } from "chart.js";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, LabelList } from "recharts";
import { useJobs } from "../JobContext";
import api from "../api/axios";

ChartJS.register(ArcElement, ChartTooltip);

export const AnalyticsPage = () => {
  const { currentEmployer } = useJobs();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // FIX: API call cheyataniki proper useEffect
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        console.log("🔵 Fetching applications for analytics...");
        const token = sessionStorage.getItem('access');
        console.log("Token exists:", !!token);

        const response = await api.get('jobs/applications/');

        console.log("✅ Applications response:", response.data);
        console.log("✅ Applications count:", response.data?.length);
        console.log("FIRST APPLICATION:", response.data[0]);

        setApplications(response.data || []);
      } catch (error) {
        console.error("❌ Error fetching applications:", error);
        console.error("Error details:", error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []); // Empty dependency array - runs once when component mounts

  // Debug: Print when component renders
  console.log("Analytics Page rendered, applications:", applications.length);

  const months = [];
  const getRecentMonths = () => {
    const date = new Date();
    for (let i = 2; i >= 0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      months.push(monthName);
    }
    return months;
  };

  const monthsMap = {
    jan: "January", feb: "February", mar: "March", apr: "April",
    may: "May", jun: "June", jul: "July", aug: "August",
    sep: "September", oct: "October", nov: "November", dec: "December"
  };

  getRecentMonths();

  const firstMonthFullName = monthsMap[months[0]?.toLowerCase()] || months[0];
  const secondMonthFullName = monthsMap[months[1]?.toLowerCase()] || months[1];
  const thirdMonthFullName = monthsMap[months[2]?.toLowerCase()] || months[2];

  // Dynamic Line Chart Data
  const dynamicLineData = useMemo(() => {
    const stages = [
      { key: "Total applicants", status: ["applied", "resume_screening", "recruiter_review", "shortlisted", "interview_called", "offered", "hired"] },
      { key: "Application reviewed", status: ["resume_screening", "recruiter_review"] },
      { key: "Shortlisted", status: ["shortlisted"] },
      { key: "Interview called", status: ["interview_called"] }
    ];

    if (!applications.length) {
      console.log("No applications, returning empty line data");
      return [];
    }

    const employerJobIds = currentEmployer?.jobPosted?.map(job => String(job.id)) || [];

    return stages.map(stage => {
      const row = { stage: stage.key };

      months.forEach((m, index) => {
        const monthLabel = index === 0 ? firstMonthFullName : index === 1 ? secondMonthFullName : thirdMonthFullName;

        let count = 0;
        applications.forEach(app => {
          const isOurJob = employerJobIds.includes(String(app.job?.id));
          const isCorrectStatus = stage.status.some(s =>
            app.status?.toLowerCase() === s.toLowerCase()
          );

          const appDate = new Date(app.applied_date);
          const appMonth = appDate.toLocaleString('default', { month: 'short' });
          const isCorrectMonth = appMonth.toLowerCase() === m.toLowerCase();

          if (isOurJob && isCorrectStatus && isCorrectMonth) {
            count++;
          }
        });

        row[monthLabel] = count;
      });

      return row;
    });
  }, [applications, currentEmployer, months]);

  // Doughnut Chart Data
  const dynamicStatusData = useMemo(() => {
    const counts = { progress: 0, reviewing: 0, done: 0 };

    if (!currentEmployer?.jobPosted) return [0, 0, 0];

    const currentMonth = new Date().toLocaleString('default', { month: 'long' });

    currentEmployer.jobPosted.forEach(job => {
      const postDate = new Date(job.created_at || job.posted_date);
      const postMonth = postDate.toLocaleString('default', { month: 'long' });

      if (postMonth === currentMonth) {
        const jobStatus = (job.job_status || "").toLowerCase();
        if (jobStatus === "hiring in progress") counts.progress++;
        else if (jobStatus === "reviewing application") counts.reviewing++;
        else if (jobStatus === "hiring done") counts.done++;
      }
    });

    return [counts.progress, counts.reviewing, counts.done];
  }, [currentEmployer]);

  // Experience Chart Data
  const experienceChartData = useMemo(() => {
    if (!applications.length) return [];



    const levels = ["16-20+", "11-15", "6-10", "1-5", "Fresher"];
    const employerJobIds = currentEmployer?.jobPosted?.map(job => String(job.id)) || [];

    return levels.map((level) => {
      const row = { level };

      months.forEach((m, index) => {
        const monthLabel = index === 0 ? firstMonthFullName : index === 1 ? secondMonthFullName : thirdMonthFullName;
        let count = 0;

        applications.forEach(app => {
          const isOurJob = employerJobIds.includes(String(app.job?.id));
          if (!isOurJob) return;

          const appDate = new Date(app.applied_date);
          const appMonth = appDate.toLocaleString('default', { month: 'short' });
          if (appMonth.toLowerCase() !== m.toLowerCase()) return;


          console.log("Full application:", app);

          let expYears = app.total_experience_years;
        
        // Handle null, undefined, or string values
        if (expYears === null || expYears === undefined) {
          expYears = 0;
        } else {
          expYears = parseFloat(expYears);
        }

        console.log("User:", app.user?.username, "Experience:", expYears);




          let isInRange = false;
          if (level === "Fresher" && expYears === 0) isInRange = true;
          else if (level === "1-5" && expYears >= 1 && expYears <= 5) isInRange = true;
          else if (level === "6-10" && expYears > 5 && expYears <= 10) isInRange = true;
          else if (level === "11-15" && expYears > 10 && expYears <= 15) isInRange = true;
          else if (level === "16-20+" && expYears > 15) isInRange = true;

          if (isInRange) count++;
        });

        row[monthLabel] = count;
      });

      return row;
    });




  }, [applications, currentEmployer, months]);

  const TriangleDot = (props) => {
    const { cx, cy, stroke } = props;
    return (
      <svg x={cx - 10} y={cy - 10} width={20} height={20} viewBox="0 0 20 20">
        <path d="M 10 2 L 18 16 L 2 16 Z" fill={stroke} fillOpacity={0.2} stroke="none" />
        <path d="M 10 4 L 16 14 L 4 14 Z" fill={stroke} stroke="none" />
      </svg>
    );
  };

  const doughnutData = {
    labels: ["Hiring in progress", "Reviewing application", "Hiring done"],
    datasets: [{
      data: dynamicStatusData,
      backgroundColor: ["#f4c542", "#7b61ff", "#22c55e"],
      borderWidth: 0,
    }],
  };

  const doughnutOptions = {
    cutout: "75%",
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    }
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="title-banner">
          <h1 className="page-title">Analytics</h1>
        </div>
        <div style={{ textAlign: "center", padding: "40px" }}>
          Loading analytics data...
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="title-banner">
        <h1 className="page-title">Analytics</h1>
      </div>

      <div className="analytics-content">
        {/* Dynamic Area Chart */}
        <div className="card line-card">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={dynamicLineData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
              <defs>
                <linearGradient id="colorJan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7b61ff" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#7b61ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFeb" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#00bcd4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
              <XAxis dataKey="stage" tick={{ fontSize: 13, fill: "#333" }} />
              <YAxis tick={{ fontSize: 13, fill: "#333" }} />
              <Tooltip />
              <Area type="monotone" dataKey={firstMonthFullName} stroke="#7b61ff" fill="url(#colorJan)" strokeWidth={2} dot={<TriangleDot stroke="#7b61ff" />} />
              <Area type="monotone" dataKey={secondMonthFullName} stroke="#ff6b6b" fill="url(#colorFeb)" strokeWidth={2} dot={<TriangleDot stroke="#ff6b6b" />} />
              <Area type="monotone" dataKey={thirdMonthFullName} stroke="#00bcd4" fill="url(#colorMar)" strokeWidth={2} dot={<TriangleDot stroke="#00bcd4" />} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="custom-legend-horizontal">
            <div className="legend-item"><span className="triangle-legend jan"></span> {months[0]}</div>
            <div className="legend-item"><span className="triangle-legend feb"></span> {months[1]}</div>
            <div className="legend-item"><span className="triangle-legend mar"></span> {months[2]}</div>
          </div>
          <p className="chart-label">Applicants Overview (Last 3 Months)</p>
        </div>

        <div className="bottom-row">
          <div className="card doughnut-card">
            <div className="doughnut-wrapper">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <div className="doughnut-center-text" style={{ fontSize: '1.2rem' }}>{thirdMonthFullName}</div>
            </div>
            <div className="doughnut-legend-container">
              {doughnutData.labels.map((label, i) => (
                <div className="legend-row" key={label}>
                  <span className={`square ${['yellow', 'purple', 'green'][i]}`}></span>
                  <span className="legend-text">{label}: <strong>{dynamicStatusData[i]}</strong></span>
                </div>
              ))}
            </div>
            <p className="chart-label">Posted Job Status - {thirdMonthFullName}</p>
          </div>

          <div className="card bar-card">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart layout="vertical" data={experienceChartData} margin={{ top: 20, right: 40, left: 10, bottom: 5 }} barGap={5}>
                <CartesianGrid strokeDasharray="3 3" horizontal vertical stroke="#e0e0e0" opacity={0.5} />
                <XAxis type="number" hide />
                <YAxis dataKey="level" type="category" tick={{ fontSize: 14, fontWeight: "500" }} width={70} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey={firstMonthFullName} fill="#7b61ff" radius={[0, 10, 10, 0]} barSize={10}>
                  <LabelList dataKey={firstMonthFullName} position="right" />
                </Bar>
                <Bar dataKey={secondMonthFullName} fill="#ff6b6b" radius={[0, 10, 10, 0]} barSize={10}>
                  <LabelList dataKey={secondMonthFullName} position="right" />
                </Bar>
                <Bar dataKey={thirdMonthFullName} fill="#00bcd4" radius={[0, 10, 10, 0]} barSize={10}>
                  <LabelList dataKey={thirdMonthFullName} position="right" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="custom-legend-horizontal">
              <div className="legend-item"><span className="square purple"></span> {months[0]}</div>
              <div className="legend-item"><span className="square green"></span> {months[1]}</div>
              <div className="legend-item"><span className="square mar"></span> {months[2]}</div>
            </div>
            <p className="chart-label">Experience Levels of Applicants</p>
          </div>
        </div>
      </div>
    </div>
  );
};