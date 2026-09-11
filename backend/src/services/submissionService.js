const db = require('../database/db');
const questService = require('./questService');

class SubmissionService {
  async startQuest(userId, questId, initialData = {}) {
    const quest = await questService.getQuestById(questId);
    if (!quest) {
      throw new Error('Quest not found');
    }

    // Check cooldown
    const cooldown = await questService.checkCooldown(userId, quest.id);
    if (cooldown.inCooldown) {
      throw new Error(`Quest is on cooldown. Please wait ${cooldown.remainingMinutes} minutes.`);
    }

    // Calculate count of previous submissions for attempt number
    const countRow = await db.getOne(
      'SELECT COUNT(*) as attemptCount FROM quest_submissions WHERE user_id = ? AND quest_id = ?',
      [userId, quest.id]
    );
    const attemptNumber = (countRow ? countRow.attemptCount : 0) + 1;

    // Create submission record
    const result = await db.execute(
      `INSERT INTO quest_submissions (user_id, quest_id, status, verification_status)
       VALUES (?, ?, 'STARTED', 'PENDING')`,
      [userId, quest.id]
    );

    const submissionId = result.lastID;

    // Save initial proof or metadata if provided (e.g. Source/Destination for transport or start photo)
    if (initialData.source || initialData.destination) {
      await db.execute(
        `INSERT INTO quest_results (submission_id, verified_value, calculation_data)
         VALUES (?, ?, ?)`,
        [
          submissionId,
          `${initialData.source || ''} -> ${initialData.destination || ''}`,
          JSON.stringify({
            source: initialData.source,
            destination: initialData.destination,
            attemptNumber
          })
        ]
      );
    }

    return this.getSubmission(submissionId);
  }

  async addProof(submissionId, { type, filePath, latitude, longitude, metadata = {} }) {
    const submission = await db.getOne('SELECT * FROM quest_submissions WHERE id = ?', [submissionId]);
    if (!submission) {
      throw new Error('Submission not found');
    }

    await db.execute(
      `INSERT INTO submission_proofs (submission_id, type, file_path, latitude, longitude, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        submissionId,
        type || 'PROOF',
        filePath || null,
        latitude ? parseFloat(latitude) : null,
        longitude ? parseFloat(longitude) : null,
        JSON.stringify(metadata)
      ]
    );

    // Update submission state based on proof type
    let newStatus = submission.status;
    if (type === 'START_PROOF') {
      newStatus = 'START_PROOF_SUBMITTED';
    } else if (type === 'MID_PROOF') {
      newStatus = 'IN_PROGRESS';
    } else if (type === 'END_PROOF' || type === 'BILL_PROOF' || type === 'PROOF') {
      newStatus = 'PROOF_SUBMITTED';
    }

    await db.execute('UPDATE quest_submissions SET status = ? WHERE id = ?', [newStatus, submissionId]);

    return this.getSubmission(submissionId);
  }

  async getSubmission(submissionId) {
    const submission = await db.getOne(
      `SELECT qs.*, q.quest_key, q.name as quest_name, q.category as quest_category
       FROM quest_submissions qs
       JOIN quests q ON qs.quest_id = q.id
       WHERE qs.id = ?`,
      [submissionId]
    );

    if (!submission) return null;

    const proofs = await db.query(
      'SELECT * FROM submission_proofs WHERE submission_id = ? ORDER BY id ASC',
      [submissionId]
    );

    const result = await db.getOne('SELECT * FROM quest_results WHERE submission_id = ?', [submissionId]);

    return {
      ...submission,
      proofs: proofs.map((p) => ({
        ...p,
        metadata: p.metadata ? JSON.parse(p.metadata) : {}
      })),
      result: result
        ? {
            ...result,
            calculation_data: result.calculation_data ? JSON.parse(result.calculation_data) : {}
          }
        : null
    };
  }

  async getUserSubmissions(userId) {
    const submissions = await db.query(
      `SELECT qs.*, q.quest_key, q.name as quest_name, q.category as quest_category,
              (SELECT COUNT(*) FROM quest_submissions qs2 WHERE qs2.user_id = qs.user_id AND qs2.quest_id = qs.quest_id AND qs2.id <= qs.id) as attempt_number
       FROM quest_submissions qs
       JOIN quests q ON qs.quest_id = q.id
       WHERE qs.user_id = ?
       ORDER BY qs.created_at DESC`,
      [userId]
    );

    const detailedSubmissions = await Promise.all(
      submissions.map(async (sub) => {
        const proofs = await db.query(
          'SELECT * FROM submission_proofs WHERE submission_id = ? ORDER BY id ASC',
          [sub.id]
        );
        const res = await db.getOne('SELECT * FROM quest_results WHERE submission_id = ?', [sub.id]);

        return {
          ...sub,
          proofs: proofs.map((p) => ({ ...p, metadata: p.metadata ? JSON.parse(p.metadata) : {} })),
          result: res ? { ...res, calculation_data: res.calculation_data ? JSON.parse(res.calculation_data) : {} } : null
        };
      })
    );

    return detailedSubmissions;
  }
}

module.exports = new SubmissionService();
