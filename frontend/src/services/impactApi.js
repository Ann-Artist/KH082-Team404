import { request } from './api';

export const impactApi = {
  getUserImpact: (userId) => request(`/impact/${userId}`)
};
