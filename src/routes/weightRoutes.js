const express = require('express');
const router = express.Router();
const { addWeight } = require('../controllers/weightController');

router.post('/add', addWeight);

module.exports = router;