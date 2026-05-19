import React from 'react';
import {
  View, ScrollView, TouchableOpacity, Text, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useForm } from '../context/FormContext';
import { COLORS } from '../constants/colors';
import { PASOS_SOLICITUD, RECOMENDACIONES_CREDITO } from '../constants/formDefaults';
import InputField from '../components/InputField';
import CheckItem from '../components/CheckItem';
import SectionHeader from '../components/SectionHeader';
import ProgressBar from '../components/ProgressBar';

export default function SolicitudesScreen({ navigation }) {
  const {
    formData,
    updateSolicitud,
    updateSolicitudPaso,
    updateSolicitudRecomendacion,
  } = useForm();
  const s = formData.solicitud;

  const pasosCompletos = s.pasos.filter(Boolean).length;
  const recCompletos = s.recomendaciones.filter(Boolean).length;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ProgressBar currentStep={3} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        <SectionHeader title="Solicitudes" subtitle="Paso 3 de 5" />

        <View style={styles.card}>
          <InputField
            label="Nombre del cliente"
            value={s.nombreCliente}
            onChangeText={(v) => updateSolicitud({ nombreCliente: v })}
            placeholder="Nombre completo"
          />
          <InputField
            label="Tipo de solicitud"
            value={s.tipoSolicitud}
            onChangeText={(v) => updateSolicitud({ tipoSolicitud: v })}
            placeholder="Crédito nuevo, renovación, etc."
          />

          <SectionHeader title="Contactabilidad" />
          <CheckItem
            label="Contactabilidad del cliente"
            value={s.contactabilidadCliente}
            onToggle={() => updateSolicitud({ contactabilidadCliente: !s.contactabilidadCliente })}
          />
          <CheckItem
            label="Contactabilidad laboral"
            value={s.contactabilidadLaboral}
            onToggle={() => updateSolicitud({ contactabilidadLaboral: !s.contactabilidadLaboral })}
          />
          <CheckItem
            label="Red de contacto ampliada"
            value={s.redContacto}
            onToggle={() => updateSolicitud({ redContacto: !s.redContacto })}
          />
        </View>

        {/* Pasos de solicitud */}
        <View style={styles.card}>
          <SectionHeader
            title="Pasos de la visita de solicitud"
            subtitle={`${pasosCompletos} de ${PASOS_SOLICITUD.length} realizados`}
          />
          {PASOS_SOLICITUD.map((paso, i) => (
            <CheckItem
              key={i}
              label={paso}
              value={s.pasos[i]}
              onToggle={() => updateSolicitudPaso(i, !s.pasos[i])}
            />
          ))}
        </View>

        {/* Recomendaciones */}
        <View style={styles.card}>
          <SectionHeader
            title="Recomendaciones en uso del crédito"
            subtitle={`${recCompletos} de ${RECOMENDACIONES_CREDITO.length} compartidas`}
          />
          {RECOMENDACIONES_CREDITO.map((rec, i) => (
            <CheckItem
              key={i}
              label={rec}
              value={s.recomendaciones[i]}
              onToggle={() => updateSolicitudRecomendacion(i, !s.recomendaciones[i])}
            />
          ))}
        </View>

        {/* Navegación */}
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
            <Text style={styles.btnBackText}>← Atrás</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnNext} onPress={() => navigation.navigate('Retroalimentacion')}>
            <Text style={styles.btnNextText}>Siguiente →</Text>
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
