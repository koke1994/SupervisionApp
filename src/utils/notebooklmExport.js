// ═══════════════════════════════════════════════════════════════════════════════
//  notebooklmExport.js  —  GENERADOR DE DOCUMENTOS PARA NOTEBOOKLM
//  Produce archivos .md muy estructurados con todo el historial de un gestor.
//  NotebookLM los usa como fuente para análisis conversacional con IA.
// ═══════════════════════════════════════════════════════════════════════════════
import { obtenerHistorialGestor } from './localDB';

// ── Calcular tendencia de alcance ─────────────────────────────────────────────
function calcularTendencia(sesiones) {
  if (sesiones.length < 2) return 'Sin datos suficientes';
  const recientes = sesiones.slice(0, Math.min(4, sesiones.length));
  const primeras = sesiones.slice(-Math.min(4, sesiones.length));
  const promedioReciente = recientes.reduce((s, r) => s + (r.alcance || 0), 0) / recientes.length;
  const promedioAnterior = primeras.reduce((s, r) => s + (r.alcance || 0), 0) / primeras.length;
  const delta = promedioReciente - promedioAnterior;
  if (delta > 5) return `📈 Tendencia POSITIVA (+${delta.toFixed(1)}pp vs período anterior)`;
  if (delta < -5) return `📉 Tendencia NEGATIVA (${delta.toFixed(1)}pp vs período anterior)`;
  return `➡ Tendencia ESTABLE (${delta > 0 ? '+' : ''}${delta.toFixed(1)}pp)`;
}

function clasificarAlcance(alcance) {
  const v = parseFloat(alcance) || 0;
  if (v >= 90) return '🟢 Top';
  if (v >= 75) return '🟡 Satisfactorio';
  if (v >= 60) return '🟠 Medio';
  return '🔴 Bajo';
}

