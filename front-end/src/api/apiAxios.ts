// apiAxios.ts
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '../firebase';

const apiAxios = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

apiAxios.interceptors.request.use(async (config) => {
  const auth = getAuth(firebaseApp);
  const currentUser = auth.currentUser;

  if (currentUser) {
    const token = await currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiAxios;
