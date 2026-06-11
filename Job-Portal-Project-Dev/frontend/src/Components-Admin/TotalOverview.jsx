import React from 'react';
import './TotalOverview.css';

export const TotalOverview = () => {
  const data = [
    { label: 'Recommended', value: 5, color: '#5b83ff' },
    { label: 'Shorted', value: 2, color: '#a67dff' },
    { label: 'Applicants', value: 2, color: '#4cc3e0' },
    { label: 'Interview', value: 2, color: '#ffb36b' },
    { label: 'Rejected', value: 1, color: '#ff7070' },
    { label: 'Hired', value: 0, color: '#cfd8dc' },
  ];

  const total = data.reduce((acc, item) => acc + item.value, 0);
  
  const radius = 75;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="Admin-overview-card">
      <h2 className="Admin-overview-title">Total Overview</h2>
      <hr className="Admin-divider" />
      
      <div className="Admin-chart-container">
        <svg width="250" height="250" viewBox="0 0 200 200">
          {data.map((item, index) => {
            if (item.value === 0) return null;
            
            const strokeDasharray = (item.value / total) * circumference;
            const strokeDashoffset = -accumulatedOffset;
            accumulatedOffset += strokeDasharray;

            return (
              <circle
                key={index}
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth="25"
                strokeDasharray={`${strokeDasharray} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 100 100)"
                className="chart-segment"
              />
            );
          })}
          {/* Inner Text */}
          <text x="50%" y="50%" textAnchor="middle" className="Admin-total-count">{total}</text>
          <text x="52%" y="60%" textAnchor="middle" className="Admin-total-label">Total Candidates</text>
        </svg>
      </div>

      <div className="Admin-legend-grid">
        {data.map((item, index) => (
          <div key={index} className="Admin-legend-item">
            <span className="dot" style={{ backgroundColor: item.color }}></span>
            <span className="Admin-label-text">{item.label}:</span>
            <span className="Admin-label-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

