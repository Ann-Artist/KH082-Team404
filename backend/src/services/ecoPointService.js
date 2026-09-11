const db = require('../database/db');
const questConfig = require('../config/questConfig');

class EcoPointService {
  calculatePoints(questKey, verifiedData = {}) {
    let points = 20;
    let reason = `${questKey} completed`;

    switch (questKey) {
      case 'public_transport': {
        const distance = parseFloat(verifiedData.distanceKm || 5);
        points = Math.max(
          questConfig.public_transport.min_xp,
          Math.round(distance * questConfig.public_transport.xp_per_km)
        );
        reason = `Public Transport journey (${distance} km)`;
        break;
      }
      case 'cycling': {
        const distance = parseFloat(verifiedData.distanceKm || 5);
        points = Math.round(distance * questConfig.cycling.xp_per_km);
        reason = `Verified Cycling ride (${distance} km)`;
        break;
      }
      case 'electricity': {
        const kwh = parseFloat(verifiedData.kwhConsumed || 150);
        const reduction = parseFloat(verifiedData.reductionPercent || 0);

        let basePoints = questConfig.electricity.base_rewards.medium_usage;
        if (kwh < 150) basePoints = questConfig.electricity.base_rewards.low_usage;
        else if (kwh > 300) basePoints = questConfig.electricity.base_rewards.high_usage;

        const bonusPoints = Math.round(reduction * questConfig.electricity.reduction_bonus_per_percent);
        points = basePoints + bonusPoints;
        reason = `Electricity Saver (${kwh} kWh${reduction > 0 ? `, -${reduction}% reduction` : ''})`;
        break;
      }
      case 'plant_care': {
        points = questConfig.plant_care.fixed_xp;
        reason = 'Plant Care activity completed';
        break;
      }
    }

    return { points, reason };
  }

  async recordPoints(userId, submissionId, questKey, verifiedData) {
    // Idempotency check: if transaction already exists for this submission, return it
    const existingTx = await db.getOne('SELECT * FROM eco_point_transactions WHERE submission_id = ?', [submissionId]);
    if (existingTx) {
      return {
        points: existingTx.points,
        reason: existingTx.reason,
        alreadyRecorded: true
      };
    }

    const { points, reason } = this.calculatePoints(questKey, verifiedData);

    try {
      await db.execute(
        `INSERT INTO eco_point_transactions (user_id, submission_id, points, reason)
         VALUES (?, ?, ?, ?)`,
        [userId, submissionId, points, reason]
      );

      // Update reward_points field on submission record
      await db.execute('UPDATE quest_submissions SET reward_points = ? WHERE id = ?', [points, submissionId]);

      return { points, reason, alreadyRecorded: false };
    } catch (err) {
      // If unique constraint violation occurred concurrently
      if (err.message && err.message.includes('UNIQUE constraint failed')) {
        const tx = await db.getOne('SELECT * FROM eco_point_transactions WHERE submission_id = ?', [submissionId]);
        return { points: tx.points, reason: tx.reason, alreadyRecorded: true };
      }
      throw err;
    }
  }

  async getUserTotalPoints(userId) {
    const row = await db.getOne(
      'SELECT SUM(points) as totalXP FROM eco_point_transactions WHERE user_id = ?',
      [userId]
    );
    return row && row.totalXP ? parseInt(row.totalXP) : 0;
  }

  async getUserPointTransactions(userId) {
    const transactions = await db.query(
      `SELECT ept.*, qs.quest_id, q.name as quest_name, q.category
       FROM eco_point_transactions ept
       JOIN quest_submissions qs ON ept.submission_id = qs.id
       JOIN quests q ON qs.quest_id = q.id
       WHERE ept.user_id = ?
       ORDER BY ept.created_at DESC`,
      [userId]
    );
    return transactions;
  }
}

module.exports = new EcoPointService();
