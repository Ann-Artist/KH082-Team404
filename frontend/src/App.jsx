import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import SetupPage from './pages/SetupPage';
import DashboardPage from './pages/DashboardPage';
import QuestsPage from './pages/QuestsPage';
import QuestDetailPage from './pages/QuestDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import LevelsPage from './pages/LevelsPage';
import ActivityPage from './pages/ActivityPage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import ImpactPage from './pages/ImpactPage';
import RewardsPage from './pages/RewardsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import { profileApi } from './services/profileApi';
import { progressionApi } from './services/progressionApi';

export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [progression, setProgression] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load: User is directed to login/setup page first
    setLoading(false);
  }, []);

  const handleSetupComplete = async (data) => {
    if (data && data.user) {
      setUser(data.user);
      setProgression(data.progression);
      localStorage.setItem('ecoquest_user_id', data.user.id);

      // Fetch fresh progression
      try {
        const progRes = await progressionApi.getProgression(data.user.id);
        if (progRes.data) setProgression(progRes.data);
      } catch (e) {}
    }
  };

  const refreshUserData = async () => {
    if (!user?.id) return;
    try {
      const userRes = await profileApi.getProfile(user.id);
      if (userRes.data) setUser(userRes.data);
      const progRes = await progressionApi.getProgression(user.id);
      if (progRes.data) setProgression(progRes.data);
    } catch (e) {
      console.error('Real-time data refresh failed:', e);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--canvas-bg)' }}>
        <span className="pill-badge pill-emerald animate-spin" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
          Launching EcoQuest...
        </span>
      </div>
    );
  }

  return (
    <Routes>
      {/* Account Login / Registration Setup Route (Default Entry) */}
      <Route path="/setup" element={<SetupPage onSetupComplete={handleSetupComplete} />} />

      {/* Main Application Layout Routes */}
      <Route
        element={
          user ? (
            <MainLayout user={user} progression={progression} />
          ) : (
            <Navigate to="/setup" replace />
          )
        }
      >
        <Route path="/dashboard" element={<DashboardPage userId={user?.id} onRefresh={refreshUserData} />} />
        <Route path="/quests" element={<QuestsPage userId={user?.id} />} />
        <Route path="/quests/:questId" element={<QuestDetailPage userId={user?.id} onRefresh={refreshUserData} />} />
        <Route path="/leaderboard" element={<LeaderboardPage currentUserId={user?.id} />} />
        <Route path="/levels" element={<LevelsPage userId={user?.id} />} />
        <Route path="/activity" element={<ActivityPage userId={user?.id} />} />
        <Route path="/activity/:submissionId" element={<ActivityDetailPage />} />
        <Route path="/impact" element={<ImpactPage userId={user?.id} />} />
        <Route path="/rewards" element={<RewardsPage userId={user?.id} />} />
        <Route
          path="/profile"
          element={
            <ProfilePage
              user={user}
              progression={progression}
              onUserUpdated={(updatedUser) => {
                setUser(updatedUser);
                refreshUserData();
              }}
            />
          }
        />
        <Route path="/settings" element={<SettingsPage onResetSession={() => setUser(null)} />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/setup'} replace />} />
    </Routes>
  );
}
