const db = require('../database/db');
const questConfig = require('../config/questConfig');

class QuestService {
  async getAllQuests(userId) {
    const quests = await db.query('SELECT * FROM quests WHERE active = 1 ORDER BY id ASC');
    
    // Attach cooldown and status for user if userId provided
    const result = await Promise.all(
      quests.map(async (quest) => {
        const cooldownInfo = await this.checkCooldown(userId, quest.id);
        const lastSubmission = await db.getOne(
          `SELECT * FROM quest_submissions 
           WHERE user_id = ? AND quest_id = ? 
           ORDER BY id DESC LIMIT 1`,
          [userId, quest.id]
        );

        return {
          ...quest,
          cooldown: cooldownInfo,
          lastSubmissionStatus: lastSubmission ? lastSubmission.status : null
        };
      })
    );

    return result;
  }

  async getQuestById(questId) {
    const quest = await db.getOne('SELECT * FROM quests WHERE id = ? OR quest_key = ?', [questId, questId]);
    return quest;
  }

  async checkCooldown(userId, questId) {
    if (!userId) return { inCooldown: false, remainingMinutes: 0 };

    const quest = await this.getQuestById(questId);
    if (!quest) return { inCooldown: false, remainingMinutes: 0 };

    const lastCompleted = await db.getOne(
      `SELECT * FROM quest_submissions 
       WHERE user_id = ? AND quest_id = ? AND status = 'COMPLETED'
       ORDER BY completed_at DESC LIMIT 1`,
      [userId, quest.id]
    );

    if (!lastCompleted || !lastCompleted.completed_at) {
      return { inCooldown: false, remainingMinutes: 0 };
    }

    const completedTime = new Date(lastCompleted.completed_at).getTime();
    const now = new Date().getTime();
    const cooldownMs = quest.cooldown_hours * 60 * 60 * 1000;
    const elapsed = now - completedTime;

    if (elapsed < cooldownMs) {
      const remainingMinutes = Math.ceil((cooldownMs - elapsed) / (1000 * 60));
      return {
        inCooldown: true,
        remainingMinutes,
        availableAt: new Date(completedTime + cooldownMs).toISOString()
      };
    }

    return { inCooldown: false, remainingMinutes: 0 };
  }
}

module.exports = new QuestService();
