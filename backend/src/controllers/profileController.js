const profileService = require('../services/profileService');
const carbonService = require('../services/carbonService');
const progressionService = require('../services/progressionService');

class ProfileController {
  async getDemoUser(req, res, next) {
    try {
      const user = await profileService.getOrCreateDemoUser();
      if (!user) {
        return res.json({ success: true, data: null, message: 'No demo user created yet' });
      }

      const profile = await profileService.getUserProfile(user.id);
      const footprint = await carbonService.getUserFootprint(user.id);
      const progression = await progressionService.getUserProgression(user.id);

      return res.json({
        success: true,
        data: {
          user: profile,
          footprint,
          progression
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async getAllProfiles(req, res, next) {
    try {
      const profiles = await profileService.getAllProfiles();
      return res.json({ success: true, data: profiles });
    } catch (err) {
      next(err);
    }
  }

  async loginByEmail(req, res, next) {
    try {
      const email = req.body?.email || req.query?.email || req.params?.email;
      const password = req.body?.password || req.query?.password;

      if (!email || typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Valid email address is required to log in.' }
        });
      }

      if (!password || typeof password !== 'string' || !password.trim()) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Password is required to log in.' }
        });
      }

      const authResult = await profileService.authenticateUser(email.trim(), password.trim());
      if (!authResult.success) {
        const statusCode = authResult.code === 'NOT_FOUND' ? 404 : 401;
        return res.status(statusCode).json({
          success: false,
          error: { code: authResult.code, message: authResult.message }
        });
      }

      const profile = authResult.profile;
      const footprint = await carbonService.getUserFootprint(profile.id);
      const progression = await progressionService.getUserProgression(profile.id);

      return res.json({
        success: true,
        data: {
          user: profile,
          footprint,
          progression
        },
        message: 'Login successful'
      });
    } catch (err) {
      next(err);
    }
  }

  async setupProfile(req, res, next) {
    try {
      const { user, lifestyle } = req.body;
      if (!user || !lifestyle) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Missing user or lifestyle information' }
        });
      }

      const userId = await profileService.setupProfile(user, lifestyle);
      const footprint = await carbonService.calculateAndSaveUserFootprint(userId);
      const userProfile = await profileService.getUserProfile(userId);
      const progression = await progressionService.getUserProgression(userId);

      return res.json({
        success: true,
        data: {
          user: userProfile,
          footprint,
          progression
        },
        message: 'Profile and lifestyle setup successful'
      });
    } catch (err) {
      next(err);
    }
  }

  async getProfile(req, res, next) {
    try {
      const { userId } = req.params;
      const profile = await profileService.getUserProfile(userId);
      if (!profile) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Profile not found' }
        });
      }
      return res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { userId } = req.params;
      const { user, lifestyle } = req.body;

      const updatedProfile = await profileService.updateProfile(userId, user, lifestyle);
      let footprint = null;
      if (lifestyle) {
        footprint = await carbonService.calculateAndSaveUserFootprint(userId);
      } else {
        footprint = await carbonService.getUserFootprint(userId);
      }

      return res.json({
        success: true,
        data: {
          user: updatedProfile,
          footprint
        },
        message: 'Profile updated and footprint recalculated'
      });
    } catch (err) {
      next(err);
    }
  }

  async updateAvatar(req, res, next) {
    try {
      const { userId } = req.params;
      const { avatar_id } = req.body;
      if (!avatar_id) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: 'avatar_id is required' }
        });
      }

      const updatedProfile = await profileService.updateAvatar(userId, avatar_id);
      return res.json({
        success: true,
        data: updatedProfile,
        message: 'Avatar updated successfully'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProfileController();
