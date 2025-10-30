# Smart Attendance System - AI-based Face Recognition

## 🎯 Project Overview
An AI-powered classroom attendance system using face recognition technology for the Smart India Hackathon. This system automates attendance tracking by recognizing students' faces in real-time.

## ✨ Features
- **Face Recognition**: Accurate student identification using AI
- **Real-time Attendance**: Mark attendance instantly with webcam
- **Student Management**: Register and manage student profiles
- **Attendance Reports**: View and export attendance records
- **Dashboard**: Visual statistics and insights
- **Secure & Fast**: SQLite database with efficient processing

## 🛠️ Tech Stack

### Backend
- **Flask**: Python web framework
- **Flask-CORS**: Cross-origin resource sharing
- **Flask-SQLAlchemy**: Database ORM
- **SQLite**: Lightweight database
- **Pillow (PIL)**: Image processing
- **NumPy**: Numerical operations
- **Image Hashing**: Perceptual hash-based face matching

### Frontend
- **React**: Modern UI library
- **React Webcam**: Camera integration
- **Axios**: HTTP client
- **Lucide React**: Beautiful icons
- **CSS3**: Modern styling with gradients

## 📋 Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- Webcam
- Good lighting for face recognition

## 🚀 Quick Start (Windows)

The easiest way to run the application:

1. **Start Backend**:
   - Double-click `start_backend.bat`
   - Server runs on http://localhost:5000

2. **Start Frontend**:
   - Double-click `start_frontend.bat`
   - App opens on http://localhost:3000

That's it! Both servers will auto-install dependencies on first run.

## 🚀 Installation & Setup (Manual)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
```

3. Activate virtual environment:
- Windows:
```bash
venv\Scripts\activate
```
- Mac/Linux:
```bash
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run the backend server:
```bash
python app.py
```

Backend will run on: http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

Frontend will run on: http://localhost:3000

## 📸 Screenshots

### Dashboard
![alt text](image.png)
*Real-time statistics showing total students, present/absent counts, attendance rate, and recent attendance records*

### Mark Attendance
![alt text](image-1.png)
*Face recognition interface with live camera feed for marking attendance*

### Register Student
![alt text](image-2.png)
*Student registration form with face capture functionality*

### View Records
![alt text](image-3.png)
*Attendance records and registered students management*

## 📱 Usage

### 1. Register Students
- Navigate to "Register Student" tab
- Enter student details (ID, name, email)
- Capture student's face photo
- Submit to register

### 2. Mark Attendance
- Navigate to "Mark Attendance" tab
- Optional: Enter class/subject name
- Click "Start Camera"
- Position face within the circular guide
- Click "Mark Attendance"
- System will recognize and mark attendance automatically

### 3. View Records
- Navigate to "View Records" tab
- **Attendance Records**: View daily attendance logs
  - Select date to filter
  - Export to CSV
- **Registered Students**: Manage student database
  - View all registered students
  - Delete students if needed

### 4. Dashboard
- View real-time statistics
- Total students registered
- Today's present/absent count
- Attendance rate
- Recent attendance activity

## 🔧 Configuration

### API Configuration
Backend API URL is configured in `frontend/src/App.js`:
```javascript
const API_URL = 'http://localhost:5000/api';
```

### Face Recognition Threshold
Adjust recognition sensitivity in `backend/app.py`:
```python
THRESHOLD = 0.3  # Lower = more lenient, Higher = stricter
```

## 📊 API Endpoints

### Students
- `POST /api/students/register` - Register new student
- `GET /api/students` - Get all students
- `DELETE /api/students/<id>` - Delete student

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/stats` - Get statistics

### Health
- `GET /api/health` - Check server status

## 🎨 Features Walkthrough

### Face Recognition Algorithm
- Uses perceptual image hashing technique
- Converts images to 8x8 grayscale for comparison
- Hamming distance for similarity matching
- Fast and efficient processing
- Works in various lighting conditions
- Adjustable threshold for accuracy

### Security Features
- Face encodings stored securely
- No raw images stored (only encodings)
- Duplicate attendance prevention
- Confidence score validation

### User Experience
- Clean, modern UI
- Real-time feedback
- Responsive design
- Mobile-friendly interface

## 🐛 Troubleshooting

### Camera not working
- Check browser permissions
- Ensure webcam is connected
- Try a different browser (Chrome recommended)

### Face not detected
- Ensure good lighting
- Position face clearly in frame
- Remove obstructions (glasses, mask)

### Backend errors
- Check Python version (3.8+)
- Verify all dependencies installed
- Ensure virtual environment activated

### Frontend not connecting
- Verify backend is running on port 5000
- Check CORS configuration
- Clear browser cache

## 📈 Performance Tips
- Good lighting improves recognition accuracy
- Register multiple angles for better matching
- Maintain consistent distance from camera
- Ensure face is clearly visible

## 🔮 Future Enhancements
- Multi-face detection (bulk attendance)
- Mobile app version
- Cloud storage integration
- Advanced analytics and reporting
- Email notifications
- Attendance tracking over time
- Integration with LMS systems

## 👥 Team
Developed for Smart India Hackathon 2024

## 📄 License
This project is created for educational purposes.

## 🤝 Contributing
Feel free to fork, improve, and submit pull requests!

## 📞 Support
For issues or questions, please create an issue in the repository.

---

**Note**: Ensure you have proper permissions and consent before collecting biometric data (face photos) in a production environment.
