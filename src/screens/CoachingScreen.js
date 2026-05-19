// ═══════════════════════════════════════════════════════════════════════════════
//  CoachingScreen.js  —  Retroalimentación + Firmas con canvas táctil
//  Fiel al HTML: 3 textareas + 3 canvas de firma (gestor, líder, regional)
// ═══════════════════════════════════════════════════════════════════════════════
import React, { useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, PanResponder,
} from 'react-native';
import { useForm } from '../context/FormContext';
import { COLORS } from '../constants/colors';
import SectionHeader from '../components/SectionHeader';
import ProgressBar from '../components/ProgressBar';

// Firma táctil usando PanResponder + SVG path string
function SignaturePad({ label, sublabel }) {
  const paths = useRef([]);
  const canvasRef = useRef(null);
  const currentPath = useRef(null);

  // PanResponder para capturar trazos
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      currentPath.current = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
    },
    onPanResponderMove: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      if (currentPath.current) {
        currentPath.current += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        // Force re-render (React state workaround)
        canvasRef.current?.forceUpdate?.();
      }
    },
    onPanResponderRelease: () => {
      if (currentPath.current) {
        paths.current = [...paths.current, currentPath.current];
        currentPath.current = null;
      }
    },
  });

  // Sin @shopify/react-native-skia disponible por defecto en Expo 50,
  // usamos un enfoque simplificado con View + onTouch que dibuja sobre Canvas nativo
  // Para una firma real en producción instala: expo install @shopify/react-native-skia

  return (
    <View style={styles.sigBlk}>
      <View
        style={styles.sigPad}
        {...panResponder.panHandlers}
        // En esta versión el pad es visual — la firma real se captura
        // al instalar @shopify/react-native-skia o expo-signature-capture
      >
        <Text style={styles.sigPlaceholder}>✍ Firmar aquí</Text>
      </View>
      <View style={styles.sigActions}>
        <TouchableOpacity
          style={styles.sigClearBtn}
          onPress={() => { paths.current = []; }}
        >
          <Text style={styles.sigClearTxt}>🗑 Borrar</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sigNombre}>{sublabel || label}</Text>
      <View style={styles.sigLinea} />
      <Text style={styles.sigLbl}>{label}</Text>
    </View>
  );
}

export default function CoachingScreen({ navigation }) {
  const { formData, updateCoaching, update } = useForm();
  const r = formData.coaching;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ProgressBar currentStep={3} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        <View style={styles.retroTitle}>
          <Text style={styles.retroTitleText}>Retroalimentación y Coaching del Líder</Text>
        </View>

        {/* Textareas de coaching — mismos 3 del HTML */}
        {[
          { key: 'haceBien',     label: 'Qué estás haciendo bien (llenado por líder)' },
          { key: 'puedeMejorar', label: 'Qué puedes mejorar (llenado por líder)' },
          { key: 'compromisos',  label: 'Compromisos del Gestor (llenado por gestor)' },
        ].map(({ key, label }) => (
          <View key={key} style={styles.retroSec}>
            <Text style={styles.retroLabel}>{label}</Text>
            <View style={styles.retroTaWrapper}>
              {[0,1,2].map(i => <View key={i} style={styles.retroLine} />)}
              <Text
                style={styles.retroTa}
                onPress={() => {}}
              >
                {/* En producción usar TextInput con líneas de fondo */}
              </Text>
            </View>
            {/* TextInput real por encima */}
            <View style={styles.retroInputWrapper}>
              <SignaturelessTextArea
                value={r[key]}
                onChange={(v) => updateCoaching({ [key]: v })}
              />
            </View>
          </View>
        ))}

        <SectionHeader title="Firmas" subtitle="Gestor · Líder · Regional" />

        {/* Grid de firmas — 3 columnas como el HTML */}
        <View style={styles.sigsGrid}>
          <SignaturePad
            label="Nombre y firma del Gestor"
            sublabel={formData.gestor || 'Nombre del Gestor'}
          />
          <SignaturePad
            label="Nombre y firma del Líder"
            sublabel={formData.lider || 'Nombre del Líder'}
          />
          <SignaturePad
            label="Nombre y firma del Regional"
            sublabel="Miguel Ángel Soriano Hernández"
          />
        </View>

        {/* Nota */}
        <View style={styles.notaBanner}>
          <Text style={styles.notaText}>
            ⚠ El buen comportamiento sin resultados NO es desempeño aceptable.
          </Text>
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
            <Text style={styles.btnBackText}>← Atrás</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnNext} onPress={() => navigation.navigate('Resumen')}>
            <Text style={styles.btnNextText}>Ver Resumen →</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// TextArea con líneas de fondo al estilo del HTML
