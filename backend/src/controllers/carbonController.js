const carbonService = require('../services/carbonService');

class CarbonController {
  async getFootprint(req, res, next) {
    try {
      const { userId } = req.params;
      const footprint = await carbonService.getUserFootprint(userId);
      if (!footprint) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Footprint not found for user' }
        });
      }
      return res.json({ success: true, data: footprint });
    } catch (err) {
      next(err);
    }
  }

  async calculateFootprint(req, res, next) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: 'userId is required' }
        });
      }

      const footprint = await carbonService.calculateAndSaveUserFootprint(userId);
      return res.json({
        success: true,
        data: footprint,
        message: 'Footprint calculated and saved'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CarbonController();
