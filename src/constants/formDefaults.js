// ═══════════════════════════════════════════════════════════════════════════════
//  formDefaults.js  —  Estructura de datos basada en supervision_zihua_FIXED.html
// ═══════════════════════════════════════════════════════════════════════════════

export const PASOS_VISITA = [
  '1.- Saludo y presentación',
  '2.- Informa del adeudo',
  '3.- Indaga motivo atraso',
  '4.- Cadena de soluciones',
  '5.- Manejo de objeciones',
  '6.- Cierre y despedida',
];

export const PASOS_BUSQUEDA = [
  'Visita Vecinos',
  'Aval y/o referencias',
  'Conoce trabajo',
  'Revisó expediente',
  'Actualiza PAX',
  'Sinergia sucursal',
];

export const PASOS_SOLICITUD = [
  '1.- Se presenta e informa motivo de la visita',
  '2.- Explica el proceso de la investigación',
  '3.- Realiza la verificación dentro del domicilio',
  '4.- Solicita al cliente documentos originales',
  '5.- Valida Referencias',
  '6.- Informa el estatus al cliente',
  '7.- Asesora al cliente en descarga de App',
  '8.- Explica beneficios de la línea de crédito',
  '9.- Hace recomendaciones en el uso correcto del crédito',
];

export const HERR_NO_NEGOCIABLE_CHECK = ['Pax', 'Sim', 'Moto', 'Casco'];

export const HERR_SEGURIDAD = [
  'Luces', 'Claxon', 'Direccionales', 'Stop',
  'Batería adicional alarma', 'Frenos / Balatas / Nivel',
  'Aceite', 'Cadena lubricada', 'Llantas / presión / TWI',
];

export const HERR_MOTO = ['Caja Shad', 'Moto Limpia'];

export const HERR_EQUIPO = [
  'Impermeable', 'Esqueleto', 'Rodilleras', 'Botas', 'Chaleco Vial',
  'Guantes', 'Camisa', 'Pantalón', 'Chamarra Verde', 'Chamarra Gerente',
];

export const HERR_DOCUMENTOS = [
  'Licencia de Conducir', 'Tarjeta de Circulación',
  'Placa', 'Tarjeta Si vale', 'Directorio en caja shad',
];

export const CLASIFICACIONES_GIC = [
  { label: 'Top',           value: 'top' },
  { label: 'Satisfactorio', value: 'satisfactorio' },
  { label: 'Medio Alto',    value: 'medioAlto' },
  { label: 'Medio Bajo',    value: 'medioBajo' },
  { label: 'Bottom',        value: 'bottom' },
];

export function createClienteDefault() {
  return {
    nombre: '', semanas: '', saldo: '', pagoSugerido: '',
    alternativas: '', negociacion: '', atiende: null,
    pasosVisita:   Array(PASOS_VISITA.length).fill(false),
    pasosBusqueda: Array(PASOS_BUSQUEDA.length).fill(false),
    observaciones: '',
    gps: null,        // { lat, lng, hora }
    fotoUri: null,
    fotoLocked: false,
  };
}

export function createSolicitudDefault() {
  return {
    gerencia: 'Ixtapa Zihuatanejo', nombreCliente: '',
    tipoSolicitud: '', contactabilidadCliente: false,
    contactabilidadLaboral: false, redContacto: false,
    pasos: Array(PASOS_SOLICITUD.length).fill(false),
  };
}

function sinoMap(keys) {
  return Object.fromEntries(keys.map(k => [k, null]));
}
function comentMap(keys) {
  return Object.fromEntries(keys.map(k => [k, '']));
}

export function createHerramientasDefault() {
  return {
    noNegociable: Object.fromEntries(HERR_NO_NEGOCIABLE_CHECK.map(k => [k, false])),
    seguridad:           sinoMap(HERR_SEGURIDAD),
    seguridadComentarios:comentMap(HERR_SEGURIDAD),
    moto:                sinoMap(HERR_MOTO),
    motoComentarios:     comentMap(HERR_MOTO),
    kilometraje: '', servicio: null, seguimientoFolios: null,
    equipo:              sinoMap(HERR_EQUIPO),
    equipoComentarios:   comentMap(HERR_EQUIPO),
    documentos:          sinoMap(HERR_DOCUMENTOS),
    documentosComentarios:comentMap(HERR_DOCUMENTOS),
    observaciones: '', fechaCompromiso: '', cumplio: '',
  };
}

export function generarFolio() {
  const d = new Date();
  const ts = d.getTime().toString().slice(-6);
  return `ZIH-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${ts}`;
}

export function createFormDefaults() {
  const ahora = new Date();
  const fechaStr = ahora.toLocaleDateString('es-MX') + ' ' +
    ahora.getHours() + ':' + (ahora.getMinutes()<10?'0':'') + ahora.getMinutes();

  return {
    id: null, folio: generarFolio(), createdAt: null,
    tipoGestion: 'ACOMPAÑAMIENTO',
    fecha: fechaStr, gerencia: 'Ixtapa Zihuatanejo',
    semana: '', gestor: '', lider: '',
    tareasRealizadas: '', cobrado: '', alcance: '',
    horaPrimeraGestion: '', herramientas: '', imagen: '',
    clasificacionGIC: 'medioAlto',
    clientes: [], solicitudes: [], herramientasSecs: [],
    coaching: { haceBien: '', puedeMejorar: '', compromisos: '' },
    firmaGestor: null, firmaLider: null, firmaRegional: null,
  };
}
