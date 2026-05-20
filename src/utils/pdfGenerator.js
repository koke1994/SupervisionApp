import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import {
    PASOS_VISITA,
    PASOS_BUSQUEDA,
    PASOS_SOLICITUD,
    RECOMENDACIONES_CREDITO,
} from '../constants/formDefaults';
import { EMPLEADOS_DATA } from '../constants/empleados';

const check = (val) => (val ? '&#10003;' : '&#9744;');
const siNo = (val) => {
    if (val === 'si') return '<span style="color:#17A589;font-weight:bold;">SÍ</span>';
    if (val === 'no') return '<span style="color:#E74C3C;font-weight:bold;">NO</span>';
    return '<span style="color:#BDC3C7;">—</span>';
};

function clienteSection(c, num) {
    const pasos = c.pasos || [];
    const pasosBusqueda = c.pasosBusqueda || [];
    const caminoCobrarMejor = c.caminoCobrarMejor || false;
    const tresPasosBusqueda = c.tresPasosBusqueda || false;

    const pasosHTML = (PASOS_VISITA || []).map((p, i) => `
    <span style="margin-right:12px;">${check(pasos[i])} ${p}</span>
  `).join('');

    const accionesHTML = (PASOS_BUSQUEDA || []).map((a, i) => `
    <span style="margin-right:12px;">${check(pasosBusqueda[i])} ${a}</span>
  `).join('');

    return `
  <div style="border:1.5px solid #1A3A5C;border-radius:6px;margin-bottom:10px;overflow:hidden;">
    <div style="background:#1A3A5C;color:#F0C040;padding:5px 12px;font-weight:bold;font-size:12px;">
      Cliente ${num}
    </div>
    <div style="padding:8px 12px;">
      <table style="width:100%;margin-bottom:6px;font-size:11.5px;">
        <tr>
          <td><b>Nombre:</b> ${c.nombre || '___________________________________________'}</td>
        </tr>
        <tr>
          <td style="padding-top:2px;">
            <b>Semanas:</b> ${c.semanas || '____'} &nbsp;&nbsp;
            <b>Saldo:</b> $${c.saldo || '________'} &nbsp;&nbsp;
            <b>Pago sugerido:</b> $${c.pagoSugerido || '________'} &nbsp;&nbsp;
            <b>Alternativas:</b> ${c.alternativas || '________'}
          </td>
        </tr>
      </table>

      <div style="margin-bottom:6px;font-size:11.5px;">
        <b>Atendió:</b> &nbsp;
        ${check(c.atiende === 'cliente')} Cliente &nbsp;&nbsp;
        ${check(c.atiende === 'familiar')} Familiar
      </div>

      <div style="font-size:11px;margin-bottom:6px;display:flex;flex-wrap:wrap;gap:2px;">
        ${pasosHTML}
      </div>

      <div style="margin-bottom:6px;font-size:10.5px;color:#444;">
        <b>Observaciones:</b> ${c.observaciones || ''}
        <div style="border-bottom:1px solid #E5E8E8;margin-top:4px;height:20px;"></div>
        <div style="border-bottom:1px solid #E5E8E8;margin-top:4px;height:20px;"></div>
      </div>

      <div style="font-size:11px;display:flex;flex-wrap:wrap;gap:2px;">
        <b>Acciones:</b> &nbsp;
        ${accionesHTML}
      </div>

      <div style="font-size:11px;margin-top:4px;">
        ${check(caminoCobrarMejor)} <i>Camino para cobrar mejor</i> &nbsp;&nbsp;
        ${check(tresPasosBusqueda)} <i>3 Pasos de búsqueda de cliente</i>
      </div>
    </div>
  </div>
  `;
}

