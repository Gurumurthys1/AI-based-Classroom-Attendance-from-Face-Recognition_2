# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import base64
from datetime import datetime
import os
from io import BytesIO
from PIL import Image
import numpy as np
import hashlib

app = Flask(__name__)
# Configure CORS to allow all origins and methods
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///attendance.db'
db = SQLAlchemy(app)

# Database Models
class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100))
    image_hash = db.Column(db.String(64))  # Store image hash instead of face encoding
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(50), db.ForeignKey('student.student_id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='Present')
    class_name = db.Column(db.String(100))

def image_to_hash(image_data):
    """Convert image to a simple hash for comparison"""
    try:
        # Remove data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',', 1)[1]
        
        # Decode base64
        img_bytes = base64.b64decode(image_data)
        img = Image.open(BytesIO(img_bytes))
        
        # Convert to grayscale and resize for faster hashing
        img = img.convert('L').resize((8, 8), Image.Resampling.LANCZOS)
        
        # Calculate average pixel value
        avg = sum(list(img.getdata())) / 64.0
        
        # Create binary hash (1 if pixel > avg, else 0)
        bits = ''.join(['1' if (pixel > avg) else '0' for pixel in img.getdata()])
        
        # Convert binary string to hex
        hash_hex = ''.join(['%02x' % int(bits[i:i+8], 2) for i in range(0, len(bits), 8)])
        return hash_hex
    except Exception as e:
        print(f"Error processing image: {e}")
        return None

def compare_hashes(hash1, hash2):
    """Compare two image hashes using Hamming distance"""
    if not (hash1 and hash2):
        return 0
    return sum(c1 != c2 for c1, c2 in zip(hash1, hash2)) / len(hash1)

# API Routes
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

@app.route('/api/students/register', methods=['POST'])
def register_student():
    try:
        data = request.json
        student_id = data.get('student_id')
        name = data.get('name')
        email = data.get('email')
        image_data = data.get('image')

        if not all([student_id, name, image_data]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Check if student exists
        if Student.query.filter_by(student_id=student_id).first():
            return jsonify({'error': 'Student ID already exists'}), 400

        # Process image
        image_hash = image_to_hash(image_data)
        if not image_hash:
            return jsonify({'error': 'Invalid image data'}), 400

        # Create student
        student = Student(
            student_id=student_id,
            name=name,
            email=email,
            image_hash=image_hash
        )
        
        db.session.add(student)
        db.session.commit()

        return jsonify({
            'message': 'Student registered successfully',
            'student': {
                'id': student.id,
                'student_id': student.student_id,
                'name': student.name,
                'email': student.email
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/attendance/mark', methods=['POST', 'OPTIONS'])
def mark_attendance():
    print("\n=== DEBUG: Received request to /api/attendance/mark ===")
    print(f"DEBUG: Request method: {request.method}")
    print(f"DEBUG: Headers: {dict(request.headers)}")
    print(f"DEBUG: Content-Type: {request.content_type}")
    
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'preflight'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response
    
    try:
        # Log raw request data for debugging
        print("DEBUG: Raw request data:", request.get_data()[:200])  # Print first 200 chars
        
        data = request.get_json(force=True)  # force=True to parse even if content-type is not application/json
        print(f"DEBUG: Parsed JSON data: {data}")
        
        if not data:
            print("DEBUG: No JSON data received")
            return jsonify({'error': 'No data provided'}), 400
            
        image_data = data.get('image')
        class_name = data.get('class_name', 'Default Class')
        print(f"DEBUG: Received image_data length: {len(image_data) if image_data else 0}")
        print(f"DEBUG: Class name: {class_name}")

        if not image_data:
            print("DEBUG: No image data in request")
            return jsonify({'error': 'No image provided'}), 400

        # Process the image
        current_hash = image_to_hash(image_data)
        if not current_hash:
            return jsonify({'error': 'Invalid image data'}), 400

        # Get all students
        students = Student.query.all()
        
        # Check if any students are registered
        if not students:
            print("DEBUG: NO STUDENTS REGISTERED - Database is empty")
            return jsonify({
                'error': 'No students registered in the system',
                'message': 'Please register students before marking attendance',
                'total_students': 0
            }), 404
        
        best_match = None
        best_similarity = float('inf')

        # Find best match
        for student in students:
            similarity = compare_hashes(current_hash, student.image_hash)
            if similarity < best_similarity:
                best_similarity = similarity
                best_match = student

        # Threshold for matching (adjust as needed)
        THRESHOLD = 0.3
        if best_similarity > THRESHOLD:
            print(f"DEBUG: NO MATCH FOUND - Best similarity: {best_similarity}, Threshold: {THRESHOLD}")
            print(f"DEBUG: Confidence: {round((1 - best_similarity) * 100, 2)}%")
            print(f"DEBUG: Checked {len(students)} students")
            return jsonify({
                'error': 'No matching student found',
                'message': 'Face does not match any registered student',
                'confidence': round((1 - best_similarity) * 100, 2),
                'threshold': f'{(1 - THRESHOLD) * 100}%',
                'total_students_checked': len(students)
            }), 404

        # Check if attendance already marked today
        today = datetime.utcnow().date()
        existing = Attendance.query.filter(
            Attendance.student_id == best_match.student_id,
            db.func.date(Attendance.timestamp) == today,
            Attendance.class_name == class_name
        ).first()

        if existing:
            return jsonify({
                'message': 'Attendance already marked today',
                'student': {
                    'student_id': best_match.student_id,
                    'name': best_match.name
                },
                'attendance': {
                    'timestamp': existing.timestamp.isoformat(),
                    'status': existing.status,
                    'class_name': existing.class_name
                }
            })

        # Mark attendance
        print(f"DEBUG: MATCH FOUND - Student: {best_match.name} (ID: {best_match.student_id})")
        print(f"DEBUG: Confidence: {round((1 - best_similarity) * 100, 2)}%")
        attendance = Attendance(
            student_id=best_match.student_id,
            status='Present',
            class_name=class_name
        )
        db.session.add(attendance)
        db.session.commit()
        print(f"DEBUG: Attendance marked successfully for {best_match.name}")

        return jsonify({
            'message': 'Attendance marked successfully',
            'student': {
                'student_id': best_match.student_id,
                'name': best_match.name
            },
            'attendance': {
                'timestamp': attendance.timestamp.isoformat(),
                'status': attendance.status,
                'class_name': attendance.class_name
            },
            'confidence': 1 - best_similarity
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/students', methods=['GET'])
def get_students():
    try:
        students = Student.query.all()
        return jsonify([{
            'id': s.id,
            'student_id': s.student_id,
            'name': s.name,
            'email': s.email,
            'created_at': s.created_at.isoformat()
        } for s in students])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/students/<string:student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        student = Student.query.filter_by(student_id=student_id).first()
        if not student:
            return jsonify({'error': 'Student not found'}), 404
            
        # Delete attendance records first
        Attendance.query.filter_by(student_id=student_id).delete()
        
        # Then delete the student
        db.session.delete(student)
        db.session.commit()
        
        return jsonify({'message': 'Student deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    try:
        date_str = request.args.get('date')
        query = Attendance.query
        
        if date_str:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            query = query.filter(db.func.date(Attendance.timestamp) == target_date)
            
        attendance = query.all()
        
        # Build response with student names
        result = []
        for a in attendance:
            student = Student.query.filter_by(student_id=a.student_id).first()
            result.append({
                'id': a.id,
                'student_id': a.student_id,
                'student_name': student.name if student else 'Unknown',
                'timestamp': a.timestamp.isoformat(),
                'status': a.status,
                'class_name': a.class_name
            })
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/attendance/stats', methods=['GET'])
def get_attendance_stats():
    try:
        total_students = Student.query.count()
        today = datetime.utcnow().date()
        present_today = Attendance.query.filter(
            db.func.date(Attendance.timestamp) == today
        ).count()
        
        return jsonify({
            'total_students': total_students,
            'present': present_today,
            'absent': max(0, total_students - present_today)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Debug route to list all registered routes
@app.route('/api/routes')
def list_routes():
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({
            'endpoint': rule.endpoint,
            'methods': sorted(rule.methods),
            'path': str(rule)
        })
    print("\n=== Registered routes ===")
    for r in routes:
        print(f"{r['path']} - {r['methods']}")
    print("======================\n")
    return jsonify(routes)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    print("Starting Face Recognition Attendance System...")
    print("Registered routes:")
    for rule in app.url_map.iter_rules():
        print(f"{rule.endpoint}: {rule.rule} {sorted(rule.methods)}")
    print("Server running on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)