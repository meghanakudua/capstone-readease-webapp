import React, { useState } from 'react';
import '../styles/SignUp.css';
import { useTheme } from '../ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

const SignUp = () => {
  const { theme } = useTheme();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (password !== confirm) {
      alert("Passwords don't match");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Signup successful!');
        navigate('/login');
      } else {
        alert(data.message || 'Signup failed.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      alert('Error during signup.');
    }
  };

  return (
    <div className={`signup-container ${theme}`}>
      <div className="signup-box">
        <div className="signup-header">
          <div className="title-section">
            <h1>ReadEase</h1>
            <h2>Create an account</h2>
          </div>
          <div className="toggle-section">
            <ThemeToggle />
            <p className="mode-text">
              {theme.charAt(0).toUpperCase() + theme.slice(1)} Mode
            </p>
          </div>
        </div>

        <label>Enter your name:</label>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />

        <label>Enter your email:</label>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label>Enter your password:</label>
        <div className="password-box">
          <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <span onClick={() => setShowPass(!showPass)}>
            {showPass ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>

        <label>Confirm password:</label>
        <div className="password-box">
          <input
            type={showConfirm ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <span onClick={() => setShowConfirm(!showConfirm)}>
            {showConfirm ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>

        <button className="signup-btn" onClick={handleSignup}>SIGN UP</button>

        <div className="bottom-section">
          <p>Already have an account?</p>
          <Link to="/login"><button className="login-btn">LOGIN</button></Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
