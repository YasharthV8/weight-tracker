const express = require('express');
const path = require('path');
const authRoutes = require('./routes/authRoutes'); // We'll create this next

const app = express();
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
const weightRoutes = require('./routes/weightRoutes');
app.use('/api/weights', weightRoutes);

// Export the app for Vercel
module.exports = app;

// Only listen locally if not on Vercel
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    // We still serve static files locally for testing
    app.use(express.static(path.join(__dirname, '../public')));
    app.listen(PORT, () => console.log(`Local server running on port ${PORT}`));
}