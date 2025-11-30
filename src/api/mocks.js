import axios from './auth/axiosInstance';

const API_BASE = 'http://localhost:8080/admin/mocks';

export const getAllMocks = async () => {
  const res = await axios.get(API_BASE);
  return res.data;
};

export const getMock = async (id) => {
  const res = await axios.get(`${API_BASE}/${id}`);
  return res.data;
};

export const createMock = async (mock) => {
  const res = await axios.post(API_BASE, mock);
  return res.data;
};

export const updateMock = async (id, mock) => {
  const res = await axios.put(`${API_BASE}/${id}`, mock);
  return res.data;
};

export const deleteMock = async (id) => {
  const res = await axios.delete(`${API_BASE}/${id}`);
  return res.data;
};
