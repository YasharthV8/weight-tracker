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