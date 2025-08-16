import React, { useState } from 'react';
import '../styles/SignUp.css';
import { useTheme } from '../ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const { theme } = useTheme();
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        alert('Login successful!');
        navigate('/dashboard'); // or wherever your next page is
      } else {
        alert(data.message || 'Login failed.');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Error during login.');
    }
  };

  return (
    <div className={`signup-container ${theme}`}>
      <div className="signup-box">
        <div className="signup-header">
          <div className="title-section">
            <h1>ReadEase</h1>
            <h2>Log in to your account</h2>
          </div>
          <div className="toggle-section">
            <ThemeToggle />
            <p className="mode-text">{theme.charAt(0).toUpperCase() + theme.slice(1)} Mode</p>
          </div>
        </div>

        <label>Enter your email:</label>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label>Enter your password:</label>
        <div className="password-box">
          <input type={showPass ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <span onClick={() => setShowPass(!showPass)}>
            {showPass ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>

        <button className="signup-btn" onClick={handleLogin}>LOGIN</button>

        <div className="bottom-section">
          <p>Don't have an account?</p>
          <Link to="/signup"><button className="login-btn">SIGN UP</button></Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
