from flask import Flask, request, jsonify, send_from_directory, session
import json
import os
import bcrypt
import re

app = Flask(__name__)
app.secret_key = 'ijustwannapassdawg'  # Change this in production for security!

# Define file paths for user and medical data storage
USER_DATA_FILE = os.path.join(os.getcwd(), 'data', 'users.txt')
MEDICAL_DATA_FILE = os.path.join(os.getcwd(), 'data', 'medical_data.txt')

# Ensure data storage directories exist
os.makedirs(os.path.dirname(USER_DATA_FILE), exist_ok=True)

def load_data(file_path):
    """ Utility function to load data from a JSON file. """
    try:
        with open(file_path, 'r') as file:
            return {data['username']: data for data in (json.loads(line.strip()) for line in file)}
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def save_data(file_path, data):
    """ Utility function to save data to a JSON file. """
    with open(file_path, 'w') as file:
        for item in data.values():
            file.write(json.dumps(item) + '\n')

def is_valid_username(username):
    """ Check if the username is alphanumeric and between 5-20 characters. """
    return len(username) >= 5 and len(username) <= 20

def is_valid_password(password):
    """ Check if password meets specific complexity requirements. """
    return (len(password) >= 8 and
            re.search(r"[A-Z]", password) and      # At least one uppercase letter
            re.search(r"[a-z]", password) and      # At least one lowercase letter
            re.search(r"[0-9]", password) and      # At least one digit
            re.search(r"[!@#$%^&*(),.?\":{}|<>]", password))  # At least one special character

@app.route('/register', methods=['POST'])
def register():
    users = load_data(USER_DATA_FILE)
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')

    # Validate username and password constraints
    if not username or not is_valid_username(username):
        return jsonify({'success': False, 'message': 'Username must be 5-20 characters long'}), 400
    if username in users:
        return jsonify({'success': False, 'message': 'Username already exists.'}), 409
    if not password or not is_valid_password(password):
        return jsonify({'success': False, 'message': 'Password must be at least 8 characters, contain uppercase and lowercase letters, a digit, and a special character.'}), 400

    # Hash the password using bcrypt
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Save the user with the hashed password
    users[username] = {
        'username': username,
        'password': hashed_password.decode('utf-8')  # Store as a string
    }
    save_data(USER_DATA_FILE, users)
    return jsonify({'success': True, 'message': 'User registered successfully'})

@app.route('/login', methods=['POST'])
def login():
    users = load_data(USER_DATA_FILE)
    data = request.get_json()

    user = users.get(data['username'])
    if user:
        # Check if the provided password matches the stored hashed password
        if bcrypt.checkpw(data['password'].encode('utf-8'), user['password'].encode('utf-8')):
            session['username'] = user['username']
            return jsonify({'success': True}), 200

    return jsonify({'success': False, 'message': 'Invalid username or password'}), 401

@app.route('/profile', methods=['GET'])
def profile():
    if 'username' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    users = load_data(USER_DATA_FILE)
    medical_data = load_data(MEDICAL_DATA_FILE)
    user_info = users.get(session['username'])
    medical_info = medical_data.get(session['username'], {})

    if user_info:
        return jsonify({
            'username': user_info['username'],
            'emergencyContact': user_info.get('emergencyContact', 'N/A'),
            'medications': [
                {
                    'name': med.get('medicationName', 'N/A'),
                    'dosage': med.get('dosage', 'N/A'),
                    'days': ', '.join(med.get('days', [])),
                    'time': med.get('time', 'N/A')
                }
                for med in medical_info.get('medications', [])
            ],
            'allergies': medical_info.get('allergies', [])
        })
    return jsonify({'error': 'User not found'}), 404

@app.route('/update_medical_info', methods=['POST'])
def update_medical_info():
    if 'username' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    username = session['username']
    medical_data = load_data(MEDICAL_DATA_FILE)
    data = request.get_json()

    # Process medications correctly
    processed_medications = [
        {
            'medicationName': med['medicationName'],
            'dosage': med['dosage'],
            'days': med['days'],
            'time': med['time']
        }
        for med in data.get('medications', [])
    ]

    medical_data[username] = {
        'username': username,
        'medications': processed_medications,
        'allergies': data.get('allergies', [])
    }

    save_data(MEDICAL_DATA_FILE, medical_data)
    return jsonify({'success': True, 'message': 'Medical information updated successfully'})

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('username', None)
    return jsonify({'success': True})

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

@app.route('/')
def index():
    return send_from_directory('.', 'login.html')

if __name__ == '__main__':
    app.run(debug=True)