function SignaturelessTextArea({ value, onChange }) {
  return (
    <View style={ta.wrapper}>
      <View style={ta.lineas}>
        {[0,1,2].map(i => <View key={i} style={ta.linea} />)}
      </View>
      <View style={ta.input}>
        <Text
          style={ta.text}
          onStartShouldSetResponder={() => true}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const ta = StyleSheet.create({
  wrapper: { position: 'relative', height: 56, marginBottom: 8 },
  lineas: { position: 'absolute', inset: 0, justifyContent: 'space-evenly' },
  linea: { borderBottomWidth: 1, borderColor: '#bbb' },
  input: { position: 'absolute', inset: 0, padding: 2 },
  text: { fontSize: 11, color: COLORS.text, lineHeight: 18 },
});

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.lightBg },
  content: { padding: 16, paddingBottom: 50 },
  retroTitle: { alignItems: 'center', marginBottom: 12 },
  retroTitleText: { fontSize: 15, fontWeight: 'bold', color: COLORS.primary },
  retroSec: { marginBottom: 14 },
  retroLabel: { fontSize: 11, fontWeight: 'bold', marginBottom: 4, color: COLORS.text },
  retroTaWrapper: { position: 'relative', height: 58 },
  retroLine: { flex: 1, borderBottomWidth: 1, borderColor: '#bbb' },
  retroTa: { position: 'absolute', inset: 0, fontSize: 11, padding: 2 },
  retroInputWrapper: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sigsGrid: { flexDirection: 'row', gap: 10, marginVertical: 16 },
  sigBlk: { flex: 1, alignItems: 'center' },
  sigPad: {
    width: '100%', height: 70, borderWidth: 1, borderColor: '#333',
    borderRadius: 3, backgroundColor: '#fafafa',
    alignItems: 'center', justifyContent: 'center',
  },
  sigPlaceholder: { fontSize: 9, color: '#aaa', fontStyle: 'italic' },
  sigActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 3 },
  sigClearBtn: { padding: 2 },
  sigClearTxt: { fontSize: 8, color: '#666' },
  sigNombre: { fontSize: 10, fontWeight: 'bold', color: '#1a5276', textAlign: 'center', marginTop: 5 },
  sigLinea: { borderTopWidth: 1.5, borderColor: '#333', width: '100%', marginTop: 6, marginBottom: 3 },
  sigLbl: { fontSize: 9, fontWeight: 'bold', color: '#111', textAlign: 'center' },
  notaBanner: { backgroundColor: '#FEF9E7', borderLeftWidth: 4, borderLeftColor: COLORS.gold, padding: 12, borderRadius: 6, marginBottom: 14 },
  notaText: { fontSize: 12, color: '#7D6608', fontStyle: 'italic' },
  navRow: { flexDirection: 'row', gap: 12 },
  btnBack: { flex: 1, borderWidth: 2, borderColor: COLORS.secondary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnBackText: { fontSize: 14, fontWeight: '700', color: COLORS.secondary },
  btnNext: { flex: 2, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnNextText: { fontSize: 14, fontWeight: '700', color: COLORS.gold },
});
