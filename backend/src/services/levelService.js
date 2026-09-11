const gameConfig = require('../config/gameConfig');

class LevelService {
  getLevelForXP(totalXP) {
    const xp = Math.max(0, parseInt(totalXP || 0));
    const levels = gameConfig.levels;

    let currentLevel = levels[0];
    for (let i = levels.length - 1; i >= 0; i--) {
      if (xp >= levels[i].minimum_xp) {
        currentLevel = levels[i];
        break;
      }
    }

    const isMaxLevel = currentLevel.level_number === levels[levels.length - 1].level_number;
    let nextLevel = isMaxLevel ? null : levels.find((l) => l.level_number === currentLevel.level_number + 1);

    let xpInLevel = xp - currentLevel.minimum_xp;
    let xpRequiredForNext = nextLevel ? nextLevel.minimum_xp - currentLevel.minimum_xp : 1;
    let progressPercent = isMaxLevel ? 100 : Math.min(100, Math.round((xpInLevel / xpRequiredForNext) * 100));

    return {
      level_number: currentLevel.level_number,
      title: currentLevel.title,
      minimum_xp: currentLevel.minimum_xp,
      maximum_xp: currentLevel.maximum_xp,
      totalXP: xp,
      xpInLevel,
      xpRequiredForNext: nextLevel ? nextLevel.minimum_xp - xp : 0,
      nextLevelXP: nextLevel ? nextLevel.minimum_xp : currentLevel.maximum_xp,
      progressPercent
    };
  }
}

module.exports = new LevelService();
