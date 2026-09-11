/**
 * Central Emission Factors Configuration (kg CO2e)
 * All values are configurable prototype baseline emission factors used for deterministic footprint calculations.
 */
module.exports = {
  transport: {
    car: 0.19,            // kg CO2e per km
    bus: 0.05,            // kg CO2e per km
    train: 0.03,          // kg CO2e per km
    motorcycle: 0.10,     // kg CO2e per km
    walking_cycling: 0.00 // kg CO2e per km
  },

  electricity: {
    grid_kwh_factor: 0.82,  // kg CO2e per kWh
    avg_cost_per_kwh: 8.0   // Estimated currency cost per kWh for bill estimation
  },

  food: {
    vegetarian: { emission_per_day: 0.9 },      // kg CO2e per day
    mixed: { emission_per_day: 1.6 },           // kg CO2e per day
    non_vegetarian: { emission_per_day: 2.5 }   // kg CO2e per day
  },

  shopping: {
    minimal: { monthly_factor: 20 },   // kg CO2e per month
    moderate: { monthly_factor: 60 },  // kg CO2e per month
    frequent: { monthly_factor: 120 }  // kg CO2e per month
  },

  waste: {
    segregated: { monthly_factor: 5 },          // kg CO2e per month
    partially_segregated: { monthly_factor: 15 },// kg CO2e per month
    unsegregated: { monthly_factor: 30 }         // kg CO2e per month
  }
};
