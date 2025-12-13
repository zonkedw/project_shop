import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { workoutsAPI, extractData } from '../services/api';

export default function WorkoutDetailsScreen({ route, navigation }) {
  const { sessionId } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError('ID тренировки не указан');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await workoutsAPI.getSession(sessionId);
        const data = extractData(res);
        setSession(data);
      } catch (err) {
        setError(err.message || 'Ошибка загрузки тренировки');
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#6366F1" size="large" />
      </View>
    );
  }

  if (error || !session) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>{error || 'Сессия не найдена'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{session.notes || 'Тренировка'}</Text>
        <Text style={styles.meta}>
          Дата: {session.session_date?.split('T')[0] || ''} • {session.duration_min || 0} мин
        </Text>
        {session.total_volume_kg && (
          <Text style={styles.meta}>Общий объём: {Math.round(session.total_volume_kg)} кг</Text>
        )}
      </View>

      <View style={styles.setsContainer}>
        {(session.sets || []).map((set) => (
          <View key={set.set_id} style={styles.setRow}>
            <Text style={styles.setTitle}>{set.exercise_name}</Text>
            <Text style={styles.setMeta}>
              Сет {set.set_number} • Повт: {set.reps ?? '-'} • Вес: {set.weight_kg ?? '-'} кг
            </Text>
            {set.duration_sec && (
              <Text style={styles.setMeta}>Длительность: {set.duration_sec} сек</Text>
            )}
            {set.rest_sec && (
              <Text style={styles.setMeta}>Отдых: {set.rest_sec} сек</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B1220' },
  header: { padding: 16 },
  backButton: {
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#22D3EE',
    fontSize: 16,
    fontWeight: '600',
  },
  title: { color: '#E5E7EB', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  meta: { color: '#94A3B8', marginTop: 4, fontSize: 14 },
  setsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  setRow: {
    marginBottom: 12,
    padding: 14,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
  },
  setTitle: { color: '#E5E7EB', fontWeight: '700', fontSize: 16, marginBottom: 6 },
  setMeta: { color: '#94A3B8', marginTop: 2, fontSize: 12 },
  empty: { color: '#94A3B8' },
});
