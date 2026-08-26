// Select elements (we use let/const so they can be null if not on the page)
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const errorMessage = document.getElementById('error-message');

// Added these two missing variables!
const weightForm = document.getElementById('weight-form');
const weightHistory = document.getElementById('weight-history');

// Regex Patterns
const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Helper function to show errors
function showError(message) {
    if (errorMessage) {
        errorMessage.innerText = message;
        errorMessage.style.display = 'block';
    }
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
                localStorage.setItem('currentUser', username); 
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
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Account created! You can now log in.');
                window.location.href = '/index.html'; 
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

if (weightForm) {
    // 1. Fetch history immediately when page loads
    async function loadHistory() {
        const username = localStorage.getItem('currentUser');
        if (!username) {
            window.location.href = '/index.html'; // Kick them out if not logged in
            return;
        }

        try {
            const response = await fetch(`/api/weights/${username}`);
            const data = await response.json();

            if (response.ok && data.length > 0) {
                weightHistory.innerHTML = ''; // Clear the "No weights logged" message
                
                data.forEach(entry => {
                    const date = new Date(entry.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const li = document.createElement('li');
                    li.innerHTML = `<span>${date}</span> <strong>${entry.weight} kg</strong>`;
                    weightHistory.appendChild(li);
                });
            }
        } catch (error) {
            console.error('Failed to load history');
        }
    }

    // Call the function instantly
    loadHistory();
    weightForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const weightInput = document.getElementById('weight').value;
        const username = localStorage.getItem('currentUser');
        const btn = weightForm.querySelector('.btn');
        
        if (!username) return alert('Please log in first!');
        btn.innerText = 'Saving...';

        try {
            const response = await fetch('/api/weights/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, weight: weightInput })
            });

            if (response.ok) {
                const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                
                const emptyMsg = document.querySelector('.empty-msg');
                if (emptyMsg) emptyMsg.remove();

                const newEntry = document.createElement('li');
                newEntry.innerHTML = `<span>${date}</span> <strong>${weightInput} kg</strong>`;
                weightHistory.prepend(newEntry);
                
                weightForm.reset();
            } else {
                alert('Failed to save weight');
            }
        } catch (error) {
            alert('Server error');
        }
        btn.innerText = 'Save Entry';
    });
}