const express = require('express');
const router = express.Router();
const carbonController = require('../controllers/carbonController');

router.post('/calculate', carbonController.calculateFootprint);
router.get('/:userId', carbonController.getFootprint);

module.exports = router;
