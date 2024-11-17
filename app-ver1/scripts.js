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
  
    // Collect the user's registration data
    const user = {
      username: document.getElementById("register-username").value,
      password: document.getElementById("register-password").value,
      medications: document.getElementById("medications").value,
      dosage: document.getElementById("dosage").value,
      allergies: document.getElementById("allergies").value || "None",
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
    .then(response => {
      if (response.ok) {
        // Redirect to the time page on successful login
        window.location.href = '/time';
      } else {
        return response.json().then(data => {
          alert(data.message);
        });
      }
    });
  }
  
  // Function to log the user out and return to the login form
  function logout() {
    // Hide the profile section and clear any user data displayed
    document.getElementById("profile").classList.add("hidden");
    
    // Clear profile details (optional)
    document.getElementById("profile-username").textContent = "";
    document.getElementById("profile-medications").textContent = "";
    document.getElementById("profile-dosage").textContent = "";
    document.getElementById("profile-allergies").textContent = "";
    document.getElementById("profile-emergency-contact").textContent = "";
  
    // Show the login form
    showLoginForm();
  
    // Optionally display a logout confirmation
    alert("You have logged out.");
  }
  
  