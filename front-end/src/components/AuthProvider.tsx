import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { auth, firebase } from '../firebase';
import axios from '../api/axios';

type BackendUser = {
  id: string;
  firebase_uid?: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  birthday?: string;
  is_active: boolean;
  user_type: string;
  created_at: string;
  last_modified: string;
};

type AuthContextType = {
  user: firebase.User | null;
  backendUser: BackendUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    phone: string,
    birthday: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  fetchBackendUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

const fetchBackendUser = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const token = await currentUser.getIdToken();
    const res = await axios.get('/auth/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setBackendUser(res.data);
  } catch (err) {
    console.error('Backend auth failed:', err);
  }
};


  const login = async (email: string, password: string) => {
    await auth.signInWithEmailAndPassword(email, password);
  };

  const register = async (
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    phone: string,
    birthday: string
  ) => {
    // Step 1: Register in Firebase


    // Step 2: Register in your Django backend
    try {
      await axios.post('/register/', {
        email,
        first_name,
        last_name,
        phone,
        birthday,
        password,
      });

    } catch (err) {
      console.error('Backend registration failed:', err);
      throw err; // So UI can respond appropriately
    }

  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setBackendUser(null);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) await fetchBackendUser();
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, backendUser, loading, isAuthenticated, login, register, logout, fetchBackendUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
