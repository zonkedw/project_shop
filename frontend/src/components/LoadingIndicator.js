import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

/**
 * Компонент индикатора загрузки
 */
export default function LoadingIndicator({ message = 'Загрузка...', size = 'small' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color="#4F46E5" />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  text: {
    color: '#94A3B8',
    fontSize: 14,
  },
});

