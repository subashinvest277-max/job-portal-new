import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Calender.css';
 
export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
 
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
 
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
 
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };
 
  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };
 
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month - 1);
    const days = [];
    const highlightDots = [6];
 
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(<div key={`p-${i}`} className="admin-cal-day admin-cal-prev">{prevMonthDays - i}</div>);
    }
 
    for (let d = 1; d <= totalDays; d++) {
      const isSelected = d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
      days.push(
        <div key={d} className={`admin-cal-day ${isSelected ? 'admin-cal-active' : ''}`} onClick={() => setSelectedDate(new Date(year, month, d))}>
          {d}
          {highlightDots.includes(d) && <span className="admin-cal-dot"></span>}
        </div>
      );
    }
    return days;
  };
 
  return (
    <div className="admin-cal-card">
      <div className="admin-cal-header">
        <button className="admin-cal-btn" onClick={() => changeMonth(-1)}><ChevronLeft size={16} /></button>
        <div className="admin-cal-selectors">
          <select value={currentDate.getMonth()} onChange={(e) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1))}>
            {monthNames.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
          <select value={currentDate.getFullYear()} onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1))}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button className="admin-cal-btn" onClick={() => changeMonth(1)}><ChevronRight size={16} /></button>
      </div>
      <div className="admin-cal-grid">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => <div key={d} className="admin-cal-weekday">{d}</div>)}
        {renderCalendar()}
      </div>
    </div>
  );
};