import api from '../api/axios';

export const fetchAppointments = async () => {
  const res = await api.get('/appointments');
  return res.data;
};

export const scheduleAppointment = async (appointment) => {
  const res = await api.post('/appointments', appointment);
  return res.data;
};

export const rescheduleAppointment = async (id, data) => {
  const res = await api.put(`/appointments/${id}/reschedule`, data);
  return res.data;
};

export const fetchReminders = async () => {
  const res = await api.get('/reminder/test-reminder');
  return res.data;
}; 