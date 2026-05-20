import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useForm } from '../context/FormContext';
import { COLORS } from '../constants/colors';
import { CLASIFICACIONES_GIC } from '../constants/formDefaults';
import { Picker } from '@react-native-picker/picker';
import { obtenerGerenciasUnicas, obtenerGestoresPorGerencia, obtenerLideresPorGerencia } from '../constants/empleados';
import InputField from '../components/InputField';
import DateTimePicker from '@react-native-community/datetimepicker';
import SectionHeader from '../components/SectionHeader';
import ProgressBar from '../components/ProgressBar';

const TIPO_OPTIONS = ['ACOMPAÑAMIENTO', 'SUPERVISION'];

export default function DatosGeneralesScreen({ navigation }) {
  const { formData, update } = useForm();

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const u = (field) => (val) => update({ [field]: val });

  // Interceptar el botón de retroceso para evitar pérdida de datos
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Prevenir el comportamiento por defecto de ir hacia atrás
      e.preventDefault();

      Alert.alert(
        '¿Deseas salir?',
        'Toda la información capturada en esta sesión se perderá. ¿Estás seguro de que deseas regresar al inicio?',
        [
          { text: 'Quedarme', style: 'cancel', onPress: () => {} },
          { text: 'Salir y perder datos', style: 'destructive', onPress: async () => {
              await AsyncStorage.removeItem('@borrador_sesion');
              navigation.dispatch(e.data.action);
          }},
        ]
      );
    });

    return unsubscribe;
  }, [navigation]);

  const handleNext = () => {
    if (!formData.gerencia || !formData.gestor || !formData.lider) {
      Alert.alert('⚠️ Faltan datos', 'Por favor selecciona una Gerencia, un Líder y un Gestor antes de continuar.');
      return;
    }
    
    if (!formData.tareasRealizadas || !formData.cobrado || !formData.alcance) {
      Alert.alert('⚠️ Faltan indicadores', 'Por favor ingresa las tareas realizadas, el monto cobrado y el porcentaje de alcance.');
      return;
    }

    navigation.navigate('FormularioPrincipal');
  };

  const handleTimeChange = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setTempDate(selectedDate);
      const horas = selectedDate.getHours().toString().padStart(2, '0');
      const mins = selectedDate.getMinutes().toString().padStart(2, '0');
      update({ horaPrimeraGestion: `${horas}:${mins}` });
    }
  };

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

          <View style={styles.pickerWrapper}>
            <Text style={styles.pickerLabel}>Gerencia</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.gerencia}
                onValueChange={(val) => {
                  const newLideres = obtenerLideresPorGerencia(val);
                  update({ 
                    gerencia: val, 
                    lider: newLideres.length === 1 ? newLideres[0] : '', 
                    gestor: '' 
                  });
                }}
              >
                <Picker.Item label="Selecciona una gerencia..." value="" color={COLORS.gray} />
                {obtenerGerenciasUnicas().map(g => (
                  <Picker.Item key={g} label={g} value={g} color={COLORS.text} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.pickerWrapper}>
            <Text style={styles.pickerLabel}>Líder</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={formData.lider} onValueChange={u('lider')} enabled={!!formData.gerencia}>
                <Picker.Item label="Selecciona un líder..." value="" color={COLORS.gray} />
                {obtenerLideresPorGerencia(formData.gerencia).map(l => (
                  <Picker.Item key={l} label={l} value={l} color={COLORS.text} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.pickerWrapper}>
            <Text style={styles.pickerLabel}>Gestor</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={formData.gestor} onValueChange={u('gestor')} enabled={!!formData.gerencia}>
                <Picker.Item label="Selecciona un gestor..." value="" color={COLORS.gray} />
                {obtenerGestoresPorGerencia(formData.gerencia).map(g => (
                  <Picker.Item key={g} label={g} value={g} color={COLORS.text} />
                ))}
              </Picker>
            </View>
          </View>
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
            <View style={styles.flex1}>
              <Text style={styles.pickerLabel}>Hora 1ª gestión</Text>
              <TouchableOpacity
                style={[styles.pickerContainer, { paddingHorizontal: 14 }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={{ fontSize: 15, color: formData.horaPrimeraGestion ? COLORS.text : COLORS.gray }}>
                  {formData.horaPrimeraGestion || 'HH:MM'}
                </Text>
              </TouchableOpacity>
            </View>
            <InputField label="Herramientas" value={formData.herramientas} onChangeText={u('herramientas')} style={styles.flex1} />
            <InputField label="Imagen" value={formData.imagen} onChangeText={u('imagen')} style={styles.flex1} />
          </View>
        </View>

        {showTimePicker && (
          <DateTimePicker
            value={tempDate}
            mode="time"
            is24Hour={true}
            display="spinner"
            onChange={handleTimeChange}
          />
        )}

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

        <TouchableOpacity style={styles.btnNext} onPress={handleNext}>
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
  pickerWrapper: { marginBottom: 12 },
  pickerLabel: { fontSize: 12, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  pickerContainer: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
    backgroundColor: '#FAFAFA', overflow: 'hidden', height: 48, justifyContent: 'center'
  },
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
