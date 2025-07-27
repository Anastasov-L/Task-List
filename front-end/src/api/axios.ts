import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '../firebase';

const instance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/users',
});

instance.interceptors.request.use(async (config) => {
  const auth = getAuth(firebaseApp);
  const currentUser = auth.currentUser;

 if (currentUser) {
    const token = await currentUser.getIdToken();
    console.log("Injecting token:", token);
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default instance;
