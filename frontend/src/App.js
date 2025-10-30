import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, Users, BarChart3, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import RegisterStudent from './components/RegisterStudent';
import MarkAttendance from './components/MarkAttendance';
import ViewAttendance from './components/ViewAttendance';
import Dashboard from './components/Dashboard';
import './App.css';

const API_URL = 'http://localhost:5000/api';

axios.defaults.baseURL = API_URL;

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    total_students: 0,
    present: 0,
    absent: 0,
    attendance_rate: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  // Refresh stats when dashboard tab is active
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/attendance/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'mark', name: 'Mark Attendance', icon: Camera },
    { id: 'register', name: 'Register Student', icon: UserPlus },
    { id: 'view', name: 'View Records', icon: Users }
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <Camera size={32} />
            <h1>Smart Attendance System</h1>
          </div>
          <div className="stats-quick">
            <div className="stat-item">
              <CheckCircle size={20} color="#10b981" />
              <span>{stats.present} Present</span>
            </div>
            <div className="stat-item">
              <XCircle size={20} color="#ef4444" />
              <span>{stats.absent} Absent</span>
            </div>
          </div>
        </div>
      </header>

      <div className="app-container">
        <nav className="sidebar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={20} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>

        <main className="main-content">
          {activeTab === 'dashboard' && <Dashboard stats={stats} />}
          {activeTab === 'register' && <RegisterStudent onSuccess={fetchStats} />}
          {activeTab === 'mark' && <MarkAttendance onSuccess={fetchStats} />}
          {activeTab === 'view' && <ViewAttendance />}
        </main>
      </div>
    </div>
  );
}

export default App;
