

import React, { useState, useEffect } from 'react';  // ← CHANGE 1: Add useEffect
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import './Billing.css';
import FileIcon from '../assets/Billing/File_icon.png';
import DeleteIcon from '../assets/Billing/Delete_icon.png';
import api from '../api/axios';  // ← CHANGE 2: Add API import

export const BillingSec = ({ onUpgradeClick }) => {

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planStatus, setPlanStatus] = useState('ACTIVE');

  // ← CHANGE 3: New states for real data
  const [activePlan, setActivePlan] = useState(null);
  const [billingHistory, setBillingHistory] = useState([]);
  const [defaultCard, setDefaultCard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nextInvoiceDate, setNextInvoiceDate] = useState(null);

  // ← CHANGE 4: Fetch real data from backend
  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      // 1. Get current subscription
      const subRes = await api.get('/subscription/');
      console.log('price value:', subRes.data.plan.monthly_price);
      console.log('type:', typeof subRes.data.plan.monthly_price);


      console.log('SUB DATA:', subRes.data);
      if (subRes.data && subRes.data.plan) {
        setActivePlan({
          name: subRes.data.plan.name,
          price: subRes.data.plan.monthly_price,
          status: subRes.data.status.toUpperCase(),
          endDate: subRes.data.end_date
        });
        setPlanStatus(subRes.data.status.toUpperCase());

        // Calculate next invoice date
        const nextDate = new Date(subRes.data.end_date);
        setNextInvoiceDate(nextDate.toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric'
        }).toUpperCase());
      }

      // 2. Get last 5 invoices for history
      const invRes = await api.get('/invoices/');
      if (invRes.data && invRes.data.length > 0) {
        const formattedHistory = invRes.data.slice(0, 5).map(inv => ({
          plan: inv.plan_name,
          date: new Date(inv.invoice_date).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
          }).toUpperCase(),
          price: `₹ ${inv.total} /-`,
          status: inv.payment_status.toUpperCase(),
          invoice: inv.invoice_number,
          company_name: inv.company_name,
          email: inv.email,
          phone: inv.phone,
          subtotal: inv.subtotal,
          gst: inv.gst,
          transaction_id: inv.transaction_id,
          start_date: inv.start_date,
          end_date: inv.end_date,
          duration: inv.duration
        }));
        setBillingHistory(formattedHistory);
      }

      // 3. Get default payment method
      const payRes = await api.get('/payment-methods/');
      if (payRes.data && payRes.data.length > 0) {
        const defaultCardData = payRes.data.find(c => c.is_default) || payRes.data[0];
        if (defaultCardData) {
          setDefaultCard({
            last4: defaultCardData.card_last4 || '0000',
            name: defaultCardData.card_holder_name || 'Card Holder',
            expiry: '12/2026',
            type: defaultCardData.method_type?.toUpperCase() || 'CARD'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ← CHANGE 5: Update handlers with API calls
  const handleToggleModal = () => setIsModalOpen(!isModalOpen);

  const handleConfirmCancellation = async () => {
    try {
      await api.post('/cancel/');
      setPlanStatus('CANCELLED');
      setIsModalOpen(false);
      alert("Subscription cancelled successfully.");
      await fetchBillingData(); // Refresh data
    } catch (error) {
      console.error('Cancellation failed:', error);
      alert("Failed to cancel subscription");
    }
  };

  const handleUpgradeRedirect = () => {
    navigate('/Job-portal/Employer/Membership');
  };

  const handleReactivate = () => {
    navigate('/Job-portal/Employer/Membership');
  };

  const handleChangeCard = () => {
    navigate('/Job-portal/Employer/Billing');
  };

  // ← CHANGE 6: Add loading state
  if (isLoading) {
    return (
      <div className="Billing-container">
        <div className="Billing-card Billing-header-card">
          <h2 className="Billing-title-main">Plans & Billing</h2>
          <p className="Billing-subtitle">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="Billing-container">
      {/* Header */}
      <div className="Billing-card Billing-header-card">
        <h2 className="Billing-title-main">Plans & Billing</h2>
        <p className="Billing-subtitle">Manage your details and personal preferences here</p>
      </div>

      {/* Current Plan */}
      <div className="Billing-card Billing-current-plan-card">
        <div className="Billing-plan-info">
          <p className="Billing-section-label">Current Plan</p>
          <div className="Billing-plan-title-row">
            <h3 className="Billing-plan-name-main">
              {activePlan?.name || 'No Active Plan'}  {/* ← CHANGE 7: Dynamic data */}
            </h3>
            <span className={`Billing-badge Billing-badge-${planStatus.toLowerCase()}`}>
              {planStatus}
            </span>
          </div>
          <p className="Billing-plan-desc">Providing the core tools and services you need at an affordable price</p>
        </div>
        <div className="Billing-plan-actions">
          <span className="Billing-main-price">
            ₹ {activePlan?.price || '0'}<small className="Billing-per-month">/month</small>  {/* ← CHANGE 8: Dynamic price */}
          </span>

          {planStatus === 'ACTIVE' ? (
            <button className="Billing-btn Billing-btn-outline" onClick={handleToggleModal}>
              Cancel Plan
            </button>
          ) : (
            <button className="Billing-btn Billing-btn-primary" onClick={handleReactivate}>
              Reactivate Plan
            </button>
          )}
          <button className="Billing-btn Billing-btn-primary" onClick={handleUpgradeRedirect}>
            Upgrade Plan
          </button>

          {/* Cancellation Modal */}
          {isModalOpen && (
            <div className="Billing-modal-overlay">
              <div className="Billing-modal-content">
                <h2 className="Billing-modal-title">CONFIRM PLAN CANCELLATION</h2>

                <div className="Billing-modal-info-card">
                  <div className="Billing-modal-card-header">
                    <div>
                      <span className="Billing-modal-label">Current Plan</span>
                      <div className="Billing-plan-title-row">
                        <h3 className="Billing-modal-plan-name">{activePlan?.name || 'Plan'}</h3>
                        <span className="Billing-badge Billing-badge-active">ACTIVE</span>
                      </div>
                    </div>
                  </div>
                  <p className="Billing-plan-desc">Providing the core tools and services you need at an affordable price</p>
                </div>

                <p className="Billing-modal-text">
                  Are you sure you want to cancel your subscription?
                  Cancelling will prevent any future charges, and access to premium
                  features will cease at the end of your current billing period.
                </p>

                <div className="Billing-modal-actions">
                  <button className="Billing-modal-btn-grey" onClick={handleToggleModal}>
                    Keep My Current Plan
                  </button>
                  <button
                    className="Billing-modal-btn-confirm"
                    onClick={handleConfirmCancellation}
                  >
                    CONFIRM CANCELLATION
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Next Invoice & Payment Method */}
      <div className="Billing-grid">
        <div className="Billing-card">
          <p className="Billing-section-label">Next Invoices</p>
          <h3 className="Billing-grid-price">₹ {activePlan?.price || '0'}/-</h3>  {/* ← CHANGE 9: Dynamic */}
          <div className="Billing-grid-details">
            <p className="Billing-detail-item">
              <span>Plan Type</span> : {activePlan?.name || '-'} (Monthly)
            </p>
            <p className="Billing-detail-item">
              <span>Next Invoice</span> : {nextInvoiceDate || 'N/A'}  {/* ← CHANGE 10: Dynamic */}
            </p>
          </div>
        </div>

        <div className="Billing-card">
          <div className="Billing-flex-between">
            <p className="Billing-section-label">Payment Method</p>
            <div className="Billing-visa-logo">
              {defaultCard?.type || 'CARD'}  {/* ← CHANGE 11: Dynamic */}
            </div>
          </div>
          <h3 className="Billing-card-number">
            **** {defaultCard?.last4 || '0000'}  {/* ← CHANGE 12: Dynamic */}
          </h3>
          <div className="Billing-flex-between">
            <div className="Billing-grid-details">
              <p className="Billing-detail-item">
                <span>Name Card</span> : {defaultCard?.name || 'No card added'}
              </p>
              <p className="Billing-detail-item">
                <span>Expired Date</span> : {defaultCard?.expiry || 'N/A'}
              </p>
            </div>
            <div className="Billing-card-btn-group">
              <button
                className="Billing-btn Billing-btn-outline Billing-btn-sm"
                onClick={handleChangeCard}
              >
                Change Card
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="Billing-card Billing-history-card">
        <div className="Billing-table-title-row">
          <h3 className="Billing-history-title">BILLING HISTORY</h3>
          <Link to="/Job-portal/Employer/Billing" className="Billing-view-link">
            View history
          </Link>
        </div>

        <div className="Billing-list-container">
          <div className="Billing-list-header">
            <div className="Billing-col-plan">PLAN</div>
            <div className="Billing-col-date">DATE</div>
            <div className="Billing-col-price">PRICE</div>
            <div className="Billing-col-status">STATUS</div>
            <div className="Billing-col-invoice">INVOICE</div>
          </div>

          {/* ← CHANGE 13: Dynamic billing history */}
          {billingHistory.length === 0 ? (
            <div className="Billing-list-row">
              <div className="Billing-col-plan" style={{ textAlign: 'center', width: '100%' }}>
                No billing history found
              </div>
            </div>
          ) : (
            billingHistory.map((item, index) => (
              <div className="Billing-list-row" key={index}>
                <div className="Billing-col-plan font-bold">{item.plan}</div>
                <div className="Billing-col-date">{item.date}</div>
                <div className="Billing-col-price">{item.price}</div>
                <div className="Billing-col-status">
                  <span className={`Billing-status-pill Billing-status-${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </div>
                <div className="Billing-col-invoice">
                  <span className="Billing-invoice-id">{item.invoice}</span>
                  <img
                    src={FileIcon}
                    alt="Invoice Icon"
                    className="Billing-doc-icon-img"
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};