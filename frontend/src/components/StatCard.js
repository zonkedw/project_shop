import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

const getDarkPalette = () => ({
  card: 'rgba(31, 32, 71, 0.6)',
  border: 'rgba(99, 102, 241, 0.3)',
  text: '#F8FAFC',
  muted: '#CBD5E1',
  primary: '#6366F1',
});

const getLightPalette = () => ({
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  muted: '#64748B',
  primary: '#6366F1',
});

/**
 * Компонент карточки статистики с поддержкой темной/светлой темы
 */
export default function StatCard({ icon, label, value, subtitle, style }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = isDark ? getDarkPalette() : getLightPalette();

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: palette.card,
        borderColor: palette.border 
      },
      style
    ]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.label, { color: palette.muted }]}>{label}</Text>
      <Text style={[styles.value, { color: palette.text }]}>{value}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: palette.muted }]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1.5,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  icon: {
    fontSize: 36,
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
});
