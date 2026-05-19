import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function CheckItem({ label, value, onToggle, style }) {
  return (
    <TouchableOpacity style={[styles.row, style]} onPress={onToggle} activeOpacity={0.7}>
      <View style={[styles.box, value && styles.boxChecked]}>
        {value && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: COLORS.white,
  },
  boxChecked: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  checkMark: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    flexWrap: 'wrap',
  },
});
