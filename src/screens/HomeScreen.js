import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Modal, TextInput, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useForm } from '../context/FormContext';
import { obtenerSupervisionesPorLider, obtenerTodasSupervisiones } from '../utils/firebaseService';
import { isFirebaseConfigured } from '../../firebase';
import { createFormDefaults } from '../constants/formDefaults';

const LIDER_KEY = '@gcc_lider_nombre';

export default function HomeScreen({ navigation }) {
  const { resetForm, loadForm, updateFormData } = useForm();
  const [lider, setLider] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [inputLider, setInputLider] = useState('');
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar nombre líder guardado
  useEffect(() => {
    AsyncStorage.getItem(LIDER_KEY).then((val) => {
      if (val) {
        setLider(val);
      } else {
        setShowModal(true);
      }
    });
  }, []);

  // Recargar historial al enfocar pantalla
  useFocusEffect(
    useCallback(() => {
      if (lider) cargarHistorial();
    }, [lider])
  );

  async function cargarHistorial() {
    setLoading(true);
    try {
      let data = [];
      if (isFirebaseConfigured) {
        data = await obtenerSupervisionesPorLider(lider);
      }
      setHistorial(data);
    } catch (e) {
      console.warn('Error cargando historial:', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function guardarLider() {
    const nombre = inputLider.trim();
    if (!nombre) return Alert.alert('Campo requerido', 'Ingresa tu nombre para continuar.');
    await AsyncStorage.setItem(LIDER_KEY, nombre);
    setLider(nombre);
    setShowModal(false);
    cargarHistorial();
  }

  function nuevaSesion() {
    resetForm();
    updateFormData({ lider });
    navigation.navigate('DatosGenerales');
  }

  function abrirSesion(sesion) {
    loadForm(sesion);
    navigation.navigate('DatosGenerales');
  }

  function renderItem({ item }) {
    return (
      <TouchableOpacity style={styles.card} onPress={() => abrirSesion(item)} activeOpacity={0.85}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardGestor} numberOfLines={1}>{item.gestor || 'Sin nombre'}</Text>
          <Text style={styles.cardMeta}>
            {item.gerencia || '—'} · Semana {item.semana || '—'}
          </Text>
          <Text style={styles.cardDate}>{item.createdAt || ''}</Text>
        </View>
        <View style={styles.cardRight}>
          <View style={[
            styles.badge,
            item.tipoVisita === 'acompanamiento' ? styles.badgeAcomp : styles.badgeSuper,
          ]}>
            <Text style={styles.badgeText}>
              {item.tipoVisita === 'acompanamiento' ? 'ACOMP' : 'SUPER'}
            </Text>
          </View>
          <Text style={styles.cardAlcance}>{item.alcance ? `${item.alcance}%` : '—'}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Bienvenida */}
      <View style={styles.welcomeBar}>
        <View>
          <Text style={styles.welcomeTitle}>Bienvenido</Text>
          <Text style={styles.welcomeLider}>{lider || '...'}</Text>
        </View>
        <TouchableOpacity onPress={() => { setInputLider(lider); setShowModal(true); }}>
          <Ionicons name="person-circle-outline" size={32} color={COLORS.gold} />
        </TouchableOpacity>
      </View>

      {/* Firebase status */}
      {!isFirebaseConfigured && (
        <View style={styles.warnBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color={COLORS.warning} />
          <Text style={styles.warnText}>  Firebase no configurado — modo local</Text>
        </View>
      )}

      {/* Header historial */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Sesiones recientes</Text>
        <TouchableOpacity onPress={cargarHistorial}>
          <Ionicons name="refresh-outline" size={20} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={COLORS.secondary} />
      ) : (
        <FlatList
          data={historial}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={cargarHistorial} colors={[COLORS.secondary]} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-outline" size={48} color={COLORS.gray} />
              <Text style={styles.emptyText}>No hay sesiones guardadas</Text>
              <Text style={styles.emptySubText}>Presiona el botón para crear una nueva</Text>
            </View>
          }
        />
      )}

      {/* FAB nueva sesión */}
      <TouchableOpacity style={styles.fab} onPress={nuevaSesion} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color={COLORS.primary} />
        <Text style={styles.fabText}>Nueva Sesión</Text>
      </TouchableOpacity>

      {/* Modal nombre líder */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>¿Quién eres?</Text>
            <Text style={styles.modalSub}>Ingresa tu nombre de líder para identificar tus sesiones</Text>
            <TextInput
              style={styles.modalInput}
              value={inputLider}
              onChangeText={setInputLider}
              placeholder="Tu nombre completo"
              placeholderTextColor={COLORS.gray}
              autoFocus
            />
            <TouchableOpacity style={styles.modalBtn} onPress={guardarLider}>
              <Text style={styles.modalBtnText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.lightBg },
  welcomeBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 16,
  },
  welcomeTitle: { fontSize: 12, color: COLORS.gray },
  welcomeLider: { fontSize: 18, color: COLORS.gold, fontWeight: '700', marginTop: 2 },
  warnBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF3CD', paddingHorizontal: 16, paddingVertical: 8,
  },
  warnText: { fontSize: 12, color: '#856404' },
  listHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4,
  },
  listTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  card: {
    backgroundColor: COLORS.white, borderRadius: 10, padding: 14, marginBottom: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4,
  },
  cardLeft: { flex: 1, marginRight: 12 },
  cardGestor: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cardMeta: { fontSize: 12, color: COLORS.textLight, marginTop: 3 },
  cardDate: { fontSize: 11, color: COLORS.gray, marginTop: 2 },
  cardRight: { alignItems: 'center', gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeAcomp: { backgroundColor: '#D5E8D4' },
  badgeSuper: { backgroundColor: '#DAE8FC' },
  badgeText: { fontSize: 10, fontWeight: '700', color: COLORS.text },
  cardAlcance: { fontSize: 16, fontWeight: '700', color: COLORS.teal },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 15, color: COLORS.darkGray, marginTop: 12 },
  emptySubText: { fontSize: 12, color: COLORS.gray, marginTop: 4 },
  fab: {
    position: 'absolute', bottom: 24, right: 20, left: 20,
    backgroundColor: COLORS.gold, borderRadius: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', paddingVertical: 16,
    elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6,
  },
  fabText: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginLeft: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 32 },
  modal: { backgroundColor: COLORS.white, borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.primary, marginBottom: 6 },
  modalSub: { fontSize: 13, color: COLORS.textLight, marginBottom: 16 },
  modalInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: COLORS.text, marginBottom: 16,
  },
  modalBtn: {
    backgroundColor: COLORS.primary, borderRadius: 10,
    paddingVertical: 14, alignItems: 'center',
  },
  modalBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.gold },
});
