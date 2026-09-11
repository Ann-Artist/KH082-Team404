const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const upload = require('../middleware/uploadMiddleware');

router.post('/', submissionController.startQuest);
router.get('/:submissionId', submissionController.getSubmission);
router.get('/user/:userId', submissionController.getUserSubmissions);
router.post('/:submissionId/proof', upload.single('file'), submissionController.uploadProof);
router.post('/:submissionId/verify', submissionController.verifySubmission);

module.exports = router;
