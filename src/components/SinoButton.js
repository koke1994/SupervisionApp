import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

// Botón Sí/No igual que el HTML (.sino-btn)
export default function SinoButton({ label, value, onChange, comment, onCommentChange, showComment = true }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.btn, styles.btnSi, value === 'si' && styles.btnSiActive]}
            onPress={() => onChange(value === 'si' ? null : 'si')}
          >
            <Text style={[styles.btnText, value === 'si' && styles.btnSiTextActive]}>✔ Sí</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnNo, value === 'no' && styles.btnNoActive]}
            onPress={() => onChange(value === 'no' ? null : 'no')}
          >
            <Text style={[styles.btnText, value === 'no' && styles.btnNoTextActive]}>✖ No</Text>
          </TouchableOpacity>
        </View>
      </View>
      {showComment && onCommentChange && (
        <View style={styles.commentBar} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 11, color: COLORS.text, flex: 1, flexWrap: 'wrap', fontWeight: '600' },
  btnRow: { flexDirection: 'row', gap: 4 },
  btn: {
    borderWidth: 1.5, borderRadius: 3, paddingVertical: 2, paddingHorizontal: 6,
  },
  btnSi:  { borderColor: '#27ae60' },
  btnNo:  { borderColor: '#c0392b' },
  btnSiActive: { backgroundColor: '#27ae60' },
  btnNoActive: { backgroundColor: '#c0392b' },
  btnText: { fontSize: 9, fontWeight: 'bold', color: COLORS.text },
  btnSiTextActive: { color: '#fff' },
  btnNoTextActive: { color: '#fff' },
  commentBar: { borderBottomWidth: 1, borderColor: '#ddd', marginTop: 2 },
});
