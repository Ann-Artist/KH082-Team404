const gameConfig = require('../config/gameConfig');
const questConfig = require('../config/questConfig');

/**
 * Seed initial static configuration into database tables
 */
function seedDatabase(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. Seed Quests
      const questStmt = db.prepare(`
        INSERT INTO quests (quest_key, name, description, category, base_reward, repeatable, cooldown_hours, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(quest_key) DO UPDATE SET
          name=excluded.name,
          description=excluded.description,
          category=excluded.category,
          base_reward=excluded.base_reward,
          cooldown_hours=excluded.cooldown_hours
      `);

      Object.values(questConfig).forEach((q) => {
        let baseReward = 20;
        if (q.quest_key === 'public_transport') baseReward = q.min_xp;
        if (q.quest_key === 'cycling') baseReward = q.xp_per_km * 5; // e.g., 50 XP
        if (q.quest_key === 'electricity') baseReward = q.base_rewards.medium_usage;
        if (q.quest_key === 'plant_care') baseReward = q.fixed_xp;

        questStmt.run([
          q.quest_key,
          q.name,
          q.description,
          q.category,
          baseReward,
          1,
          q.cooldownHours
        ]);
      });
      questStmt.finalize();

      // 2. Seed Levels
      const levelStmt = db.prepare(`
        INSERT INTO levels (level_number, title, minimum_xp, maximum_xp)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(level_number) DO UPDATE SET
          title=excluded.title,
          minimum_xp=excluded.minimum_xp,
          maximum_xp=excluded.maximum_xp
      `);

      gameConfig.levels.forEach((lvl) => {
        levelStmt.run([lvl.level_number, lvl.title, lvl.minimum_xp, lvl.maximum_xp]);
      });
      levelStmt.finalize();

      // 3. Seed Badges
      const badgeStmt = db.prepare(`
        INSERT INTO badges (badge_key, name, description, criteria, icon)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(badge_key) DO UPDATE SET
          name=excluded.name,
          description=excluded.description,
          criteria=excluded.criteria,
          icon=excluded.icon
      `);

      gameConfig.badges.forEach((b) => {
        badgeStmt.run([
          b.badge_key,
          b.name,
          b.description,
          JSON.stringify(b.criteria),
          b.icon
        ]);
      });
      badgeStmt.finalize((err) => {
        if (err) {
          console.error('Error seeding database:', err);
          return reject(err);
        }
        console.log('Database successfully seeded with quests, levels, and badges.');
        resolve();
      });
    });
  });
}

module.exports = seedDatabase;