export function buildHtml(formData) {
    if (!formData) {
        throw new Error('No hay datos para generar el PDF');
    }

    const clientes = formData.clientes || [];
    const solicitudes = formData.solicitudes || [];
    const solicitud = solicitudes[0] || {}; // Tomar la primera solicitud
    const retro = formData.coaching || {};

    const herr = (formData.herramientasSecs && formData.herramientasSecs.length > 0) ? formData.herramientasSecs[0] : null;

    let clientesHTML = '';
    clientes.forEach((c, i) => {
        clientesHTML += clienteSection(c, i + 1);
        // Insertar salto de página cada 2 clientes (si no es el último)
        if ((i + 1) % 2 === 0 && i !== clientes.length - 1) {
            clientesHTML += '\n  <div class="page-break"></div>\n  ';
        }
    });

    let herramientasHTML = '';
    if (herr) {
        // Función para inyectar cada elemento en un recuadro de 33% del ancho
        const renderChecks = (obj) => Object.entries(obj || {}).map(([k,v]) => `<span style="display:inline-block; width:32%; font-size:10.5px; margin-bottom:3px;">${check(v)} ${k}</span>`).join('');

        herramientasHTML = `
  <!-- Salto de página exclusivo para Herramientas -->
  <div class="page-break"></div>
  <div class="card">
    <div class="section-title">Checklist de Herramientas de Trabajo</div>
    <div class="row" style="margin-bottom:8px; border-bottom: 1px solid #eaeaea; padding-bottom: 8px;">
      <div class="field" style="width:32%"><b>Kilometraje:</b> ${herr.kilometraje || '___'}</div>
      <div class="field" style="width:32%"><b>Próx. Servicio:</b> ${herr.servicio || '___'}</div>
      <div class="field" style="width:32%"><b>Folios pend:</b> ${herr.seguimientoFolios || '___'}</div>
    </div>
    <div style="margin-bottom:6px;">
       <div style="font-weight:bold; color:#1A3A5C; font-size:11px; margin-bottom:3px;">No Negociables y Moto:</div>
       <div>${renderChecks(herr.noNegociable)}${renderChecks(herr.moto)}</div>
    </div>
    <div style="margin-bottom:6px;">
       <div style="font-weight:bold; color:#1A3A5C; font-size:11px; margin-bottom:3px;">Seguridad:</div>
       <div>${renderChecks(herr.seguridad)}</div>
    </div>
    <div style="margin-bottom:6px;">
       <div style="font-weight:bold; color:#1A3A5C; font-size:11px; margin-bottom:3px;">Equipo de Protección:</div>
       <div>${renderChecks(herr.equipo)}</div>
    </div>
    <div style="margin-bottom:8px;">
       <div style="font-weight:bold; color:#1A3A5C; font-size:11px; margin-bottom:3px;">Documentos:</div>
       <div>${renderChecks(herr.documentos)}</div>
    </div>
    <div style="background:#F0F4F8;border-radius:6px;padding:8px;font-size:10.5px;">
      <b>Observaciones:</b> ${herr.observaciones || 'Ninguna'} <br/>
      <b style="margin-top:2px; display:inline-block;">Compromiso:</b> ${herr.fechaCompromiso || '___'}
    </div>
  </div>`;
    }

    // Instrumentación para depuración: registrar longitudes y existencia de constantes
    try {
        console.log('PDF build: clientes=', (clientes || []).length, 'solicitudes=', (solicitudes || []).length);
        console.log('PDF build: PASOS_VISITA:', Array.isArray(PASOS_VISITA),
            'PASOS_BUSQUEDA:', Array.isArray(PASOS_BUSQUEDA),
            'PASOS_SOLICITUD:', Array.isArray(PASOS_SOLICITUD),
            'RECOMENDACIONES_CREDITO:', Array.isArray(RECOMENDACIONES_CREDITO)
        );
    } catch (logErr) {
        // No bloquear por fallos en logging
        console.error('PDF build: error al registrar estado inicial', logErr);
    }

    clientes.forEach((c, i) => {
        if (!c.pasos) c.pasos = [];
        if (!c.pasosBusqueda) c.pasosBusqueda = [];
    });

    const clasificacionLabels = {
        top: 'Top', satisfactorio: 'Satisfactorio',
        medioAlto: 'Medio Alto', medioBajo: 'Medio Bajo', bottom: 'Bottom',
    };

    const gicRow = ['top', 'satisfactorio', 'medioAlto', 'medioBajo', 'bottom'].map(v =>
        `${check(formData.clasificacionGIC === v)} ${clasificacionLabels[v]}`
    ).join(' &nbsp; ');

    let pasosolicitudHTML = '';
    let recHTML = '';
    try {
        pasosolicitudHTML = (PASOS_SOLICITUD || []).map((p, i) => `
    <div style="margin-bottom:3px;">${check(solicitud.pasos?.[i])} ${p}</div>
  `).join('');

        recHTML = (RECOMENDACIONES_CREDITO || []).map((r, i) => `
    <div style="font-size:10.5px;margin-bottom:2px;">${check(solicitud.recomendaciones?.[i])} ${r}</div>
  `).join('');
    } catch (mapErr) {
        console.error('PDF build: error al generar HTML de solicitudes/recomendaciones', mapErr, {
            solicitudPasos: solicitud.pasos,
            solicitudRecomendaciones: solicitud.recomendaciones,
        });
        // Dejar strings vacíos para evitar crash al renderizar
        pasosolicitudHTML = '';
        recHTML = '';
    }

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <style>
    @page { size: A4; margin: 10mm 12mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Calibri, Arial, sans-serif; font-size: 11.5px; color: #2C3E50; line-height: 1.3; }
    .page { max-width: 750px; margin: 0 auto; }
    .header { background: #0D1B2A; color: #F0C040; padding: 10px 14px; border-radius: 6px; margin-bottom: 10px; }
    .header h1 { font-size: 15px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px; }
    .header .sub { font-size: 10.5px; color: #BDC3C7; }
    .card { border: 1px solid #D5D8DC; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; }
    .section-title { font-size: 11px; font-weight: bold; color: #1A3A5C; text-transform: uppercase;
                     letter-spacing: 0.5px; border-bottom: 1.5px solid #F0C040; padding-bottom: 3px; margin-bottom: 6px; }
    .row { display: flex; flex-wrap: wrap; gap: 4px 12px; margin-bottom: 6px; font-size: 11.5px; }
    .field { display: flex; gap: 4px; }
    .field b { white-space: nowrap; }
    .semaforo { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px;
                font-weight: bold; color: white; }
    .tipo-badge { background: #1A3A5C; color: #F0C040; padding: 3px 10px; border-radius: 4px;
                  font-size: 11px; font-weight: bold; display: inline-block; margin-left: 8px; }
    .firma-box { border-top: 1.5px solid #2C3E50; margin-top: 8px; padding-top: 4px;
                 text-align: center; font-size: 11px; color: #7F8C8D; }
    .page-break { page-break-before: always; margin-top: 20px; }
  </style>
</head>
<body>
<div class="page">

  <!-- ENCABEZADO -->
  <div class="header">
    <h1>Supervisión y Acompañamiento — División Cobranza</h1>
    <div class="sub">Región Acapulco Costas 1 &nbsp;·&nbsp; GCC Zihuatanejo, Guerrero</div>
  </div>

  <!-- DATOS GENERALES -->
  <div class="card">
    <div class="section-title">Datos Generales</div>
    <div class="row">
      <div class="field"><b>Fecha:</b> ${formData.fecha}</div>
      <div class="field"><b>Semana:</b> ${formData.semana}</div>
      <div class="field"><b>Gerencia:</b> ${formData.gerencia}</div>
    </div>
    <div class="row">
      <div class="field"><b>Gestor:</b> ${formData.gestor}</div>
      <div class="field"><b>Líder:</b> ${formData.lider}</div>
    </div>
    <div class="row">
      <div class="field"><b>Tareas realizadas:</b> ${formData.tareasRealizadas}</div>
      <div class="field"><b>Cobrado:</b> $${formData.cobrado}</div>
      <div class="field"><b>Alcance:</b> ${formData.alcance}%</div>
    </div>
    <div class="row">
      <div class="field"><b>Hora 1ª gestión:</b> ${formData.horaPrimeraGestion}</div>
      <div class="field"><b>Herramientas:</b> ${siNo(formData.herramientas)}</div>
      <div class="field"><b>Imagen:</b> ${siNo(formData.imagen)}</div>
    </div>
    <div class="row" style="margin-top:4px;">
      <div class="field"><b>¿Conoce mandato y funciones?</b> ${siNo(formData.conoceMandato)}</div>
      <div class="field"><b>¿Conoce compensación?</b> ${siNo(formData.conoceCompensacion)}</div>
      <div class="field"><b>¿Conexión rápida?</b> ${siNo(formData.conexionRapida)}</div>
      <div class="field"><b>Registra en ZEUS:</b> ${siNo(formData.registraZeus)}</div>
    </div>
    <div class="row" style="margin-top:4px;align-items:center;">
      <div class="field"><b>GIC:</b> &nbsp;${gicRow}</div>
      <div class="field">
        <b>Tipo:</b>
        <span class="tipo-badge">
          ${formData.tipoVisita === 'acompanamiento' ? 'ACOMPAÑAMIENTO' : formData.tipoVisita === 'supervision' ? 'SUPERVISIÓN' : '—'}
        </span>
      </div>
    </div>
  </div>

  <!-- CLIENTES -->
  <div class="section-title" style="margin-bottom:8px;">Clientes Visitados</div>
  ${clientesHTML}

  <!-- PÁGINA 2 -->
  <div class="page-break"></div>

  <!-- SOLICITUDES -->
  <div class="card" style="margin-top:10px;">
    <div class="section-title">Solicitudes</div>
    <div class="row" style="margin-bottom:6px;">
      <div class="field"><b>Cliente:</b> ${solicitud.nombreCliente}</div>
      <div class="field"><b>Tipo de solicitud:</b> ${solicitud.tipoSolicitud}</div>
    </div>
    <div style="font-size:11.5px;margin-bottom:8px;">
      ${check(solicitud.contactabilidadCliente)} Contactabilidad del Cliente &nbsp;&nbsp;
      ${check(solicitud.contactabilidadLaboral)} Contactabilidad Laboral &nbsp;&nbsp;
      ${check(solicitud.redContacto)} Red de contacto ampliada
    </div>
    <div style="font-size:11.5px;margin-bottom:8px;">${pasosolicitudHTML}</div>
    <div style="background:#F0F4F8;border-radius:6px;padding:8px;font-size:10.5px;">
      <b>Recomendaciones en uso del crédito:</b><br/>${recHTML}
    </div>
  </div>

  ${herramientasHTML}

  <!-- Salto de página antes del Coaching para no cortar las firmas -->
  <div class="page-break"></div>

  <!-- RETROALIMENTACIÓN -->
  <div class="card">
    <div class="section-title">Retroalimentación y Coaching del Líder</div>
    <table style="width:100%;font-size:11.5px;">
      <tr>
        <td style="width:33%;vertical-align:top;padding-right:8px;">
          <b>Qué está haciendo bien:</b> <i>(llenado por líder)</i>
          <div style="border:1px solid #D5D8DC;border-radius:4px;padding:6px;margin-top:4px;min-height:70px;color:#2C3E50;">
            ${retro.haceBien || ''}
          </div>
        </td>
        <td style="width:33%;vertical-align:top;padding-right:8px;">
          <b>Qué puede mejorar:</b> <i>(llenado por líder)</i>
          <div style="border:1px solid #D5D8DC;border-radius:4px;padding:6px;margin-top:4px;min-height:70px;color:#2C3E50;">
            ${retro.puedeMejorar || ''}
          </div>
        </td>
        <td style="width:33%;vertical-align:top;">
          <b>Compromisos del gestor:</b>
          <div style="border:1px solid #D5D8DC;border-radius:4px;padding:6px;margin-top:4px;min-height:70px;color:#2C3E50;">
            ${retro.compromisos || ''}
          </div>
        </td>
      </tr>
    </table>

    <!-- Firmas -->
    <div style="display:flex;gap:16px;margin-top:20px;">
      <div style="flex:1;text-align:center;">
        ${formData.firmaGestor ? `<img src="${formData.firmaGestor}" style="max-height: 45px; margin-bottom: 5px;" /><br/>` : ''}
        <div style="border-top:1.5px solid #2C3E50;padding-top:6px;font-size:11px;color:#7F8C8D;">
          <b>${formData.gestor || 'Nombre del Gestor'}</b><br/>Gestor
        </div>
      </div>
      <div style="flex:1;text-align:center;">
        ${formData.firmaLider ? `<img src="${formData.firmaLider}" style="max-height: 45px; margin-bottom: 5px;" /><br/>` : ''}
        <div style="border-top:1.5px solid #2C3E50;padding-top:6px;font-size:11px;color:#7F8C8D;">
          <b>${formData.lider || 'Nombre del Líder'}</b><br/>Líder
        </div>
      </div>
      <div style="flex:1;text-align:center;">
        ${formData.firmaRegional ? `<img src="${formData.firmaRegional}" style="max-height: 45px; margin-bottom: 5px;" /><br/>` : ''}
        <div style="border-top:1.5px solid #2C3E50;padding-top:6px;font-size:11px;color:#7F8C8D;">
          <b>Miguel Ángel Soriano Hernández</b><br/>Regional
        </div>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <div style="text-align:center;margin-top:12px;font-size:9px;color:#BDC3C7;border-top:1px solid #D5D8DC;padding-top:6px;">
    División Cobranza Metro Sur · Región Acapulco Costas 1 · GCC Zihuatanejo
    &nbsp;|&nbsp; Generado: ${new Date().toLocaleString('es-MX')}
    <br/>
    <i>El buen comportamiento sin resultados NO es desempeño aceptable.</i>
  </div>

</div>
</body>
</html>`;
}

// ── Generar Nombre de Archivo Inteligente ─────────────────────────────────────
export function generarNombreArchivo(formData) {
    if (!formData) return 'Supervision_GCC.pdf';

    // 1. Iniciales de Gerencia (Ej. "8525 Gcc Ixtapa Zihuatanejo" -> "IZ")
    const gerencia = formData.gerencia || '';
    const cleanGerencia = gerencia.replace(/[0-9]/g, '').replace(/gcc/i, '').trim();
    const iniciales = cleanGerencia.split(/\s+/).map(w => w[0]?.toUpperCase() || '').join('');

    // 2. Tipo (ACOMP o SUP)
    const tipo = formData.tipoGestion === 'ACOMPAÑAMIENTO' ? 'ACOMP' : 'SUP';

    // 3. Número de empleado
    const gestorInfo = EMPLEADOS_DATA.find(e => e.nombre === formData.gestor);
    const numEmp = gestorInfo ? gestorInfo.numero : '000000';

    // 4. Fecha (Ej. "14/05/2024 15:30" -> "14052024")
    const fechaLimpia = (formData.fecha || '').split(' ')[0].replace(/\//g, '');

    return `${iniciales}_${tipo}_${numEmp}_${fechaLimpia}.pdf`;
}

// ── Generar solo el Base64 (Ideal para envíos de correo en segundo plano) ────
export async function obtenerPdfBase64(formData) {
    if (!formData) return null;
    const datosCorregidos = { ...formData };
    datosCorregidos.clientes = (datosCorregidos.clientes || []).map(c => ({
        ...c,
        pasos: c.pasos || [],
        pasosBusqueda: c.pasosBusqueda || [],
    }));

    const html = buildHtml(datosCorregidos);
    const { base64 } = await Print.printToFileAsync({ html, base64: true });
    return base64;
}

export async function generarYCompartirPDF(formData) {
    if (!formData) {
        throw new Error('No hay datos para generar el PDF');
    }

    const datosCorregidos = { ...formData };
    datosCorregidos.clientes = (datosCorregidos.clientes || []).map(c => ({
        ...c,
        pasos: c.pasos || [],
        pasosBusqueda: c.pasosBusqueda || [],
    }));

    const html = buildHtml(datosCorregidos);
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    const filename = generarNombreArchivo(formData);

    const newUri = uri.replace(/[^/]+$/, filename);
    await FileSystem.moveAsync({ from: uri, to: newUri });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
        await Sharing.shareAsync(newUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Guardar o compartir PDF',
        });
    }
    return newUri;
}