import React from 'react';
import {
  View, ScrollView, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useForm } from '../context/FormContext';
import { COLORS } from '../constants/colors';
import InputField from '../components/InputField';
import SectionHeader from '../components/SectionHeader';
import ProgressBar from '../components/ProgressBar';

export default function RetroalimentacionScreen({ navigation }) {
  const { formData, updateRetroalimentacion } = useForm();
  const r = formData.retroalimentacion;
  const u = (field) => (val) => updateRetroalimentacion({ [field]: val });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ProgressBar currentStep={4} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        <SectionHeader title="Retroalimentación y Coaching" subtitle="Paso 4 de 5" />

        {/* 3 columnas de retroalimentación */}
        <View style={styles.card}>
          <View style={styles.hint}>
            <Text style={styles.hintText}>
              💡 Esta sección la llena el líder tras observar al gestor en campo
            </Text>
          </View>

          <InputField
            label="¿Qué está haciendo bien? (observaciones positivas)"
            value={r.haceBien}
            onChangeText={u('haceBien')}
            placeholder="Técnicas, actitud, presentación, ruta..."
            multiline
            numberOfLines={4}
          />

          <InputField
            label="¿Qué puede mejorar? (áreas de oportunidad)"
            value={r.puedeMejorar}
            onChangeText={u('puedeMejorar')}
            placeholder="Objeciones, argumentación, búsqueda..."
            multiline
            numberOfLines={4}
          />

          <InputField
            label="Compromisos del gestor"
            value={r.compromisos}
            onChangeText={u('compromisos')}
            placeholder="Acuerdos específicos para próxima sesión..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Firmas */}
        <SectionHeader title="Firmas (nombre para constancia)" />

        <View style={styles.card}>
          <View style={styles.firmasGrid}>
            <View style={styles.firmaBox}>
              <InputField
                label="Gestor"
                value={r.firmaGestor}
                onChangeText={u('firmaGestor')}
                placeholder="Nombre del gestor"
              />
              <View style={styles.firmaLinea} />
              <Text style={styles.firmaLabel}>Firma / Nombre del Gestor</Text>
            </View>
          </View>

          <View style={styles.firmasGrid}>
            <View style={styles.firmaBox}>
              <InputField
                label="Líder"
                value={r.firmaLider}
                onChangeText={u('firmaLider')}
                placeholder="Nombre del líder"
              />
              <View style={styles.firmaLinea} />
              <Text style={styles.firmaLabel}>Firma / Nombre del Líder</Text>
            </View>
          </View>

          <View style={styles.firmasGrid}>
            <View style={styles.firmaBox}>
              <InputField
                label="Regional (opcional)"
                value={r.firmaRegional}
                onChangeText={u('firmaRegional')}
                placeholder="Nombre del regional"
              />
              <View style={styles.firmaLinea} />
              <Text style={styles.firmaLabel}>Firma / Nombre del Regional</Text>
            </View>
          </View>
        </View>

        {/* Nota de pie */}
        <View style={styles.notaBanner}>
          <Text style={styles.notaText}>
            ⚠️  El buen comportamiento sin resultados NO es desempeño aceptable.
          </Text>
        </View>

        {/* Navegación */}
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

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.lightBg },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 16, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4,
  },
  hint: {
    backgroundColor: '#EBF5FB', borderRadius: 8, padding: 10, marginBottom: 14,
  },
  hintText: { fontSize: 12, color: COLORS.secondary },
  firmasGrid: { marginBottom: 12 },
  firmaBox: { flex: 1 },
  firmaLinea: {
    borderBottomWidth: 1.5, borderColor: COLORS.primary,
    marginTop: 8, marginBottom: 4,
  },
  firmaLabel: { fontSize: 10, color: COLORS.gray, textAlign: 'center' },
  notaBanner: {
    backgroundColor: '#FEF9E7', borderLeftWidth: 4, borderLeftColor: COLORS.gold,
    borderRadius: 8, padding: 12, marginBottom: 12,
  },
  notaText: { fontSize: 12, color: '#7D6608', fontStyle: 'italic' },
  navRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
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
