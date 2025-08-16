import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import { useTheme } from '../ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import axios from 'axios';

const Dashboard = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [fileContent, setFileContent] = useState(''); // 👈 New state
  // ⭐ CHANGED: added currentPage state
  const [currentPage, setCurrentPage] = useState(0);

  const goNext = () => {
    if (currentPage < fileContent.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };


  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadStatus('Uploading...');
      const res = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      console.log('Full upload response:', res.data); // ✅ To see the whole response
      console.log('Extracted text:', res.data.content); // ✅ THIS LINE

      console.log('Uploaded file:', res.data);
      setUploadStatus(`✅ ${res.data.message}`);
      setUploadedFileUrl(res.data.fileUrl);
      setFileContent(res.data.content); // 👈 Set extracted content

    } catch (err) {
      console.error(err);
      if (err.response?.data?.error) {
        setUploadStatus(`❌ ${err.response.data.error}`);
      } else {
        setUploadStatus('❌ Upload failed.');
      }
    }
  };

  /*const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };*/
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };



  return (
    <div className={`dashboard-container ${theme}`}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <h1>ReadEase</h1>
        </div>
        <div className="nav-right">
          <div className="theme-toggle">
            <ThemeToggle />
            <p className="mode-text">
              {theme.charAt(0).toUpperCase() + theme.slice(1)} Mode
            </p>
          </div>
          <button className="nav-button">👤 Profile</button>
          <button className="nav-button">📊 Stats</button>
          <button className="nav-button" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </nav>

      {/* Dashboard layout */}
      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <h3>Reading Tools</h3>
          <button>🔊 Speak Selected</button>
          <button>📄 Speak Page</button>
          <button>🔠 Increase Font Size</button>
          <button>🎨 Background Color</button>
          <button>🎨 Font Color</button>
          <button>📏 Line Spacing</button>
          <button>🔡 Capitalize b/d</button>
          <button>🖍️ Highlight Text</button>
        </aside>

        {/* Main content */}
        <main className="main-area">
          <h2>Welcome to your Dashboard</h2>
          <p>Here you'll see uploaded documents and use tools to assist with reading.</p>

          <div className="upload-box">
            <label htmlFor="file-upload" className="upload-label">
              Click to upload a PDF or DOC file
            </label>
            <input
              type="file"
              id="file-upload"
              className="file-input"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
            />
            {uploadStatus && (
              <p style={{ marginTop: '10px' }}>
                {uploadStatus}
                {uploadedFileUrl && (
                  <>
                    {' '}
                  </>
                )}
              </p>
            )}
          </div>

          {/* Display Only One Page at a Time */}
          {fileContent && Array.isArray(fileContent) && fileContent.length > 0 && (
            <div className="file-preview">
              <div className="page-block">
                <div className="page-header">
                  <strong>Page {currentPage + 1} of {fileContent.length}</strong>
                </div>
                <div className="page-text">{fileContent[currentPage]}</div>
              </div>

              {/* Page Navigation */}
              <div className="page-controls">
                <button onClick={goPrev} disabled={currentPage === 0}>⬅ Previous</button>
                <button onClick={goNext} disabled={currentPage === fileContent.length - 1}>Next ➡</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
