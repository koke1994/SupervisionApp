// ═══════════════════════════════════════════════════════════════════════════════
//  CoachingScreen.js  —  Retroalimentación + Firmas con canvas táctil
//  Fiel al HTML: 3 textareas + 3 canvas de firma (gestor, líder, regional)
// ═══════════════════════════════════════════════════════════════════════════════
import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Image, Modal, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from '../context/FormContext';
import { COLORS } from '../constants/colors';
import SectionHeader from '../components/SectionHeader';
import ProgressBar from '../components/ProgressBar';
import SignatureScreen from 'react-native-signature-canvas';
import * as ScreenOrientation from 'expo-screen-orientation';

function SignaturePad({ label, sublabel, value, onSignPress }) {
  return (
    <View style={styles.sigBlk}>
      <TouchableOpacity style={styles.sigPadContainer} onPress={onSignPress}>
        {value ? (
          <Image source={{ uri: value }} style={styles.sigImage} resizeMode="contain" />
        ) : (
          <Text style={styles.sigPlaceholder}>✍ Toca para firmar</Text>
        )}
      </TouchableOpacity>
      <Text style={styles.sigNombre}>{sublabel || label}</Text>
      <View style={styles.sigLinea} />
      <Text style={styles.sigLbl}>{label}</Text>
    </View>
  );
}

export default function CoachingScreen({ navigation }) {
  const { formData, updateCoaching, update } = useForm();
  const r = formData.coaching;

  const [sigModal, setSigModal] = useState({ visible: false, targetField: null, title: '' });
  const sigRef = useRef(null);

  const openSignaturePad = async (targetField, title) => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    setSigModal({ visible: true, targetField, title });
  };

  const closeSignaturePad = async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    setSigModal({ visible: false, targetField: null, title: '' });
  };

  const handleSignature = async (signature) => {
    update({ [sigModal.targetField]: signature });
    await closeSignaturePad();
  };

  const handleNext = () => {
    const { haceBien, puedeMejorar, compromisos } = formData.coaching || {};

    if (!haceBien?.trim() || !puedeMejorar?.trim() || !compromisos?.trim()) {
      Alert.alert('⚠️ Faltan datos', 'Por favor completa los 3 campos de retroalimentación y compromisos antes de continuar.');
      return;
    }

    if (!formData.firmaGestor || !formData.firmaLider) {
      Alert.alert('✍️ Faltan firmas', 'Debes recolectar al menos las firmas del Gestor y del Líder para poder continuar.');
      return;
    }

    navigation.navigate('Resumen');
  };

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
            <SignaturelessTextArea
              value={r?.[key] || ''}
              onChange={(v) => updateCoaching({ [key]: v })}
            />
          </View>
        ))}

        <SectionHeader title="Firmas" subtitle="Gestor · Líder · Regional" />

        {/* Grid de firmas — 3 columnas como el HTML */}
        <View style={styles.sigsGrid}>
          <SignaturePad
            label="Nombre y firma del Gestor"
            sublabel={formData.gestor || 'Nombre del Gestor'}
            value={formData.firmaGestor}
            onSignPress={() => openSignaturePad('firmaGestor', 'Firma del Gestor')}
          />
          <SignaturePad
            label="Nombre y firma del Líder"
            sublabel={formData.lider || 'Nombre del Líder'}
            value={formData.firmaLider}
            onSignPress={() => openSignaturePad('firmaLider', 'Firma del Líder')}
          />
          <SignaturePad
        label="Firma del Regional (Opcional)"
            sublabel="Miguel Ángel Soriano Hernández"
            value={formData.firmaRegional}
            onSignPress={() => openSignaturePad('firmaRegional', 'Firma del Regional')}
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
          <TouchableOpacity style={styles.btnNext} onPress={handleNext}>
            <Text style={styles.btnNextText}>Ver Resumen →</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Modal de Firma */}
      <Modal visible={sigModal.visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{sigModal.title}</Text>
            <TouchableOpacity onPress={closeSignaturePad}>
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sigCanvasWrapper}>
            <SignatureScreen
              ref={sigRef}
              onOK={handleSignature}
              webStyle={`.m-signature-pad { box-shadow: none; border: none; } .m-signature-pad--body { border: none; } .m-signature-pad--footer { display: none; margin: 0px; }`}
              autoClear={false}
              imageType="image/png"
            />
          </View>
          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnClear]} onPress={() => sigRef.current?.clearSignature()}>
              <Text style={styles.modalBtnClearText}>🗑 Borrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSave]} onPress={() => sigRef.current?.readSignature()}>
              <Text style={styles.modalBtnSaveText}>✔ Guardar Firma</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
      <TextInput
        style={ta.input}
        multiline
        numberOfLines={3}
        value={value}
        onChangeText={onChange}
        placeholder="Escribe aquí..."
        placeholderTextColor="#999"
        textAlignVertical="top"
      />
    </View>
  );
}

const ta = StyleSheet.create({
  wrapper: { position: 'relative', height: 56, marginBottom: 8 },
  lineas: { position: 'absolute', inset: 0, justifyContent: 'space-evenly' },
  linea: { borderBottomWidth: 1, borderColor: '#bbb' },
  input: { position: 'absolute', inset: 0, padding: 4, fontSize: 11, color: '#333', lineHeight: 18 },
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
  sigPadContainer: {
    width: '100%', height: 70, borderWidth: 1, borderColor: '#ccc',
    borderRadius: 6, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
  },
  sigImage: { width: '100%', height: '100%' },
  sigPlaceholder: { fontSize: 9, color: COLORS.primary, fontStyle: 'italic', fontWeight: 'bold' },
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

  modalContainer: { flex: 1, backgroundColor: '#f5f5f5' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  modalCloseText: { fontSize: 16, color: COLORS.danger },
  sigCanvasWrapper: { flex: 1, backgroundColor: '#fff' },
  modalActions: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ddd', gap: 12 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  modalBtnClear: { backgroundColor: '#f8d7da' },
  modalBtnClearText: { color: '#721c24', fontWeight: 'bold', fontSize: 16 },
  modalBtnSave: { backgroundColor: COLORS.primary },
  modalBtnSaveText: { color: COLORS.gold, fontWeight: 'bold', fontSize: 16 },
});
