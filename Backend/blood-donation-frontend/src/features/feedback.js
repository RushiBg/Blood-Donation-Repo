import api from '../api/axios';

export const submitFeedback = async (feedback) => {
  const res = await api.post('/feedback', feedback);
  return res.data;
};

export const fetchFeedback = async () => {
  const res = await api.get('/feedback');
  return res.data;
}; 