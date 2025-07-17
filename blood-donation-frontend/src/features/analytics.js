import api from '../api/axios';

export const fetchAnalyticsStats = async () => {
  const res = await api.get('/analytics/stats');
  return res.data;
};

export const fetchLeaderboard = async () => {
  const res = await api.get('/donors');
  return (res.data || []).sort((a, b) => (b.donations || 0) - (a.donations || 0));
};

export const fetchAuditLogs = async () => {
  const res = await api.get('/admin/audit-logs');
  return res.data;
};

export const fetchDonationsThisYear = async () => {
  const res = await api.get('/analytics/donations-this-year');
  return res.data;
};

export const fetchAllAppointments = async () => {
  const res = await api.get('/analytics/appointments');
  return res.data;
};

export const fetchAllPayments = async () => {
  const res = await api.get('/analytics/payments');
  return res.data;
}; 