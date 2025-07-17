import api from '../api/axios';

export const fetchRequests = async () => {
  const res = await api.get('/requests');
  return res.data;
};

export const createRequest = async (request) => {
  const res = await api.post('/requests', request);
  return res.data;
};

export const updateRequest = async (id, data) => {
  const res = await api.put(`/requests/${id}`, data);
  return res.data;
};

export const deleteRequest = async (id) => {
  const res = await api.delete(`/requests/${id}`);
  return res.data;
}; 