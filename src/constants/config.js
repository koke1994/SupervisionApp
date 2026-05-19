// ═══════════════════════════════════════════════════════════════════════════════
//  config.js  —  CONFIGURACIÓN CENTRAL
//  Solo edita este archivo para personalizar la app.
// ═══════════════════════════════════════════════════════════════════════════════

// ── 1. EMAIL VÍA GOOGLE APPS SCRIPT ──────────────────────────────────────────
//  Igual que en tu HTML (const GAS_URL).
//  Instrucciones en README.md → sección "Configurar Apps Script"
export const GAS_URL = 'PEGA_AQUI_TU_URL_DE_APPS_SCRIPT';

// Destinatario (se define también en el Apps Script, esto es referencia)
export const JEFE_EMAIL   = 'jefe@tuempresa.com';
export const JEFE_NOMBRE  = 'Nombre del Jefe';

// ── 2. GOOGLE DRIVE (para NotebookLM) ─────────────────────────────────────────
export const GOOGLE_CONFIG = {
  ANDROID_CLIENT_ID: 'TU_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  WEB_CLIENT_ID:     'TU_WEB_CLIENT_ID.apps.googleusercontent.com',
  ROOT_FOLDER_NAME:  'Supervisión GCC — NotebookLM',
};

// ── 3. COMPORTAMIENTO DE EMAIL ─────────────────────────────────────────────────
export const EMAIL_CONFIG = {
  AUTO_SEND: true,              // disparar automáticamente al guardar
  RETRY_INTERVAL_MINUTES: 5,   // checar cola cada 5 min
  MAX_RETRIES: 48,
};

// ── 4. PERSISTENCIA ───────────────────────────────────────────────────────────
export const STORAGE_KEY = 'svz_sesion_v1';   // igual que el HTML
