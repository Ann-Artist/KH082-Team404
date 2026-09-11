import { request } from './api';

export const carbonApi = {
  getFootprint: (userId) => request(`/carbon/${userId}`),
  calculateFootprint: (userId) =>
    request('/carbon/calculate', {
      method: 'POST',
      body: { userId }
    })
};
