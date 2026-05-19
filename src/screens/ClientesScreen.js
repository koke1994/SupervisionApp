import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useForm } from '../context/FormContext';
import { COLORS } from '../constants/colors';
import { PASOS_VISITA, ACCIONES_ADICIONALES } from '../constants/formDefaults';
import InputField from '../components/InputField';
import CheckItem from '../components/CheckItem';
import RadioGroup from '../components/RadioGroup';
import SectionHeader from '../components/SectionHeader';
import ProgressBar from '../components/ProgressBar';

const ATIENDE = [
  { label: 'Cliente', value: 'cliente' },
  { label: 'Familiar', value: 'familiar' },
];

function ClienteCard({ index }) {
  const { formData, updateCliente, updateClientePasos, updateClienteAccion } = useForm();
  const c = formData.clientes[index];
  const u = (field) => (val) => updateCliente(index, { [field]: val });

  const pasosCompletos = c.pasos.filter(Boolean).length;
  const totalPasos = PASOS_VISITA.length;

  return (
    <View style={styles.clienteCard}>
      {/* Header con progreso */}
      <View style={styles.cardHeader}>
        <View style={styles.progressPill}>
          <Text style={styles.progressText}>{pasosCompletos}/{totalPasos} pasos</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(pasosCompletos / totalPasos) * 100}%` }]} />
          </View>
        </View>
      </View>

      <InputField label="Nombre del cliente" value={c.nombre} onChangeText={u('nombre')} placeholder="Nombre completo" />

      <View style={styles.rowFields}>
        <InputField label="Semanas" value={c.semanas} onChangeText={u('semanas')} placeholder="0" keyboardType="numeric" style={styles.fieldSm} />
        <InputField label="Saldo ($)" value={c.saldo} onChangeText={u('saldo')} placeholder="0.00" keyboardType="decimal-pad" style={styles.fieldMd} />
        <InputField label="Pago sug. ($)" value={c.pagoSugerido} onChangeText={u('pagoSugerido')} placeholder="0.00" keyboardType="decimal-pad" style={styles.fieldMd} />
      </View>

      <InputField label="Alternativas" value={c.alternativas} onChangeText={u('alternativas')} placeholder="Convenio, fecha de pago, etc." />

      <RadioGroup label="¿Quién atendió?" options={ATIENDE} value={c.atendio} onChange={u('atendio')} />

      <SectionHeader title="Pasos de visita" subtitle={`${pasosCompletos} de ${totalPasos} realizados`} />
      {PASOS_VISITA.map((paso, i) => (
        <CheckItem
          key={i}
          label={paso}
          value={c.pasos[i]}
          onToggle={() => updateClientePasos(index, i, !c.pasos[i])}
        />
      ))}

      <SectionHeader title="Acciones adicionales" />
      {ACCIONES_ADICIONALES.map((accion, i) => (
        <CheckItem
          key={i}
          label={accion}
          value={c.accionesAdicionales[i]}
          onToggle={() => updateClienteAccion(index, i, !c.accionesAdicionales[i])}
        />
      ))}

      <CheckItem
        label="Camino para cobrar mejor"
        value={c.caminoCobrarMejor}
        onToggle={() => updateCliente(index, { caminoCobrarMejor: !c.caminoCobrarMejor })}
        style={styles.extraCheck}
      />
      <CheckItem
        label="3 Pasos de búsqueda de cliente"
        value={c.tresPasosBusqueda}
        onToggle={() => updateCliente(index, { tresPasosBusqueda: !c.tresPasosBusqueda })}
      />

      <InputField
        label="Observaciones"
        value={c.observaciones}
        onChangeText={u('observaciones')}
        placeholder="Notas sobre la visita..."
        multiline
        numberOfLines={3}
        style={{ marginTop: 8 }}
      />
    </View>
  );
}

export default function ClientesScreen({ navigation }) {
  const [tab, setTab] = useState(0);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ProgressBar currentStep={2} />

      {/* Tabs clientes */}
      <View style={styles.tabs}>
        {[1, 2, 3].map((n, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.tab, tab === i && styles.tabActive]}
            onPress={() => setTab(i)}
          >
            <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>
              Cliente {n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <SectionHeader title={`Cliente ${tab + 1}`} subtitle="Paso 2 de 5" />
        <ClienteCard index={tab} />

        {/* Navegación */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
            <Text style={styles.btnBackText}>← Atrás</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnNext} onPress={() => navigation.navigate('Solicitudes')}>
            <Text style={styles.btnNextText}>Siguiente →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', backgroundColor: COLORS.primary },
  tab: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.gold },
  tabText: { fontSize: 13, color: COLORS.gray, fontWeight: '600' },
  tabTextActive: { color: COLORS.gold },
  scroll: { flex: 1, backgroundColor: COLORS.lightBg },
  content: { padding: 16, paddingBottom: 40 },
  clienteCard: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 16,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4,
  },
  cardHeader: { marginBottom: 12 },
  progressPill: { alignItems: 'flex-end' },
  progressText: { fontSize: 11, color: COLORS.textLight, marginBottom: 4 },
  progressBar: {
    width: 100, height: 5, backgroundColor: COLORS.border, borderRadius: 3,
  },
  progressFill: {
    height: 5, backgroundColor: COLORS.teal, borderRadius: 3,
  },
  rowFields: { flexDirection: 'row', gap: 8 },
  fieldSm: { flex: 1 },
  fieldMd: { flex: 1.5 },
  extraCheck: { marginTop: 8 },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  btnBack: {
    flex: 1, borderWidth: 2, borderColor: COLORS.secondary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  btnBackText: { fontSize: 14, fontWeight: '700', color: COLORS.secondary },
  btnNext: {
    flex: 2, backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  btnNextText: { fontSize: 14, fontWeight: '700', color: COLORS.gold },
});
