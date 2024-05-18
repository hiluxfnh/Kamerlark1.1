// firebase.js
import { initializeApp ,getApp,getApps} from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBwTX1giyCj1Xtj7A6VW1Lb19tbiiAmm2A",
  authDomain: "kamerlark1.firebaseapp.com",
  databaseURL: "https://kamerlark1-default-rtdb.firebaseio.com",
  projectId: "kamerlark1",
  storageBucket: "kamerlark1.appspot.com",
  messagingSenderId: "342771663259",
  appId: "1:342771663259:web:6f71b1e03ea003e089213e",
  measurementId: "G-F59CGZN0Q4"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
export {app, auth}

