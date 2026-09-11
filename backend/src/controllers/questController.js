const questService = require('../services/questService');

class QuestController {
  async getAllQuests(req, res, next) {
    try {
      const userId = req.query.userId || req.headers['x-user-id'];
      const quests = await questService.getAllQuests(userId);
      return res.json({ success: true, data: quests });
    } catch (err) {
      next(err);
    }
  }

  async getQuest(req, res, next) {
    try {
      const { questId } = req.params;
      const userId = req.query.userId || req.headers['x-user-id'];
      const quest = await questService.getQuestById(questId);
      if (!quest) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Quest not found' }
        });
      }

      const cooldown = await questService.checkCooldown(userId, quest.id);
      return res.json({
        success: true,
        data: {
          ...quest,
          cooldown
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new QuestController();
