// ═══════════════════════════════════════════════════════════════════════════════
//  networkMonitor.js  —  DETECTOR DE CONECTIVIDAD + PROCESADOR DE COLA
//  Se inicializa al arrancar la app.
//  Cuando vuelve la señal, procesa automáticamente los emails pendientes.
// ═══════════════════════════════════════════════════════════════════════════════
import * as Network from 'expo-network';
import { procesarColaEmails } from './emailService';
import { EMAIL_CONFIG } from '../constants/config';

let retryInterval = null;
let ultimoEstado = null;

// ── Verificar si hay internet ─────────────────────────────────────────────────
export async function hayInternet() {
  try {
    const state = await Network.getNetworkStateAsync();
    return state.isConnected && state.isInternetReachable;
  } catch {
    return false;
  }
}

// ── Iniciar monitor (llamar desde App.js al arrancar) ─────────────────────────
export function iniciarMonitorRed() {
  // Verificar cada N minutos (configurable en config.js)
  const intervaloMs = EMAIL_CONFIG.RETRY_INTERVAL_MINUTES * 60 * 1000;

  retryInterval = setInterval(async () => {
    const conectado = await hayInternet();

    // Si acaba de recuperarse la conexión, procesar cola
    if (conectado && ultimoEstado === false) {
      console.log('[red] Conexión recuperada — procesando cola de emails...');
      try {
        await procesarColaEmails();
      } catch (e) {
        console.warn('[red] Error procesando cola:', e.message);
      }
    }

    ultimoEstado = conectado;
  }, intervaloMs);

  // Verificación inmediata al arrancar
  hayInternet().then(async (conectado) => {
    ultimoEstado = conectado;
    if (conectado) {
      // Al arrancar con internet, procesar cualquier pendiente de sesiones anteriores
      try {
        await procesarColaEmails();
      } catch (e) {
        console.warn('[red] Error en verificación inicial:', e.message);
      }
    }
  });

  return () => {
    if (retryInterval) clearInterval(retryInterval);
  };
}

// ── Detener monitor ───────────────────────────────────────────────────────────
export function detenerMonitorRed() {
  if (retryInterval) {
    clearInterval(retryInterval);
    retryInterval = null;
  }
}
