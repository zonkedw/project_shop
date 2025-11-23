import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import { workoutsAPI } from '../services/api';

export default function WorkoutDetailsScreen({ route }) {
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await workoutsAPI.getSession(id);
        setSession(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#6366F1" size="large" />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>Сессия не найдена</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{session.notes || 'Тренировка'}</Text>
        <Text style={styles.meta}>Дата: {session.session_date?.split('T')[0] || ''} • {session.duration_min || 0} мин</Text>
      </View>

      {(session.sets || []).map((set) => (
        <Card key={set.set_id} style={styles.setRow}>
          <Card.Content>
            <Text style={styles.setTitle}>{set.exercise_name}</Text>
            <Text style={styles.setMeta}>Сет {set.set_number} • Повт: {set.reps ?? '-'} • Вес: {set.weight_kg ?? '-'} кг</Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B1220' },
  header: { padding: 16 },
  title: { color: '#E5E7EB', fontSize: 20, fontWeight: '700' },
  meta: { color: '#94A3B8', marginTop: 4 },
  setRow: { marginHorizontal: 16, marginBottom: 10, padding: 14, backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)' },
  setTitle: { color: '#E5E7EB', fontWeight: '700' },
  setMeta: { color: '#94A3B8', marginTop: 2, fontSize: 12 },
  empty: { color: '#94A3B8' },
});