// ── Generar documento .md estructurado ───────────────────────────────────────
export async function generarMarkdownGestor(gestor, gerencia) {
  const sesiones = await obtenerHistorialGestor(gestor);

  if (sesiones.length === 0) {
    return `# Sin datos para ${gestor}\n\nNo se encontraron sesiones registradas en la bóveda local.`;
  }

  const totalSesiones = sesiones.length;
  const promedioAlcance = (sesiones.reduce((s, r) => s + (r.alcance || 0), 0) / totalSesiones).toFixed(1);
  const totalCobrado = sesiones.reduce((s, r) => s + (r.cobrado || 0), 0).toFixed(2);
  const tendencia = calcularTendencia(sesiones);
  const fechaMin = sesiones[sesiones.length - 1]?.fecha || '—';
  const fechaMax = sesiones[0]?.fecha || '—';

  const lines = [];

  // ── FRONTMATTER para NotebookLM ──────────────────────────────────────────
  lines.push(`---`);
  lines.push(`tipo: historial_gestor`);
  lines.push(`gestor: "${gestor}"`);
  lines.push(`gerencia: "${gerencia || '—'}"`);
  lines.push(`total_sesiones: ${totalSesiones}`);
  lines.push(`promedio_alcance: ${promedioAlcance}`);
  lines.push(`periodo: "${fechaMin} — ${fechaMax}"`);
  lines.push(`generado: "${new Date().toLocaleString('es-MX')}"`);
  lines.push(`sistema: "SupervisionApp GCC — División Cobranza Metro Sur"`);
  lines.push(`---`);
  lines.push(``);

  // ── ENCABEZADO ──────────────────────────────────────────────────────────
  lines.push(`# Historial de Supervisión — ${gestor}`);
  lines.push(``);
  lines.push(`**Gerencia:** ${gerencia || '—'}  `);
  lines.push(`**Período analizado:** ${fechaMin} al ${fechaMax}  `);
  lines.push(`**Total de sesiones supervisadas:** ${totalSesiones}  `);
  lines.push(`**Promedio de alcance:** ${promedioAlcance}%  `);
  lines.push(`**Total cobrado en período:** $${totalCobrado}  `);
  lines.push(`**Tendencia:** ${tendencia}  `);
  lines.push(``);

  // ── RESUMEN EJECUTIVO ───────────────────────────────────────────────────
  lines.push(`## Resumen Ejecutivo`);
  lines.push(``);

  const sesionesTop = sesiones.filter(s => (s.alcance || 0) >= 90).length;
  const sesionesBajas = sesiones.filter(s => (s.alcance || 0) < 60).length;
  const pasosPromGlobal = (sesiones.reduce((s, r) => s + (r.pasos_promedio || 0), 0) / totalSesiones).toFixed(1);

  lines.push(`Este documento contiene el registro completo de ${totalSesiones} sesiones de supervisión y/o acompañamiento`);
  lines.push(`realizadas al gestor **${gestor}** de la gerencia **${gerencia}** en el marco del sistema de supervisión`);
  lines.push(`de campo de la División Cobranza Metro Sur, Región Acapulco Costas 1.`);
  lines.push(``);
  lines.push(`### Indicadores clave del período`);
  lines.push(``);
  lines.push(`| Indicador | Valor |`);
  lines.push(`|-----------|-------|`);
  lines.push(`| Sesiones con alcance Top (≥90%) | ${sesionesTop} de ${totalSesiones} |`);
  lines.push(`| Sesiones con alcance Bajo (<60%) | ${sesionesBajas} de ${totalSesiones} |`);
  lines.push(`| Promedio de pasos de visita cumplidos | ${pasosPromGlobal}/6 |`);
  lines.push(`| Promedio de alcance general | ${promedioAlcance}% |`);
  lines.push(``);

  // ── ANÁLISIS DE PATRONES ──────────────────────────────────────────────
  lines.push(`## Patrones observados por el líder`);
  lines.push(``);

  // Compilar todos los compromisos y observaciones
  const compromisos = sesiones
    .filter(s => s.compromisos && s.compromisos.trim())
    .map(s => `- [${s.fecha}] ${s.compromisos.trim()}`);

  const observaciones = sesiones
    .filter(s => s.observaciones && s.observaciones.trim())
    .map(s => `- [${s.fecha}] ${s.observaciones.trim()}`);

  if (compromisos.length > 0) {
    lines.push(`### Compromisos adquiridos por el gestor`);
    lines.push(``);
    lines.push(...compromisos);
    lines.push(``);
  }

  if (observaciones.length > 0) {
    lines.push(`### Observaciones del líder`);
    lines.push(``);
    lines.push(...observaciones);
    lines.push(``);
  }

  // ── SEMÁFORO SEMANAL ──────────────────────────────────────────────────
  lines.push(`## Registro semana a semana`);
  lines.push(``);
  lines.push(`| Semana | Fecha | Alcance | Cobrado | Tareas | GIC | Clasificación |`);
  lines.push(`|--------|-------|---------|---------|--------|-----|---------------|`);

  for (const s of sesiones) {
    lines.push(
      `| ${s.semana || '—'} | ${s.fecha} | ${s.alcance || 0}% | $${s.cobrado || 0} | ${s.tareas || 0} | ${s.clasificacion_gic || '—'} | ${clasificarAlcance(s.alcance)} |`
    );
  }
  lines.push(``);

  // ── DETALLE POR SESIÓN ────────────────────────────────────────────────
  lines.push(`## Detalle de sesiones`);
  lines.push(``);

  for (const [i, s] of sesiones.entries()) {
    lines.push(`### Sesión ${totalSesiones - i}: ${s.fecha} (${s.semana || 'S?'})`);
    lines.push(``);
    lines.push(`**Alcance:** ${s.alcance || 0}% ${clasificarAlcance(s.alcance)}  `);
    lines.push(`**Total cobrado:** $${s.cobrado || 0}  `);
    lines.push(`**Tareas realizadas:** ${s.tareas || 0}  `);
    lines.push(`**Clasificación GIC:** ${s.clasificacion_gic || '—'}  `);
    lines.push(`**Promedio pasos visita:** ${(s.pasos_promedio || 0).toFixed(1)}/6  `);
    lines.push(``);

    if (s.observaciones && s.observaciones.trim()) {
      lines.push(`**Observaciones del líder:**  `);
      lines.push(`${s.observaciones.trim()}`);
      lines.push(``);
    }

    if (s.compromisos && s.compromisos.trim()) {
      lines.push(`**Compromisos adquiridos:**  `);
      lines.push(`${s.compromisos.trim()}`);
      lines.push(``);
    }

    lines.push(`---`);
    lines.push(``);
  }

  // ── PREGUNTAS SUGERIDAS PARA NOTEBOOKLM ──────────────────────────────
  lines.push(`## Preguntas sugeridas para analizar con NotebookLM`);
  lines.push(``);
  lines.push(`> Estas preguntas están pensadas para que las hagas en el chat de NotebookLM`);
  lines.push(`> después de cargar este documento como fuente.`);
  lines.push(``);
  lines.push(`1. ¿Cuál es la tendencia de alcance de ${gestor} en las últimas 4 semanas?`);
  lines.push(`2. ¿En qué semanas tuvo el desempeño más bajo y cuáles fueron las causas identificadas por el líder?`);
  lines.push(`3. ¿Los compromisos adquiridos por el gestor se reflejan en mejoras posteriores de alcance?`);
  lines.push(`4. ¿Cuáles son los patrones recurrentes en las observaciones del líder?`);
  lines.push(`5. ¿Qué plan de trabajo específico recomendarías para mejorar el alcance en las próximas 4 semanas?`);
  lines.push(`6. ¿Hay correlación entre la clasificación GIC y el alcance de cobranza?`);
  lines.push(`7. ¿Qué pasos del proceso de visita se están omitiendo con mayor frecuencia?`);
  lines.push(``);

  // ── PIE DEL DOCUMENTO ────────────────────────────────────────────────
  lines.push(`---`);
  lines.push(`*Documento generado automáticamente por SupervisionApp GCC.*  `);
  lines.push(`*División Cobranza Metro Sur · Región Acapulco Costas 1 · GCC Zihuatanejo.*  `);
  lines.push(`*El buen comportamiento sin resultados NO es desempeño aceptable.*`);
  lines.push(``);

  return lines.join('\n');
}
