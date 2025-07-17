import api from '../api/axios';

export const fetchDonors = async () => {
  const res = await api.get('/donors');
  return res.data;
};

export const addDonor = async (donor) => {
  const res = await api.post('/donors', donor);
  return res.data;
};

export const updateDonor = async (id, donor) => {
  const res = await api.put(`/donors/${id}`, donor);
  return res.data;
};

export const deleteDonor = async (id) => {
  const res = await api.delete(`/donors/${id}`);
  return res.data;
}; 