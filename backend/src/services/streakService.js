const db = require('../database/db');
const gameConfig = require('../config/gameConfig');

class StreakService {
  async getUserStreak(userId) {
    let streak = await db.getOne('SELECT * FROM streaks WHERE user_id = ?', [userId]);
    if (!streak) {
      await db.execute('INSERT INTO streaks (user_id, current_streak, longest_streak) VALUES (?, 0, 0)', [userId]);
      streak = { user_id: userId, current_streak: 0, longest_streak: 0, last_activity_date: null };
    }
    return streak;
  }

  async recordActivity(userId) {
    let streak = await this.getUserStreak(userId);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (!streak.last_activity_date) {
      // First activity ever
      const newStreak = 1;
      const newLongest = Math.max(1, streak.longest_streak || 0);
      await db.execute(
        `UPDATE streaks 
         SET current_streak = ?, longest_streak = ?, last_activity_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = ?`,
        [newStreak, newLongest, userId]
      );
      return { current_streak: newStreak, longest_streak: newLongest, streakIncremented: true };
    }

    const lastDate = new Date(streak.last_activity_date);
    const lastDateStr = lastDate.toISOString().split('T')[0];

    // Calculate day difference
    const diffTime = Math.abs(now.getTime() - lastDate.getTime());
    const diffHours = diffTime / (1000 * 60 * 60);

    let newStreak = streak.current_streak;
    let streakIncremented = false;

    if (todayStr === lastDateStr) {
      // Activity already recorded today, keep current streak
      newStreak = streak.current_streak;
    } else if (diffHours <= gameConfig.streak.inactivityResetHours) {
      // Consecutive day activity!
      newStreak = streak.current_streak + 1;
      streakIncremented = true;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
      streakIncremented = true;
    }

    const newLongest = Math.max(newStreak, streak.longest_streak || 0);

    await db.execute(
      `UPDATE streaks 
       SET current_streak = ?, longest_streak = ?, last_activity_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = ?`,
      [newStreak, newLongest, userId]
    );

    return {
      current_streak: newStreak,
      longest_streak: newLongest,
      streakIncremented
    };
  }
}

module.exports = new StreakService();
