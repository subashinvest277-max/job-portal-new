import React from 'react';
import './AdminExperience.css';
 
export const AdminExperience = () => {
  const experienceData = [
    { label: 'Entry', percentage: 70, color: '#4A76FD' },
    { label: 'Junior', percentage: 55, color: '#FFAC5F' },
    { label: 'Mid', percentage: 40, color: '#45CCE1' },
    { label: 'Senior', percentage: 20, color: '#A17DFF' }
  ];
 
  return (
    <div className="admin-exp-card">
      <h3 className="admin-exp-title">Top Experience Levels</h3>
      <p className="admin-exp-subtext">Applicants by Experience Level</p>
      <div className="admin-exp-list">
        {experienceData.map((item, index) => (
          <div key={index} className="admin-exp-item">
            <span className="admin-exp-label">{item.label} Level</span>
            <div className="admin-exp-bar-bg">
              <div
                className="admin-exp-bar-fill"
                style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};