import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { Camera, User, Mail, Hash, X } from 'lucide-react';

function RegisterStudent({ onSuccess }) {
  const webcamRef = useRef(null);
  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    email: ''
  });
  const [capturedImage, setCapturedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setShowCamera(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!capturedImage) {
      setMessage({ type: 'error', text: 'Please capture a photo first!' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('/students/register', {
        ...formData,
        image: capturedImage
      });

      setMessage({ type: 'success', text: response.data.message });
      setFormData({ student_id: '', name: '', email: '' });
      setCapturedImage(null);
      onSuccess();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Registration failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: '#1f2937' }}>Register New Student</h1>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <h2>
          <User size={20} />
          Student Information
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <Hash size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Student ID
            </label>
            <input
              type="text"
              name="student_id"
              value={formData.student_id}
              onChange={handleInputChange}
              placeholder="e.g., STU2024001"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter student name"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="student@example.com"
            />
          </div>

          <div className="form-group">
            <label>Photo</label>
            
            {!showCamera && !capturedImage && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCamera(true)}
                style={{ width: '100%' }}
              >
                <Camera size={20} />
                Open Camera
              </button>
            )}

            {showCamera && (
              <div>
                <div className="camera-container">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width="100%"
                  />
                  <div className="overlay"></div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={capture}
                    style={{ flex: 1 }}
                  >
                    <Camera size={20} />
                    Capture Photo
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCamera(false)}
                  >
                    <X size={20} />
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {capturedImage && (
              <div>
                <img
                  src={capturedImage}
                  alt="Captured"
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setCapturedImage(null);
                    setShowCamera(true);
                  }}
                  style={{ width: '100%' }}
                >
                  Retake Photo
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !capturedImage}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {loading ? 'Registering...' : 'Register Student'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterStudent;
