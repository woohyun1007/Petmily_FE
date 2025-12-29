import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // Spring Boot 서버 주소
});

// 요청 인터셉터: 로컬 스토리지에서 토큰을 꺼내 헤더에 넣음
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;