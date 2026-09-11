const db = require('../database/db');
const emissionFactors = require('../config/emissionFactors');

class CarbonService {
  calculateFootprint(lifestyleData) {
    const {
      transport_mode,
      daily_distance_km = 0,
      travel_days_per_week = 5,
      electricity_bill_monthly = 0,
      household_size = 1,
      food_preference,
      shopping_frequency,
      waste_segregation
    } = lifestyleData;

    // 1. Transport Emission Calculation
    const transportFactor = emissionFactors.transport[transport_mode] || emissionFactors.transport.car;
    const monthlyDistanceKm = daily_distance_km * travel_days_per_week * 4.33;
    const transport_emission = Math.round(monthlyDistanceKm * transportFactor * 10) / 10;

    // 2. Electricity Emission Calculation
    const estimatedKwh = (electricity_bill_monthly || 0) / emissionFactors.electricity.avg_cost_per_kwh;
    const perPersonKwh = estimatedKwh / Math.max(1, household_size);
    const electricity_emission = Math.round(perPersonKwh * emissionFactors.electricity.grid_kwh_factor * 10) / 10;

    // 3. Food Emission Calculation (Monthly = Daily Factor x 30)
    const foodConfig = emissionFactors.food[food_preference] || emissionFactors.food.mixed;
    const food_emission = Math.round(foodConfig.emission_per_day * 30 * 10) / 10;

    // 4. Shopping Emission Calculation
    const shoppingConfig = emissionFactors.shopping[shopping_frequency] || emissionFactors.shopping.moderate;
    const shopping_emission = shoppingConfig.monthly_factor;

    // 5. Waste Emission Calculation
    const wasteConfig = emissionFactors.waste[waste_segregation] || emissionFactors.waste.partially_segregated;
    const waste_emission = wasteConfig.monthly_factor;

    // Total Monthly Baseline Footprint
    const total_emission = Math.round(
      (transport_emission + electricity_emission + food_emission + shopping_emission + waste_emission) * 10
    ) / 10;

    return {
      transport_emission,
      electricity_emission,
      food_emission,
      shopping_emission,
      waste_emission,
      total_emission
    };
  }

  async calculateAndSaveUserFootprint(userId) {
    const lifestyle = await db.getOne('SELECT * FROM profile_lifestyle WHERE user_id = ?', [userId]);
    if (!lifestyle) {
      throw new Error('Lifestyle data not found for user');
    }

    const footprint = this.calculateFootprint(lifestyle);

    await db.execute(
      `INSERT INTO carbon_footprints (
        user_id, transport_emission, electricity_emission, food_emission, shopping_emission, waste_emission, total_emission
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        transport_emission = excluded.transport_emission,
        electricity_emission = excluded.electricity_emission,
        food_emission = excluded.food_emission,
        shopping_emission = excluded.shopping_emission,
        waste_emission = excluded.waste_emission,
        total_emission = excluded.total_emission,
        calculated_at = CURRENT_TIMESTAMP`,
      [
        userId,
        footprint.transport_emission,
        footprint.electricity_emission,
        footprint.food_emission,
        footprint.shopping_emission,
        footprint.waste_emission,
        footprint.total_emission
      ]
    );

    return footprint;
  }

  async getUserFootprint(userId) {
    let footprint = await db.getOne('SELECT * FROM carbon_footprints WHERE user_id = ?', [userId]);
    if (!footprint) {
      // If not yet calculated, calculate now if lifestyle exists
      const lifestyle = await db.getOne('SELECT * FROM profile_lifestyle WHERE user_id = ?', [userId]);
      if (lifestyle) {
        footprint = await this.calculateAndSaveUserFootprint(userId);
      }
    }
    return footprint;
  }
}

module.exports = new CarbonService();
