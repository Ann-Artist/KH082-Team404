const db = require('../database/db');
const emissionFactors = require('../config/emissionFactors');

class ImpactService {
  async getUserImpact(userId) {
    const verifiedSubmissions = await db.query(
      `SELECT qs.*, q.quest_key, qr.distance, qr.calculation_data
       FROM quest_submissions qs
       JOIN quests q ON qs.quest_id = q.id
       LEFT JOIN quest_results qr ON qs.id = qr.submission_id
       WHERE qs.user_id = ? AND qs.verification_status = 'VERIFIED'`,
      [userId]
    );

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
          const dist = parseFloat(sub.distance || verifiedData.distanceKm || 0);
          totalCyclingKm += dist;
          // Avoided CO2e: Cycling instead of driving a car (0.19 kg CO2e per km)
          avoidedCO2eKg += dist * emissionFactors.transport.car;
          break;
        }
        case 'public_transport': {
          publicTransportCount++;
          const dist = parseFloat(sub.distance || verifiedData.distanceKm || 0);
          publicTransportKm += dist;
          // Avoided CO2e: Public transit vs driving private car (0.19 - 0.05 = 0.14 kg CO2e/km)
          avoidedCO2eKg += dist * (emissionFactors.transport.car - emissionFactors.transport.bus);
          break;
        }
        case 'plant_care': {
          plantCareCount++;
          // Estimated carbon offset: 2.0 kg CO2e per plant care intervention
          avoidedCO2eKg += 2.0;
          break;
        }
        case 'electricity': {
          electricitySubmissions++;
          const kwhReduced = parseFloat(verifiedData.reductionPercent || 0) * (parseFloat(verifiedData.kwhConsumed || 150) / 100);
          totalKwhSaved += kwhReduced;
          avoidedCO2eKg += kwhReduced * emissionFactors.electricity.grid_kwh_factor;
          break;
        }
      }
    });

    return {
      totalActivities,
      totalCyclingKm: Math.round(totalCyclingKm * 10) / 10,
      publicTransportCount,
      publicTransportKm: Math.round(publicTransportKm * 10) / 10,
      plantCareCount,
      electricitySubmissions,
      totalKwhSaved: Math.round(totalKwhSaved * 10) / 10,
      avoidedCO2eKg: Math.round(avoidedCO2eKg * 10) / 10,
      avoidedCO2eTons: Math.round((avoidedCO2eKg / 1000) * 1000) / 1000
    };
  }
}

module.exports = new ImpactService();
