// ═══════════════════════════════════════════════════════════════════════════════
//  googleDriveService.js  —  INTEGRACIÓN GOOGLE DRIVE
//  Sube el .md del gestor a una carpeta estructurada en Drive.
//  Esa carpeta se conecta manualmente a NotebookLM como fuente.
// ═══════════════════════════════════════════════════════════════════════════════
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_CONFIG } from '../constants/config';
import {
  guardarGoogleToken,
  obtenerGoogleToken,
  actualizarRootFolder,
} from './localDB';

WebBrowser.maybeCompleteAuthSession();

const DRIVE_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD = 'https://www.googleapis.com/upload/drive/v3';

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email',
];

// ── Obtener token válido desde SQLite ─────────────────────────────────────────
export async function obtenerTokenValido() {
  const token = await obtenerGoogleToken();
  if (!token) return null;
  if (token.isExpired) {
    // Token expirado — el usuario debe volver a autenticar
    return null;
  }
  return token.access_token;
}

// ── Guardar token tras autenticación ─────────────────────────────────────────
export async function procesarRespuestaAuth(response) {
  if (response?.type !== 'success') return false;

  const { authentication } = response;
  if (!authentication?.accessToken) return false;

  await guardarGoogleToken(
    authentication.accessToken,
    authentication.refreshToken || '',
    authentication.expiresIn || 3600,
    null
  );

  // Guardar también en AsyncStorage para acceso rápido
  await AsyncStorage.setItem('@google_access_token', authentication.accessToken);
  return true;
}

// ── Verificar si ya está autenticado ─────────────────────────────────────────
export async function estaAutenticado() {
  const token = await obtenerTokenValido();
  return !!token;
}

// ── Crear carpeta en Drive ────────────────────────────────────────────────────
async function crearCarpeta(accessToken, nombre, parentId = null) {
  const metadata = {
    name: nombre,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentId ? { parents: [parentId] } : {}),
  };

  const res = await fetch(`${DRIVE_BASE}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!res.ok) throw new Error(`Drive error crear carpeta: ${res.status}`);
  return res.json();
}

// ── Buscar carpeta por nombre ─────────────────────────────────────────────────
async function buscarCarpeta(accessToken, nombre, parentId = null) {
  const q = parentId
    ? `name='${nombre}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
    : `name='${nombre}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

  const res = await fetch(`${DRIVE_BASE}/files?q=${encodeURIComponent(q)}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Drive error buscar: ${res.status}`);
  const data = await res.json();
  return data.files?.[0] || null;
}

// ── Obtener o crear carpeta (idempotente) ─────────────────────────────────────
async function obtenerOCrearCarpeta(accessToken, nombre, parentId = null) {
  const existente = await buscarCarpeta(accessToken, nombre, parentId);
  if (existente) return existente.id;
  const nueva = await crearCarpeta(accessToken, nombre, parentId);
  return nueva.id;
}

// ── Subir o actualizar archivo de texto ───────────────────────────────────────
async function subirArchivo(accessToken, folderId, filename, contenido, mimeType = 'text/markdown') {
  // Buscar si ya existe (para actualizar en vez de duplicar)
  const q = `name='${filename}' and '${folderId}' in parents and trashed=false`;
  const busqueda = await fetch(`${DRIVE_BASE}/files?q=${encodeURIComponent(q)}&fields=files(id)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const busquedaData = await busqueda.json();
  const existeId = busquedaData.files?.[0]?.id;

  if (existeId) {
    // PATCH: actualizar contenido del archivo existente
    const res = await fetch(`${DRIVE_UPLOAD}/files/${existeId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': mimeType,
      },
      body: contenido,
    });
    if (!res.ok) throw new Error(`Drive error actualizar: ${res.status}`);
    return res.json();
  } else {
    // POST multipart: nuevo archivo
    const boundary = '-------supervision_gcc_boundary';
    const metadata = JSON.stringify({ name: filename, parents: [folderId] });
    const body = [
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      metadata,
      `--${boundary}`,
      `Content-Type: ${mimeType}`,
      '',
      contenido,
      `--${boundary}--`,
    ].join('\r\n');

    const res = await fetch(`${DRIVE_UPLOAD}/files?uploadType=multipart&fields=id,name,webViewLink`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    });
    if (!res.ok) throw new Error(`Drive error subir: ${res.status}`);
    return res.json();
  }
}

// ── FUNCIÓN PRINCIPAL: subir historial del gestor a Drive ─────────────────────
export async function subirHistorialATDrive(gestor, gerencia, contenidoMd) {
  const accessToken = await obtenerTokenValido();
  if (!accessToken) {
    throw new Error('No autenticado con Google — ve a Configuración → Conectar Google Drive');
  }

  // Estructura: Supervisión GCC (root) / [Gestor] / historial_completo.md
  const tokenRow = await obtenerGoogleToken();
  let rootId = tokenRow?.root_folder_id;

  if (!rootId) {
    rootId = await obtenerOCrearCarpeta(accessToken, GOOGLE_CONFIG.ROOT_FOLDER_NAME);
    await actualizarRootFolder(rootId);
  }

  // Carpeta del gestor
  const gestorSafe = gestor.replace(/[^a-zA-Z0-9 ÁÉÍÓÚáéíóúÑñ]/g, '_');
  const gestorFolderId = await obtenerOCrearCarpeta(accessToken, gestorSafe, rootId);

  // Subir/actualizar archivo de historial completo
  const filename = `historial_${gestorSafe.replace(/\s/g, '_')}.md`;
  const resultado = await subirArchivo(accessToken, gestorFolderId, filename, contenidoMd);

  return {
    fileId: resultado.id,
    fileName: resultado.name,
    webViewLink: resultado.webViewLink,
    rootFolderId: rootId,
    gestorFolderId,
  };
}

// ── URL de la carpeta raíz en Drive ──────────────────────────────────────────
export function buildDriveFolderUrl(folderId) {
  return `https://drive.google.com/drive/folders/${folderId}`;
}
