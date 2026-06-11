import React, { useState, useEffect } from 'react';
import SixDots from '../assets/AdminAssets/SixDots.png';
import Save from '../assets/AdminAssets/SaveDraft.png';
import Tick from '../assets/AdminAssets/GreenTick.png';
import RedCross from '../assets/AdminAssets/RedCross.png';
import './PublishedPlan.css';
import './Membership.css';
import { useJobs } from '../JobContext';
import api from '../api/axios';

export const PublishedPlans = () => {
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [editPlan, setEditPlan] = useState(null);
  const [previewPlan, setPreviewPlan] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [allPlans, setAllPlans] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Check if the currently viewed plan is the read-only starter tier
  const isStarterPlan = editPlan?.name?.toUpperCase() === 'STARTER PLAN';

  const getAdminToken = () => {
    return (
      sessionStorage.getItem("access") || 
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("admin_token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("admin_token")
    );
  };

  useEffect(() => {
    fetchAllPlans();
  }, []);

  const fetchAllPlans = async () => {
    try {
      const token = getAdminToken();
      const response = await api.get('plans/', {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      setAllPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchSelectedPlanDetails = async (planId) => {
    try {
      const token = getAdminToken();
      const response = await api.get(`plans/${planId}/`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      const planData = response.data;

      const normalizedPlan = {
        ...planData,
        monthly_price: planData.monthly_price ?? 0,
        discount_halfyear: planData.discount_halfyear ?? 0,
        discount_annual: planData.discount_annual ?? 0,
        tax: planData.tax ?? 0,
        trial_duration: planData.trial_duration ?? 0,
        grace_time: planData.grace_time ?? 0,
        is_trial_enabled: planData.is_trial_enabled ?? false,
        is_auto_renewal: planData.is_auto_renewal ?? false,
        color: planData.color ?? '#1E88E5',
        features: planData.features?.map(feature => ({
          ...feature,
          value: feature.value ?? (feature.text === 'Jobs Posting' || feature.text === 'Highlight Your Job Listing' ? 0 : "false")
        })) || []
      };

      setEditPlan(normalizedPlan);
      setPreviewPlan(normalizedPlan);
    } catch (error) {
      console.error('Error fetching plan details:', error);
    }
  };

  const calculateTotalPayable = (basePrice, tax) => {
    let price = parseFloat(basePrice) || 0;
    if (price === 0) return "0.00"; 
    const taxAmt = price * (tax / 100);
    const finalTotal = price + taxAmt;
    return finalTotal.toFixed(2);
  };

  const handleFeatureValueChange = (featureIdx, value) => {
    const updatedFeatures = editPlan.features.map((feature, i) => {
      if (i === featureIdx) {
        return { ...feature, value: value };
      }
      return feature;
    });
    setEditPlan(prev => ({ ...prev, features: updatedFeatures }));
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlanId(plan.id);
    fetchSelectedPlanDetails(plan.id);
  };

  const handleInputChange = (field, value) => {
    // Block price field changes for Starter Plan
    const priceFields = ['monthly_price', 'tax', 'discount_halfyear', 'discount_annual'];
    if (isStarterPlan && priceFields.includes(field)) {
      console.log("Starter Plan: Price fields cannot be edited");
      return;
    }
    setEditPlan(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleFeature = (featureIdx) => {
    const updatedFeatures = editPlan.features.map((feature, i) => {
      if (i === featureIdx) {
        const currentValue = feature.value;
        const newValue = (currentValue === "true" || currentValue === true) ? "false" : "true";
        return { ...feature, value: newValue };
      }
      return feature;
    });
    setEditPlan(prev => ({ ...prev, features: updatedFeatures }));
  };

  const handleAutoRenewalToggle = () => {
    setEditPlan(prev => ({ ...prev, is_auto_renewal: !prev.is_auto_renewal }));
  };

  const handleTriggerPreview = () => {
    setPreviewPlan({ ...editPlan });
  };

  const handleTrailToggle = () => {
    setEditPlan(prev => ({
      ...prev,
      is_trial_enabled: !prev.is_trial_enabled,
      trial_duration: !prev.is_trial_enabled ? 7 : 0
    }));
  };

  const handleSavePlan = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const token = getAdminToken();
      
      // Prepare data for API - for Starter Plan, force price fields to 0
      const planData = {
        name: editPlan?.name,
        summary: editPlan?.summary,
        color: editPlan?.color,
        monthly_price: isStarterPlan ? 0 : (editPlan?.monthly_price ?? 0),
        tax: isStarterPlan ? 0 : (editPlan?.tax ?? 0),
        discount_halfyear: isStarterPlan ? 0 : (editPlan?.discount_halfyear ?? 0),
        discount_annual: isStarterPlan ? 0 : (editPlan?.discount_annual ?? 0),
        duration_days: editPlan?.duration_days ?? 30,
        is_trial_enabled: editPlan?.is_trial_enabled ?? false,
        trial_duration: editPlan?.trial_duration ?? 0,
        is_auto_renewal: editPlan?.is_auto_renewal ?? false,
        grace_time: editPlan?.grace_time ?? 0,
        Analytics: editPlan?.Analytics ?? false,
        Candidate_Search: editPlan?.Candidate_Search ?? false,
        Premium_Support: editPlan?.Premium_Support ?? false,
        Account_Manager: editPlan?.Account_Manager ?? false,
        features: editPlan?.features
      };
      
      console.log("Saving plan data:", planData);
      
      const response = await api.patch(`plans/${selectedPlanId}/`, planData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Plan updated successfully:', response.data);
      
      setAllPlans(prevPlans =>
        prevPlans.map(plan => plan.id === selectedPlanId ? response.data : plan)
      );
      alert("Plan changes saved successfully");
      
      // Refresh the current plan data
      await fetchSelectedPlanDetails(selectedPlanId);
      await fetchAllPlans();
      
    } catch (error) {
      console.error('Error saving plan:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        alert(`Error saving plan: ${JSON.stringify(error.response.data)}`);
      } else {
        alert("Error saving plan. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {!selectedPlanId ? (
        <>
          <div style={{ margin: "25px 0px", padding: "15px 0", border: "1px solid #afaaaa", borderRadius: "10px" }}>
            <p style={{ margin: "5px 0" }} className='Admin-Welcome-Note'>Published Plans</p>
            <p style={{ margin: "5px 0" }} className='Admin-Welcome-para'>View or Edit Published plans</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", border: "1px solid #afaaaa", borderRadius: "10px", gap: "35px", padding: "45px 0" }}>
            <p style={{ margin: "5px 0" }} className='Admin-Welcome-para'>Select a plan to View or Edit</p>
            {allPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => handleSelectPlan(plan)}
                style={{
                  padding: "20px 10px",
                  border: "1px solid #afaaaa",
                  width: "35%",
                  borderRadius: "10px",
                  background: plan.color || '#1E88E5',
                  color: "#fff",
                  textAlign: "center",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0px 4px 6px rgba(0,0,0,0.1)"
                }}
              >
                {plan.name}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="membership-cr-membership-container">
          <div style={{ display: "flex", alignItems: "center", padding: "10px 15px", margin: "10px 0", gap: "10px" }} >
            <button onClick={() => { setSelectedPlanId(null); setEditPlan(null); setPreviewPlan(null); }}
              style={{ padding: "7px 10px", cursor: 'pointer', fontSize: '14px', backgroundColor: '#1E88E5', color: 'white', border: 'none', borderRadius: "5px" }}>
              Back to plans
            </button>
            <div className="membership-cr-membership-header">
              <h1 style={{ padding: "10px 20px", flex: "1", fontSize: "18px" }}>
                Plan Name: {editPlan?.name} {isStarterPlan && "⚠️ (PRICE FIELDS READ-ONLY)"}
              </h1>
            </div>
          </div>

          {/* Banner notification informing admins the plan cannot be changed */}
          {isStarterPlan && (
            <div style={{ backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', padding: '12px 20px', borderRadius: '6px', margin: '10px 15px', fontWeight: '500', fontSize: '14px', textAlign: 'start' }}>
              <strong>Notice:</strong> This is the default system Starter Plan (Free Tier). Price fields are read-only, but features can be customized.
            </div>
          )}

          <div className="membership-cr-membership-content">
            <div className="membership-cr-form-sections">

              <div className="membership-cr-form-card">
                <div className="membership-cr-section-title">
                  <span className="membership-cr-step-num">1</span> Basic plan details
                </div>
                <div className="membership-cr-row">
                  <div className="membership-cr-input-group">
                    <label>Plan name</label>
                    <input
                      type="text"
                      value={editPlan?.name ?? ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={false}
                    />
                  </div>
                  <div className="membership-cr-input-group">
                    <label>Summary</label>
                    <input
                      type="text"
                      value={editPlan?.summary ?? ''}
                      onChange={(e) => handleInputChange('summary', e.target.value)}
                      disabled={false}
                    />
                  </div>
                </div>
                
                <div className="membership-cr-row" style={{ marginTop: '15px' }}>
                  <div className="membership-cr-input-group" style={{ width: '50%' }}>
                    <label>Card Color / Badge Visual Theme Code</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={editPlan?.color ?? '#1E88E5'}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        disabled={false}
                        placeholder="e.g. #1E88E5 or green"
                        style={{ flex: 1 }}
                      />
                      <input
                        type="color"
                        value={editPlan?.color?.startsWith('#') && editPlan?.color?.length === 7 ? editPlan.color : '#1E88E5'}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        disabled={false}
                        style={{ width: '40px', height: '38px', padding: '0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="membership-cr-form-card">
                <div className="membership-cr-section-title">
                  <span className="membership-cr-step-num">2</span> Pricing & Duration
                </div>
                <div className="membership-cr-row">
                  <div className="membership-cr-input-group">
                    <label>Price (₹) for a month {isStarterPlan && ""}</label>
                    <input
                      type="number"
                      value={editPlan?.monthly_price ?? ''}
                      onChange={(e) => handleInputChange('monthly_price', e.target.value)}
                      disabled={isStarterPlan}
                      style={{ backgroundColor: isStarterPlan ? '#e9ecef' : '#fff' }}
                    />
                  </div>
                  <div className="membership-cr-input-group">
                    <label>Discount (%) for 6 month plan {isStarterPlan && ""}</label>
                    <input
                      type="number"
                      value={editPlan?.discount_halfyear ?? ''}
                      onChange={(e) => handleInputChange('discount_halfyear', e.target.value)}
                      disabled={isStarterPlan}
                      style={{ backgroundColor: isStarterPlan ? '#e9ecef' : '#fff' }}
                    />
                  </div>
                </div>
                <div className="membership-cr-row">
                  <div className="membership-cr-input-group">
                    <label>Discount (%) for Annual plan {isStarterPlan && ""}</label>
                    <input
                      type="number"
                      value={editPlan?.discount_annual ?? ''}
                      onChange={(e) => handleInputChange('discount_annual', e.target.value)}
                      disabled={isStarterPlan}
                      style={{ backgroundColor: isStarterPlan ? '#e9ecef' : '#fff' }}
                    />
                  </div>
                  <div className="membership-cr-input-group">
                    <label>Tax (%) {isStarterPlan && ""}</label>
                    <input
                      type="number"
                      value={editPlan?.tax ?? ''}
                      onChange={(e) => handleInputChange('tax', e.target.value)}
                      disabled={isStarterPlan}
                      style={{ backgroundColor: isStarterPlan ? '#e9ecef' : '#fff' }}
                    />
                  </div>

                  <div className="membership-cr-total-payable">
                    <p style={{ textAlign: "start", margin: "5px 0", fontWeight: "600" }}>Total Payable</p>
                    <h3 style={{ textAlign: "start", fontSize: "24px" }}>
                      {isStarterPlan ? "Free Plan" : `₹ ${calculateTotalPayable(editPlan?.monthly_price ?? 0, editPlan?.tax ?? 0)}`}
                      {!isStarterPlan && (
                        <span style={{ fontSize: "16px", fontWeight: "normal", color: "#555" }}>
                          / for a Month
                        </span>
                      )}
                    </h3>
                    <p style={{ textAlign: "start", margin: "5px 0", fontSize: "12px" }}>(incl. tax after discount)</p>
                  </div>
                </div>
              </div>

              <div className="membership-cr-form-card">
                <div className="membership-cr-section-title">
                  <span className="membership-cr-step-num">3</span> Features & Limits
                </div>
                <table className="membership-cr-features-table">
                  <thead>
                    <tr >
                      <th style={{ textAlign: 'left', padding: '10px' }}>Feature</th>
                      <th style={{ textAlign: 'center', padding: '10px' }}>Limit / Inclusion</th>
                    </tr>
                  </thead>
                  <tbody style={{ border: "1px solid #f0f0ff" }}>
                    {editPlan?.features?.map((item, i) => {
                      if (item.text === 'Jobs Posting') {
                        return (
                          <tr key={i}>
                            <td style={{ padding: '20px' }}>Max Job Posts</td>
                            <td style={{ textAlign: 'center', padding: '10px' }}>
                              <input
                                type="number"
                                value={item.value ? (parseInt(item.value) || 0) : 0}
                                onChange={(e) => {
                                  const intValue = parseInt(e.target.value) || 0;
                                  handleFeatureValueChange(i, intValue);
                                }}
                                disabled={false}
                                min="0"
                                step="1"
                                style={{ width: '80px', padding: '5px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px' }}
                              />
                            </td>
                          </tr>
                        );
                      }

                      if (item.text === 'Highlight Your Job Listing') {
                        return (
                          <tr key={i}>
                            <td style={{ padding: '20px' }}>{item.text}</td>
                            <td style={{ textAlign: 'center', padding: '10px' }}>
                              <input
                                type="number"
                                value={item.value ? (parseInt(item.value) || 0) : 0}
                                onChange={(e) => {
                                  const intValue = parseInt(e.target.value) || 0;
                                  handleFeatureValueChange(i, intValue);
                                }}
                                disabled={false}
                                min="0"
                                step="1"
                                style={{ width: '80px', padding: '5px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px' }}
                              />
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={i}>
                          <td style={{ padding: '20px' }}>{item.text}</td>
                          <td style={{ textAlign: 'center', padding: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              <div
                                className={`membership-cr-toggle-switch ${item.value === "true" || item.value === true ? "membership-cr-active" : ""}`}
                                onClick={() => handleToggleFeature(i)}
                                style={{ cursor: 'pointer' }}
                              ></div>
                            </div>
                          </td>
                         </tr>
                      );
                    })}
                  </tbody>
                 </table>
              </div>

              <div className="membership-cr-form-card membership-cr-mini-section">
                <div className="membership-cr-section-title"><span className="membership-cr-step-num">4</span> Trial Settings</div>
                <div className="membership-cr-row membership-cr-align-center">
                  <div className="membership-cr-toggle-group" style={{ pointerEvents: 'auto' }}>
                    <span>Free trial option</span>
                    <div onClick={handleTrailToggle} className={`membership-cr-toggle-switch ${editPlan?.is_trial_enabled ? "membership-cr-active" : ""}`}></div>
                  </div>
                  <div className="membership-cr-input-group">
                    <label>Total Duration (Days)</label>
                    <input
                      type="number"
                      name="TrailDuration"
                      value={editPlan?.trial_duration ?? 0}
                      disabled={!editPlan?.is_trial_enabled}
                      onChange={(e) => handleInputChange('trial_duration', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              <div className="membership-cr-form-card">
                <div className="membership-cr-section-title"><span className="membership-cr-step-num">5</span> Advanced Settings</div>
                <div className="membership-cr-row membership-cr-align-center">
                  <div className="membership-cr-toggle-group" style={{ pointerEvents: 'auto' }}>
                    <span>Auto Renewal</span>
                    <div onClick={handleAutoRenewalToggle} className={`membership-cr-toggle-switch ${editPlan?.is_auto_renewal ? 'membership-cr-active' : ''}`}></div>
                  </div>
                  <div className="membership-cr-input-group">
                    <label>Grace Period (Days)</label>
                    <input
                      type="number"
                      name="GraceTime"
                      value={editPlan?.grace_time ?? 0}
                      onChange={(e) => handleInputChange('grace_time', parseInt(e.target.value) || 0)}
                      disabled={!editPlan?.is_auto_renewal}
                    />
                  </div>
                </div>
              </div>

              <div className="membership-cr-action-buttons" style={{ display: 'flex', gap: '15px' }}>
                <button
                  type="button"
                  className="membership-cr-btn-preview"
                  onClick={handleTriggerPreview}
                  style={{
                    padding: "12px 24px",
                    background: "#5c6bc0",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  Preview Changes
                </button>

                <button
                  type="button"
                  className="membership-cr-btn-save"
                  onClick={handleSavePlan}
                  disabled={isSaving}
                  style={{ opacity: isSaving ? 0.7 : 1 }}
                >
                  {Save && <img src={Save} alt="" className="membership-cr-btn-icon" />} {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            <div className="membership-cr-preview-sidebar">
              {previewPlan && (
                <div className="published-plan-preview-card">
                  <div className="published-plan-badge" style={{ backgroundColor: previewPlan.color || '#1E88E5' }}>
                    {previewPlan.name}
                  </div>

                  <div className="published-plan-content">
                    <div className="published-plan-price-section">
                      <h2 className="published-plan-price">
                        {isStarterPlan ? "Free Plan" : `₹ ${calculateTotalPayable(previewPlan.monthly_price ?? 0, previewPlan.tax ?? 0)}`}
                      </h2>
                      {!isStarterPlan && <small style={{ color: '#555' }}>For a Month</small>}
                      <p className="published-plan-sub-badge">{previewPlan.summary}</p>
                    </div>

                    <div className="published-plan-divider"></div>
                    <ul className="published-plan-features">
                      {previewPlan.features?.map((feature, i) => {
                        if (feature.text === 'Jobs Posting') {
                          return (
                            <li key={i} className="published-plan-feature-item included">
                              <span className="published-plan-icon">
                                <img src={Tick} alt="yes" width={15} />
                              </span>
                              Max Job Posts: {feature.value ?? 0}
                            </li>
                          );
                        }

                        if (feature.text === 'Highlight Your Job Listing') {
                          const numericValue = parseInt(feature.value) || 0;
                          if (numericValue > 0) {
                            return (
                              <li key={i} className="published-plan-feature-item included">
                                <span className="published-plan-icon">
                                  <img src={Tick} alt="yes" width={15} />
                                </span>
                                {numericValue} {feature.text}
                              </li>
                            );
                          }
                          return null;
                        }

                        const isEnabled = feature.value === "true" || feature.value === true;
                        return (
                          <li
                            key={i}
                            className={`published-plan-feature-item ${isEnabled ? 'included' : 'excluded'}`}
                          >
                            <span className="published-plan-icon">
                              <img src={isEnabled ? Tick : RedCross} alt={isEnabled ? "yes" : "no"} width={15} />
                            </span>
                            <span className="published-plan-feature-text">
                              {feature.text}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    <button
                      className="published-plan-btn-get-started"
                      style={{ backgroundColor: previewPlan.color || '#1E88E5' }}
                    >
                      {isStarterPlan ? "Get Started For Free" : "Get started"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};