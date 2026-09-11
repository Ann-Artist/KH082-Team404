const express = require('express');
const router = express.Router();
const progressionController = require('../controllers/progressionController');

router.get('/:userId', progressionController.getProgression);
router.get('/:userId/dashboard', progressionController.getDashboard);

module.exports = router;
