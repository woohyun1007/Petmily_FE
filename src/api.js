import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // Spring Boot 서버 주소
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 서버로 요청을 보내기 직전 실행
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
},
(error) => {
    return Promise.reject(error);
});

// 응답 인터셉터 : 서버로부터 응답을 받은 후, 컴포넌트의 catch문으로 가기 직전 실행
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status == 401) {
            localStorage.removeItem('token');
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;