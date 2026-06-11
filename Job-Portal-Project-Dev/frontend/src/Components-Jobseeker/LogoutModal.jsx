import React from "react";
 
export const LogoutModal = ({ show, onClose, onConfirm }) => {
  if (!show) return null;
 
  return (
    <div className="Logout-modal-overlay" onClick={onClose}>
      <div className="Logout-modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>Logout</h2>
        <p>Are you sure you want to logout ?</p>
        <div className="Logout-modal-button-group">
          <button className="Logout-modal-btn btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="Logout-modal-btn Logout-btn-logout-confirm" onClick={onConfirm}>
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
};

