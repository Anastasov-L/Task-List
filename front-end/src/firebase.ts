import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCLh3rrHVAyuofBgPC8-5lgzTccsffwGYM',
  authDomain: 'cation-62ed9.firebaseapp.com',
  projectId: 'cation-62ed9',
  storageBucket: 'cation-62ed9.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_ID',
  appId: '1:523356758295:web:1f619252b7f650ed919752'
};

const firebaseApp = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

const auth = firebase.auth();

export { auth, firebase, firebaseApp };