import React, { useState } from 'react';
import { MapPin, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import '../styles/components.css';

export default function GeoCapture({ onLocationCaptured, required = true }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      // Fallback for demo
      useDemoLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: Math.round(pos.coords.latitude * 10000) / 10000,
          longitude: Math.round(pos.coords.longitude * 10000) / 10000,
          timestamp: new Date().toISOString()
        };
        setLocation(coords);
        setLoading(false);
        if (onLocationCaptured) onLocationCaptured(coords);
      },
      (err) => {
        console.warn('Browser geolocation denied or unavailable, using Pune demo location:', err.message);
        useDemoLocation();
      },
      { timeout: 8000 }
    );
  };

  const useDemoLocation = () => {
    // Demo location Pune coordinates (18.5204 N, 73.8567 E) with minor jitter
    const coords = {
      latitude: 18.5204 + (Math.random() - 0.5) * 0.02,
      longitude: 73.8567 + (Math.random() - 0.5) * 0.02,
      timestamp: new Date().toISOString(),
      isDemo: true
    };
    setLocation(coords);
    setLoading(false);
    if (onLocationCaptured) onLocationCaptured(coords);
  };

  return (
    <div style={{ marginTop: '1rem', background: '#f8faf8', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: location ? 'var(--emerald-100)' : '#e2e8f0',
              color: location ? 'var(--emerald-600)' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <MapPin size={20} />
          </div>

          <div>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>
              Geo-Tag Verification
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {location
                ? `Lat: ${location.latitude.toFixed(4)}, Long: ${location.longitude.toFixed(4)}`
                : 'Capture real-time location proof'}
            </span>
          </div>
        </div>

        <button
          type="button"
          className={location ? 'btn-secondary' : 'btn-emerald'}
          style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
          onClick={requestLocation}
          disabled={loading}
        >
          {loading ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : location ? (
            <>
              <CheckCircle size={14} style={{ color: 'var(--emerald-600)' }} /> Captured
            </>
          ) : (
            'Capture Geo Tag'
          )}
        </button>
      </div>

      {location && location.isDemo && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
          <AlertTriangle size={12} style={{ color: '#f59e0b' }} />
          <span>Demo Geolocation Tagged (Pune Region)</span>
        </div>
      )}
    </div>
  );
}
