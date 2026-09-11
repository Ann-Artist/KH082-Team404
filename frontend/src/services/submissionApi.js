import { request } from './api';

export const submissionApi = {
  getSubmission: (submissionId) => request(`/submissions/${submissionId}`),
  getUserSubmissions: (userId) => request(`/submissions/user/${userId}`),
  uploadProof: (submissionId, formData) =>
    request(`/submissions/${submissionId}/proof`, {
      method: 'POST',
      body: formData,
      isFormData: true
    }),
  verifySubmission: (submissionId, extraData = {}) =>
    request(`/submissions/${submissionId}/verify`, {
      method: 'POST',
      body: extraData
    })
};
