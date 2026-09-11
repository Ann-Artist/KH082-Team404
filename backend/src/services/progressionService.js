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
}

module.exports = new ProgressionService();
