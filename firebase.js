// ─────────────────────────────────────────────────────────────────────────────
//  firebase.js  —  CONFIGURACIÓN FIREBASE
//  Reemplaza los valores de firebaseConfig con los de tu proyecto en:
//  https://console.firebase.google.com → Configuración del proyecto → Tus apps
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAfAFN7v1PTGDvChhhVT94b8xpb0VO92oY",
  authDomain: "supervisionappgcc.firebaseapp.com",
  projectId: "supervisionappgcc",
  storageBucket: "supervisionappgcc.firebasestorage.app",
  messagingSenderId: "154008057459",
  appId: "1:154008057459:web:52b375f340abf478d0dc06"
};

let app;
let db;

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('✅ Firebase inicializado correctamente');
  } else {
    console.warn('⚠️ Variables de entorno no encontradas. Firebase operará en modo local.');
  }
} catch (error) {
  console.error('❌ Error al inicializar Firebase:', error);
}

export { db };
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey);
