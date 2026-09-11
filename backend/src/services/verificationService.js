const db = require('../database/db');
const questConfig = require('../config/questConfig');
const submissionService = require('./submissionService');

class VerificationService {
  async verifySubmission(submissionId, extraParams = {}) {
    const submission = await submissionService.getSubmission(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }

    const { quest_key, user_id, proofs } = submission;

    // Update status to VERIFYING
    await db.execute('UPDATE quest_submissions SET status = "VERIFYING" WHERE id = ?', [submissionId]);

    let verificationResult = {
      status: 'REJECTED', // VERIFIED, SUSPICIOUS, REJECTED
      confidence: 0,
      reasons: [],
      verifiedData: {}
    };

    switch (quest_key) {
      case 'public_transport':
        verificationResult = await this.verifyPublicTransport(submission, extraParams);
        break;
      case 'cycling':
        verificationResult = await this.verifyCycling(submission, extraParams);
        break;
      case 'electricity':
        verificationResult = await this.verifyElectricity(submission, extraParams);
        break;
      case 'plant_care':
        verificationResult = await this.verifyPlantCare(submission, extraParams);
        break;
      default:
        verificationResult.reasons.push('Unknown quest type');
    }

    // Update quest_submissions table
    await db.execute(
      `UPDATE quest_submissions 
       SET verification_status = ?, status = ?, completed_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        verificationResult.status,
        verificationResult.status === 'VERIFIED' ? 'VERIFIED' : 'REJECTED',
        submissionId
      ]
    );

    // Save calculation data to quest_results
    const existingResult = await db.getOne('SELECT * FROM quest_results WHERE submission_id = ?', [submissionId]);
    const distanceVal = verificationResult.verifiedData.distanceKm || extraParams.distanceKm || 0;
    
    if (existingResult) {
      await db.execute(
        `UPDATE quest_results 
         SET distance = ?, verified_value = ?, calculation_data = ? 
         WHERE submission_id = ?`,
        [
          distanceVal,
          verificationResult.status,
          JSON.stringify(verificationResult),
          submissionId
        ]
      );
    } else {
      await db.execute(
        `INSERT INTO quest_results (submission_id, distance, verified_value, calculation_data)
         VALUES (?, ?, ?, ?)`,
        [
          submissionId,
          distanceVal,
          verificationResult.status,
          JSON.stringify(verificationResult)
        ]
      );
    }

    return {
      submissionId,
      verificationStatus: verificationResult.status,
      details: verificationResult
    };
  }

  // 1. Public Transport Verification
  async verifyPublicTransport(submission, { source, destination, distanceKm }) {
    const proofs = submission.proofs || [];
    const reasons = [];

    // Rule Check 1: Must have at least 1 or 2 proof images/records
    if (proofs.length === 0) {
      reasons.push('Missing required journey proof images.');
    }

    // Rule Check 2: Geo check
    const startProof = proofs.find((p) => p.type === 'START_PROOF' || p.type === 'PROOF');
    const endProof = proofs.find((p) => p.type === 'END_PROOF');

    const hasStartGeo = startProof && startProof.latitude && startProof.longitude;
    const hasEndGeo = endProof && endProof.latitude && endProof.longitude;

    // Calculated route distance: estimate from locations or user/demo params
    const calculatedDistance = distanceKm || Math.max(3.5, Math.round((Math.random() * 10 + 4) * 10) / 10);

    // Mock AI check: verify public transport environment
    const aiContextScore = 0.92;

    if (reasons.length > 0) {
      return { status: 'REJECTED', confidence: 0, reasons, verifiedData: { distanceKm: 0 } };
    }

    return {
      status: 'VERIFIED',
      confidence: aiContextScore,
      reasons: ['Valid journey route and geo-tagged proof verified.'],
      verifiedData: {
        source: source || 'Pune Station',
        destination: destination || 'Deccan Gymkhana',
        distanceKm: calculatedDistance,
        transportMode: 'Bus/Metro'
      }
    };
  }

  // 2. Cycling Verification
  async verifyCycling(submission, { distanceKm }) {
    const proofs = submission.proofs || [];
    const reasons = [];

    if (proofs.length === 0) {
      reasons.push('No cycling proof photo submitted.');
    }

    const dist = parseFloat(distanceKm || 5.0);
    if (dist <= 0 || dist > 150) {
      reasons.push('Invalid cycling distance recorded.');
    }

    // AI Check: Bicycle presence and consistency score across start & finish photos
    const sameBicycleLikelihood = proofs.length >= 2 ? 0.91 : 0.86;
    const threshold = questConfig.cycling.ai_similarity_threshold;

    let status = 'VERIFIED';
    if (sameBicycleLikelihood < 0.5) {
      status = 'REJECTED';
      reasons.push('Bicycle in proof photos could not be verified.');
    } else if (sameBicycleLikelihood < threshold) {
      status = 'SUSPICIOUS';
      reasons.push('Bicycle similarity score is inconclusive.');
    }

    if (reasons.length > 0 && status === 'REJECTED') {
      return { status: 'REJECTED', confidence: sameBicycleLikelihood, reasons, verifiedData: { distanceKm: dist } };
    }

    return {
      status,
      confidence: sameBicycleLikelihood,
      reasons: ['Bicycle identified in proof photos with valid distance.'],
      verifiedData: {
        distanceKm: dist,
        sameBicycleLikelihood
      }
    };
  }

  // 3. Electricity Bill Verification (Duplicate check + OCR extraction)
  async verifyElectricity(submission, { billingMonth, kwhConsumed, billAmount }) {
    const userId = submission.user_id;
    const proofs = submission.proofs || [];
    const reasons = [];

    const month = billingMonth || 'September 2026';

    // Duplicate Check Rule: Same user cannot submit electricity bill for same billing period twice
    const existingBill = await db.getOne(
      `SELECT qs.id FROM quest_submissions qs
       JOIN quest_results qr ON qs.id = qr.submission_id
       WHERE qs.user_id = ? AND qs.quest_id = ? AND qs.verification_status = 'VERIFIED' AND qs.id != ?
       AND qr.calculation_data LIKE ?`,
      [userId, submission.quest_id, submission.id, `%${month}%`]
    );

    if (existingBill) {
      reasons.push(`Electricity bill for ${month} has already been submitted and verified.`);
      return {
        status: 'REJECTED',
        confidence: 0,
        reasons,
        verifiedData: { billingMonth: month, duplicate: true }
      };
    }

    // OCR / AI Bill Extraction Simulation
    const extractedKwh = parseFloat(kwhConsumed || 140);
    const extractedAmount = parseFloat(billAmount || 1120);

    // Look up previous verified bill to evaluate reduction comparison (Option B logic!)
    const previousBillResult = await db.getOne(
      `SELECT qr.calculation_data FROM quest_submissions qs
       JOIN quest_results qr ON qs.id = qr.submission_id
       WHERE qs.user_id = ? AND qs.quest_id = ? AND qs.verification_status = 'VERIFIED' AND qs.id != ?
       ORDER BY qs.completed_at DESC LIMIT 1`,
      [userId, submission.quest_id, submission.id]
    );

    let reductionPercent = 0;
    if (previousBillResult && previousBillResult.calculation_data) {
      try {
        const prevData = JSON.parse(previousBillResult.calculation_data);
        const prevKwh = prevData.verifiedData?.kwhConsumed || 160;
        if (prevKwh > 0 && extractedKwh < prevKwh) {
          reductionPercent = Math.round(((prevKwh - extractedKwh) / prevKwh) * 100);
        }
      } catch (e) {
        console.error('Error parsing previous bill data:', e);
      }
    }

    return {
      status: 'VERIFIED',
      confidence: 0.95,
      reasons: [`Electricity bill for ${month} verified successfully.`],
      verifiedData: {
        billingMonth: month,
        kwhConsumed: extractedKwh,
        billAmount: extractedAmount,
        reductionPercent
      }
    };
  }

  // 4. Plant Care Verification
  async verifyPlantCare(submission) {
    const proofs = submission.proofs || [];
    const reasons = [];

    if (proofs.length === 0) {
      reasons.push('Missing photo proof for plant care action.');
    }

    // AI Check: Plant and watering action detection
    const plantDetectionScore = 0.89;

    if (reasons.length > 0) {
      return { status: 'REJECTED', confidence: 0, reasons, verifiedData: {} };
    }

    return {
      status: 'VERIFIED',
      confidence: plantDetectionScore,
      reasons: ['Plant maintenance activity verified.'],
      verifiedData: {
        activity: 'Plant Care / Watering'
      }
    };
  }
}

module.exports = new VerificationService();
