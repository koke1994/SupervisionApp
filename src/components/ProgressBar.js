import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const STEPS = [
  { label: 'General', step: 1 },
  { label: 'Clientes', step: 2 },
  { label: 'Solicitudes', step: 3 },
  { label: 'Retro', step: 4 },
  { label: 'Guardar', step: 5 },
];

export default function ProgressBar({ currentStep }) {
  return (
    <View style={styles.container}>
      {STEPS.map((s, i) => (
        <React.Fragment key={s.step}>
          <View style={styles.stepWrapper}>
            <View
              style={[
                styles.circle,
                currentStep >= s.step && styles.circleActive,
                currentStep === s.step && styles.circleCurrent,
              ]}
            >
              <Text
                style={[styles.circleText, currentStep >= s.step && styles.circleTextActive]}
              >
                {s.step}
              </Text>
            </View>
            <Text style={[styles.stepLabel, currentStep >= s.step && styles.stepLabelActive]}>
              {s.label}
            </Text>
          </View>
          {i < STEPS.length - 1 && (
            <View style={[styles.line, currentStep > s.step && styles.lineActive]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  stepWrapper: {
    alignItems: 'center',
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
  },
  circleActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  circleCurrent: {
    transform: [{ scale: 1.1 }],
  },
  circleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray,
  },
  circleTextActive: {
    color: COLORS.primary,
  },
  stepLabel: {
    fontSize: 9,
    color: COLORS.gray,
    marginTop: 3,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.secondary,
    marginBottom: 14,
    marginHorizontal: 2,
  },
  lineActive: {
    backgroundColor: COLORS.gold,
  },
});
