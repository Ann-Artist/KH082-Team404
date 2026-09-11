const db = require('../database/db');

class ProfileService {
  async getOrCreateDemoUser() {
    let user = await db.getOne('SELECT * FROM users ORDER BY id ASC LIMIT 1');
    if (!user) {
      return null;
    }
    return user;
  }

  async getAllProfiles() {
    return await db.query(
      'SELECT id, name, email, age_group, city, avatar_id, created_at, updated_at FROM users ORDER BY updated_at DESC'
    );
  }

  async getProfileByEmail(email) {
    if (!email) return null;
    const user = await db.getOne('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (!user) return null;
    return this.getUserProfile(user.id);
  }

  async authenticateUser(email, password) {
    if (!email || !password) {
      return { success: false, code: 'INVALID_INPUT', message: 'Both email address and password are required to log in.' };
    }
    const user = await db.getOne('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (!user) {
      return { success: false, code: 'NOT_FOUND', message: `No account found with email "${email.trim()}". Please register as a new user.` };
    }
    if (user.password && user.password !== password) {
      return { success: false, code: 'INVALID_PASSWORD', message: 'Incorrect password. Please check your password and try again.' };
    }
    const profile = await this.getUserProfile(user.id);
    return { success: true, profile };
  }

  async setupProfile(userData, lifestyleData) {
    const { name, email, password, age_group, city, avatar_id } = userData;
    const pwd = password || 'password123';
    const {
      transport_mode,
      daily_distance_km,
      travel_days_per_week,
      electricity_bill_monthly,
      household_size,
      food_preference,
      shopping_frequency,
      waste_segregation
    } = lifestyleData;

    // Check if user already exists
    let existingUser = await db.getOne('SELECT * FROM users WHERE email = ?', [email]);
    let userId;

    if (existingUser) {
      userId = existingUser.id;
      await db.execute(
        `UPDATE users SET name = ?, password = ?, age_group = ?, city = ?, avatar_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [name, pwd, age_group, city, avatar_id || 'eco', userId]
      );
    } else {
      const result = await db.execute(
        `INSERT INTO users (name, email, password, age_group, city, avatar_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, email, pwd, age_group, city, avatar_id || 'eco']
      );
      userId = result.lastID;
    }

    // Save/update lifestyle data
    await db.execute(
      `INSERT INTO profile_lifestyle (
        user_id, transport_mode, daily_distance_km, travel_days_per_week,
        electricity_bill_monthly, household_size, food_preference, shopping_frequency, waste_segregation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        transport_mode = excluded.transport_mode,
        daily_distance_km = excluded.daily_distance_km,
        travel_days_per_week = excluded.travel_days_per_week,
        electricity_bill_monthly = excluded.electricity_bill_monthly,
        household_size = excluded.household_size,
        food_preference = excluded.food_preference,
        shopping_frequency = excluded.shopping_frequency,
        waste_segregation = excluded.waste_segregation,
        updated_at = CURRENT_TIMESTAMP`,
      [
        userId,
        transport_mode,
        parseFloat(daily_distance_km || 0),
        parseInt(travel_days_per_week || 5),
        parseFloat(electricity_bill_monthly || 0),
        parseInt(household_size || 1),
        food_preference,
        shopping_frequency,
        waste_segregation
      ]
    );

    // Initialize initial streak record
    const existingStreak = await db.getOne('SELECT * FROM streaks WHERE user_id = ?', [userId]);
    if (!existingStreak) {
      await db.execute(
        `INSERT INTO streaks (user_id, current_streak, longest_streak) VALUES (?, 0, 0)`,
        [userId]
      );
    }

    return userId;
  }

  async getUserProfile(userId) {
    const user = await db.getOne('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return null;

    const lifestyle = await db.getOne('SELECT * FROM profile_lifestyle WHERE user_id = ?', [userId]);
    return {
      ...user,
      lifestyle: lifestyle || null
    };
  }

  async updateAvatar(userId, avatar_id) {
    await db.execute('UPDATE users SET avatar_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
      avatar_id,
      userId
    ]);
    return this.getUserProfile(userId);
  }

  async updateProfile(userId, userData, lifestyleData) {
    if (userData) {
      const { name, age_group, city, avatar_id } = userData;
      await db.execute(
        'UPDATE users SET name = ?, age_group = ?, city = ?, avatar_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, age_group, city, avatar_id, userId]
      );
    }

    if (lifestyleData) {
      const {
        transport_mode,
        daily_distance_km,
        travel_days_per_week,
        electricity_bill_monthly,
        household_size,
        food_preference,
        shopping_frequency,
        waste_segregation
      } = lifestyleData;

      await db.execute(
        `UPDATE profile_lifestyle SET
          transport_mode = ?, daily_distance_km = ?, travel_days_per_week = ?,
          electricity_bill_monthly = ?, household_size = ?, food_preference = ?,
          shopping_frequency = ?, waste_segregation = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`,
        [
          transport_mode,
          parseFloat(daily_distance_km || 0),
          parseInt(travel_days_per_week || 5),
          parseFloat(electricity_bill_monthly || 0),
          parseInt(household_size || 1),
          food_preference,
          shopping_frequency,
          waste_segregation,
          userId
        ]
      );
    }

    return this.getUserProfile(userId);
  }
}

module.exports = new ProfileService();
