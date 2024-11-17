// Function to show the registration form and hide the login form
function showRegistrationForm() {
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("register-form").classList.remove("hidden");
}

// Function to show the login form and hide the registration form
function showLoginForm() {
  document.getElementById("register-form").classList.add("hidden");
  document.getElementById("login-form").classList.remove("hidden");
}

// Function to show the user's profile and hide the forms
function showProfile() {
  document.getElementById("register-form").classList.add("hidden");
  document.getElementById("login-form").classList.add("hidden");
  document.getElementById("profile").classList.remove("hidden");
}

// Function to handle user registration
function registerUser(event) {
  event.preventDefault(); // Prevent the form from submitting the traditional way

  // Collect the user's registration data (without medical info)
  const user = {
    username: document.getElementById("register-username").value,
    password: document.getElementById("register-password").value,
    emergencyContact: document.getElementById("emergency-contact").value
  };

  // Send registration data to the server
  fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert("Registration successful!");
        showLoginForm(); // Switch to login form after successful registration
      } else {
        alert("Error: " + data.message);
      }
    });
}

// Function to handle user login
function loginUser(event) {
  event.preventDefault();

  const credentials = {
    username: document.getElementById("login-username").value,
    password: document.getElementById("login-password").value
  };

  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Redirect to the time page on successful login
        window.location.href = '/time';
      } else {
        alert(data.message);
      }
    });
}

// Function to load the user's profile information
function loadProfile(username) {
  fetch('/profile?username=' + username)
    .then(response => response.json())
    .then(data => {
      document.getElementById("profile-username").textContent = data.username;
      document.getElementById("profile-medications").value = data.medications || '';
      document.getElementById("profile-dosage").value = data.dosage || '';
      document.getElementById("profile-allergies").value = data.allergies || '';
      document.getElementById("profile-emergency-contact").value = data.emergencyContact || '';
    });
}

// Function to handle profile update (after login)
function saveProfile(event) {
  event.preventDefault();
  
  const updatedData = {
    medications: document.getElementById("profile-medications").value,
    dosage: document.getElementById("profile-dosage").value,
    allergies: document.getElementById("profile-allergies").value
  };

  fetch('/update_profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedData)
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert("Profile updated successfully!");
      } else {
        alert("Error updating profile");
      }
    });
}

// Function to log the user out and return to the login form
function logout() {
  // Hide the profile section and clear any user data displayed
  document.getElementById("profile").classList.add("hidden");
  
  // Clear profile details
  document.getElementById("profile-username").textContent = "";
  document.getElementById("profile-medications").value = "";
  document.getElementById("profile-dosage").value = "";
  document.getElementById("profile-allergies").value = "";
  document.getElementById("profile-emergency-contact").value = "";

  // Show the login form
  showLoginForm();

  // Optionally display a logout confirmation
  alert("You have logged out.");
}

// Function to display the current time on the time page
function displayTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  document.getElementById("current-time").textContent = timeString;
}

// Automatically refresh the time every second
setInterval(displayTime, 1000);
