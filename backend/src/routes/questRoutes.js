const express = require('express');
const router = express.Router();
const questController = require('../controllers/questController');
const submissionController = require('../controllers/submissionController');

router.get('/', questController.getAllQuests);
router.get('/:questId', questController.getQuest);
router.post('/:questId/start', submissionController.startQuest);

module.exports = router;
