import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Компонент карточки статистики
 */
export default function StatCard({ icon, label, value, subtitle, style }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  subtitle: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
});

