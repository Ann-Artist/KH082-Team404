const db = require('../database/db');
const ecoPointService = require('./ecoPointService');
const levelService = require('./levelService');
const streakService = require('./streakService');
const badgeService = require('./badgeService');

class ProgressionService {
  async processQuestCompletion(userId, submissionId, questKey, verifiedData = {}) {
    // 1. Get initial level before points addition
    const initialXP = await ecoPointService.getUserTotalPoints(userId);
    const initialLevelInfo = levelService.getLevelForXP(initialXP);

    // 2. Record EcoXP Transaction (Idempotent)
    const pointResult = await ecoPointService.recordPoints(userId, submissionId, questKey, verifiedData);

    // 3. Recalculate User Total XP & Level
    const newTotalXP = await ecoPointService.getUserTotalPoints(userId);
    const updatedLevelInfo = levelService.getLevelForXP(newTotalXP);

    const levelUp = updatedLevelInfo.level_number > initialLevelInfo.level_number;

    // 4. Record Activity for Streak
    const streakInfo = await streakService.recordActivity(userId);

    // 5. Evaluate and Unlock Badges
    const newlyUnlockedBadges = await badgeService.evaluateAndUnlockBadges(userId, {
      totalXP: newTotalXP,
      currentStreak: streakInfo.current_streak
    });

    return {
      submissionId,
      ecoPointsEarned: pointResult.points,
      totalEcoPoints: newTotalXP,
      previousLevel: initialLevelInfo,
      currentLevel: updatedLevelInfo,
      levelUp,
      newTitle: updatedLevelInfo.title,
      streak: streakInfo,
      newlyUnlockedBadges
    };
  }

  async getUserProgression(userId) {
    const totalXP = await ecoPointService.getUserTotalPoints(userId);
    const levelInfo = levelService.getLevelForXP(totalXP);
    const streakInfo = await streakService.getUserStreak(userId);
    const badges = await badgeService.getUserBadges(userId);
    const transactions = await ecoPointService.getUserPointTransactions(userId);

    return {
      totalXP,
      level: levelInfo,
      streak: streakInfo,
      badges,
      recentTransactions: transactions.slice(0, 5)
    };
  }

  async getLeaderboard() {
    const users = await db.query('SELECT id, name, email, city, avatar_id, created_at FROM users');

    const leaderboardItems = await Promise.all(
      users.map(async (u) => {
        const totalXP = await ecoPointService.getUserTotalPoints(u.id);
        const levelInfo = levelService.getLevelForXP(totalXP);
        const streakInfo = await streakService.getUserStreak(u.id);
        const questCountRow = await db.getOne(
          `SELECT COUNT(*) as completedCount FROM quest_submissions 
           WHERE user_id = ? AND verification_status = 'VERIFIED'`,
          [u.id]
        );

        return {
          id: u.id,
          name: u.name,
          city: u.city,
          avatar_id: u.avatar_id,
          totalXP,
          level: levelInfo,
          currentStreak: streakInfo ? streakInfo.current_streak : 0,
          completedQuestsCount: questCountRow ? questCountRow.completedCount : 0
        };
      })
    );

    // Sort by totalXP DESC, then by completedQuestsCount DESC
    leaderboardItems.sort((a, b) => b.totalXP - a.totalXP || b.completedQuestsCount - a.completedQuestsCount);

    // Assign rank 1, 2, 3...
    return leaderboardItems.map((item, idx) => ({
      rank: idx + 1,
      ...item
    }));
  }
}

module.exports = new ProgressionService();
