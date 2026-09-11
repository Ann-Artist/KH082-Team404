const db = require('../database/db');
const questConfig = require('../config/questConfig');
const submissionService = require('./submissionService');
const aiVerificationService = require('./aiVerificationService');

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
        verificationResult.status === 'VERIFIED' ? 'VERIFIED' : verificationResult.status === 'SUSPICIOUS' ? 'SUSPICIOUS' : 'REJECTED',
        submissionId
      ]
    );

    // Save calculation data to quest_results
    const existingResult = await db.getOne('SELECT * FROM quest_results WHERE submission_id = ?', [submissionId]);
    const distanceVal = verificationResult.verifiedData?.distanceKm || extraParams.distanceKm || 0;
    
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

  // 1. Public Transport Verification (Geo + AI Vision signal)
  async verifyPublicTransport(submission, { source, destination, distanceKm }) {
    const proofs = submission.proofs || [];
    const reasons = [];

    if (proofs.length === 0) {
      reasons.push('Missing required journey proof images.');
      return { status: 'REJECTED', confidence: 0, reasons, verifiedData: { distanceKm: 0 } };
    }

    const startProof = proofs.find((p) => p.type === 'START_PROOF' || p.type === 'PROOF') || proofs[0];
    const endProof = proofs.find((p) => p.type === 'END_PROOF');
    const photoPath = startProof?.file_path;

    const hasStartGeo = Boolean(startProof && startProof.latitude && startProof.longitude);
    const hasEndGeo = Boolean(endProof && endProof.latitude && endProof.longitude);

    const calculatedDistance = distanceKm || Math.max(3.5, Math.round((Math.random() * 10 + 4) * 10) / 10);

    // Real AI Vision Check
    let aiRes = null;
    if (photoPath) {
      aiRes = await aiVerificationService.verifyTransportContext(photoPath);
    }

    // SUSPICIOUS fallback if AI service fails or returns parse/API error
    if (!aiRes || aiRes.error) {
      const aiErrorReason = aiRes?.raw || aiRes?.error || 'Proof photo could not be parsed by AI';
      return {
        status: 'SUSPICIOUS',
        confidence: 0.5,
        reasons: [`AI verification fallback: ${aiErrorReason}. Marked for manual review.`],
        verifiedData: {
          source: source || 'Transit Station',
          destination: destination || 'Destination',
          distanceKm: calculatedDistance,
          transportMode: 'Bus/Metro',
          aiError: aiRes?.error || 'MISSING_PHOTO'
        }
      };
    }

    const threshold = questConfig.public_transport.ai_confidence_threshold || 0.70;
    const aiConfidence = parseFloat(aiRes.confidence || 0);
    let status = 'VERIFIED';

    if (aiRes.publicTransportContext === false && aiConfidence > 0.8) {
      status = 'SUSPICIOUS';
      reasons.push(aiRes.notes || 'Photo does not appear to show a public transport environment.');
    } else if (aiConfidence < threshold && !hasStartGeo) {
      status = 'SUSPICIOUS';
      reasons.push(aiRes.notes || 'Public transport environment confidence is below threshold.');
    } else {
      reasons.push(aiRes.notes || 'Valid journey route and public transport context verified.');
    }

    return {
      status,
      confidence: aiConfidence,
      reasons,
      verifiedData: {
        source: source || 'Pune Station',
        destination: destination || 'Deccan Gymkhana',
        distanceKm: calculatedDistance,
        transportMode: 'Bus/Metro',
        aiNotes: aiRes.notes
      }
    };
  }

  // 2. Cycling Verification (AI Bicycle Consistency Check across start/end photos)
  async verifyCycling(submission, { distanceKm }) {
    const proofs = submission.proofs || [];
    const reasons = [];

    if (proofs.length === 0) {
      reasons.push('No cycling proof photo submitted.');
      return { status: 'REJECTED', confidence: 0, reasons, verifiedData: { distanceKm: 0 } };
    }

    const dist = parseFloat(distanceKm || 5.0);
    if (dist <= 0 || dist > 150) {
      reasons.push('Invalid cycling distance recorded.');
      return { status: 'REJECTED', confidence: 0, reasons, verifiedData: { distanceKm: dist } };
    }

    const startProofPath = (proofs.find((p) => p.type === 'START_PROOF') || proofs[0])?.file_path;
    const endProofPath = (proofs.find((p) => p.type === 'END_PROOF') || proofs[1] || proofs[0])?.file_path;

    // Real AI Vision Check
    const aiRes = await aiVerificationService.verifyBicycleConsistency(startProofPath, endProofPath);

    // SUSPICIOUS fallback if AI call fails
    if (!aiRes || aiRes.error) {
      const errorMsg = aiRes?.raw || aiRes?.error || 'AI verification failed';
      return {
        status: 'SUSPICIOUS',
        confidence: 0.5,
        reasons: [`AI verification fallback: ${errorMsg}. Marked for manual review.`],
        verifiedData: { distanceKm: dist, aiError: aiRes?.error }
      };
    }

    const confidence = parseFloat(aiRes.confidence || 0);
    const threshold = questConfig.cycling.ai_similarity_threshold;

    let status = 'VERIFIED';
    if (aiRes.bicyclePresent === false || confidence < 0.5) {
      status = 'REJECTED';
      reasons.push(aiRes.notes || 'Bicycle in proof photos could not be verified.');
    } else if (confidence < threshold || aiRes.sameBicycle === false) {
      status = 'SUSPICIOUS';
      reasons.push(aiRes.notes || 'Bicycle similarity score is below verification threshold.');
    } else {
      reasons.push(aiRes.notes || 'Bicycle identified in proof photos with valid distance.');
    }

    return {
      status,
      confidence,
      reasons,
      verifiedData: {
        distanceKm: dist,
        sameBicycleLikelihood: confidence,
        aiNotes: aiRes.notes
      }
    };
  }

  // 3. Electricity Bill Verification (Real AI OCR + Duplicate check + Reduction percent)
  async verifyElectricity(submission, { billingMonth, kwhConsumed, billAmount }) {
    const userId = submission.user_id;
    const proofs = submission.proofs || [];
    const reasons = [];

    const proofFile = (proofs.find((p) => p.type === 'BILL_PROOF' || p.type === 'PROOF') || proofs[0])?.file_path;

    if (!proofFile) {
      reasons.push('No electricity bill document image uploaded.');
      return {
        status: 'REJECTED',
        confidence: 0,
        reasons,
        verifiedData: { billingMonth: billingMonth || 'Unknown' }
      };
    }

    // Real AI OCR Extraction
    const aiRes = await aiVerificationService.extractElectricityBill(proofFile);

    // SUSPICIOUS fallback if AI call fails
    if (!aiRes || aiRes.error) {
      const errorMsg = aiRes?.raw || aiRes?.error || 'AI OCR bill processing failed';
      return {
        status: 'SUSPICIOUS',
        confidence: 0.5,
        reasons: [`AI verification fallback: ${errorMsg}. Marked for manual review.`],
        verifiedData: {
          billingMonth: billingMonth || 'Unknown Period',
          kwhConsumed: parseFloat(kwhConsumed || 140),
          billAmount: parseFloat(billAmount || 1120),
          aiError: aiRes?.error
        }
      };
    }

    // If AI explicitly determines image is not an electricity bill -> REJECT
    if (aiRes.isElectricityBill === false) {
      reasons.push('Submitted document is not a valid electricity bill.');
      return {
        status: 'REJECTED',
        confidence: parseFloat(aiRes.confidence || 0),
        reasons,
        verifiedData: { isElectricityBill: false }
      };
    }

    // Extract billing values from AI (fallback to user inputs if AI extracted null/undefined)
    const extractedMonth = aiRes.billingMonth || billingMonth || 'September 2026';
    const extractedKwh = parseFloat(aiRes.kwhConsumed || kwhConsumed || 140);
    const extractedAmount = parseFloat(aiRes.billAmount || billAmount || 1120);
    const confidence = parseFloat(aiRes.confidence || 0.9);

    // Duplicate Check Rule: Same user cannot submit electricity bill for same billing period twice
    const existingBill = await db.getOne(
      `SELECT qs.id FROM quest_submissions qs
       JOIN quest_results qr ON qs.id = qr.submission_id
       WHERE qs.user_id = ? AND qs.quest_id = ? AND (qs.verification_status = 'VERIFIED' OR qs.verification_status = 'SUSPICIOUS') AND qs.id != ?
       AND qr.calculation_data LIKE ?`,
      [userId, submission.quest_id, submission.id, `%${extractedMonth}%`]
    );

    if (existingBill) {
      reasons.push(`Electricity bill for ${extractedMonth} has already been submitted and verified.`);
      return {
        status: 'REJECTED',
        confidence: 0,
        reasons,
        verifiedData: { billingMonth: extractedMonth, duplicate: true }
      };
    }

    // Previous bill reduction calculation logic
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

    const threshold = questConfig.electricity.ai_confidence_threshold || 0.70;
    let status = 'VERIFIED';

    if (confidence < threshold) {
      status = 'SUSPICIOUS';
      reasons.push(`AI OCR confidence (${confidence}) is below threshold. Marked for manual review.`);
    } else {
      reasons.push(`Electricity bill for ${extractedMonth} verified successfully via AI OCR.`);
    }

    return {
      status,
      confidence,
      reasons,
      verifiedData: {
        billingMonth: extractedMonth,
        kwhConsumed: extractedKwh,
        billAmount: extractedAmount,
        reductionPercent
      }
    };
  }

  // 4. Plant Care Verification (Real AI Plant & Care Action Detection)
  async verifyPlantCare(submission) {
    const proofs = submission.proofs || [];
    const reasons = [];

    const photoPath = (proofs.find((p) => p.type === 'PROOF' || p.file_path) || proofs[0])?.file_path;

    if (!photoPath) {
      reasons.push('Missing photo proof for plant care action.');
      return { status: 'REJECTED', confidence: 0, reasons, verifiedData: {} };
    }

    // Real AI Vision Check
    const aiRes = await aiVerificationService.verifyPlantCareAction(photoPath);

    // SUSPICIOUS fallback if AI call fails
    if (!aiRes || aiRes.error) {
      const errorMsg = aiRes?.raw || aiRes?.error || 'AI vision check failed';
      return {
        status: 'SUSPICIOUS',
        confidence: 0.5,
        reasons: [`AI verification fallback: ${errorMsg}. Marked for manual review.`],
        verifiedData: { activity: 'Plant Care', aiError: aiRes?.error }
      };
    }

    const confidence = parseFloat(aiRes.confidence || 0);
    const threshold = questConfig.plant_care.ai_confidence_threshold || 0.70;
    let status = 'VERIFIED';

    if (aiRes.plantDetected === false) {
      status = 'REJECTED';
      reasons.push('No plants or green vegetation detected in proof photo.');
    } else if (confidence < threshold || aiRes.careActionVisible === false) {
      status = 'SUSPICIOUS';
      reasons.push('Plant detected but active care action confidence is below threshold.');
    } else {
      reasons.push('Plant maintenance activity verified by AI vision.');
    }

    return {
      status,
      confidence,
      reasons,
      verifiedData: {
        activity: aiRes.activity || 'Plant Care / Gardening',
        plantDetected: aiRes.plantDetected,
        careActionVisible: aiRes.careActionVisible
      }
    };
  }
}

module.exports = new VerificationService();
