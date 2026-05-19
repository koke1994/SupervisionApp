import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm } from '../context/FormContext';
import { COLORS } from '../constants/colors';
import { CLASIFICACIONES_GIC } from '../constants/formDefaults';
import InputField from '../components/InputField';
import SectionHeader from '../components/SectionHeader';
import ProgressBar from '../components/ProgressBar';

const TIPO_OPTIONS = ['ACOMPAÑAMIENTO', 'SUPERVISION'];

export default function DatosGeneralesScreen({ navigation }) {
  const { formData, update } = useForm();

  const u = (field) => (val) => update({ [field]: val });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ProgressBar currentStep={1} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* FOLIO */}
        <View style={styles.folioRow}>
          <Text style={styles.folioLabel}>ID Reporte:</Text>
          <Text style={styles.folioVal}>{formData.folio}</Text>
        </View>

        {/* TIPO DE GESTIÓN */}
        <SectionHeader title="Tipo de gestión" subtitle="Paso 1 de 5" />
        <View style={styles.tipoRow}>
          {TIPO_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.tipoBtn, formData.tipoGestion === opt && styles.tipoBtnActive]}
              onPress={() => update({ tipoGestion: opt })}
            >
              <Text style={[styles.tipoBtnText, formData.tipoGestion === opt && styles.tipoBtnTextActive]}>
                {opt === 'ACOMPAÑAMIENTO' ? '👥 Acompañamiento' : '🔍 Supervisión'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DATOS BÁSICOS */}
        <SectionHeader title="Datos del día" />
        <View style={styles.card}>
          <View style={styles.rowFields}>
            <InputField label="Fecha" value={formData.fecha} onChangeText={u('fecha')} style={styles.flex2} />
            <InputField label="Semana" value={formData.semana} onChangeText={u('semana')} placeholder="S14" style={styles.flex1} />
          </View>
          <InputField label="Gerencia" value={formData.gerencia} onChangeText={u('gerencia')} />
          <InputField label="Gestor" value={formData.gestor} onChangeText={u('gestor')} placeholder="Nombre completo" />
          <InputField label="Líder" value={formData.lider} onChangeText={u('lider')} placeholder="Nombre completo" />
        </View>

        {/* INDICADORES */}
        <SectionHeader title="Indicadores operativos" />
        <View style={styles.card}>
          <View style={styles.rowFields}>
            <InputField label="Tareas realizadas" value={formData.tareasRealizadas} onChangeText={u('tareasRealizadas')} keyboardType="numeric" style={styles.flex1} />
            <InputField label="Cobrado $" value={formData.cobrado} onChangeText={u('cobrado')} keyboardType="decimal-pad" style={styles.flex1} />
            <InputField label="Alcance %" value={formData.alcance} onChangeText={u('alcance')} keyboardType="numeric" style={styles.flex1} />
          </View>
          <View style={styles.rowFields}>
            <InputField label="Hora 1ª gestión" value={formData.horaPrimeraGestion} onChangeText={u('horaPrimeraGestion')} placeholder="HH:MM" style={styles.flex1} />
            <InputField label="Herramientas" value={formData.herramientas} onChangeText={u('herramientas')} style={styles.flex1} />
            <InputField label="Imagen" value={formData.imagen} onChangeText={u('imagen')} style={styles.flex1} />
          </View>
        </View>

        {/* GIC */}
        <SectionHeader title="Clasificación GIC" />
        <View style={styles.card}>
          <View style={styles.gicRow}>
            {CLASIFICACIONES_GIC.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.gicBtn, formData.clasificacionGIC === opt.value && styles.gicBtnActive]}
                onPress={() => update({ clasificacionGIC: opt.value })}
              >
                <Text style={[styles.gicText, formData.clasificacionGIC === opt.value && styles.gicTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.btnNext} onPress={() => navigation.navigate('FormularioPrincipal')}>
          <Text style={styles.btnNextText}>Ir al Formulario →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.lightBg },
  content: { padding: 16, paddingBottom: 40 },
  folioRow: {
    flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center',
    backgroundColor: COLORS.primary, padding: 8, borderRadius: 6, marginBottom: 8,
  },
  folioLabel: { fontSize: 10, color: COLORS.gray, marginRight: 6 },
  folioVal: { fontSize: 11, color: '#7fb3f5', fontWeight: 'bold', letterSpacing: 0.3 },
  tipoRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  tipoBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 10,
    borderWidth: 2, borderColor: COLORS.border, alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  tipoBtnActive: { backgroundColor: '#EBF5FB', borderColor: COLORS.secondary },
  tipoBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.gray },
  tipoBtnTextActive: { color: COLORS.secondary },
  card: {
    backgroundColor: COLORS.white, borderRadius: 10, padding: 14, marginBottom: 8,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3,
  },
  rowFields: { flexDirection: 'row', gap: 8 },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  gicRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gicBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white,
  },
  gicBtnActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  gicText: { fontSize: 13, color: COLORS.textLight },
  gicTextActive: { color: COLORS.white, fontWeight: '700' },
  btnNext: {
    marginTop: 20, backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  btnNextText: { fontSize: 15, fontWeight: '700', color: COLORS.gold },
});
