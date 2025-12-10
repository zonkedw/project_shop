import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Компонент карточки тренировки
 */
export default function WorkoutCard({ session, onPress, style }) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>💪</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{session.notes || 'Тренировка'}</Text>
          <Text style={styles.date}>{formatDate(session.start_time || session.session_date)}</Text>
        </View>
        {session.completed && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓</Text>
          </View>
        )}
      </View>
      
      <View style={styles.stats}>
        {session.duration_min && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Длительность</Text>
            <Text style={styles.statValue}>{session.duration_min} мин</Text>
          </View>
        )}
        {session.total_volume_kg && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Объём</Text>
            <Text style={styles.statValue}>{Math.round(session.total_volume_kg)} кг</Text>
          </View>
        )}
        {session.total_sets && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Подходов</Text>
            <Text style={styles.statValue}>{session.total_sets}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    color: '#111',
    fontWeight: '600',
  },
});

