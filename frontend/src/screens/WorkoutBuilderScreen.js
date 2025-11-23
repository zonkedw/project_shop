import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ActivityIndicator, Alert } from 'react-native';
import { workoutsAPI } from '../services/api';

export default function WorkoutBuilderScreen({ navigation, route }) {
  const [name, setName] = useState('Моя тренировка');
  const [sets, setSets] = useState([]); // { exercise, reps, weight_kg }
  const [saving, setSaving] = useState(false);

  const selectedExercise = route?.params?.selectedExercise;

  useEffect(() => {
    if (selectedExercise) {
      addExercise(selectedExercise);
      // очищаем параметр, чтобы не дублировать
      navigation.setParams({ selectedExercise: undefined });
    }
  }, [selectedExercise]);

  const addExercise = (exercise) => {
    setSets((prev) => [
      ...prev,
      {
        id: `${exercise.exercise_id || Date.now()}-${prev.length}`,
        exercise,
        reps: '10',
        weight_kg: '0',
      },
    ]);
  };

  const updateSet = (id, field, value) => {
    setSets((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const removeSet = (id) => {
    setSets((prev) => prev.filter((s) => s.id !== id));
  };

  const saveSession = async () => {
    if (!sets.length) {
      Alert.alert('Добавьте упражнения', 'Добавьте хотя бы одно упражнение');
      return;
    }
    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const duration_min = 45;
      const payload = {
        date: today,
        notes: name,
        duration_min,
        sets: sets.map((s, idx) => ({
          exercise_id: s.exercise.exercise_id,
          set_number: idx + 1,
          reps: parseInt(s.reps || '0', 10) || null,
          weight_kg: parseFloat(s.weight_kg || '0') || null,
        })),
      };
      await workoutsAPI.createSession(payload);
      navigation.navigate('Workouts');
    } catch (e) {
      Alert.alert('Ошибка', e.response?.data?.error || 'Не удалось сохранить тренировку');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Конструктор тренировки</Text>
        <Text style={styles.subtitle}>Соберите свой план из упражнений</Text>
      </View>

      <View style={styles.nameRow}>
        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder="Название тренировки"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <TouchableOpacity
        style={styles.addExerciseBtn}
        onPress={() => navigation.navigate('ExerciseLibrary')}
      >
        <Text style={styles.addExerciseText}>+ Добавить упражнение</Text>
      </TouchableOpacity>

      <FlatList
        data={sets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Пока нет упражнений. Добавьте из библиотеки.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.setCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.setName}>{item.exercise.name}</Text>
              <Text style={styles.setMeta}>{item.exercise.muscle_group || 'Мышечная группа не указана'}</Text>
            </View>
            <View style={styles.inputsCol}>
              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>Повт</Text>
                <TextInput
                  style={styles.smallInput}
                  keyboardType="numeric"
                  value={item.reps}
                  onChangeText={(t) => updateSet(item.id, 'reps', t)}
                />
              </View>
              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>Вес</Text>
                <TextInput
                  style={styles.smallInput}
                  keyboardType="numeric"
                  value={item.weight_kg}
                  onChangeText={(t) => updateSet(item.id, 'weight_kg', t)}
                />
              </View>
            </View>
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeSet(item.id)}>
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.6 }]}
        onPress={saveSession}
        disabled={saving}
      >
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Сохранить тренировку</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  header: { paddingTop: 20, paddingHorizontal: 16, paddingBottom: 8 },
  title: { color: '#E5E7EB', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#94A3B8', marginTop: 4, fontSize: 13 },
  nameRow: { paddingHorizontal: 16, marginTop: 12 },
  nameInput: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#E5E7EB',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
  },
  addExerciseBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  addExerciseText: { color: '#E5E7EB', fontWeight: '600' },
  emptyBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
  },
  emptyText: { color: '#94A3B8', textAlign: 'center' },
  setCard: {
    marginTop: 10,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  setName: { color: '#E5E7EB', fontWeight: '700', fontSize: 15 },
  setMeta: { color: '#94A3B8', marginTop: 2, fontSize: 12 },
  inputsCol: { flexDirection: 'row', gap: 8 },
  inputBlock: { alignItems: 'center' },
  inputLabel: { color: '#9CA3AF', fontSize: 11, marginBottom: 2 },
  smallInput: {
    width: 56,
    backgroundColor: '#020617',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    color: '#E5E7EB',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    textAlign: 'center',
    fontSize: 13,
  },
  removeBtn: {
    marginLeft: 8,
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)',
  },
  removeText: { color: '#FCA5A5', fontSize: 18, fontWeight: '700' },
  saveBtn: {
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 12,
  },
  saveText: { color: '#fff', fontWeight: '700' },
});
