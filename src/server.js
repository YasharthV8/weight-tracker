const express = require('express');
const path = require('path');

// Initialize the Express application
const app = express();

// Define the port the server will run on
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON data (Crucial for your login POST request later)
app.use(express.json());

// Tell Express to serve the static frontend files from the 'public' folder
// We use path.join and '../public' because server.js is inside the 'src' folder
app.use(express.static(path.join(__dirname, '../public')));

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    console.log(`Backend received login attempt for username: ${username}`);

    // A simple mock check to prove the connection works
    if (username && password) {
        // Send a success response back to the frontend
        res.status(200).json({ message: 'Login successful' });
    } else {
        // Send an error if data is missing
        res.status(400).json({ message: 'Missing credentials' });
    }
});

// Start the server and listen for connections
app.listen(PORT, () => {
    console.log(`Server is up and running! Visit http://localhost:${PORT} in your browser.`);
});