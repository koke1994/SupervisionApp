import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm } from '../context/FormContext';
import { COLORS } from '../constants/colors';
import SectionHeader from '../components/SectionHeader';
import ProgressBar from '../components/ProgressBar';
import { guardarSupervision, actualizarSupervision } from '../utils/firebaseService';
import { generarYCompartirPDF } from '../utils/pdfGenerator';
import { isFirebaseConfigured } from '../../firebase';

function ResumenFila({ label, value }) {
  return (
    <View style={styles.fila}>
      <Text style={styles.filaLabel}>{label}</Text>
      <Text style={styles.filaValue}>{value || '—'}</Text>
    </View>
  );
}

function SemaforoAlcance({ alcance }) {
  const val = parseFloat(alcance) || 0;
  let color = COLORS.danger;
  let label = 'Bajo';
  if (val >= 90) { color = COLORS.teal; label = 'Top'; }
  else if (val >= 75) { color = COLORS.success; label = 'Satisfactorio'; }
  else if (val >= 60) { color = COLORS.warning; label = 'Medio'; }

  return (
    <View style={[styles.semaforo, { backgroundColor: color }]}>
      <Text style={styles.semaforoVal}>{val}%</Text>
      <Text style={styles.semaforoLabel}>{label}</Text>
    </View>
  );
}

