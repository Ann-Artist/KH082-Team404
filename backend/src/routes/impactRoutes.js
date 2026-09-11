const express = require('express');
const router = express.Router();
const impactController = require('../controllers/impactController');

router.get('/:userId', impactController.getUserImpact);

module.exports = router;
