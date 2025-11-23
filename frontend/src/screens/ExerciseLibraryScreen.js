import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { workoutsAPI } from '../services/api';

export default function ExerciseLibraryScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await workoutsAPI.getExercises();
      const list = res.data?.exercises || res.data || [];
      setExercises(list);
      setFiltered(list);
    } catch (e) {
      setExercises([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  const onSearch = (text) => {
    setQuery(text);
    const q = text.trim().toLowerCase();
    if (!q) {
      setFiltered(exercises);
      return;
    }
    setFiltered(
      exercises.filter((ex) =>
        (ex.name || '').toLowerCase().includes(q) || (ex.muscle_group || '').toLowerCase().includes(q)
      )
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Упражнения</Text>
        <Text style={styles.subtitle}>Выберите упражнения для своих тренировок</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Поиск по названию или мышце"
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={onSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item, idx) => String(item.exercise_id || idx)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              // Если экран открыт из конструктора, можно навигировать назад с выбранным упражнением
              if (navigation.canGoBack() && navigation.getState()?.routes?.slice(-2)[0]?.name === 'WorkoutBuilder') {
                navigation.navigate('WorkoutBuilder', { selectedExercise: item });
              }
            }}
          >
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardMeta}>{item.muscle_group || 'Мышечная группа не указана'}</Text>
            {item.equipment && (
              <Text style={styles.cardTag}>{item.equipment}</Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Упражнения пока не найдены</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B1220' },
  header: { paddingTop: 20, paddingHorizontal: 16, paddingBottom: 8 },
  title: { color: '#E5E7EB', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#94A3B8', marginTop: 4, fontSize: 13 },
  searchRow: { paddingHorizontal: 16, marginTop: 12 },
  search: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#E5E7EB',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
  },
  card: {
    marginTop: 10,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
  },
  cardName: { color: '#E5E7EB', fontWeight: '700', fontSize: 15 },
  cardMeta: { color: '#94A3B8', marginTop: 4, fontSize: 12 },
  cardTag: { marginTop: 6, color: '#A5B4FC', fontSize: 12, fontWeight: '600' },
  emptyBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
  },
  emptyText: { color: '#94A3B8', textAlign: 'center' },
});
