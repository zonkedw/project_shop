import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

const getDarkPalette = () => ({
  card: 'rgba(31, 32, 71, 0.6)',
  border: 'rgba(99, 102, 241, 0.3)',
  text: '#F8FAFC',
  muted: '#CBD5E1',
  primary: '#6366F1',
  success: '#22C55E',
});

const getLightPalette = () => ({
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  muted: '#64748B',
  primary: '#6366F1',
  success: '#22C55E',
});

/**
 * Компонент карточки тренировки с поддержкой темной/светлой темы
 */
export default function WorkoutCard({ session, onPress, style }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = isDark ? getDarkPalette() : getLightPalette();

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
      style={[
        styles.container, 
        { 
          backgroundColor: palette.card,
          borderColor: palette.border 
        },
        style
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>💪</Text>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: palette.text }]}>
            {session.notes || 'Тренировка'}
          </Text>
          <Text style={[styles.date, { color: palette.muted }]}>
            {formatDate(session.start_time || session.session_date)}
          </Text>
        </View>
        {session.completed && (
          <View style={[styles.completedBadge, { backgroundColor: palette.success }]}>
            <Text style={styles.completedText}>✓</Text>
          </View>
        )}
      </View>
      
      <View style={styles.stats}>
        {session.duration_min && (
          <View style={[styles.statItem, { 
            backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#F8FAFC',
            borderColor: palette.border 
          }]}>
            <Text style={[styles.statLabel, { color: palette.muted }]}>Длительность</Text>
            <Text style={[styles.statValue, { color: palette.text }]}>
              {session.duration_min} мин
            </Text>
          </View>
        )}
        {session.total_volume_kg && (
          <View style={[styles.statItem, { 
            backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#F8FAFC',
            borderColor: palette.border 
          }]}>
            <Text style={[styles.statLabel, { color: palette.muted }]}>Объём</Text>
            <Text style={[styles.statValue, { color: palette.text }]}>
              {Math.round(session.total_volume_kg)} кг
            </Text>
          </View>
        )}
        {session.total_sets && (
          <View style={[styles.statItem, { 
            backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#F8FAFC',
            borderColor: palette.border 
          }]}>
            <Text style={[styles.statLabel, { color: palette.muted }]}>Подходов</Text>
            <Text style={[styles.statValue, { color: palette.text }]}>
              {session.total_sets}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 28,
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  date: {
    fontSize: 13,
    marginTop: 3,
    fontWeight: '500',
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
  },
  statItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
  },
});
