import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './PlanExpiryPopup.css';

export const PlanExpiryPopup = ({ onUpgrade, onClose }) => {
    const [expiryData, setExpiryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        checkPlanExpiry();
    }, []);

    const checkPlanExpiry = async () => {
        try {
            const response = await api.get('/check-plan-expiry/');
            setExpiryData(response.data);
            
            // Show popup if plan is expired or expiring soon (within 7 days)
            if (response.data.is_expired || 
                (response.data.days_until_expiry && response.data.days_until_expiry <= 7)) {
                setShowPopup(true);
            }
        } catch (error) {
            console.error('Error checking plan expiry:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = () => {
        setShowPopup(false);
        if (onUpgrade) onUpgrade();
    };

    const handleClose = () => {
        setShowPopup(false);
        if (onClose) onClose();
    };

    if (loading || !showPopup) return null;

    const isExpired = expiryData?.is_expired;
    const daysLeft = expiryData?.days_until_expiry;

    return (
        <div className="plan-expiry-overlay">
            <div className="plan-expiry-modal">
                <div className={`expiry-icon ${isExpired ? 'expired' : 'warning'}`}>
                    {isExpired ? '⚠️' : '⏰'}
                </div>
                <h2 className="expiry-title">
                    {isExpired ? 'Your Plan Has Expired!' : 'Plan Expiring Soon'}
                </h2>
                <p className="expiry-message">
                    {isExpired 
                        ? `Your ${expiryData?.plan_name} plan has expired. You are now on the Free plan with limited features.`
                        : `Your ${expiryData?.plan_name} plan will expire in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Renew now to avoid service interruption.`
                    }
                </p>
                <div className="expiry-details">
                    <div className="detail-row">
                        <span>Current Plan:</span>
                        <strong>{expiryData?.plan_name}</strong>
                    </div>
                    <div className="detail-row">
                        <span>Expiry Date:</span>
                        <strong>{expiryData?.end_date ? new Date(expiryData.end_date).toLocaleDateString() : 'N/A'}</strong>
                    </div>
                    {isExpired && (
                        <div className="detail-row warning-text">
                            <span>Status:</span>
                            <strong>EXPIRED - Limited features active</strong>
                        </div>
                    )}
                </div>
                <div className="expiry-actions">
                    <button className="btn-upgrade" onClick={handleUpgrade}>
                        Upgrade Now
                    </button>
                    <button className="btn-later" onClick={handleClose}>
                        Later
                    </button>
                </div>
            </div>
        </div>
    );
};