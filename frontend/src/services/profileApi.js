import { request } from './api';

export const profileApi = {
  getDemoUser: () => request('/profile/demo-user'),
  setupProfile: (userData, lifestyleData) =>
    request('/profile/setup', {
      method: 'POST',
      body: { user: userData, lifestyle: lifestyleData }
    }),
  getProfile: (userId) => request(`/profile/${userId}`),
  updateProfile: (userId, userData, lifestyleData) =>
    request(`/profile/${userId}`, {
      method: 'PUT',
      body: { user: userData, lifestyle: lifestyleData }
    }),
  updateAvatar: (userId, avatar_id) =>
    request(`/profile/${userId}/avatar`, {
      method: 'PUT',
      body: { avatar_id }
    })
};
