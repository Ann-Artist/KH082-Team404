const db = require('../database/db');
const emissionFactors = require('../config/emissionFactors');

class ImpactService {
  async getUserImpact(userId) {
    // 1. Fetch user's verified or completed quest submissions
    const verifiedSubmissions = await db.query(
      `SELECT qs.*, q.quest_key, qr.distance, qr.calculation_data
       FROM quest_submissions qs
       JOIN quests q ON qs.quest_id = q.id
       LEFT JOIN quest_results qr ON qs.id = qr.submission_id
       WHERE qs.user_id = ? AND (qs.verification_status = 'VERIFIED' OR qs.status = 'COMPLETED')`,
      [userId]
    );

    // 2. Fetch user's baseline footprint for baseline comparison
    const footprintRow = await db.getOne(
      'SELECT total_emission FROM carbon_footprints WHERE user_id = ?',
      [userId]
    );
    const monthlyBaselineKg = footprintRow ? parseFloat(footprintRow.total_emission || 0) : 180;

    let totalActivities = verifiedSubmissions.length;
    let totalCyclingKm = 0;
    let publicTransportCount = 0;
    let publicTransportKm = 0;
    let plantCareCount = 0;
    let electricitySubmissions = 0;
    let totalKwhSaved = 0;

    let avoidedCO2eKg = 0;

    verifiedSubmissions.forEach((sub) => {
      let calcData = {};
      try {
        if (sub.calculation_data) calcData = JSON.parse(sub.calculation_data);
      } catch (e) {}

      const verifiedData = calcData.verifiedData || {};

      switch (sub.quest_key) {
        case 'cycling': {
          let dist = parseFloat(sub.distance || verifiedData.distanceKm || 0);
          if (dist <= 0) dist = 5.0; // Default 5 km for verified cycling quest
          totalCyclingKm += dist;
          // Avoided CO2e: Cycling instead of driving a car (0.19 kg CO2e per km)
          const saved = dist * emissionFactors.transport.car;
          avoidedCO2eKg += saved;
          break;
        }
        case 'public_transport': {
          publicTransportCount++;
          let dist = parseFloat(sub.distance || verifiedData.distanceKm || 0);
          if (dist <= 0) dist = 10.0; // Default 10 km for verified transit journey
          publicTransportKm += dist;
          // Avoided CO2e: Public transit vs driving private car (0.19 - 0.05 = 0.14 kg CO2e/km)
          const saved = dist * (emissionFactors.transport.car - emissionFactors.transport.bus);
          avoidedCO2eKg += saved;
          break;
        }
        case 'plant_care': {
          plantCareCount++;
          // Estimated carbon offset: 2.5 kg CO2e per plant care intervention
          avoidedCO2eKg += 2.5;
          break;
        }
        case 'electricity': {
          electricitySubmissions++;
          let kwhReduced = parseFloat(verifiedData.reductionPercent || 0) * (parseFloat(verifiedData.kwhConsumed || 150) / 100);
          if (kwhReduced <= 0) kwhReduced = 18.5; // Default 18.5 kWh saved per verified electricity bill
          totalKwhSaved += kwhReduced;
          const saved = kwhReduced * emissionFactors.electricity.grid_kwh_factor;
          avoidedCO2eKg += saved;
          break;
        }
      }
    });

    const roundedAvoidedKg = Math.round(avoidedCO2eKg * 10) / 10;
    const roundedBaselineKg = Math.round(monthlyBaselineKg * 10) / 10;
    const offsetPercentage = roundedBaselineKg > 0
      ? Math.min(100, Math.round((roundedAvoidedKg / roundedBaselineKg) * 100 * 10) / 10)
      : 0;

    return {
      totalActivities,
      totalCyclingKm: Math.round(totalCyclingKm * 10) / 10,
      publicTransportCount,
      publicTransportKm: Math.round(publicTransportKm * 10) / 10,
      plantCareCount,
      electricitySubmissions,
      totalKwhSaved: Math.round(totalKwhSaved * 10) / 10,
      avoidedCO2eKg: roundedAvoidedKg,
      avoidedCO2eTons: Math.round((roundedAvoidedKg / 1000) * 1000) / 1000,
      monthlyBaselineKg: roundedBaselineKg,
      offsetPercentage
    };
  }
}

module.exports = new ImpactService();
