import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { Camera, CheckCircle, X } from 'lucide-react';
import { getApiUrl, API_ENDPOINTS } from '../config';

function MarkAttendance({ onSuccess }) {
  const webcamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [className, setClassName] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [recognizedStudent, setRecognizedStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  const markAttendance = async () => {
    if (!webcamRef.current) return;

    setLoading(true);
    setMessage({ type: '', text: '' });
    setRecognizedStudent(null);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      
      const response = await axios.post(
        getApiUrl(API_ENDPOINTS.MARK_ATTENDANCE),
        {
          image: imageSrc,
          class_name: className || 'Default Class'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      setRecognizedStudent(response.data.student);
      setMessage({
        type: 'success',
        text: `Attendance marked for ${response.data.student.name} with ${(response.data.confidence * 100).toFixed(1)}% confidence`
      });
      onSuccess();

      // Auto-clear after 3 seconds
      setTimeout(() => {
        setRecognizedStudent(null);
        setMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to mark attendance';
      setMessage({ type: 'error', text: errorMsg });
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: '#1f2937' }}>Mark Attendance</h1>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {recognizedStudent && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle size={48} />
            <div>
              <h2 style={{ color: 'white', marginBottom: '0.5rem' }}>Attendance Marked!</h2>
              <p style={{ fontSize: '1.125rem', margin: 0 }}>
                <strong>{recognizedStudent.name}</strong> ({recognizedStudent.student_id})
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2>
          <Camera size={20} />
          Face Recognition
        </h2>

        <div className="form-group">
          <label>Class/Subject Name (Optional)</label>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="e.g., Mathematics 101"
          />
        </div>

        {!showCamera ? (
          <button
            className="btn btn-primary"
            onClick={() => setShowCamera(true)}
            style={{ width: '100%' }}
          >
            <Camera size={20} />
            Start Camera
          </button>
        ) : (
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

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                className="btn btn-primary"
                onClick={markAttendance}
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? 'Processing...' : 'Mark Attendance'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowCamera(false)}
                disabled={loading}
              >
                <X size={20} />
                Close Camera
              </button>
            </div>
          </div>
        )}

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#f9fafb',
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <strong>Instructions:</strong>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
            <li>Position your face within the circular guide</li>
            <li>Ensure good lighting</li>
            <li>Look directly at the camera</li>
            <li>Click "Mark Attendance" to capture and recognize</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MarkAttendance;
