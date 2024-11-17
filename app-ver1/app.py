from flask import Flask, request, jsonify, send_from_directory, session
import json
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Required for session management

# File to store user data
USER_DATA_FILE = os.path.join(os.getcwd(), 'data', 'users.txt')

# Ensure the directory exists
if not os.path.exists(os.path.dirname(USER_DATA_FILE)):
    os.makedirs(os.path.dirname(USER_DATA_FILE))

# Load existing users from the text file, where each user is on a new line
def load_users():
    users = {}
    try:
        with open(USER_DATA_FILE, 'r') as file:
            for line in file:
                user = json.loads(line.strip())  # Load each user from a new line
                users[user['username']] = user  # Use the username as the key
    except (FileNotFoundError, json.JSONDecodeError):
        return {}
    return users

# Save a single user's data on a new line
def save_user(user):
    with open(USER_DATA_FILE, 'a') as file:
        file.write(json.dumps(user) + '\n')  # Append new user data to the file on a new line

# Serve the index.html file when the root URL is accessed
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Serve static files like CSS and JS
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

# Handle registration requests
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    users = load_users()

    if data['username'] in users:
        return jsonify({'success': False, 'message': 'Username already exists'})

    # Save the new user (append to the file)
    save_user(data)
    return jsonify({'success': True, 'message': 'User registered successfully'})

# Handle login requests and redirect to the time page on success
@app.route('/login', methods=['POST'])
def login():
    credentials = request.get_json()
    users = load_users()

    user = users.get(credentials['username'])
    if user and user['password'] == credentials['password']:
        session['username'] = user['username']  # Store username in session
        return jsonify({'success': True}), 200
    else:
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401

# Serve the time.html page
@app.route('/time')
def time_page():
    return send_from_directory('.', 'time.html')

# Handle requests for profile data
@app.route('/profile', methods=['GET'])
def profile():
    # Get the logged-in user from session
    logged_in_user = session.get('username')  # Retrieve username from session
    users = load_users()
    user = users.get(logged_in_user)
    
    if user:
        return jsonify({
            'username': user['username'],
            'medications': user['medications'],
            'dosage': user['dosage'],
            'allergies': user['allergies'],
            'emergencyContact': user['emergencyContact']
        })
    else:
        return jsonify({'error': 'User not found'}), 404

# Handle logout request
@app.route('/logout', methods=['POST'])
def logout():
    session.pop('username', None)  # Clear the session
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)
