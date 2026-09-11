import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, Bus, Zap, Utensils, ShoppingBag, Trash2, UserCheck } from 'lucide-react';
import AvatarSelector from '../components/AvatarSelector';
import { profileApi } from '../services/profileApi';
import '../styles/index.css';

export default function SetupPage({ onSetupComplete }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: User Profile & Login Info (Clean state for custom user entry)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ageGroup, setAgeGroup] = useState('25-34');
  const [city, setCity] = useState('');
  const [avatarId, setAvatarId] = useState('eco');

  // Step 2: Structured Lifestyle Info
  const [transportMode, setTransportMode] = useState('bus');
  const [dailyDistanceKm, setDailyDistanceKm] = useState('10');
  const [travelDaysPerWeek, setTravelDaysPerWeek] = useState('5');
  const [electricityBillMonthly, setElectricityBillMonthly] = useState('1000');
  const [householdSize, setHouseholdSize] = useState('2');
  const [foodPreference, setFoodPreference] = useState('mixed');
  const [shoppingFrequency, setShoppingFrequency] = useState('moderate');
  const [wasteSegregation, setWasteSegregation] = useState('segregated');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!name.trim() || !email.trim() || !city.trim()) {
        setError('Please complete all required setup fields (Full Name, Email, and City).');
        return;
      }
      setError('');
      setStep(2);
      return;
    }

    // Step 2 submission -> Save profile & calculate carbon
    setLoading(true);
    setError('');

    try {
      const userData = {
        name: name.trim(),
        email: email.trim(),
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
      }
      navigate('/dashboard');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div className="brand-logo-glow">
            <Leaf size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: '#0f172a', lineHeight: 1.2 }}>EcoQuest Profile Registration</h1>
            <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
              Step {step} of 2 — {step === 1 ? 'Personal Account & Avatar Setup' : 'Lifestyle Carbon Profiler'}
            </p>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {step === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="field-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', fontSize: '0.95rem' }}
                  placeholder="Enter your name (e.g. Anusha Sharma)"
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

              <AvatarSelector selectedAvatarId={avatarId} onSelectAvatar={setAvatarId} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'var(--emerald-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--emerald-200)', fontSize: '0.85rem', color: 'var(--emerald-800)' }}>
                ℹ️ Your lifestyle answers are used exclusively to calculate your personal baseline carbon footprint using verified deterministic emission factors.
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
            {step === 2 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setStep(1)}
              >
                Back
              </button>
            )}

            <button
              type="submit"
              className="btn-emerald"
              style={{ marginLeft: 'auto' }}
              disabled={loading}
            >
              {loading ? 'Calculating Footprint...' : step === 1 ? 'Continue to Lifestyle Setup' : 'Calculate & Launch EcoQuest'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
