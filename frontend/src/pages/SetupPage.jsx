import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Leaf,
  ArrowRight,
  Bus,
  Zap,
  Utensils,
  ShoppingBag,
  Trash2,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import AvatarSelector from '../components/AvatarSelector';
import { profileApi } from '../services/profileApi';
import '../styles/index.css';

export default function SetupPage({ onSetupComplete }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login Form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Step 1: User Profile Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [ageGroup, setAgeGroup] = useState('25-34');
  const [city, setCity] = useState('');
  const [avatarId, setAvatarId] = useState('eco');

  // Register Step 2: Structured Lifestyle Info
  const [transportMode, setTransportMode] = useState('bus');
  const [dailyDistanceKm, setDailyDistanceKm] = useState('10');
  const [travelDaysPerWeek, setTravelDaysPerWeek] = useState('5');
  const [electricityBillMonthly, setElectricityBillMonthly] = useState('1000');
  const [householdSize, setHouseholdSize] = useState('2');
  const [foodPreference, setFoodPreference] = useState('mixed');
  const [shoppingFrequency, setShoppingFrequency] = useState('moderate');
  const [wasteSegregation, setWasteSegregation] = useState('segregated');

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please enter both your registered email address and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await profileApi.loginUser(loginEmail.trim(), loginPassword.trim());
      if (res.data && res.data.user) {
        localStorage.setItem('ecoquest_user_id', res.data.user.id);
        if (onSetupComplete) {
          onSetupComplete(res.data);
        }
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials or register as a new user.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!name.trim() || !email.trim() || !password.trim() || !city.trim()) {
        setError('Please complete all required profile fields (Full Name, Email, Password, and City).');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      setError('');
      setStep(2);
      return;
    }

    // Step 2 submission -> Save profile & calculate carbon footprint in DB
    setLoading(true);
    setError('');

    try {
      const userData = {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        age_group: ageGroup,
        city: city.trim(),
        avatar_id: avatarId
      };

      const lifestyleData = {
        transport_mode: transportMode,
        daily_distance_km: parseFloat(dailyDistanceKm || 0),
        travel_days_per_week: parseInt(travelDaysPerWeek || 5),
        electricity_bill_monthly: parseFloat(electricityBillMonthly || 0),
        household_size: parseInt(householdSize || 1),
        food_preference: foodPreference,
        shopping_frequency: shoppingFrequency,
        waste_segregation: wasteSegregation
      };

      const res = await profileApi.setupProfile(userData, lifestyleData);
      if (res.data && res.data.user) {
        localStorage.setItem('ecoquest_user_id', res.data.user.id);
        if (onSetupComplete) {
          onSetupComplete(res.data);
        }
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to create user profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="eco-card animate-fade-in" style={{ maxWidth: '680px', width: '100%', padding: '2.5rem' }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-logo-glow">
              <Leaf size={26} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', color: '#0f172a', lineHeight: 1.2 }}>
                {mode === 'login' ? 'EcoQuest Account Access' : 'EcoQuest Profile Registration'}
              </h1>
              <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
                {mode === 'login'
                  ? 'Sign in with your registered email and password'
                  : `Step ${step} of 2 — ${step === 1 ? 'Personal Account & Avatar Setup' : 'Lifestyle Carbon Profiler'}`}
              </p>
            </div>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: '#f1f5f9', padding: '0.35rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
              background: mode === 'login' ? '#ffffff' : 'transparent',
              color: mode === 'login' ? 'var(--emerald-700)' : '#64748b',
              boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <LogIn size={18} /> Sign In / Existing Account
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setStep(1);
              setError('');
            }}
            style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
              background: mode === 'register' ? '#ffffff' : 'transparent',
              color: mode === 'register' ? 'var(--emerald-700)' : '#64748b',
              boxShadow: mode === 'register' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <UserPlus size={18} /> Register New User
          </button>
        </div>

        {error && (
          <div style={{
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#9f1239',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
              <AlertTriangle size={20} style={{ color: '#e11d48', flexShrink: 0 }} />
              <span>{error.includes('No account found') ? '⚠️ Account Not Found Warning' : '⚠️ Authentication Warning'}</span>
            </div>
            <div style={{ fontSize: '0.88rem', lineHeight: 1.4, marginLeft: '1.75rem' }}>
              {error}
            </div>
            {error.includes('No account found') && (
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setStep(1);
                  setEmail(loginEmail);
                  setError('');
                }}
                style={{
                  alignSelf: 'flex-start',
                  marginLeft: '1.75rem',
                  marginTop: '0.25rem',
                  background: '#e11d48',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.45rem 0.95rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 1px 3px rgba(225,29,72,0.3)'
                }}
              >
                <UserPlus size={14} /> Register as New User with "{loginEmail}"
              </button>
            )}
          </div>
        )}

        {/* MODE 1: LOGIN TO EXISTING ACCOUNT */}
        {mode === 'login' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
              <div>
                <label className="field-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                  <Mail size={16} style={{ color: 'var(--emerald-600)' }} /> Email Address *
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', fontSize: '0.95rem' }}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div>
                <label className="field-label" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                  <Lock size={16} style={{ color: 'var(--emerald-600)' }} /> Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', fontSize: '0.95rem' }}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-emerald"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem 1rem', marginTop: '0.5rem' }}
                disabled={loading}
              >
                {loading ? 'Logging In...' : 'Log In to Account'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setStep(1);
                    setError('');
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--emerald-600)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Register as a New User
                </button>
              </span>
            </div>
          </div>
        ) : (
          /* MODE 2: REGISTER NEW USER */
          <form onSubmit={handleRegisterSubmit}>
            {step === 1 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="field-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', fontSize: '0.95rem' }}
                    placeholder="Enter your name (e.g. Anusha Randive)"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="field-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', fontSize: '0.95rem' }}
                      placeholder="name@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="field-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>City *</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', fontSize: '0.95rem' }}
                      placeholder="e.g. Pune"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="field-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Password *</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', fontSize: '0.95rem' }}
                        placeholder="At least 6 characters"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="field-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Age Group</label>
                    <select
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', fontSize: '0.95rem', background: '#fff' }}
                    >
                      <option value="18-24">18-24</option>
                      <option value="25-34">25-34</option>
                      <option value="35-44">35-44</option>
                      <option value="45+">45+</option>
                    </select>
                  </div>
                </div>

                <AvatarSelector selectedAvatarId={avatarId} onSelectAvatar={setAvatarId} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: 'var(--emerald-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--emerald-200)', fontSize: '0.85rem', color: 'var(--emerald-800)' }}>
                  ℹ️ Your lifestyle answers are saved securely to your database profile to compute your personal baseline carbon footprint using verified deterministic emission factors.
                </div>

                {/* Transportation */}
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <Bus size={18} style={{ color: '#0284c7' }} /> Primary Transportation Mode & Travel
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Travel Mode</span>
                      <select
                        value={transportMode}
                        onChange={(e) => setTransportMode(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                      >
                        <option value="car">Private Car</option>
                        <option value="bus">Public Bus</option>
                        <option value="train">Train / Metro</option>
                        <option value="motorcycle">Motorcycle</option>
                        <option value="walking_cycling">Walking / Cycling</option>
                      </select>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Daily Distance (km)</span>
                      <input
                        type="number"
                        value={dailyDistanceKm}
                        onChange={(e) => setDailyDistanceKm(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Days / Week</span>
                      <input
                        type="number"
                        min="1"
                        max="7"
                        value={travelDaysPerWeek}
                        onChange={(e) => setTravelDaysPerWeek(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Electricity */}
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <Zap size={18} style={{ color: '#f59e0b' }} /> Household Electricity Usage
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Monthly Electricity Bill (₹)</span>
                      <input
                        type="number"
                        value={electricityBillMonthly}
                        onChange={(e) => setElectricityBillMonthly(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '0.2rem' }}>Household Size</span>
                      <input
                        type="number"
                        min="1"
                        value={householdSize}
                        onChange={(e) => setHouseholdSize(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Food */}
                <div>
                  <label style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <Utensils size={18} style={{ color: '#10b981' }} /> Food & Diet Preference
                  </label>
                  <select
                    value={foodPreference}
                    onChange={(e) => setFoodPreference(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                  >
                    <option value="vegetarian">Vegetarian (0.9 kg CO2e / day)</option>
                    <option value="mixed">Mixed Diet (1.6 kg CO2e / day)</option>
                    <option value="non_vegetarian">Non-Vegetarian (2.5 kg CO2e / day)</option>
                  </select>
                </div>

                {/* Shopping & Waste */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                      <ShoppingBag size={16} style={{ color: '#8b5cf6' }} /> Shopping Frequency
                    </label>
                    <select
                      value={shoppingFrequency}
                      onChange={(e) => setShoppingFrequency(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                    >
                      <option value="minimal">Minimal (20 kg CO2e/mo)</option>
                      <option value="moderate">Moderate (60 kg CO2e/mo)</option>
                      <option value="frequent">Frequent (120 kg CO2e/mo)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                      <Trash2 size={16} style={{ color: '#64748b' }} /> Waste Segregation
                    </label>
                    <select
                      value={wasteSegregation}
                      onChange={(e) => setWasteSegregation(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                    >
                      <option value="segregated">Fully Recycled / Segregated (5 kg CO2e/mo)</option>
                      <option value="partially_segregated">Partially Segregated (15 kg CO2e/mo)</option>
                      <option value="unsegregated">Unsegregated (30 kg CO2e/mo)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {step === 2 ? (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.88rem', cursor: 'pointer' }}
                >
                  Already have an account? Log In
                </button>
              )}

              <button
                type="submit"
                className="btn-emerald"
                style={{ marginLeft: 'auto' }}
                disabled={loading}
              >
                {loading ? 'Calculating Footprint...' : step === 1 ? 'Continue to Lifestyle Setup' : 'Calculate & Register Account'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
