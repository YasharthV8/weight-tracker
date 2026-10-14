// Select elements (we use let/const so they can be null if not on the page)
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const errorMessage = document.getElementById('error-message');
const logoutLink = document.querySelector('.logout-link');

const weightForm = document.getElementById('weight-form');
const weightHistory = document.getElementById('weight-history');

// Regex Patterns
const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!\%*?&]{8,}$/;

// Declare global chart instance
let weightChart = null;

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

        if (errorMessage) errorMessage.style.display = 'none';
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

        if (errorMessage) errorMessage.style.display = 'none';

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

// --- DASHBOARD & WEIGHT LOGIC ---
if (weightForm) {
    // 1. Fetch history and update list + chart
    async function loadHistory() {
        const username = localStorage.getItem('currentUser');
        if (!username) {
            window.location.href = '/index.html'; // Kick out unauthenticated user
            return;
        }

        try {
            const response = await fetch(`/api/weights/${username}`);
            const data = await response.json();

            if (response.ok && data.length > 0) {
                if (weightHistory) {
                    weightHistory.innerHTML = ''; // Clear "No weights logged" message
                    
                    data.forEach(entry => {
                        const date = new Date(entry.logged_at || entry.date || entry.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                        });
                        const li = document.createElement('li');
                        li.innerHTML = `<span>${date}</span> <strong>${entry.weight} kg</strong>`;
                        weightHistory.appendChild(li);
                    });
                }

                // Update Chart with retrieved data
                updateWeightChart(data);
            }
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    }

    // Initialize data load on page load
    loadHistory();

    // Handle Form Submit
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
                weightForm.reset();
                // Refresh list and chart automatically
                await loadHistory();
            } else {
                alert('Failed to save weight');
            }
        } catch (error) {
            alert('Server error');
        }
        btn.innerText = 'Save Entry';
    });
}

// --- LOGOUT LOGIC ---
if (logoutLink) {
    logoutLink.addEventListener('click', function(event) {
        event.preventDefault(); 
        localStorage.removeItem('currentUser');
        window.location.href = '/index.html';
    });
}

// --- CHART RENDERING FUNCTION ---
function updateWeightChart(weightLogs) {
    const canvas = document.getElementById('weightChart');
    if (!canvas) return;

    // Sort logs chronologically ascending
    const sortedLogs = [...weightLogs].sort(
        (a, b) => new Date(a.logged_at || a.date || a.created_at) - new Date(b.logged_at || b.date || b.created_at)
    );

    const labels = sortedLogs.map(log => 
        new Date(log.logged_at || log.date || log.created_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric'
        })
    );
    const data = sortedLogs.map(log => log.weight);

    // Destroy existing instance to avoid canvas overlay bugs
    if (weightChart) {
        weightChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    weightChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Weight (kg)',
                data: data,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#4f46e5',
                pointRadius: 4,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    title: { display: true, text: 'Date' }
                },
                y: {
                    title: { display: true, text: 'Weight (kg)' },
                    beginAtZero: false
                }
            }
        }
    });
}