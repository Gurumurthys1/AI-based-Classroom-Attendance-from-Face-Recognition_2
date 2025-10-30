import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { getApiUrl, API_ENDPOINTS } from '../config';

function Dashboard({ stats = {} }) {
  // Default values for stats
  const safeStats = {
    total_students: stats.total_students || 0,
    present: stats.present || 0,
    absent: stats.absent || 0
  };
  const [recentAttendance, setRecentAttendance] = useState([]);

  useEffect(() => {
    // Initial fetch
    fetchRecentAttendance();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchRecentAttendance();
    }, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const fetchRecentAttendance = async () => {
    try {
      const response = await axios.get(getApiUrl(API_ENDPOINTS.ATTENDANCE));
      setRecentAttendance(Array.isArray(response.data) ? response.data.slice(0, 5) : []);
    } catch (error) {
      console.error('Error fetching recent attendance:', error);
      setRecentAttendance([]);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: '#1f2937' }}>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3>Total Students</h3>
              <div className="value">{safeStats.total_students}</div>
            </div>
            <Users size={40} opacity={0.8} />
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3>Present Today</h3>
              <div className="value">{safeStats.present}</div>
            </div>
            <CheckCircle size={40} opacity={0.8} />
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3>Absent Today</h3>
              <div className="value">{safeStats.absent}</div>
            </div>
            <XCircle size={40} opacity={0.8} />
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3>Attendance Rate</h3>
              <div className="value">
                {safeStats.total_students > 0 
                  ? ((safeStats.present / safeStats.total_students) * 100).toFixed(1) 
                  : '0.0'}%
              </div>
            </div>
            <TrendingUp size={40} opacity={0.8} />
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Recent Attendance</h2>
        {recentAttendance.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAttendance.map((record) => (
                <tr key={record.id}>
                  <td>{record.student_id}</td>
                  <td>{record.student_name}</td>
                  <td>{new Date(record.timestamp).toLocaleTimeString()}</td>
                  <td>
                    <span className="badge badge-success">{record.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
            No attendance records yet
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
