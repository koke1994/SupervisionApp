import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useForm } from '../context/FormContext';
import { COLORS } from '../constants/colors';
import SectionHeader from '../components/SectionHeader';
import ProgressBar from '../components/ProgressBar';
import { guardarSupervisionLocal } from '../utils/localDB';
import { generarYCompartirPDF } from '../utils/pdfGenerator';
import { dispararEmailSupervision } from '../utils/emailService';
import { generarMarkdownGestor } from '../utils/notebooklmExport';
import { subirHistorialATDrive } from '../utils/googleDriveService';

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
    const { formData, update, resetForm } = useForm();
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [savedId, setSavedId] = useState(formData.id || null);
    const [syncingDrive, setSyncingDrive] = useState(false);
    const [emailStatus, setEmailStatus] = useState(null);

    const clientes = formData.clientes || [];
    const coaching = formData.coaching || {};
    const clientesLlenados = clientes.filter(c => c.nombre?.trim() !== '').length;

    async function handleGuardar() {
        if (saving) return;
        setSaving(true);
        try {
            const id = await guardarSupervisionLocal(formData);
            setSavedId(id);
            update({ id });
            // Limpiar el borrador porque ya se guardó formalmente
            await AsyncStorage.removeItem('@borrador_sesion');
            Alert.alert('✅ Guardado', 'Sesión guardada en la bóveda local del dispositivo.');
        } catch (e) {
            console.error('❌ Error al guardar:', e);
            Alert.alert('❌ Error al guardar',
                `No se pudo guardar: ${e.message || 'Error de base de datos'}`);
        } finally {
            setSaving(false);
        }
    }

    async function handleGenerarPDF() {
        if (generating) return;
        if (!savedId && !formData.id) {
            Alert.alert('⏳ Atención', 'Primero guarda la supervisión en la bóveda antes de generar el PDF.');
            return;
        }

        setGenerating(true);
        try {
            const pdfUri = await generarYCompartirPDF(formData);
            const resultado = await dispararEmailSupervision({
                formData,
                pdfUri,
                supervisionId: savedId || formData.id,
            });
            if (resultado.exito) {
                setEmailStatus('enviado');
                Alert.alert('✅ Éxito', 'PDF generado y email enviado correctamente.');
            } else if (resultado.encolado) {
                setEmailStatus('encolado');
                Alert.alert('📨 Sin conexión', 'Email encolado para enviarse automáticamente cuando haya señal.');
            } else {
                throw new Error('No se pudo completar el proceso');
            }
        } catch (e) {
            console.error('❌ Error al generar PDF:', e);
            Alert.alert('❌ Error', `No se pudo generar: ${e.message || 'Error desconocido'}`);
        } finally {
            setGenerating(false);
        }
    }

    async function handleSyncDrive() {
        if (syncingDrive) return;
        if (!savedId && !formData.id) {
            Alert.alert('⏳ Atención', 'Primero guarda la supervisión en la bóveda antes de sincronizar con Drive.');
            return;
        }
        setSyncingDrive(true);
        try {
            const mdContent = await generarMarkdownGestor(formData.gestor, formData.gerencia);
            await subirHistorialATDrive(formData.gestor, formData.gerencia, mdContent);
            Alert.alert('✅ Sincronizado', 'Historial del gestor subido a Google Drive exitosamente para NotebookLM.');
        } catch (e) {
            console.error('❌ Error al sincronizar con Drive:', e);
            Alert.alert('❌ Error', `No se pudo subir a Drive: ${e.message}`);
        } finally {
            setSyncingDrive(false);
        }
    }

    function handleNuevaSesion() {
        Alert.alert(
            'Nueva sesión',
            '¿Iniciar sesión nueva? Asegúrate de haber guardado primero.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Nueva sesión',
                    onPress: () => {
                        resetForm();
                        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
                    }
                },
            ]
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <ProgressBar currentStep={4} />
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

                {savedId && (
                    <View style={styles.savedBanner}>
                        <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.teal} />
                        <Text style={styles.savedText}>  Guardado en bóveda · Folio: {formData.folio}</Text>
                    </View>
                )}

                {emailStatus === 'enviado' && (
                    <View style={[styles.savedBanner, { backgroundColor: '#D5F5E3' }]}>
                        <Ionicons name="mail-outline" size={16} color="#1E8449" />
                        <Text style={[styles.savedText, { color: '#1E8449' }]}>  Email enviado al jefe correctamente</Text>
                    </View>
                )}
                {emailStatus === 'encolado' && (
                    <View style={[styles.savedBanner, { backgroundColor: '#FEF3CD' }]}>
                        <Ionicons name="cloud-offline-outline" size={16} color="#856404" />
                        <Text style={[styles.savedText, { color: '#856404' }]}>  Sin señal — email en cola, se enviará automáticamente</Text>
                    </View>
                )}

                <SectionHeader title="Resumen de la sesión" subtitle="Paso 4 de 4" />

                <View style={styles.semaforoRow}>
                    <SemaforoAlcance alcance={formData.alcance} />
                    <View style={styles.semaforoMeta}>
                        <Text style={styles.semaforoMetaLabel}>Total cobrado</Text>
                        <Text style={styles.semaforoMetaVal}>${formData.cobrado || '0'}</Text>
                        <Text style={styles.semaforoMetaLabel}>Tareas</Text>
                        <Text style={styles.semaforoMetaVal}>{formData.tareasRealizadas || '0'}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Datos Generales</Text>
                    <ResumenFila label="Folio" value={formData.folio} />
                    <ResumenFila label="Fecha" value={formData.fecha} />
                    <ResumenFila label="Semana" value={formData.semana} />
                    <ResumenFila label="Gerencia" value={formData.gerencia} />
                    <ResumenFila label="Gestor" value={formData.gestor} />
                    <ResumenFila label="Líder" value={formData.lider} />
                    <ResumenFila label="Tipo visita" value={formData.tipoGestion} />
                    <ResumenFila label="GIC" value={formData.clasificacionGIC} />
                    <ResumenFila label="Hora 1ª gestión" value={formData.horaPrimeraGestion} />
                </View>

                {clientes.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            Clientes Visitados ({clientesLlenados}/{clientes.length})
                        </Text>
                        {clientes.map((c, i) => (
                            <View key={i} style={styles.clienteResumen}>
                                <Text style={styles.clienteNum}>Cliente {i + 1}</Text>
                                <Text style={styles.clienteNombre}>{c.nombre || '(sin nombre)'}</Text>
                                <View style={styles.clienteStats}>
                                    <Text style={styles.clienteStat}>
                                        Pasos: {(c.pasosVisita || []).filter(Boolean).length}/{(c.pasosVisita || []).length}
                                    </Text>
                                    <Text style={styles.clienteStat}>Saldo: ${c.saldo || '0'}</Text>
                                    <Text style={styles.clienteStat}>GPS: {c.gps ? '🔒' : '—'}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Coaching y Retroalimentación</Text>
                    <ResumenFila label="Qué hace bien" value={coaching.haceBien} />
                    <ResumenFila label="Puede mejorar" value={coaching.puedeMejorar} />
                    <ResumenFila label="Compromisos" value={coaching.compromisos} />
                </View>

                <View style={styles.actionsCard}>
                    <Text style={styles.actionsTitle}>Acciones finales</Text>

                    <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnCloud, saving && styles.btnDisabled]}
                        onPress={handleGuardar}
                        disabled={saving}
                    >
                        {saving ? <ActivityIndicator color={COLORS.white} /> : (
                            <>
                                <Ionicons name="save-outline" size={20} color={COLORS.white} />
                                <Text style={styles.actionBtnText}>
                                    {savedId ? 'Actualizar en bóveda' : '💾 Guardar en bóveda'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnPDF, generating && styles.btnDisabled]}
                        onPress={handleGenerarPDF}
                        disabled={generating}
                    >
                        {generating ? <ActivityIndicator color={COLORS.primary} /> : (
                            <>
                                <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
                                <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>
                                    Generar PDF + enviar email
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#6C3483', borderColor: '#6C3483' }, syncingDrive && styles.btnDisabled]}
                        onPress={handleSyncDrive}
                        disabled={syncingDrive}
                    >
                        {syncingDrive ? <ActivityIndicator color={COLORS.white} /> : (
                            <>
                                <Ionicons name="logo-google" size={20} color={COLORS.white} />
                                <Text style={styles.actionBtnText}>
                                    Sincronizar a NotebookLM
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="create-outline" size={18} color={COLORS.secondary} />
                        <Text style={[styles.actionBtnText, { color: COLORS.secondary }]}>Editar coaching</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionBtn, styles.actionBtnNew]} onPress={handleNuevaSesion}>
                        <Ionicons name="add-circle-outline" size={18} color={COLORS.gold} />
                        <Text style={[styles.actionBtnText, { color: COLORS.gold }]}>Nueva sesión</Text>
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
    semaforoRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 16 },
    semaforo: {
        width: 90, height: 90, borderRadius: 45,
        alignItems: 'center', justifyContent: 'center', elevation: 4,
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
    cardTitle: {
        fontSize: 13, fontWeight: '700', color: COLORS.primary,
        marginBottom: 10, textTransform: 'uppercase',
    },
    fila: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 5, borderBottomWidth: 1, borderColor: COLORS.lightBg,
    },
    filaLabel: { fontSize: 12, color: COLORS.textLight },
    filaValue: { fontSize: 12, fontWeight: '600', color: COLORS.text, maxWidth: '55%', textAlign: 'right' },
    clienteResumen: { borderLeftWidth: 3, borderLeftColor: COLORS.teal, paddingLeft: 10, marginBottom: 10 },
    clienteNum: { fontSize: 10, color: COLORS.textLight, textTransform: 'uppercase' },
    clienteNombre: { fontSize: 14, fontWeight: '700', color: COLORS.text },
    clienteStats: { flexDirection: 'row', gap: 12, marginTop: 3 },
    clienteStat: { fontSize: 11, color: COLORS.textLight },
    actionsCard: { backgroundColor: COLORS.primary, borderRadius: 14, padding: 16, gap: 10 },
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