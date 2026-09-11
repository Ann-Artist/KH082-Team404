import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VerificationStatus from '../components/VerificationStatus';
import { submissionApi } from '../services/submissionApi';
import { ArrowLeft, MapPin, Calendar, Award, CheckCircle, ShieldCheck } from 'lucide-react';
import '../styles/index.css';

export default function ActivityDetailPage() {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSubmissionDetail();
  }, [submissionId]);

  const loadSubmissionDetail = async () => {
    try {
      setLoading(true);
      const res = await submissionApi.getSubmission(submissionId);
      setSubmission(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load submission details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <span className="pill-badge pill-blue animate-spin" style={{ padding: '0.75rem 1.5rem' }}>
          Loading Submission Record #{submissionId}...
        </span>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: '#ef4444' }}>{error || 'Submission record not found.'}</p>
        <button className="btn-emerald" style={{ marginTop: '1rem' }} onClick={() => navigate('/activity')}>
          Back to Activity Ledger
        </button>
      </div>
    );
  }

  const { quest_name, status, verification_status, reward_points, created_at, proofs, result } = submission;
  const calcData = result?.calculation_data || {};
  const verifiedData = calcData.verifiedData || {};

  return (
    <div className="page-container animate-fade-in">
      <button className="btn-secondary" style={{ marginBottom: '1.5rem', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }} onClick={() => navigate('/activity')}>
        <ArrowLeft size={16} /> Back to Activity History
      </button>

      <div className="eco-card" style={{ maxWidth: '780px', margin: '0 auto', padding: '2.5rem' }}>
        {/* Record Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>{quest_name}</h1>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Attempt #{submission.attempt_number || 1}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={15} /> {new Date(created_at).toLocaleString()}
              </span>
              <VerificationStatus status={verification_status} />
            </div>
          </div>

          {verification_status === 'VERIFIED' && (
            <div className="pill-badge pill-emerald" style={{ fontSize: '1.1rem', padding: '0.5rem 1.25rem' }}>
              <Award size={18} /> +{reward_points} EcoXP
            </div>
          )}
        </div>

        {/* Verification Summary */}
        <div style={{ background: '#f8faf8', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={18} style={{ color: 'var(--emerald-600)' }} /> Verification Summary
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.88rem' }}>
            {verifiedData.distanceKm && (
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Verified Distance</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{verifiedData.distanceKm} km</span>
              </div>
            )}
            {verifiedData.source && (
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Route</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{verifiedData.source} ➔ {verifiedData.destination}</span>
              </div>
            )}
            {verifiedData.billingMonth && (
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Billing Month</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{verifiedData.billingMonth}</span>
              </div>
            )}
            {verifiedData.kwhConsumed && (
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Verified Energy</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{verifiedData.kwhConsumed} kWh</span>
              </div>
            )}
          </div>

          {calcData.reasons && calcData.reasons.length > 0 && (
            <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#334155' }}>
              <strong>Verification Notes:</strong> {calcData.reasons.join(' ')}
            </div>
          )}
        </div>

        {/* Proof Images & Geolocation Attachments */}
        {proofs && proofs.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.75rem' }}>Submitted Proof Images</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {proofs.map((proof) => (
                <div key={proof.id} style={{ border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '0.75rem', background: '#ffffff' }}>
                  {proof.file_path ? (
                    <img src={proof.file_path} alt={proof.type} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                  ) : (
                    <div style={{ height: '140px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                      No Image File
                    </div>
                  )}

                  <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: '#64748b' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>{proof.type}</span>
                    {proof.latitude && proof.longitude && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--emerald-700)', marginTop: '0.2rem' }}>
                        <MapPin size={12} /> {proof.latitude.toFixed(4)}, {proof.longitude.toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
