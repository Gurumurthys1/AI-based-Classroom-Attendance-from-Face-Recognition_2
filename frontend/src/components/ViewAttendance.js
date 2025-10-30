import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Calendar, Download, Trash2 } from 'lucide-react';
import { getApiUrl, API_ENDPOINTS } from '../config';

function ViewAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('attendance');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAttendance();
    fetchStudents();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await axios.get(getApiUrl(API_ENDPOINTS.ATTENDANCE), {
        params: { date: selectedDate }
      });
      setAttendanceRecords(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(getApiUrl(API_ENDPOINTS.STUDENTS));
      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  const deleteStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      await axios.delete(getApiUrl(`${API_ENDPOINTS.STUDENTS}/${studentId}`));
      fetchStudents();
      alert('Student deleted successfully');
    } catch (error) {
      alert('Error deleting student: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  const exportToCSV = () => {
    const headers = ['Student ID', 'Name', 'Time', 'Status', 'Confidence', 'Class'];
    const rows = attendanceRecords.map(record => [
      record.student_id,
      record.student_name,
      new Date(record.timestamp).toLocaleString(),
      record.status,
      (record.confidence * 100).toFixed(1) + '%',
      record.class_name || 'N/A'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedDate}.csv`;
    a.click();
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: '#1f2937' }}>View Records</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          className={`btn ${activeTab === 'attendance' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('attendance')}
        >
          <Calendar size={20} />
          Attendance Records
        </button>
        <button
          className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('students')}
        >
          <Users size={20} />
          Registered Students
        </button>
      </div>

      {activeTab === 'attendance' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>
              <Calendar size={20} />
              Attendance Records
            </h2>
            <button className="btn btn-secondary" onClick={exportToCSV} disabled={attendanceRecords.length === 0}>
              <Download size={20} />
              Export CSV
            </button>
          </div>

          <div className="form-group">
            <label>Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading...</p>
          ) : attendanceRecords.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Time</th>
                    <th>Confidence</th>
                    <th>Class</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr key={record.id}>
                      <td>{record.student_id}</td>
                      <td>{record.student_name}</td>
                      <td>{new Date(record.timestamp).toLocaleTimeString()}</td>
                      <td>{(record.confidence * 100).toFixed(1)}%</td>
                      <td>{record.class_name || 'N/A'}</td>
                      <td>
                        <span className="badge badge-success">{record.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              No attendance records for this date
            </p>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="card">
          <h2>
            <Users size={20} />
            Registered Students ({students.length})
          </h2>

          {students.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Registered On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.student_id}</td>
                      <td>{student.name}</td>
                      <td>{student.email || 'N/A'}</td>
                      <td>{new Date(student.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          onClick={() => deleteStudent(student.student_id)}
                          style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              No students registered yet
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default ViewAttendance;
