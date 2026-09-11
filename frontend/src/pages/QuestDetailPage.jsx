import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuestStep from '../components/QuestStep';
import ProofUploader from '../components/ProofUploader';
import GeoCapture from '../components/GeoCapture';
import QuestCompleteModal from '../components/QuestCompleteModal';
import LevelUpModal from '../components/LevelUpModal';
import { questApi } from '../services/questApi';
import { submissionApi } from '../services/submissionApi';
import { Bus, Bike, Zap, Sprout, ArrowRight, ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react';
import '../styles/index.css';

const questIcons = {
  public_transport: Bus,
  cycling: Bike,
  electricity: Zap,
  plant_care: Sprout
};

export default function QuestDetailPage({ userId, onRefresh }) {
  const { questId } = useParams();
  const navigate = useNavigate();

  const [quest, setQuest] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  // Quest-specific form state
  const [source, setSource] = useState('Pune Station');
  const [destination, setDestination] = useState('Deccan Gymkhana');
  const [distanceKm, setDistanceKm] = useState('6.5');
  const [billingMonth, setBillingMonth] = useState('October 2026');
  const [kwhConsumed, setKwhConsumed] = useState('135');
  const [billAmount, setBillAmount] = useState('1080');

  // Proof files & Geo location
  const [startFile, setStartFile] = useState(null);
  const [endFile, setEndFile] = useState(null);
  const [billFile, setBillFile] = useState(null);
  const [plantFile, setPlantFile] = useState(null);
  const [geoData, setGeoData] = useState(null);

  // Victory Modals state
  const [completionResult, setCompletionResult] = useState(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);

  useEffect(() => {
    loadQuestData();
  }, [questId, userId]);

  const loadQuestData = async () => {
    try {
      setLoading(true);
      const res = await questApi.getQuest(questId, userId);
      setQuest(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load quest details');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setError('');
    } else {
      navigate('/quests');
    }
  };

  const handleStartMission = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await questApi.startQuest(questId, userId, { source, destination });
      setSubmission(res.data);
      setCurrentStep(1);
    } catch (err) {
      setError(err.message || 'Failed to start quest mission');
    } finally {
      setLoading(false);
    }
  };

  const handleAttachProofAndContinue = async (proofType, file, nextStepIdx) => {
    if (!submission) return;
    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('type', proofType);
      if (geoData) {
        formData.append('latitude', geoData.latitude);
        formData.append('longitude', geoData.longitude);
      }

      const updatedSub = await submissionApi.uploadProof(submission.id, formData);
      setSubmission(updatedSub.data);
      setCurrentStep(nextStepIdx);
    } catch (err) {
      setError(err.message || 'Failed to attach proof');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteVerification = async () => {
    if (!submission) return;
    try {
      setVerifying(true);
      setError('');

      const extraData = {
        source,
        destination,
        distanceKm: parseFloat(distanceKm || 5.0),
        billingMonth,
        kwhConsumed: parseFloat(kwhConsumed || 140),
        billAmount: parseFloat(billAmount || 1120)
      };

      const res = await submissionApi.verifySubmission(submission.id, extraData);

      if (res.data.verificationStatus === 'REJECTED') {
        setError(res.message || 'Verification rejected. Please check proof image and try again.');
        setVerifying(false);
        return;
      }

      // Refresh global app data in real-time
      if (onRefresh) {
        onRefresh();
      }

      // Check level up celebration
      if (res.data.levelUp) {
        setLevelUpData(res.data.currentLevel);
        setShowLevelUpModal(true);
      }

      setCompletionResult(res.data);
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading && !quest) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <span className="pill-badge pill-blue animate-spin" style={{ padding: '0.75rem 1.5rem' }}>
          Loading Quest Engine...
        </span>
      </div>
    );
  }

  if (error && !quest) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: '#ef4444' }}>{error}</p>
        <button className="btn-emerald" style={{ marginTop: '1rem' }} onClick={() => navigate('/quests')}>
          Return to Quests
        </button>
      </div>
    );
  }

  const Icon = questIcons[quest?.quest_key] || Sprout;

  // Define steps per quest type
  let steps = [
    { title: 'Start Mission' },
    { title: 'Action & Proof' },
    { title: 'Verification' }
  ];

  if (quest?.quest_key === 'public_transport') {
    steps = [
      { title: 'Route Details' },
      { title: 'Start Geo Proof' },
      { title: 'Destination Proof' },
      { title: 'Verification' }
    ];
  } else if (quest?.quest_key === 'cycling') {
    steps = [
      { title: 'Bicycle Start Proof' },
      { title: 'Finish Proof & Distance' },
      { title: 'AI Consistency Check' }
    ];
  }

  return (
    <div className="page-container animate-fade-in">
      {/* Victory Modals */}
      {showLevelUpModal && (
        <LevelUpModal
          levelInfo={levelUpData}
          onClose={() => setShowLevelUpModal(false)}
        />
      )}

      {completionResult && !showLevelUpModal && (
        <QuestCompleteModal
          result={completionResult}
          onClose={() => setCompletionResult(null)}
        />
      )}

      <div className="eco-card" style={{ maxWidth: '780px', margin: '0 auto', padding: '2.5rem', position: 'relative' }}>
        {/* Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button
            onClick={handleGoBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#f1f5f9',
              color: '#334155',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#e2e8f0')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#f1f5f9')}
          >
            <ArrowLeft size={16} />
            {currentStep > 0 ? 'Back to Previous Step' : 'Back to Quests'}
          </button>
        </div>

        {/* Mission Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className={`quest-icon-wrapper ${quest.category}`} style={{ width: '56px', height: '56px' }}>
            <Icon size={30} />
          </div>
          <div>
            <span className="pill-badge pill-emerald">+{quest.base_reward} EcoXP Reward</span>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a', margin: '0.2rem 0' }}>{quest.name}</h1>
            <p style={{ fontSize: '0.88rem', color: '#64748b' }}>{quest.description}</p>
          </div>
        </div>

        <QuestStep steps={steps} currentStepIndex={currentStep} />

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.85rem 1.1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{error}</span>
            {currentStep > 0 && (
              <button
                onClick={handleGoBack}
                style={{ background: '#991b1b', color: '#ffffff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Go Back & Re-upload
              </button>
            )}
          </div>
        )}

        {/* Dynamic Workflow render based on Quest Key & Step */}
        {quest.quest_key === 'public_transport' && (
          <div>
            {currentStep === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Enter Journey Route</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', fontSize: '0.88rem', marginBottom: '0.3rem' }}>Starting Location</label>
                    <input type="text" value={source} onChange={(e) => setSource(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', fontSize: '0.88rem', marginBottom: '0.3rem' }}>Destination Location</label>
                    <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>

                <button className="btn-emerald" style={{ marginTop: '1rem' }} onClick={handleStartMission}>
                  Start Transit Journey <ArrowRight size={18} />
                </button>
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Step 1: Board Transit & Take Start Photo</h3>
                <ProofUploader label="Take photo at starting station/bus stop" onFileSelect={setStartFile} />
                <GeoCapture onLocationCaptured={setGeoData} />
                <button
                  className="btn-emerald"
                  style={{ marginTop: '1.5rem', width: '100%' }}
                  onClick={() => {
                    if (!startFile) {
                      setError('Please select a starting station proof photo before continuing.');
                      return;
                    }
                    handleAttachProofAndContinue('START_PROOF', startFile, 2);
                  }}
                >
                  Confirm Boarding & Continue Journey <ArrowRight size={18} />
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Step 2: Destination Arrival Photo</h3>
                <ProofUploader label="Take photo upon reaching destination" onFileSelect={setEndFile} />
                <GeoCapture onLocationCaptured={setGeoData} />
                <button
                  className="btn-emerald"
                  style={{ marginTop: '1.5rem', width: '100%' }}
                  onClick={() => {
                    if (!endFile) {
                      setError('Please select a destination proof photo before continuing.');
                      return;
                    }
                    handleAttachProofAndContinue('END_PROOF', endFile, 3);
                  }}
                >
                  Submit Final Proof & Verify <ArrowRight size={18} />
                </button>
              </div>
            )}

            {currentStep === 3 && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Verifying Public Transport Journey</h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
                  Evaluating timestamp, route progression, and geo-tagged proof data...
                </p>
                <button className="btn-emerald" style={{ padding: '0.85rem 2rem' }} onClick={handleExecuteVerification} disabled={verifying}>
                  {verifying ? <RefreshCw size={20} className="animate-spin" /> : 'Run Verification & Claim EcoXP'}
                </button>
              </div>
            )}
          </div>
        )}

        {quest.quest_key === 'cycling' && (
          <div>
            {currentStep === 0 && (
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Step 1: Start Cycling Photo</h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1rem' }}>
                  Take a geo-tagged photo clearly containing your bicycle before commencing your ride.
                </p>
                <ProofUploader label="Start Photo (Bicycle visible)" onFileSelect={setStartFile} />
                <GeoCapture onLocationCaptured={setGeoData} />
                <button className="btn-emerald" style={{ marginTop: '1.5rem', width: '100%' }} onClick={async () => {
                  if (!startFile) {
                    setError('Please select a start bicycle proof photo before continuing.');
                    return;
                  }
                  await handleStartMission();
                  await handleAttachProofAndContinue('START_PROOF', startFile, 1);
                }}>
                  Start Ride <ArrowRight size={18} />
                </button>
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Step 2: Finish Ride & Distance Record</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: 600, display: 'block', fontSize: '0.88rem', marginBottom: '0.3rem' }}>Distance Cycled (km)</label>
                  <input type="number" step="0.1" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }} />
                </div>
                <ProofUploader label="Finish Photo (Same bicycle visible)" onFileSelect={setEndFile} />
                <button className="btn-emerald" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => {
                  if (!endFile) {
                    setError('Please select a finish bicycle proof photo before continuing.');
                    return;
                  }
                  handleAttachProofAndContinue('END_PROOF', endFile, 2);
                }}>
                  Submit Ride & Verify Consistency <ArrowRight size={18} />
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>AI Bicycle Consistency Verification</h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
                  Comparing start and finish proof photos for bicycle visual likelihood...
                </p>
                <button className="btn-emerald" style={{ padding: '0.85rem 2rem' }} onClick={handleExecuteVerification} disabled={verifying}>
                  {verifying ? <RefreshCw size={20} className="animate-spin" /> : 'Execute AI Verification & Claim EcoXP'}
                </button>
              </div>
            )}
          </div>
        )}

        {quest.quest_key === 'electricity' && (
          <div>
            {currentStep === 0 && (
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Upload Monthly Electricity Bill</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', fontSize: '0.88rem', marginBottom: '0.3rem' }}>Billing Month</label>
                    <input type="text" value={billingMonth} onChange={(e) => setBillingMonth(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, display: 'block', fontSize: '0.88rem', marginBottom: '0.3rem' }}>kWh Consumed</label>
                    <input type="number" value={kwhConsumed} onChange={(e) => setKwhConsumed(e.target.value)} style={{ width: '100%', padding: '0.7rem', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }} />
                  </div>
                </div>
                <ProofUploader label="Upload Electricity Bill Document/Photo" onFileSelect={setBillFile} />
                <button className="btn-emerald" style={{ marginTop: '1.5rem', width: '100%' }} onClick={async () => {
                  if (!billFile) {
                    setError('Please select an electricity bill image file before proceeding.');
                    return;
                  }
                  await handleStartMission();
                  await handleAttachProofAndContinue('BILL_PROOF', billFile, 1);
                }}>
                  Submit Bill for OCR Verification <ArrowRight size={18} />
                </button>
              </div>
            )}

            {currentStep === 1 && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Verifying Electricity Bill</h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
                  Checking billing period uniqueness and calculating energy reduction savings...
                </p>
                <button className="btn-emerald" style={{ padding: '0.85rem 2rem' }} onClick={handleExecuteVerification} disabled={verifying}>
                  {verifying ? <RefreshCw size={20} className="animate-spin" /> : 'Verify & Calculate Reward'}
                </button>
              </div>
            )}
          </div>
        )}

        {quest.quest_key === 'plant_care' && (
          <div>
            {currentStep === 0 && (
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Plant Care Action Photo</h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1rem' }}>
                  Take a photo of yourself watering, planting, or tending to real-world plants.
                </p>
                <ProofUploader label="Photo Proof of Plant Care Action" onFileSelect={setPlantFile} />
                <GeoCapture onLocationCaptured={setGeoData} />
                <button className="btn-emerald" style={{ marginTop: '1.5rem', width: '100%' }} onClick={async () => {
                  if (!plantFile) {
                    setError('Please select a plant care proof photo before proceeding.');
                    return;
                  }
                  await handleStartMission();
                  await handleAttachProofAndContinue('PROOF', plantFile, 1);
                }}>
                  Submit Plant Care Proof <ArrowRight size={18} />
                </button>
              </div>
            )}

            {currentStep === 1 && (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Verifying Plant Care Action</h3>
                <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
                  Evaluating photo proof, plant detection, and cooldown window...
                </p>
                <button className="btn-emerald" style={{ padding: '0.85rem 2rem' }} onClick={handleExecuteVerification} disabled={verifying}>
                  {verifying ? <RefreshCw size={20} className="animate-spin" /> : 'Verify & Claim +25 EcoXP'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

