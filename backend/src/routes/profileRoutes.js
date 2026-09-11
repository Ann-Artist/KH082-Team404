const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { validateProfileSetup } = require('../middleware/validationMiddleware');

router.get('/demo-user', profileController.getDemoUser);
router.post('/setup', validateProfileSetup, profileController.setupProfile);
router.get('/:userId', profileController.getProfile);
router.put('/:userId', profileController.updateProfile);
router.put('/:userId/avatar', profileController.updateAvatar);

module.exports = router;
