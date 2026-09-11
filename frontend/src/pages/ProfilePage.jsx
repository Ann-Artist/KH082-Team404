import React, { useState, useEffect } from 'react';
import AvatarSelector from '../components/AvatarSelector';
import { profileApi } from '../services/profileApi';
import {
  User,
  Mail,
  MapPin,
  CheckCircle,
  Pencil,
  Save,
  X,
  Bus,
  Zap,
  Utensils,
  ShoppingBag,
  Trash2,
  Calendar
} from 'lucide-react';
import '../styles/index.css';

export default function ProfilePage({ user, progression, onUserUpdated }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editable Profile state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState(user?.city || '');
  const [ageGroup, setAgeGroup] = useState(user?.age_group || '25-34');
  const [avatarId, setAvatarId] = useState(user?.avatar_id || 'eco');

  // Editable Lifestyle state
  const [transportMode, setTransportMode] = useState(user?.lifestyle?.transport_mode || 'bus');
  const [dailyDistanceKm, setDailyDistanceKm] = useState(user?.lifestyle?.daily_distance_km || 10);
  const [travelDaysPerWeek, setTravelDaysPerWeek] = useState(user?.lifestyle?.travel_days_per_week || 5);
  const [electricityBillMonthly, setElectricityBillMonthly] = useState(user?.lifestyle?.electricity_bill_monthly || 1000);
  const [householdSize, setHouseholdSize] = useState(user?.lifestyle?.household_size || 2);
  const [foodPreference, setFoodPreference] = useState(user?.lifestyle?.food_preference || 'mixed');
  const [shoppingFrequency, setShoppingFrequency] = useState(user?.lifestyle?.shopping_frequency || 'moderate');
  const [wasteSegregation, setWasteSegregation] = useState(user?.lifestyle?.waste_segregation || 'segregated');

  // Sync state if user prop updates externally
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setCity(user.city || '');
      setAgeGroup(user.age_group || '25-34');
      setAvatarId(user.avatar_id || 'eco');
      if (user.lifestyle) {
        setTransportMode(user.lifestyle.transport_mode || 'bus');
        setDailyDistanceKm(user.lifestyle.daily_distance_km || 10);
        setTravelDaysPerWeek(user.lifestyle.travel_days_per_week || 5);
        setElectricityBillMonthly(user.lifestyle.electricity_bill_monthly || 1000);
        setHouseholdSize(user.lifestyle.household_size || 2);
        setFoodPreference(user.lifestyle.food_preference || 'mixed');
        setShoppingFrequency(user.lifestyle.shopping_frequency || 'moderate');
        setWasteSegregation(user.lifestyle.waste_segregation || 'segregated');
      }
    }
  }, [user]);

  if (!user) return null;

  const handleStartEdit = () => {
    setIsEditing(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrorMsg('');
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setCity(user.city || '');
      setAgeGroup(user.age_group || '25-34');
      setAvatarId(user.avatar_id || 'eco');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !city.trim()) {
      setErrorMsg('Full Name, Email, and City cannot be empty.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const userData = {
        name: name.trim(),
        email: email.trim(),
        city: city.trim(),
        age_group: ageGroup,
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

      const res = await profileApi.updateProfile(user.id, userData, lifestyleData);
      if (res.data && res.data.user) {
        if (onUserUpdated) {
          onUserUpdated(res.data.user);
        }
        setSuccessMsg('Profile and character avatar updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const avatarPath = `/src/assets/avatars/${user.avatar_id || 'eco'}.png`;

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-600)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <User size={18} /> My Character Profile
        </div>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>Player Profile & Settings</h1>
      </div>

      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: 'var(--emerald-800)', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', fontWeight: 600 }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main Profile View vs Edit Mode */}
      {!isEditing ? (
        <div className="eco-card" style={{ padding: '2rem' }}>
          {/* Card Header with Edit Profile Button */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <img
                src={avatarPath}
                alt={user.name}
                style={{ width: '90px', height: '90px', borderRadius: '50%', border: '4px solid var(--emerald-500)', objectFit: 'cover', background: '#f1f5f9' }}
                onError={(e) => { e.target.src = '/src/assets/avatars/eco.png'; }}
              />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h2 style={{ fontSize: '1.75rem', color: '#0f172a', fontWeight: 800 }}>{user.name}</h2>
                  <span className="pill-badge pill-emerald">Level {progression?.level?.level_number || 1}</span>
                </div>

                <p style={{ fontSize: '1rem', color: 'var(--emerald-700)', fontWeight: 800, margin: '0.2rem 0 0.75rem 0' }}>
                  {progression?.level?.title || 'Eco Starter'}
                </p>

                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.88rem', color: '#64748b', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={15} style={{ color: 'var(--emerald-600)' }} /> {user.email}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={15} style={{ color: 'var(--emerald-600)' }} /> {user.city}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={15} style={{ color: 'var(--emerald-600)' }} /> Age: {user.age_group}
                  </span>
                </div>
              </div>
            </div>

            {/* EDIT PROFILE BUTTON */}
            <button
              onClick={handleStartEdit}
              className="btn-emerald"
              style={{ padding: '0.6rem 1.2rem', gap: '0.4rem', fontSize: '0.9rem' }}
            >
              <Pencil size={16} /> Edit Profile
            </button>
          </div>

          {/* Lifestyle Overview Summary */}
          {user.lifestyle && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '1rem', fontWeight: 800 }}>
                Baseline Lifestyle Parameters
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                    <Bus size={14} style={{ color: '#0284c7' }} /> Primary Transport
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', textTransform: 'capitalize', display: 'block', marginTop: '0.2rem' }}>
                    {user.lifestyle.transport_mode?.replace('_', ' ')} ({user.lifestyle.daily_distance_km} km/day)
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                    <Zap size={14} style={{ color: '#f59e0b' }} /> Electricity Bill
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', display: 'block', marginTop: '0.2rem' }}>
                    ₹{user.lifestyle.electricity_bill_monthly} / mo ({user.lifestyle.household_size} members)
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                    <Utensils size={14} style={{ color: '#10b981' }} /> Food Preference
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', textTransform: 'capitalize', display: 'block', marginTop: '0.2rem' }}>
                    {user.lifestyle.food_preference?.replace('_', ' ')}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                    <ShoppingBag size={14} style={{ color: '#8b5cf6' }} /> Shopping & Waste
                  </span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', textTransform: 'capitalize', display: 'block', marginTop: '0.2rem' }}>
                    {user.lifestyle.shopping_frequency} / {user.lifestyle.waste_segregation?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* EDIT PROFILE FORM */
        <form onSubmit={handleSaveProfile} className="eco-card animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Pencil size={20} style={{ color: 'var(--emerald-600)' }} /> Edit Profile & Avatar Settings
            </h2>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancelEdit}
                style={{ padding: '0.5rem 1rem', gap: '0.3rem' }}
              >
                <X size={16} /> Cancel
              </button>
              <button
                type="submit"
                className="btn-emerald"
                disabled={saving}
                style={{ padding: '0.5rem 1.25rem', gap: '0.3rem' }}
              >
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* AVATAR SELECTION GRID (INSIDE EDIT MODE ONLY) */}
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '0.5rem', fontWeight: 800 }}>
              Select Character Avatar
            </h3>
            <AvatarSelector selectedAvatarId={avatarId} onSelectAvatar={setAvatarId} />
          </div>

          {/* Personal Details Inputs */}
          <div>
            <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '0.75rem', fontWeight: 800 }}>
              Personal Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="field-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', fontSize: '0.92rem' }}
                  required
                />
              </div>

              <div>
                <label className="field-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', fontSize: '0.92rem' }}
                  required
                />
              </div>

              <div>
                <label className="field-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', fontSize: '0.92rem' }}
                  required
                />
              </div>

              <div>
                <label className="field-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Age Group</label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', fontSize: '0.92rem', background: '#fff' }}
                >
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45+">45+</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lifestyle Parameters Inputs */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '0.75rem', fontWeight: 800 }}>
              Baseline Lifestyle Footprint Survey
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Transport Mode</label>
                <select
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                >
                  <option value="car">Private Car</option>
                  <option value="bus">Public Bus</option>
                  <option value="train">Train / Metro</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="walking_cycling">Walking / Cycling</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Daily Distance (km)</label>
                <input
                  type="number"
                  value={dailyDistanceKm}
                  onChange={(e) => setDailyDistanceKm(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Electricity Bill (₹/mo)</label>
                <input
                  type="number"
                  value={electricityBillMonthly}
                  onChange={(e) => setElectricityBillMonthly(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Food Preference</label>
                <select
                  value={foodPreference}
                  onChange={(e) => setFoodPreference(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                >
                  <option value="vegetarian">Vegetarian</option>
                  <option value="mixed">Mixed Diet</option>
                  <option value="non_vegetarian">Non-Vegetarian</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Shopping Frequency</label>
                <select
                  value={shoppingFrequency}
                  onChange={(e) => setShoppingFrequency(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                >
                  <option value="minimal">Minimal</option>
                  <option value="moderate">Moderate</option>
                  <option value="frequent">Frequent</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Waste Segregation</label>
                <select
                  value={wasteSegregation}
                  onChange={(e) => setWasteSegregation(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}
                >
                  <option value="segregated">Fully Recycled / Segregated</option>
                  <option value="partially_segregated">Partially Segregated</option>
                  <option value="unsegregated">Unsegregated</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
