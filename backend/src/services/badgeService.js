const db = require('../database/db');

class BadgeService {
  async evaluateAndUnlockBadges(userId, { totalXP, currentStreak }) {
    const allBadges = await db.query('SELECT * FROM badges');
    const existingUserBadges = await db.query('SELECT badge_id FROM user_badges WHERE user_id = ?', [userId]);
    const unlockedBadgeIds = new Set(existingUserBadges.map((ub) => ub.badge_id));

    // Gather user metrics for evaluation
    const questCountRow = await db.getOne(
      `SELECT COUNT(*) as completedCount FROM quest_submissions 
       WHERE user_id = ? AND verification_status = 'VERIFIED'`,
      [userId]
    );
    const completedQuestsCount = questCountRow ? questCountRow.completedCount : 0;

    const questTypeCountsRows = await db.query(
      `SELECT q.quest_key, COUNT(*) as count FROM quest_submissions qs
       JOIN quests q ON qs.quest_id = q.id
       WHERE qs.user_id = ? AND qs.verification_status = 'VERIFIED'
       GROUP BY q.quest_key`,
      [userId]
    );

    const questTypeMap = {};
    questTypeCountsRows.forEach((r) => {
      questTypeMap[r.quest_key] = r.count;
    });

    const newlyUnlocked = [];

    for (const badge of allBadges) {
      if (unlockedBadgeIds.has(badge.id)) continue;

      let criteria;
      try {
        criteria = JSON.parse(badge.criteria);
      } catch (e) {
        continue;
      }

      let eligible = false;

      switch (criteria.type) {
        case 'completed_quests_count':
          eligible = completedQuestsCount >= criteria.threshold;
          break;
        case 'quest_completed':
          eligible = (questTypeMap[criteria.quest_key] || 0) >= 1;
          break;
        case 'quest_count':
          eligible = (questTypeMap[criteria.quest_key] || 0) >= (criteria.threshold || 1);
          break;
        case 'streak_days':
          eligible = (currentStreak || 0) >= criteria.threshold;
          break;
        case 'total_xp':
          eligible = (totalXP || 0) >= criteria.threshold;
          break;
      }

      if (eligible) {
        try {
          await db.execute(
            `INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)
             ON CONFLICT(user_id, badge_id) DO NOTHING`,
            [userId, badge.id]
          );
          newlyUnlocked.push({
            ...badge,
            criteria
          });
        } catch (e) {
          console.error('Error unlocking badge:', e);
        }
      }
    }

    return newlyUnlocked;
  }

  async getUserBadges(userId) {
    const badges = await db.query(
      `SELECT b.*, ub.unlocked_at, CASE WHEN ub.id IS NOT NULL THEN 1 ELSE 0 END as unlocked
       FROM badges b
       LEFT JOIN user_badges ub ON b.id = ub.badge_id AND ub.user_id = ?
       ORDER BY unlocked DESC, b.id ASC`,
      [userId]
    );

    return badges.map((b) => ({
      ...b,
      unlocked: Boolean(b.unlocked),
      criteria: b.criteria ? JSON.parse(b.criteria) : {}
    }));
  }
}

module.exports = new BadgeService();
