import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import './Jcreatepassword.css'
import confirm_password from "../assets/ConfirmPassword.png"
import eye from '../assets/show_password.png'
import eyeHide from '../assets/eye-hide.png'
import api from '../api/axios'

export const Jcreatepassword = () => {

  const [passwordShow, setPasswordShow] = useState(true)
  const [confirmPasswordShow, setconfirmPasswordShow] = useState(true)

  const navigate = useNavigate();

  const togglePasswordView = () => {
    setPasswordShow((prev) => !prev)
  }

  const toggleConfirmPasswordView = () => {
    setconfirmPasswordShow((prev) => !prev)
   }

  const initialValues = { newPassword: "", confirmPassword: "" }

  const [formValues, setFormValues] = useState(initialValues)
  const [errors, setErrors] = useState({})


  const handleForm = (e) => {
    const { name, value } = e.target
    setFormValues({ ...formValues, [name]: value })
    setErrors({ ...errors, [name]: "" })
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^?&*]{8,}$/

  const validateForm = () => {
    const newErrors = {}

    if (!formValues.newPassword.trim()) {
      newErrors.newPassword = "Password is required"
    } else if (formValues.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters"
    } else if (!passwordRegex.test(formValues.newPassword)) {
      newErrors.newPassword =
        "Password must be at least 8 characters long, with uppercase, lowercase, a number, and a special";;
    }

    if (!formValues.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm Password is required"
    } else if (formValues.confirmPassword.length < 8) {
      newErrors.confirmPassword = "Password must be at least 8 characters"
    } else if (formValues.confirmPassword !== formValues.newPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  
  const location = useLocation(); //location

  // for token validation
  useEffect(()=>{
    const queryParams        = new URLSearchParams(location.search);
    const tokenFromURL       = queryParams.get('token');

    if(tokenFromURL){
      validateToken(tokenFromURL);
    }
  },[])

  //validate's the token
  const validateToken = async (tokenString) => {
    try {
       const data = await api.post('auth/validate-reset-token/',
        {token : tokenString,} // object
      )
    } catch (error) {
      alert('Invalid token or expired token')
    }
  }

  // reset password integretion

  const handleSubmit = async (e) => {
    e.preventDefault();

    const queryParams        = new URLSearchParams(location.search);
    const tokenFromURL       = queryParams.get('token');
    if (!validateForm()) {
      return false
    }
    try {
      const res = await api.post('auth/reset-password-confirm/',
      { token : tokenFromURL,
        new_password : formValues.newPassword,
        confirm_password : formValues.confirmPassword
      }
    )
     alert(res.data.message);
     navigate("/Job-portal/jobseeker/login")

    } catch (error) {
      alert('Invalid token or expired token')
      }
    }

  return (
    <div className="j-create-password-page">
      <header className="j-create-password-header">
        <Link to="/Job-portal" className="logo">
          <span className="logo-text">Job portal</span>
        </Link>
        <div className="j-create-password-header-links">
          <span className='no-account'>Create a new account?</span>
          <Link to="/Job-portal/jobseeker/signup" className="signup-btn">Create</Link>
        </div>
      </header>
      <div className='j-create-password-login-body'>
        <div className="create-password-illustration">
          <img src={confirm_password} alt="create password Illustration" />
        </div>
        <form onSubmit={handleSubmit} className="create-password-form">
          <h2>Create a New Password</h2>

          <label>New Password</label>
          <div className="password-wrapper">
            <input type={passwordShow ? "password" : "text"} placeholder="Enter new password" name="newPassword"
              value={formValues.newPassword}
              onChange={handleForm}
              className={errors.newPassword ? "input-error" : ""} />
            <span className="eye-icon" onClick={togglePasswordView}><img src={passwordShow ? eyeHide : eye} className='show-icon' alt='show' /></span>
          </div>
          {errors.newPassword && <span className="error-msg">{errors.newPassword}</span>}

          <label>Confirm Password</label>
          <div className="password-wrapper">
            <input type={confirmPasswordShow ? "password" : "text"} placeholder="Re-enter new password" name="confirmPassword"
              value={formValues.confirmPassword}
              onChange={handleForm}
              className={errors.confirmPassword ? "input-error" : ""} />
            <span className="eye-icon" onClick={toggleConfirmPasswordView}><img src={confirmPasswordShow ? eyeHide : eye} className='show-icon' alt='show' /></span>
          </div>
          {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}

          <button type='submit' className="j-reset-link-btn">Reset Password</button>

          <div className='center-div-text'>
            <p>Remember your password? <Link to="/Job-portal/jobseeker/login" className='j-password-form-login-link'>Login</Link></p>
          </div>
        </form>
      </div>
    </div>
  )
}