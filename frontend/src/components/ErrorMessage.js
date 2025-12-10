import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Компонент отображения ошибки с возможностью повтора
 */
export default function ErrorMessage({ message, onRetry, style }) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Повторить</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#7F1D1D',
    borderRadius: 12,
    padding: 16,
    margin: 12,
    borderWidth: 1,
    borderColor: '#991B1B',
  },
  message: {
    color: '#FCA5A5',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginTop: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

