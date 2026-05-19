// ═══════════════════════════════════════════════════════════════════════════════
//  FormularioPrincipalScreen.js
//  Pantalla central del formulario: clientes, solicitudes, herramientas.
//  Fiel al HTML supervision_zihua_FIXED.html
// ═══════════════════════════════════════════════════════════════════════════════
import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, TextInput, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useForm } from '../context/FormContext';
import { COLORS } from '../constants/colors';
import {
  PASOS_VISITA, PASOS_BUSQUEDA, PASOS_SOLICITUD,
  HERR_NO_NEGOCIABLE_CHECK, HERR_SEGURIDAD, HERR_MOTO,
  HERR_EQUIPO, HERR_DOCUMENTOS,
} from '../constants/formDefaults';
import CheckItem from '../components/CheckItem';
import SinoButton from '../components/SinoButton';
import InputField from '../components/InputField';
import SectionHeader from '../components/SectionHeader';
import ProgressBar from '../components/ProgressBar';

// ── Bloque GPS blindado ───────────────────────────────────────────────────────
function GPSBlindado({ gps, onCapture }) {
  const [loading, setLoading] = useState(false);

  async function capturar() {
    if (gps) return; // ya bloqueado
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('GPS denegado', 'Activa los permisos de ubicación en la configuración del dispositivo.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const ahora = new Date();
      const hora = ahora.getHours() + ':' + (ahora.getMinutes()<10?'0':'') + ahora.getMinutes();
      onCapture({ lat: loc.coords.latitude.toFixed(6), lng: loc.coords.longitude.toFixed(6), hora });
    } catch (e) {
      Alert.alert('Error GPS', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <TouchableOpacity
      style={[styles.gpsBox, gps && styles.gpsLocked]}
      onPress={capturar}
      disabled={!!gps || loading}
      activeOpacity={0.8}
    >
      {gps ? (
        <>
          <Ionicons name="location" size={18} color="#27ae60" />
          <Text style={styles.gpsLockedText}>🔒 {gps.hora}</Text>
          <Text style={styles.gpsCoords}>{gps.lat}, {gps.lng}</Text>
        </>
      ) : loading ? (
        <>
          <Ionicons name="navigate-circle-outline" size={22} color={COLORS.warning} />
          <Text style={styles.gpsTxt}>📡 Obteniendo...</Text>
        </>
      ) : (
        <>
          <Ionicons name="location-outline" size={22} color={COLORS.textLight} />
          <Text style={styles.gpsTxt}>TAP GPS{'\n'}(QR)</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// ── Bloque Foto blindada ──────────────────────────────────────────────────────
function FotoBlindada({ fotoUri, locked, onCapture }) {
  async function capturar() {
    if (locked) return;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permiso de cámara requerido'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.72, base64: false });
    if (!result.canceled && result.assets?.[0]) {
      onCapture(result.assets[0].uri);
    }
  }

  return (
    <TouchableOpacity
      style={[styles.fotoBox, locked && styles.fotoLocked]}
      onPress={capturar}
      disabled={locked}
      activeOpacity={0.8}
    >
      {fotoUri ? (
        <Image source={{ uri: fotoUri }} style={styles.fotoImg} resizeMode="cover" />
      ) : (
        <>
          <Ionicons name="camera-outline" size={22} color="#c0392b" />
          <Text style={styles.fotoTxt}>TAP FOTO{'\n'}(BLINDADO)</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// ── Card de un cliente ────────────────────────────────────────────────────────
function ClienteCard({ index }) {
  const { formData, updateCliente, toggleClientePasoVisita, toggleClientePasoBusqueda, removeCliente } = useForm();
  const c = formData.clientes[index];
  const u = (field) => (val) => updateCliente(index, { [field]: val });

  return (
    <View style={styles.ccard}>
      <View style={styles.ccardHeader}>
        <Text style={styles.ccardTitle}>Cliente {index + 1}</Text>
        <TouchableOpacity onPress={() => removeCliente(index)} style={styles.removeBtn}>
          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <InputField label="Nombre" value={c.nombre} onChangeText={u('nombre')} />
      <View style={styles.rowFields}>
        <InputField label="Semanas" value={c.semanas} onChangeText={u('semanas')} keyboardType="numeric" style={styles.flex1} />
        <InputField label="Saldo $" value={c.saldo} onChangeText={u('saldo')} keyboardType="decimal-pad" style={styles.flex1} />
        <InputField label="Pago sug. $" value={c.pagoSugerido} onChangeText={u('pagoSugerido')} keyboardType="decimal-pad" style={styles.flex1} />
      </View>
      <InputField label="Alternativas" value={c.alternativas} onChangeText={u('alternativas')} />
      <InputField label="¿Cómo se negoció?" value={c.negociacion} onChangeText={u('negociacion')} />

      {/* Atendió */}
      <View style={styles.atendioRow}>
        <Text style={styles.atendioLabel}>Atendió:</Text>
        {['cliente','familiar'].map(op => (
          <TouchableOpacity
            key={op}
            style={[styles.atendioBtn, c.atiende === op && styles.atiendeBtnActive]}
            onPress={() => updateCliente(index, { atiende: op })}
          >
            <Text style={[styles.atiendeTxt, c.atiende === op && styles.atiendeTxtActive]}>
              {op.charAt(0).toUpperCase() + op.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Grid checklists */}
      <View style={styles.checkGrid}>
        <View style={styles.checkCol}>
          <Text style={styles.colHdr}>Camino para cobrar mejor</Text>
          {PASOS_VISITA.map((p, i) => (
            <CheckItem key={i} label={p} value={c.pasosVisita[i]} onToggle={() => toggleClientePasoVisita(index, i)} />
          ))}
        </View>
        <View style={styles.checkCol}>
          <Text style={styles.colHdr}>3 Pasos de búsqueda</Text>
          {PASOS_BUSQUEDA.map((p, i) => (
            <CheckItem key={i} label={p} value={c.pasosBusqueda[i]} onToggle={() => toggleClientePasoBusqueda(index, i)} />
          ))}
        </View>
      </View>

      {/* GPS + Foto */}
      <View style={styles.evidenciasRow}>
        <GPSBlindado
          gps={c.gps}
          onCapture={(gpsData) => updateCliente(index, { gps: gpsData })}
        />
        <FotoBlindada
          fotoUri={c.fotoUri}
          locked={c.fotoLocked}
          onCapture={(uri) => updateCliente(index, { fotoUri: uri, fotoLocked: true })}
        />
      </View>

      {/* Observaciones */}
      <Text style={styles.obsLabel}>Observaciones</Text>
      <TextInput
        style={styles.obsTa}
        value={c.observaciones}
        onChangeText={u('observaciones')}
        placeholder="Escribe aquí las observaciones..."
        placeholderTextColor={COLORS.gray}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
}

// ── Card de solicitud ─────────────────────────────────────────────────────────
function SolicitudCard({ index }) {
  const { formData, updateSolicitud, toggleSolicitudPaso, removeSolicitud } = useForm();
  const s = formData.solicitudes[index];
  const u = (field) => (val) => updateSolicitud(index, { [field]: val });

  return (
    <View style={styles.ccard}>
      <View style={styles.ccardHeader}>
        <Text style={styles.ccardTitle}>Solicitud {index + 1}</Text>
        <TouchableOpacity onPress={() => removeSolicitud(index)} style={styles.removeBtn}>
          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.rowFields}>
        <InputField label="Gerencia" value={s.gerencia} onChangeText={u('gerencia')} style={styles.flex2} />
        <InputField label="Líder" value={formData.lider} editable={false} style={styles.flex1} />
      </View>
      <InputField label="Nombre del cliente" value={s.nombreCliente} onChangeText={u('nombreCliente')} />
      <InputField label="Tipo de solicitud" value={s.tipoSolicitud} onChangeText={u('tipoSolicitud')} />

      <View style={styles.contactRow}>
        <CheckItem label="Contactabilidad del Cliente" value={s.contactabilidadCliente} onToggle={() => updateSolicitud(index, { contactabilidadCliente: !s.contactabilidadCliente })} />
        <CheckItem label="Contactabilidad Laboral" value={s.contactabilidadLaboral} onToggle={() => updateSolicitud(index, { contactabilidadLaboral: !s.contactabilidadLaboral })} />
        <CheckItem label="Red de contacto ampliada" value={s.redContacto} onToggle={() => updateSolicitud(index, { redContacto: !s.redContacto })} />
      </View>

      <View style={styles.checkGrid}>
        <View style={{ flex: 1 }}>
          {PASOS_SOLICITUD.slice(0, 7).map((p, i) => (
            <CheckItem key={i} label={p} value={s.pasos[i]} onToggle={() => toggleSolicitudPaso(index, i)} />
          ))}
        </View>
        <View style={{ flex: 1 }}>
          {PASOS_SOLICITUD.slice(7).map((p, i) => (
            <CheckItem key={i+7} label={p} value={s.pasos[i+7]} onToggle={() => toggleSolicitudPaso(index, i+7)} />
          ))}
          <View style={styles.recBox}>
            {[
              'Cuida tu historial crediticio',
              'Si pagas puntual, pagas menos y te ofrecemos la mejor tasa del mercado',
              'En caso de pagos quincenales o mensuales, adelanta 3 o 5 abonos.',
              'Paga a tiempo para no generar intereses moratorios.',
              'El bien es tuyo hasta que finalices tus pagos.',
              'La línea de crédito es personal e intransferible.',
              'Realiza tus pagos por medio de la App o directamente en sucursal.',
            ].map((r, i) => (
              <Text key={i} style={styles.recItem}>• {r}</Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

// ── Card de herramientas ──────────────────────────────────────────────────────
function HerramientasCard({ index }) {
  const { formData, updateHerramientas, setSinoHerr, removeHerramientas } = useForm();
  const h = formData.herramientasSecs[index];
  const u = (field) => (val) => updateHerramientas(index, { [field]: val });

  function renderSinoList(items, categoria) {
    return items.map((item) => (
      <SinoButton
        key={item}
        label={item}
        value={h[categoria]?.[item]}
        onChange={(val) => setSinoHerr(index, categoria, item, val)}
      />
    ));
  }

  return (
    <View style={styles.ccard}>
      <View style={styles.ccardHeader}>
        <Text style={styles.ccardTitle}>Herramientas {index + 1}</Text>
        <TouchableOpacity onPress={() => removeHerramientas(index)} style={styles.removeBtn}>
          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.rowFields}>
        <InputField label="Gestor" value={formData.gestor} editable={false} style={styles.flex1} />
        <InputField label="Líder" value={formData.lider} editable={false} style={styles.flex1} />
      </View>

      {/* Categorías */}
      <View style={styles.catBadgeRow}>
        {[['#c0392b','No Negociable'],['#e67e22','Seguridad'],['#27ae60','Moto'],['#e74c3c','Equipo'],['#d4a017','Docs']].map(([c,l]) => (
          <View key={l} style={[styles.catBadge, { backgroundColor: c }]}>
            <Text style={[styles.catBadgeTxt, l==='Docs'&&{color:'#111'}]}>{l}</Text>
          </View>
        ))}
      </View>

      <View style={styles.herrGrid}>
        {/* Columna 1 */}
        <View style={{ flex: 1 }}>
          <View style={[styles.catHdr, { backgroundColor: '#c0392b' }]}>
            <Text style={styles.catHdrTxt}>NO NEGOCIABLE</Text>
          </View>
          <View style={styles.catBody}>
            {HERR_NO_NEGOCIABLE_CHECK.map(item => (
              <CheckItem
                key={item}
                label={item}
                value={h.noNegociable[item]}
                onToggle={() => updateHerramientas(index, {
                  noNegociable: { ...h.noNegociable, [item]: !h.noNegociable[item] }
                })}
              />
            ))}
          </View>

          <View style={[styles.catHdr, { backgroundColor: '#e67e22' }]}>
            <Text style={styles.catHdrTxt}>5 NO NEGOCIABLES SEGURIDAD</Text>
          </View>
          <View style={styles.catBody}>
            {renderSinoList(HERR_SEGURIDAD, 'seguridad')}
          </View>

          <View style={[styles.catHdr, { backgroundColor: '#27ae60' }]}>
            <Text style={styles.catHdrTxt}>CONDICIONES MOTOCICLETA</Text>
          </View>
          <View style={styles.catBody}>
            {renderSinoList(HERR_MOTO, 'moto')}
            <InputField label="Kilometraje" value={h.kilometraje} onChangeText={u('kilometraje')} placeholder="Escribir km..." />
            <SinoButton label="Servicio SI/NO" value={h.servicio} onChange={u('servicio')} />
            <SinoButton label="Seguimiento a folios" value={h.seguimientoFolios} onChange={u('seguimientoFolios')} />
          </View>
        </View>

        {/* Columna 2 */}
        <View style={{ flex: 1 }}>
          <View style={[styles.catHdr, { backgroundColor: '#e74c3c' }]}>
            <Text style={styles.catHdrTxt}>EQUIPO DE PROTECCIÓN Y UNIFORME</Text>
          </View>
          <View style={styles.catBody}>
            {renderSinoList(HERR_EQUIPO, 'equipo')}
          </View>

          <View style={[styles.catHdr, { backgroundColor: '#d4a017' }]}>
            <Text style={[styles.catHdrTxt, { color: '#111' }]}>DOCUMENTOS</Text>
          </View>
          <View style={styles.catBody}>
            {renderSinoList(HERR_DOCUMENTOS, 'documentos')}
          </View>

          <Text style={styles.obsLabel}>OBSERVACIONES</Text>
          <TextInput
            style={[styles.obsTa, { height: 55 }]}
            value={h.observaciones}
            onChangeText={u('observaciones')}
            placeholder="Observaciones del checklist..."
            placeholderTextColor={COLORS.gray}
            multiline
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* Firma y compromiso */}
      <View style={styles.compromisoRow}>
        <InputField label="Fecha compromiso" value={h.fechaCompromiso} onChangeText={u('fechaCompromiso')} placeholder="dd/mm/2026" style={{ flex: 2 }} />
        <InputField label="Cumplió" value={h.cumplio} onChangeText={u('cumplio')} placeholder="SÍ / NO" style={{ flex: 1 }} />
      </View>
    </View>
  );
}

// ── PANTALLA PRINCIPAL ────────────────────────────────────────────────────────
export default function FormularioPrincipalScreen({ navigation }) {
  const { formData, addCliente, addSolicitud, addHerramientas } = useForm();

  return (
    <View style={{ flex: 1 }}>
      <ProgressBar currentStep={2} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* CLIENTES */}
        {formData.clientes.length > 0 && (
          <>
            <SectionHeader title="Clientes visitados" />
            {formData.clientes.map((_, i) => <ClienteCard key={i} index={i} />)}
          </>
        )}

        {/* SOLICITUDES */}
        {formData.solicitudes.length > 0 && (
          <>
            <SectionHeader title="Solicitudes" />
            {formData.solicitudes.map((_, i) => <SolicitudCard key={i} index={i} />)}
          </>
        )}

        {/* HERRAMIENTAS */}
        {formData.herramientasSecs.length > 0 && (
          <>
            <SectionHeader title="Supervisión de Herramientas" />
            {formData.herramientasSecs.map((_, i) => <HerramientasCard key={i} index={i} />)}
          </>
        )}

        {/* Vacío */}
        {formData.clientes.length === 0 && formData.solicitudes.length === 0 && formData.herramientasSecs.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={52} color={COLORS.gray} />
            <Text style={styles.emptyTxt}>Usa los botones de abajo para agregar secciones</Text>
          </View>
        )}

        <TouchableOpacity style={styles.btnNext} onPress={() => navigation.navigate('Coaching')}>
          <Text style={styles.btnNextText}>Ir a Coaching y Firmas →</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* FABs flotantes — igual que el HTML */}
      <View style={styles.fabs}>
        <TouchableOpacity style={[styles.fab, { backgroundColor: '#1a5276' }]} onPress={addCliente}>
          <Ionicons name="person-add-outline" size={20} color="#fff" />
          <Text style={styles.fabTxt}>Cliente</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, { backgroundColor: '#d35400' }]} onPress={addSolicitud}>
          <Ionicons name="search-outline" size={20} color="#fff" />
          <Text style={styles.fabTxt}>Solicitud</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, { backgroundColor: '#8e44ad' }]} onPress={addHerramientas}>
          <Ionicons name="construct-outline" size={20} color="#fff" />
          <Text style={styles.fabTxt}>Herram.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.lightBg },
  content: { padding: 16, paddingBottom: 120 },
  ccard: {
    borderWidth: 1.5, borderColor: '#444', borderStyle: 'dashed',
    borderRadius: 6, padding: 10, marginBottom: 16, backgroundColor: '#fff',
  },
  ccardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ccardTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  removeBtn: { padding: 4 },
  rowFields: { flexDirection: 'row', gap: 8 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  atendioRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 4 },
  atendioLabel: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  atendioBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1.5, borderColor: COLORS.border },
  atiendeBtnActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  atiendeTxt: { fontSize: 12, color: COLORS.textLight, fontWeight: '600' },
  atiendeTxtActive: { color: '#fff' },
  checkGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  checkCol: { flex: 1 },
  colHdr: {
    fontSize: 9, fontWeight: 'bold', borderWidth: 1, borderColor: '#333',
    padding: 2, textAlign: 'center', marginBottom: 4, backgroundColor: '#f2f2f2',
  },
  evidenciasRow: { flexDirection: 'row', gap: 8, height: 100, marginBottom: 10 },
  gpsBox: {
    width: 90, borderWidth: 2, borderColor: '#1a2e4a', borderRadius: 4,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa',
  },
  gpsLocked: { borderColor: '#27ae60', backgroundColor: '#e8f5e9' },
  gpsTxt: { fontSize: 9, color: '#777', textAlign: 'center', fontWeight: 'bold', marginTop: 2 },
  gpsLockedText: { fontSize: 8, color: '#27ae60', fontWeight: 'bold' },
  gpsCoords: { fontSize: 7, color: '#555', textAlign: 'center', marginTop: 2 },
  fotoBox: {
    flex: 1, borderWidth: 2, borderColor: '#c0392b', borderStyle: 'dashed',
    borderRadius: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee',
  },
  fotoLocked: { borderColor: '#27ae60', borderStyle: 'solid', backgroundColor: '#f0fff0' },
  fotoImg: { width: '100%', height: '100%', borderRadius: 3 },
  fotoTxt: { fontSize: 9, color: '#c0392b', fontWeight: 'bold', textAlign: 'center', marginTop: 2 },
  obsLabel: { fontSize: 9, fontWeight: 'bold', borderWidth: 1, borderColor: '#333', padding: 2, textAlign: 'center', backgroundColor: '#f2f2f2', marginBottom: 4 },
  obsTa: {
    width: '100%', minHeight: 80, borderWidth: 1, borderColor: '#999',
    padding: 5, fontSize: 10, fontFamily: 'Arial', lineHeight: 16,
  },
  contactRow: { marginBottom: 8 },
  recBox: { backgroundColor: '#f0f4f8', borderRadius: 4, padding: 6, marginTop: 6 },
  recItem: { fontSize: 9, color: '#444', lineHeight: 16, marginBottom: 1 },
  catBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  catBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 },
  catBadgeTxt: { fontSize: 8, fontWeight: 'bold', color: '#fff' },
  herrGrid: { flexDirection: 'row', gap: 8 },
  catHdr: { padding: 3, marginBottom: 3, borderRadius: 2 },
  catHdrTxt: { fontSize: 9, fontWeight: 'bold', color: '#fff' },
  catBody: { borderWidth: 1, borderColor: '#ccc', padding: 4, marginBottom: 4, borderRadius: 2 },
  compromisoRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  empty: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  emptyTxt: { fontSize: 14, color: COLORS.darkGray, marginTop: 12, textAlign: 'center', lineHeight: 20 },
  fabs: {
    position: 'absolute', bottom: 80, right: 14,
    flexDirection: 'column', gap: 10, alignItems: 'center',
  },
  fab: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 5,
    gap: 2,
  },
  fabTxt: { fontSize: 8, fontWeight: 'bold', color: '#fff' },
  btnNext: {
    marginTop: 16, backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  btnNextText: { fontSize: 15, fontWeight: '700', color: COLORS.gold },
});
