import { request } from './api';

export const questApi = {
  getAllQuests: (userId) => request(`/quests${userId ? `?userId=${userId}` : ''}`),
  getQuest: (questId, userId) => request(`/quests/${questId}${userId ? `?userId=${userId}` : ''}`),
  startQuest: (questId, userId, initialData = {}) =>
    request(`/quests/${questId}/start`, {
      method: 'POST',
      body: { userId, ...initialData }
    })
};
