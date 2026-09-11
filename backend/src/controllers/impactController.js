const impactService = require('../services/impactService');

class ImpactController {
  async getUserImpact(req, res, next) {
    try {
      const { userId } = req.params;
      const impact = await impactService.getUserImpact(userId);
      return res.json({ success: true, data: impact });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ImpactController();
