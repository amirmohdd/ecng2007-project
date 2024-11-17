from flask import Flask, request, jsonify, send_from_directory, session
import json
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Required for session management

# File to store user data
USER_DATA_FILE = os.path.join(os.getcwd(), 'data', 'users.txt')

# File to store medical data
MEDICAL_DATA_FILE = os.path.join(os.getcwd(), 'data', 'medical_data.txt')

# Ensure the directory exists for both user and medical data
if not os.path.exists(os.path.dirname(USER_DATA_FILE)):
    os.makedirs(os.path.dirname(USER_DATA_FILE))

# Load existing users from the text file
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

# Save a single user's data
def save_user(user):
    users = load_users()
    users[user['username']] = user  # Update or add the user
    with open(USER_DATA_FILE, 'w') as file:
        for user in users.values():
            file.write(json.dumps(user) + '\n')

# Load medical data
def load_medical_data():
    medical_data = {}
    try:
        with open(MEDICAL_DATA_FILE, 'r') as file:
            for line in file:
                medical_info = json.loads(line.strip())
                medical_data[medical_info['username']] = medical_info
    except (FileNotFoundError, json.JSONDecodeError):
        return {}
    return medical_data

# Save medical data for a user
def save_medical_info(username, medical_info):
    medical_data = load_medical_data()
    medical_data[username] = medical_info  # Update or add medical info
    with open(MEDICAL_DATA_FILE, 'w') as file:
        for info in medical_data.values():
            file.write(json.dumps(info) + '\n')

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

    # Initially, the user registers without medical info
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

# Serve the update_medical_info.html page
@app.route('/update_medical_info')
def update_medical_info_page():
    return send_from_directory('.', 'update_medical_info.html')

# Handle updating user medical information
@app.route('/update_medical_info', methods=['POST'])
def update_medical_info():
    data = request.get_json()
    username = session.get('username')  # Get the current user from the session
    medical_data = load_medical_data()

    if username:
        # Update the user's medical information
        medical_info = {
            'username': username,
            'medications': data.get('medications', []),
            'dosages': data.get('dosages', []),
            'allergies': data.get('allergies', [])
        }

        # Save updated medical data
        save_medical_info(username, medical_info)
        return jsonify({'success': True, 'message': 'Medical information updated successfully.'})
    else:
        return jsonify({'success': False, 'message': 'User not found.'}), 404

# Handle requests for profile data
@app.route('/profile', methods=['GET'])
def profile():
    # Get the logged-in user from session
    logged_in_user = session.get('username')
    users = load_users()
    medical_data = load_medical_data()

    user = users.get(logged_in_user)
    medical_info = medical_data.get(logged_in_user, {})

    if user:
        return jsonify({
            'username': user['username'],
            'medications': medical_info.get('medications', []),
            'dosages': medical_info.get('dosages', []),
            'allergies': medical_info.get('allergies', []),
            'emergencyContact': user.get('emergencyContact')
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
