const express = require('express');
const router = express.Router();
// Update the import line to include getWeights
const { addWeight, getWeights } = require('../controllers/weightController');

router.post('/add', addWeight);
// Add this new route
router.get('/:username', getWeights);

module.exports = router;