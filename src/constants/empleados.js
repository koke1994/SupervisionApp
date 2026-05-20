// ═══════════════════════════════════════════════════════════════════════════════
//  empleados.js — Base de datos local de Gerencias, Líderes y Gestores
// ═══════════════════════════════════════════════════════════════════════════════

export const EMPLEADOS_DATA = [
  // LÍDERES
  { puesto: 'Lider', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8525 Gcc Ixtapa Zihuatanejo', numero: '1182842', nombre: 'Martin Lopez Morales' },
  { puesto: 'Lider', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '9731 Gcc San Luis La Loma', numero: '1157035', nombre: 'Bryam Soberanis Barrera' },
  { puesto: 'Lider', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8527 Gcc Zihuatanejo', numero: '1054448', nombre: 'Jorge Santiago Maza Jimenez' },
  { puesto: 'Lider', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8524 Gcc Lazaro Cardenas', numero: '208796', nombre: 'Saul Reyes Ochoa' },
  { puesto: 'Lider', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '9198 Gcc Lazaro Cardenas 2', numero: '207403', nombre: 'Wilber Hugo Ayala Sandoval' },
  
  // EMPLEADOS (Gestores)
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8527 Gcc Zihuatanejo', numero: '1216600', nombre: 'Jose Guillermo Laureano Gomez' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '9198 Gcc Lazaro Cardenas 2', numero: '1215440', nombre: 'Yahir Barboza Rivera' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8525 Gcc Ixtapa Zihuatanejo', numero: '1211324', nombre: 'Jorge David Pina Garcia' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '9198 Gcc Lazaro Cardenas 2', numero: '1210577', nombre: 'Jose Guadalupe Rosas Marroquin' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8527 Gcc Zihuatanejo', numero: '1208974', nombre: 'Ariel Jafeth Salazar Benitez' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8527 Gcc Zihuatanejo', numero: '1207772', nombre: 'Bryan Hilario Prudente Suastegui' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '9198 Gcc Lazaro Cardenas 2', numero: '1203936', nombre: 'Humberto Carrera Hernandez' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8527 Gcc Zihuatanejo', numero: '1203643', nombre: 'Tomas Adonis Morales Enriquez' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '9198 Gcc Lazaro Cardenas 2', numero: '1203052', nombre: 'Alexis Guadalupe Vazquez Muñoz' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8527 Gcc Zihuatanejo', numero: '1202472', nombre: 'Jose Antonio Hernandez Hilerio' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8524 Gcc Lazaro Cardenas', numero: '1199034', nombre: 'Oswar Giovani Pedraza Campos' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '9731 Gcc San Luis La Loma', numero: '1194602', nombre: 'Alexis Javier Guerrero Hernandez' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8524 Gcc Lazaro Cardenas', numero: '1193807', nombre: 'Francisco Gomez Nuñez' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '9731 Gcc San Luis La Loma', numero: '1191520', nombre: 'Josue Maximiliano Cruz Guerrero' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '9198 Gcc Lazaro Cardenas 2', numero: '1189495', nombre: 'Manuel Alejandro Camacho Andaluz' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '9731 Gcc San Luis La Loma', numero: '1185169', nombre: 'Roberto Flores Vazquez' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '9198 Gcc Lazaro Cardenas 2', numero: '1182568', nombre: 'Jose Alejandro Madrigal Guerra' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8525 Gcc Ixtapa Zihuatanejo', numero: '1182371', nombre: 'Dorian Michael Gallardo Hernandez' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '9731 Gcc San Luis La Loma', numero: '1174828', nombre: 'Daniel Sebastian Ruiz Gallegos' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8524 Gcc Lazaro Cardenas', numero: '1169233', nombre: 'Leobardo Gabriel Teran Ruiz' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '9731 Gcc San Luis La Loma', numero: '1162286', nombre: 'Sergio Emmanuel Perez Duarte' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '9731 Gcc San Luis La Loma', numero: '1159649', nombre: 'Heyler Antonio Ramos Ayerdi' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8525 Gcc Ixtapa Zihuatanejo', numero: '1158154', nombre: 'Daniel Blanco Rodriguez' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '9198 Gcc Lazaro Cardenas 2', numero: '1146065', nombre: 'Luis Alberto Bracamontes Chavez' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8524 Gcc Lazaro Cardenas', numero: '1128153', nombre: 'Alejandro Hernandez Aguilar' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8524 Gcc Lazaro Cardenas', numero: '1126965', nombre: 'Alexis Chavez Silvas' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8527 Gcc Zihuatanejo', numero: '1119901', nombre: 'Gilberto Nuñez Orozco' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8525 Gcc Ixtapa Zihuatanejo', numero: '1115400', nombre: 'Carlos Mendiola Ortuño' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8524 Gcc Lazaro Cardenas', numero: '1105528', nombre: 'Beatriz Garcia Chavez' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8525 Gcc Ixtapa Zihuatanejo', numero: '1037648', nombre: 'Rogelio Maciel Solis' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '9198 Gcc Lazaro Cardenas 2', numero: '958320', nombre: 'Jose Maria Torres Guerrero' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '9731 Gcc San Luis La Loma', numero: '817968', nombre: 'Jesus Ibarez Gallardo' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '9198 Gcc Lazaro Cardenas 2', numero: '725027', nombre: 'Luis Alberto Rodriguez Rivera' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8524 Gcc Lazaro Cardenas', numero: '676483', nombre: 'Martha Yadira Lara Rodriguez' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '9198 Gcc Lazaro Cardenas 2', numero: '334655', nombre: 'Abraham Davalos Sanchez' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8525 Gcc Ixtapa Zihuatanejo', numero: '203156', nombre: 'Luis Francisco Garcia Gonzalez' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8524 Gcc Lazaro Cardenas', numero: '202780', nombre: 'Juan Javier Bernal Astudillo' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8527 Gcc Zihuatanejo', numero: '198753', nombre: 'Luis Roberto Jimenez Castruita' },
  { puesto: 'Empleado', division: 'Metro Sur', cuartel: 'Acapulco Costas', region: 'Acapulco Costas 1', gerencia: '8525 Gcc Ixtapa Zihuatanejo', numero: '181265', nombre: 'Hugo Cesar Hernandez Sanchez' },
];

// ── Funciones de ayuda para obtener listas filtradas ─────────────────────────

export function obtenerGerenciasUnicas() {
  const gerencias = EMPLEADOS_DATA.map(e => e.gerencia);
  return [...new Set(gerencias)].sort();
}

export function obtenerLideresPorGerencia(gerenciaSeleccionada) {
  if (!gerenciaSeleccionada) return [];
  return EMPLEADOS_DATA
    .filter(e => e.puesto === 'Lider' && e.gerencia === gerenciaSeleccionada)
    .map(e => e.nombre)
    .sort();
}

export function obtenerGestoresPorGerencia(gerenciaSeleccionada) {
  if (!gerenciaSeleccionada) return [];
  return EMPLEADOS_DATA
    .filter(e => e.puesto === 'Empleado' && e.gerencia === gerenciaSeleccionada)
    .map(e => e.nombre)
    .sort();
}