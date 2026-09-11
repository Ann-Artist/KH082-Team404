/**
 * Central Quest Parameters Configuration
 * Defines reward formulas, cooldowns, AI similarity thresholds, and verification factors for the 4 permanent quests.
 */
module.exports = {
  public_transport: {
    quest_key: 'public_transport',
    name: 'Public Transport',
    description: 'Replace private motorized travel with buses, trains, or metro.',
    category: 'transport',
    xp_per_km: 4,             // EcoXP earned per verified kilometer traveled
    min_xp: 15,                // Minimum guaranteed reward for completed transit trip
    verification_threshold: 0.75, // Haversine / proof geo & timestamp validation threshold
    cooldownHours: 1           // Cooldown before starting next transit quest
  },

  cycling: {
    quest_key: 'cycling',
    name: 'Cycling Quest',
    description: 'Ride a bicycle for commuting or daily travel instead of a motor vehicle.',
    category: 'transport',
    xp_per_km: 10,            // EcoXP earned per verified cycling kilometer
    ai_similarity_threshold: 0.75, // Bicycle similarity score required for VERIFIED
    cooldownHours: 2           // Cooldown hours between cycling submissions
  },

  electricity: {
    quest_key: 'electricity',
    name: 'Electricity Saver',
    description: 'Upload your monthly electricity bill to verify low energy consumption or savings.',
    category: 'energy',
    base_rewards: {
      low_usage: 50,       // < 150 kWh
      medium_usage: 30,    // 150 - 300 kWh
      high_usage: 15       // > 300 kWh
    },
    reduction_bonus_per_percent: 1.5, // Extra XP for percentage reduction vs previous month
    cooldownHours: 720     // Monthly billing period (~30 days)
  },

  plant_care: {
    quest_key: 'plant_care',
    name: 'Plant Care',
    description: 'Water, plant, or maintain real-world trees, gardens, or houseplants.',
    category: 'nature',
    fixed_xp: 25,          // Fixed reward for plant care activity
    cooldownHours: 24      // Configurable cooldown window (24 hours default)
  }
};
