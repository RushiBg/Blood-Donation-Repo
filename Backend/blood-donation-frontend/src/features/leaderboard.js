import api from '../api/axios';

export const fetchLeaderboard = async () => {
  const res = await api.get('/donors');
  return (res.data || []).sort((a, b) => (b.donations || 0) - (a.donations || 0));
}; 