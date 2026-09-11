-- EcoQuest Database Schema (SQLite)

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL DEFAULT 'password123',
    age_group TEXT NOT NULL,
    city TEXT NOT NULL,
    avatar_id TEXT NOT NULL DEFAULT 'eco',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profile_lifestyle (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    transport_mode TEXT NOT NULL,
    daily_distance_km REAL NOT NULL,
    travel_days_per_week INTEGER NOT NULL,
    electricity_bill_monthly REAL NOT NULL,
    household_size INTEGER NOT NULL,
    food_preference TEXT NOT NULL,
    shopping_frequency TEXT NOT NULL,
    waste_segregation TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS carbon_footprints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    transport_emission REAL NOT NULL,
    electricity_emission REAL NOT NULL,
    food_emission REAL NOT NULL,
    shopping_emission REAL NOT NULL,
    waste_emission REAL NOT NULL,
    total_emission REAL NOT NULL,
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quest_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    base_reward INTEGER NOT NULL DEFAULT 20,
    repeatable INTEGER NOT NULL DEFAULT 1,
    cooldown_hours INTEGER NOT NULL DEFAULT 24,
    active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS quest_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    quest_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'NOT_STARTED', 
    -- Statuses: NOT_STARTED, STARTED, START_PROOF_SUBMITTED, IN_PROGRESS, PROOF_SUBMITTED, VERIFYING, COMPLETED, REJECTED
    verification_status TEXT DEFAULT 'PENDING', 
    -- Verification: PENDING, VERIFIED, SUSPICIOUS, REJECTED
    reward_points INTEGER DEFAULT 0,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS submission_proofs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL,
    type TEXT NOT NULL, -- e.g., START_PROOF, MID_PROOF, END_PROOF, BILL_PROOF
    file_path TEXT,
    latitude REAL,
    longitude REAL,
    captured_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT, -- JSON string for extra fields
    FOREIGN KEY (submission_id) REFERENCES quest_submissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quest_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER UNIQUE NOT NULL,
    distance REAL DEFAULT 0,
    verified_value TEXT,
    calculation_data TEXT, -- JSON details
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES quest_submissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS eco_point_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    submission_id INTEGER UNIQUE NOT NULL, -- Mandatory idempotency protection!
    points INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (submission_id) REFERENCES quest_submissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS levels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level_number INTEGER UNIQUE NOT NULL,
    title TEXT NOT NULL,
    minimum_xp INTEGER NOT NULL,
    maximum_xp INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    badge_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    criteria TEXT NOT NULL, -- JSON string
    icon TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    badge_id INTEGER NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS streaks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
