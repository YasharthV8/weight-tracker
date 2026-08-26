const db = require('../config/db');

exports.addWeight = async (req, res) => {
    const { username, weight } = req.body;
    try {
        await db.query(
            'INSERT INTO weights (username, weight) VALUES ($1, $2)',
            [username, weight]
        );
        res.status(201).json({ message: 'Weight saved successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving weight' });
    }
};
exports.getWeights = async (req, res) => {
    const { username } = req.params;
    try {
        // ORDER BY logged_at DESC ensures the newest entries are at the top
        const result = await db.query(
            'SELECT weight, logged_at FROM weights WHERE username = $1 ORDER BY logged_at DESC',
            [username]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching weights' });
    }
};