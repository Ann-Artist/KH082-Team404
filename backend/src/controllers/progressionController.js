const progressionService = require('../services/progressionService');
const profileService = require('../services/profileService');
const carbonService = require('../services/carbonService');
const questService = require('../services/questService');
const impactService = require('../services/impactService');

class ProgressionController {
  async getProgression(req, res, next) {
    try {
      const { userId } = req.params;
      const progression = await progressionService.getUserProgression(userId);
      return res.json({ success: true, data: progression });
    } catch (err) {
      next(err);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const { userId } = req.params;

      const profile = await profileService.getUserProfile(userId);
      if (!profile) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'User profile not found' }
        });
      }

      const footprint = await carbonService.getUserFootprint(userId);
      const progression = await progressionService.getUserProgression(userId);
      const quests = await questService.getAllQuests(userId);
      const impact = await impactService.getUserImpact(userId);

      return res.json({
        success: true,
        data: {
          user: profile,
          footprint,
          progression,
          quests,
          impact
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async getLeaderboard(req, res, next) {
    try {
      const leaderboard = await progressionService.getLeaderboard();
      return res.json({ success: true, data: leaderboard });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProgressionController();