export default function ResumenScreen({ navigation }) {
  const { formData, updateFormData, resetForm } = useForm();
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [savedId, setSavedId] = useState(formData.id || null);

  const clientesLlenados = formData.clientes.filter((c) => c.nombre.trim() !== '').length;

  async function handleGuardar() {
    setSaving(true);
    try {
      if (!isFirebaseConfigured) {
        Alert.alert('Firebase no configurado', 'Configura Firebase en firebase.js para sincronizar en la nube.');
        return;
      }
      let id;
      if (savedId) {
        await actualizarSupervision(savedId, formData);
        id = savedId;
        Alert.alert('✅ Actualizado', 'La sesión fue actualizada en la nube.');
      } else {
        id = await guardarSupervision(formData);
        setSavedId(id);
        updateFormData({ id });
        Alert.alert('✅ Guardado', 'Sesión sincronizada en Firebase correctamente.');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerarPDF() {
    setGenerating(true);
    try {
      await generarYCompartirPDF(formData);
    } catch (e) {
      Alert.alert('Error al generar PDF', e.message);
    } finally {
      setGenerating(false);
    }
  }

  function handleNuevaSesion() {
    Alert.alert(
      'Nueva sesión',
      '¿Deseas iniciar una nueva sesión? Los datos actuales no se perderán si ya los guardaste.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Nueva sesión',
          onPress: () => {
            resetForm();
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          },
        },
      ]
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ProgressBar currentStep={5} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Estado guardado */}
        {savedId && (
          <View style={styles.savedBanner}>
            <Ionicons name="cloud-done-outline" size={16} color={COLORS.teal} />
            <Text style={styles.savedText}>  Guardado en la nube · ID: {savedId.slice(0, 8)}…</Text>
          </View>
        )}

        <SectionHeader title="Resumen de la sesión" subtitle="Paso 5 de 5" />

        {/* Semáforo alcance */}
        <View style={styles.semaforoRow}>
          <SemaforoAlcance alcance={formData.alcance} />
          <View style={styles.semaforoMeta}>
            <Text style={styles.semaforoMetaLabel}>Total cobrado</Text>
            <Text style={styles.semaforoMetaVal}>${formData.cobrado || '0'}</Text>
            <Text style={styles.semaforoMetaLabel}>Tareas</Text>
            <Text style={styles.semaforoMetaVal}>{formData.tareasRealizadas || '0'}</Text>
          </View>
        </View>

        {/* Datos generales */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Datos Generales</Text>
          <ResumenFila label="Fecha" value={formData.fecha} />
          <ResumenFila label="Semana" value={formData.semana} />
          <ResumenFila label="Gerencia" value={formData.gerencia} />
          <ResumenFila label="Gestor" value={formData.gestor} />
          <ResumenFila label="Líder" value={formData.lider} />
          <ResumenFila label="Tipo visita" value={formData.tipoVisita?.toUpperCase()} />
          <ResumenFila label="Hora 1ª gestión" value={formData.horaPrimeraGestion} />
        </View>

        {/* Clientes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Clientes Visitados ({clientesLlenados}/3)</Text>
          {formData.clientes.map((c, i) => (
            <View key={i} style={styles.clienteResumen}>
              <Text style={styles.clienteNum}>Cliente {i + 1}</Text>
              <Text style={styles.clienteNombre}>{c.nombre || '(sin nombre)'}</Text>
              <View style={styles.clienteStats}>
                <Text style={styles.clienteStat}>
                  Pasos: {c.pasos.filter(Boolean).length}/{c.pasos.length}
                </Text>
                <Text style={styles.clienteStat}>
                  Saldo: ${c.saldo || '0'}
                </Text>
                <Text style={styles.clienteStat}>
                  Atendió: {c.atendio || '—'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Retroalimentación */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Retroalimentación</Text>
          <ResumenFila label="Qué hace bien" value={formData.retroalimentacion.haceBien} />
          <ResumenFila label="Puede mejorar" value={formData.retroalimentacion.puedeMejorar} />
          <ResumenFila label="Compromisos" value={formData.retroalimentacion.compromisos} />
        </View>

        {/* Acciones */}
        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Acciones finales</Text>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnCloud, saving && styles.btnDisabled]}
            onPress={handleGuardar}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color={COLORS.white} />
                <Text style={styles.actionBtnText}>
                  {savedId ? 'Actualizar en la nube' : 'Guardar en la nube'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPDF, generating && styles.btnDisabled]}
            onPress={handleGenerarPDF}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <>
                <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
                <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>
                  Generar y compartir PDF
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="create-outline" size={18} color={COLORS.secondary} />
            <Text style={[styles.actionBtnText, { color: COLORS.secondary }]}>
              Editar retroalimentación
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnNew]} onPress={handleNuevaSesion}>
            <Ionicons name="add-circle-outline" size={18} color={COLORS.gold} />
            <Text style={[styles.actionBtnText, { color: COLORS.gold }]}>
              Nueva sesión
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.lightBg },
  content: { padding: 16, paddingBottom: 50 },
  savedBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#D5F5E3', borderRadius: 8, padding: 10, marginBottom: 8,
  },
  savedText: { fontSize: 12, color: '#1E8449' },
  semaforoRow: {
    flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 16,
  },
  semaforo: {
    width: 90, height: 90, borderRadius: 45,
    alignItems: 'center', justifyContent: 'center',
    elevation: 4,
  },
  semaforoVal: { fontSize: 22, fontWeight: '800', color: COLORS.white },
  semaforoLabel: { fontSize: 11, color: COLORS.white, fontWeight: '600' },
  semaforoMeta: { flex: 1, gap: 2 },
  semaforoMetaLabel: { fontSize: 11, color: COLORS.textLight },
  semaforoMetaVal: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  card: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginBottom: 10, textTransform: 'uppercase' },
  fila: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderColor: COLORS.lightBg },
  filaLabel: { fontSize: 12, color: COLORS.textLight },
  filaValue: { fontSize: 12, fontWeight: '600', color: COLORS.text, maxWidth: '55%', textAlign: 'right' },
  clienteResumen: {
    borderLeftWidth: 3, borderLeftColor: COLORS.teal, paddingLeft: 10, marginBottom: 10,
  },
  clienteNum: { fontSize: 10, color: COLORS.textLight, textTransform: 'uppercase' },
  clienteNombre: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  clienteStats: { flexDirection: 'row', gap: 12, marginTop: 3 },
  clienteStat: { fontSize: 11, color: COLORS.textLight },
  actionsCard: {
    backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, gap: 10,
  },
  actionsTitle: { fontSize: 13, color: COLORS.gold, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 10, paddingVertical: 14, paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: COLORS.secondary,
  },
  actionBtnCloud: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  actionBtnPDF: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  actionBtnNew: { borderColor: COLORS.gold },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  btnDisabled: { opacity: 0.6 },
});
