// Select our form and input elements
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');

// Define our Regex patterns
// Username: 3 to 15 characters, only letters, numbers, and underscores
const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;

// Password: At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

loginForm.addEventListener('submit', function(event) {
    // Prevent the page from refreshing when clicking submit
    event.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;

    // Reset error message
    errorMessage.style.display = 'none';
    errorMessage.innerText = '';

    // 1. Validate Username using Regex
    if (!usernameRegex.test(username)) {
        showError('Username must be 3-15 characters and contain only letters, numbers, or underscores.');
        return; // Stop execution if invalid
    }

    // 2. Validate Password using Regex
    if (!passwordRegex.test(password)) {
        showError('Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.');
        return; 
    }

    // If both Regex checks pass, simulate a successful login
    simulateLogin(username);
});

function showError(message) {
    errorMessage.innerText = message;
    errorMessage.style.display = 'block';
}

async function simulateLogin(username, password) {
    const btn = loginForm.querySelector('.btn');
    btn.innerText = 'Logging in...';

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Login successful!');
            window.location.href = '/dashboard.html'; // Redirect on success
        } else {
            showError(data.message || 'Login failed');
            btn.innerText = 'Login';
        }
    } catch (error) {
        showError('Server error. Please try again.');
        btn.innerText = 'Login';
    }
}