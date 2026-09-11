import React, { useEffect, useState } from 'react';
import { impactApi } from '../services/impactApi';
import { TrendingUp, Bike, Bus, Sprout, Zap, ShieldCheck, Leaf } from 'lucide-react';
import '../styles/index.css';

export default function ImpactPage({ userId }) {
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    loadImpact();
  }, [userId]);

  const loadImpact = async () => {
    try {
      setLoading(true);
      const res = await impactApi.getUserImpact(userId);
      setImpact(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load impact metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <span className="pill-badge pill-blue animate-spin" style={{ padding: '0.75rem 1.5rem' }}>
          Calculating Verified Impact Metrics...
        </span>
      </div>
    );
  }

  if (error || !impact) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: '#ef4444' }}>{error || 'Unable to calculate impact.'}</p>
      </div>
    );
  }

  const {
    totalActivities = 0,
    totalCyclingKm = 0,
    publicTransportCount = 0,
    publicTransportKm = 0,
    plantCareCount = 0,
    electricitySubmissions = 0,
    totalKwhSaved = 0,
    avoidedCO2eKg = 0
  } = impact;

  return (
    <div className="page-container animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-600)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <TrendingUp size={18} /> Sustainability Metrics
        </div>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>Verified EcoQuest Impact</h1>
        <p style={{ fontSize: '0.92rem', color: '#64748b', marginTop: '0.25rem' }}>
          Quantified environmental contribution generated from your verified real-world sustainable quest completions.
        </p>
      </div>

      {/* Hero Avoided CO2e Banner */}
      <div className="eco-card-dark animate-fade-in" style={{ padding: '2rem', marginBottom: '1.75rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="pill-badge pill-emerald" style={{ marginBottom: '0.5rem' }}>
              <Leaf size={14} /> Cumulative Carbon Savings
            </span>
            <h2 style={{ fontSize: '2.5rem', color: '#ffffff', lineHeight: 1.1 }}>
              {avoidedCO2eKg} <span style={{ fontSize: '1.2rem', color: 'var(--emerald-neon)' }}>kg CO2e Avoided</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '0.4rem', maxWidth: '520px' }}>
              Estimated greenhouse gas emissions prevented by replacing motorized trips with cycling & transit, saving electricity, and tending plants.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--emerald-neon)', display: 'block', lineHeight: 1 }}>
              {totalActivities}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>
              Verified Sustainable Actions
            </span>
          </div>
        </div>
      </div>

      {/* Impact Breakdown Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="eco-card">
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dcfce7', color: 'var(--emerald-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <Bike size={22} />
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Cycling Distance</span>
          <h3 style={{ fontSize: '1.5rem', color: '#0f172a', margin: '0.2rem 0' }}>{totalCyclingKm} km</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--emerald-700)' }}>Zero-emission travel</span>
        </div>

        <div className="eco-card">
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <Bus size={22} />
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Public Transport</span>
          <h3 style={{ fontSize: '1.5rem', color: '#0f172a', margin: '0.2rem 0' }}>{publicTransportCount} Journeys</h3>
          <span style={{ fontSize: '0.78rem', color: '#0369a1' }}>{publicTransportKm} km traveled via transit</span>
        </div>

        <div className="eco-card">
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <Zap size={22} />
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Electricity Saved</span>
          <h3 style={{ fontSize: '1.5rem', color: '#0f172a', margin: '0.2rem 0' }}>{totalKwhSaved} kWh</h3>
          <span style={{ fontSize: '0.78rem', color: '#b45309' }}>{electricitySubmissions} bills verified</span>
        </div>

        <div className="eco-card">
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ecfdf5', color: 'var(--emerald-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <Sprout size={22} />
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Plant Maintenance</span>
          <h3 style={{ fontSize: '1.5rem', color: '#0f172a', margin: '0.2rem 0' }}>{plantCareCount} Actions</h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--emerald-700)' }}>Real-world plant care</span>
        </div>
      </div>
    </div>
  );
}
