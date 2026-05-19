// ─────────────────────────────────────────────────────────────────────────────
//  firebase.js  —  CONFIGURACIÓN FIREBASE
//  Reemplaza los valores de firebaseConfig con los de tu proyecto en:
//  https://console.firebase.google.com → Configuración del proyecto → Tus apps
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.warn('Firebase no configurado — modo local activo');
}

export { db };
export const isFirebaseConfigured = firebaseConfig.apiKey !== 'TU_API_KEY';
