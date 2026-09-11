/**
 * Central Game System Configuration
 * Defines Level XP thresholds, Titles, Badges, and Streak rules.
 */
module.exports = {
  levels: [
    { level_number: 1, title: 'Eco Starter', minimum_xp: 0, maximum_xp: 99 },
    { level_number: 2, title: 'Green Explorer', minimum_xp: 100, maximum_xp: 249 },
    { level_number: 3, title: 'Eco Adventurer', minimum_xp: 250, maximum_xp: 499 },
    { level_number: 4, title: 'Planet Protector', minimum_xp: 500, maximum_xp: 999 },
    { level_number: 5, title: 'Earth Champion', minimum_xp: 1000, maximum_xp: 1999 },
    { level_number: 6, title: 'Eco Guardian', minimum_xp: 2000, maximum_xp: 999999 }
  ],

  badges: [
    {
      badge_key: 'first_quest',
      name: 'First Step',
      description: 'Complete your first EcoQuest mission.',
      criteria: { type: 'completed_quests_count', threshold: 1 },
      icon: 'sparkles'
    },
    {
      badge_key: 'first_cycle',
      name: 'Pedal Power',
      description: 'Complete a verified Cycling quest.',
      criteria: { type: 'quest_completed', quest_key: 'cycling' },
      icon: 'bike'
    },
    {
      badge_key: 'public_transport_explorer',
      name: 'Transit Titan',
      description: 'Complete 3 Public Transport journeys.',
      criteria: { type: 'quest_count', quest_key: 'public_transport', threshold: 3 },
      icon: 'bus'
    },
    {
      badge_key: 'plant_care_starter',
      name: 'Green Thumb',
      description: 'Water or care for plants.',
      criteria: { type: 'quest_completed', quest_key: 'plant_care' },
      icon: 'sprout'
    },
    {
      badge_key: 'monthly_energy_saver',
      name: 'Watt Saver',
      description: 'Submit a verified electricity bill.',
      criteria: { type: 'quest_completed', quest_key: 'electricity' },
      icon: 'zap'
    },
    {
      badge_key: 'eco_streak_7',
      name: 'Weekly Guardian',
      description: 'Maintain an eco streak for 7 consecutive days.',
      criteria: { type: 'streak_days', threshold: 7 },
      icon: 'flame'
    },
    {
      badge_key: 'xp_100',
      name: 'Century Club',
      description: 'Accumulate 100 EcoXP.',
      criteria: { type: 'total_xp', threshold: 100 },
      icon: 'award'
    },
    {
      badge_key: 'xp_500',
      name: 'Eco Master',
      description: 'Accumulate 500 EcoXP.',
      criteria: { type: 'total_xp', threshold: 500 },
      icon: 'shield'
    }
  ],

  streak: {
    inactivityResetHours: 36 // If no eco activity within 36 hours, streak resets
  }
};
