import { request } from './api';

export const progressionApi = {
  getProgression: (userId) => request(`/progression/${userId}`),
  getDashboard: (userId) => request(`/progression/${userId}/dashboard`),
  getLeaderboard: () => request('/progression/leaderboard')
};
