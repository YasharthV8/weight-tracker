// Select elements (we use let so they can be null if not on the page)
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const errorMessage = document.getElementById('error-message');

// Regex Patterns
const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Helper function to show errors
function showError(message) {
    errorMessage.innerText = message;
    errorMessage.style.display = 'block';
}

// --- LOGIN LOGIC ---
if (loginForm) {
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const btn = loginForm.querySelector('.btn');

        errorMessage.style.display = 'none';
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
                window.location.href = '/dashboard.html';
            } else {
                showError(data.message || 'Login failed');
                btn.innerText = 'Login';
            }
        } catch (error) {
            showError('Server error. Please try again.');
            btn.innerText = 'Login';
        }
    });
}

// --- SIGNUP LOGIC ---
if (signupForm) {
    signupForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const username = document.getElementById('new-username').value;
        const password = document.getElementById('new-password').value;
        const btn = signupForm.querySelector('.btn');

        errorMessage.style.display = 'none';

        // Run Regex Validation
        if (!usernameRegex.test(username)) {
            return showError('Username must be 3-15 characters (letters, numbers, underscores).');
        }
        if (!passwordRegex.test(password)) {
            return showError('Password must be 8+ chars, with upper, lower, number, and symbol.');
        }

        btn.innerText = 'Creating account...';

        try {
            // Notice this hits the /signup endpoint!
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Account created! You can now log in.');
                window.location.href = '/index.html'; // Send them to login page
            } else {
                showError(data.message || 'Signup failed');
                btn.innerText = 'Sign Up';
            }
        } catch (error) {
            showError('Server error. Please try again.');
            btn.innerText = 'Sign Up';
        }
    });
}

// --- DASHBOARD LOGIC ---
const weightForm = document.getElementById('weight-form');
const weightHistory = document.getElementById('weight-history');

if (weightForm) {
    weightForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const weightInput = document.getElementById('weight').value;
        
        // Get today's date formatted nicely (e.g., Oct 24, 2023)
        const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        // Remove the "No weights logged yet" message if it exists
        const emptyMsg = document.querySelector('.empty-msg');
        if (emptyMsg) emptyMsg.remove();

        // Create a new list item
        const newEntry = document.createElement('li');
        newEntry.innerHTML = `<span>${date}</span> <strong>${weightInput} kg</strong>`;

        // Add it to the top of the list
        weightHistory.prepend(newEntry);

        // Clear the input box
        weightForm.reset();
    });
}