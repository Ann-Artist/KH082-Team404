const submissionService = require('../services/submissionService');
const verificationService = require('../services/verificationService');
const progressionService = require('../services/progressionService');

class SubmissionController {
  async startQuest(req, res, next) {
    try {
      const { questId } = req.params;
      const { userId, source, destination } = req.body;

      if (!userId || !questId) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: 'userId and questId are required' }
        });
      }

      const submission = await submissionService.startQuest(userId, questId, { source, destination });
      return res.json({
        success: true,
        data: submission,
        message: 'Quest mission started successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async uploadProof(req, res, next) {
    try {
      const { submissionId } = req.params;
      const { type, latitude, longitude, metadata } = req.body;

      let filePath = null;
      if (req.file) {
        // Return accessible relative path for uploaded file
        filePath = `/uploads/${req.file.filename}`;
      }

      let parsedMeta = {};
      if (metadata) {
        try {
          parsedMeta = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
        } catch (e) {}
      }

      const submission = await submissionService.addProof(submissionId, {
        type,
        filePath,
        latitude,
        longitude,
        metadata: parsedMeta
      });

      return res.json({
        success: true,
        data: submission,
        message: 'Proof attached successfully'
      });
    } catch (err) {
      next(err);
    }
  }

  async verifySubmission(req, res, next) {
    try {
      const { submissionId } = req.params;
      const extraParams = req.body || {};

      // 1. Execute verification logic
      const verification = await verificationService.verifySubmission(submissionId, extraParams);
      const submission = await submissionService.getSubmission(submissionId);

      if (verification.verificationStatus === 'REJECTED') {
        return res.json({
          success: true,
          data: {
            submission,
            verification,
            ecoPointsEarned: 0,
            verificationStatus: 'REJECTED'
          },
          message: verification.details.reasons.join(' ') || 'Verification failed'
        });
      }

      // 2. If VERIFIED or SUSPICIOUS (valid), process progression (EcoXP, Level, Badges, Streak)
      const progression = await progressionService.processQuestCompletion(
        submission.user_id,
        submission.id,
        submission.quest_key,
        verification.details.verifiedData
      );

      // Re-fetch updated submission
      const updatedSubmission = await submissionService.getSubmission(submissionId);

      return res.json({
        success: true,
        data: {
          submission: updatedSubmission,
          verification,
          progression,
          ecoPointsEarned: progression.ecoPointsEarned,
          totalEcoPoints: progression.totalEcoPoints,
          currentLevel: progression.currentLevel,
          levelUp: progression.levelUp,
          streak: progression.streak,
          newlyUnlockedBadges: progression.newlyUnlockedBadges
        },
        message: 'Quest verification complete!'
      });
    } catch (err) {
      next(err);
    }
  }

  async getSubmission(req, res, next) {
    try {
      const { submissionId } = req.params;
      const submission = await submissionService.getSubmission(submissionId);
      if (!submission) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Submission not found' }
        });
      }
      return res.json({ success: true, data: submission });
    } catch (err) {
      next(err);
    }
  }

  async getUserSubmissions(req, res, next) {
    try {
      const { userId } = req.params;
      const submissions = await submissionService.getUserSubmissions(userId);
      return res.json({ success: true, data: submissions });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SubmissionController();
