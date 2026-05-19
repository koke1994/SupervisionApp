// ═══════════════════════════════════════════════════════════════════════════════
//  emailService.js  —  EMAIL VÍA GOOGLE APPS SCRIPT (igual que el HTML)
//  Usa mode: 'no-cors' exactamente como el original.
//  Si falla → encola en SQLite → reintenta con mensaje de retraso.
// ═══════════════════════════════════════════════════════════════════════════════
import { GAS_URL, EMAIL_CONFIG } from '../constants/config';
import { encolarEmail, obtenerEmailsPendientes, actualizarEstadoEmail, obtenerSupervisionPorId } from './localDB';

// ── Enviar vía GAS (exactamente como el HTML) ─────────────────────────────────
async function enviarPorGAS({ gestor, lider, semana, fecha, pdfBase64, filename, esReintento = false }) {
  if (!GAS_URL || GAS_URL === 'PEGA_AQUI_TU_URL_DE_APPS_SCRIPT') {
    throw new Error('GAS_URL no configurada — edita src/constants/config.js');
  }

  const payload = {
    pdf:        pdfBase64 || '',
    filename:   filename || `Supervision_${(gestor||'GCC').replace(/ /g,'_')}_S${semana||'--'}.pdf`,
    gestor:     gestor   || 'Sin nombre',
    lider:      lider    || 'Sin líder',
    semana:     semana   || '--',
    fecha:      fecha    || '--',
    esReintento,
    // Si es reintento, el Apps Script lo detecta y agrega la nota de demora al email
  };

  // no-cors = exactamente igual que el HTML original
  await fetch(GAS_URL, {
    method:  'POST',
    mode:    'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
  // no-cors devuelve response opaca → no podemos leer el body, pero si no lanza = OK
}

// ── Punto de entrada: enviar o encolar ───────────────────────────────────────
export async function dispararEmailSupervision({ formData, pdfBase64, supervisionId }) {
  if (!EMAIL_CONFIG.AUTO_SEND) return { exito: false, encolado: false };

  try {
    await enviarPorGAS({
      gestor:    formData.gestor,
      lider:     formData.lider,
      semana:    formData.semana,
      fecha:     formData.fecha,
      pdfBase64: pdfBase64 || '',
      filename:  `Supervision_${(formData.gestor||'GCC').replace(/ /g,'_')}_S${formData.semana||'--'}.pdf`,
      esReintento: false,
    });
    console.log('[email] Enviado vía Apps Script.');
    return { exito: true, encolado: false };
  } catch (err) {
    console.warn('[email] Fallo, encolando:', err.message);
    await encolarEmail({
      supervisionId,
      lider:     formData.lider,
      gestor:    formData.gestor,
      semana:    formData.semana,
      fecha:     formData.fecha,
      pdfBase64: pdfBase64 || '',
    });
    return { exito: false, encolado: true };
  }
}

// ── Procesar cola cuando vuelve la conexión ───────────────────────────────────
export async function procesarColaEmails() {
  const pendientes = await obtenerEmailsPendientes();
  if (!pendientes.length) return;

  for (const item of pendientes) {
    if (item.intentos >= EMAIL_CONFIG.MAX_RETRIES) {
      await actualizarEstadoEmail(item.id, 'fallido_definitivo', item.intentos);
      continue;
    }
    try {
      // Recuperar datos completos si están en SQLite
      let gestor = item.gestor, lider = item.lider, semana = item.semana || '', fecha = item.fecha;
      try {
        const completo = await obtenerSupervisionPorId(item.supervision_id);
        if (completo) { gestor = completo.gestor; lider = completo.lider; semana = completo.semana; fecha = completo.fecha; }
      } catch (_) {}

      await enviarPorGAS({
        gestor, lider, semana, fecha,
        pdfBase64:   item.pdf_base64 || '',
        esReintento: true,
      });
      await actualizarEstadoEmail(item.id, 'enviado', item.intentos + 1);
    } catch (err) {
      await actualizarEstadoEmail(item.id, 'pendiente', item.intentos + 1);
    }
  }
}
