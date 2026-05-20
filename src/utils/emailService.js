// ═══════════════════════════════════════════════════════════════════════════════
//  emailService.js  —  EMAIL VÍA GOOGLE APPS SCRIPT (igual que el HTML)
//  Usa mode: 'no-cors' exactamente como el original.
//  Si falla → encola en SQLite → reintenta con mensaje de retraso.
// ═══════════════════════════════════════════════════════════════════════════════
import { GAS_URL, JEFE_EMAIL, EMAIL_CONFIG, JEFE_NOMBRE } from '../constants/config';
import { encolarEmail, obtenerEmailsPendientes, actualizarEstadoEmail, obtenerSupervisionPorId } from './localDB';
import { obtenerPdfBase64, generarNombreArchivo } from './pdfGenerator';

// ── Enviar vía GAS (exactamente como el HTML) ─────────────────────────────────
async function enviarPorGAS({ destinatario, asunto, cuerpo, pdfBase64, filename }) {
  if (!GAS_URL || GAS_URL === 'PEGA_AQUI_TU_URL_DE_APPS_SCRIPT') {
    throw new Error('GAS_URL no configurada — edita src/constants/config.js');
  }

  const payload = {
    pdf:        pdfBase64 || '',
    filename:   filename || 'Reporte_Supervision.pdf',
    destinatario: destinatario || JEFE_EMAIL,
    asunto:     asunto,
    cuerpo:     cuerpo,
  };

  // En React Native NO necesitamos 'no-cors' (eso era solo para navegadores web).
  // Quitarlo nos permite ver si Google Apps Script falla o arroja errores de permisos.
  const response = await fetch(GAS_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  const textResponse = await response.text();
  if (!response.ok || textResponse.includes('error')) {
    throw new Error(`Fallo en el servidor de Google: ${textResponse}`);
  }
}

// ── Punto de entrada: enviar o encolar ───────────────────────────────────────
export async function dispararEmailSupervision({ formData, pdfBase64, supervisionId }) {
  if (!EMAIL_CONFIG.AUTO_SEND) return { exito: false, encolado: false };

  // Asegurarnos de tener el PDF codificado para mandarlo al Apps Script
  let finalPdfBase64 = pdfBase64;
  if (!finalPdfBase64 && formData) {
    try {
      finalPdfBase64 = await obtenerPdfBase64(formData);
    } catch (e) {
      console.warn('[email] Error generando PDF base64:', e.message);
    }
  }

  const filename = generarNombreArchivo(formData);
  const empleadoId = filename.split('_')[2] || '--';
  
  const semanaTxt = formData.semana ? ` - Semana ${formData.semana}` : '';
  const asunto = `[Reporte] ${formData.tipoGestion}: ${formData.gestor}${semanaTxt}`;
  const cuerpo = `Hola ${JEFE_NOMBRE || 'Equipo'},

Se ha concluido una nueva sesión de ${formData.tipoGestion.toLowerCase()}. Adjunto a este correo encontrarás el documento detallado en PDF.

Resumen Operativo:
• Gestor: ${formData.gestor} (No. Emp: ${empleadoId})
• Líder: ${formData.lider}
• Gerencia: ${formData.gerencia}
• Calificación GIC: ${String(formData.clasificacionGIC).toUpperCase()}
• Alcance: ${formData.alcance}%
• Cobrado: $${formData.cobrado}

Saludos cordiales,
App Supervisión GCC`;

  try {
    await enviarPorGAS({
      destinatario: JEFE_EMAIL,
      asunto,
      cuerpo,
      pdfBase64: finalPdfBase64 || '',
      filename
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
      pdfBase64: finalPdfBase64 || '',
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
      let finalPdfBase64 = item.pdf_base64;
      
      let filename = `Supervision_Diferida.pdf`;
      let asunto = `[Diferido] Reporte de Supervisión - ${fecha}`;
      let cuerpo = `Este reporte fue generado offline y se sincronizó al restablecer la conexión.\n\nGestor: ${gestor}\nLíder: ${lider}\nFecha: ${fecha}`;

      try {
        const completo = await obtenerSupervisionPorId(item.supervision_id);
        if (completo) { 
          filename = generarNombreArchivo(completo);
          const semTxt = completo.semana ? ` - Semana ${completo.semana}` : '';
          asunto = `[Diferido] Reporte de ${completo.tipoGestion}: ${completo.gestor}${semTxt}`;
          cuerpo = `Hola ${JEFE_NOMBRE || 'Equipo'},\n\nEste reporte fue generado previamente sin conexión y se ha sincronizado ahora.\n\nResumen:\n• Gestor: ${completo.gestor}\n• Gerencia: ${completo.gerencia}\n• Alcance: ${completo.alcance}%\n• Cobrado: $${completo.cobrado}\n\nAdjunto el PDF detallado.\n\nSaludos,\nApp Supervisión GCC`;
          
          if (!finalPdfBase64) {
             finalPdfBase64 = await obtenerPdfBase64(completo);
          }
        }
      } catch (_) {}

      await enviarPorGAS({
        destinatario: JEFE_EMAIL,
        asunto,
        cuerpo,
        pdfBase64:   finalPdfBase64 || '',
        filename
      });
      await actualizarEstadoEmail(item.id, 'enviado', item.intentos + 1);
    } catch (err) {
      await actualizarEstadoEmail(item.id, 'pendiente', item.intentos + 1);
    }
  }
}
