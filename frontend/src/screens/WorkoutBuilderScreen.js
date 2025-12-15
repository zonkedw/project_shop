import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  ActivityIndicator, 
  Alert,
  useWindowDimensions,
  Animated as RNAnimated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { workoutsAPI } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import GradientButton from '../components/GradientButton';

export default function WorkoutBuilderScreen({ navigation, route }) {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  const [name, setName] = useState('Моя тренировка');
  const [sets, setSets] = useState([]); // { exercise, reps, weight_kg }
  const [saving, setSaving] = useState(false);
  
  const fade = useRef(new RNAnimated.Value(0)).current;

  const selectedExercise = route?.params?.selectedExercise;

  useEffect(() => {
    RNAnimated.timing(fade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (selectedExercise) {
      addExercise(selectedExercise);
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
      Alert.alert('Успех', 'Тренировка сохранена!', [
        { text: 'OK', onPress: () => navigation.navigate('Workouts') }
      ]);
    } catch (e) {
      Alert.alert('Ошибка', e.response?.data?.error || 'Не удалось сохранить тренировку');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <RNAnimated.View style={{ opacity: fade }}>
        <LinearGradient
          colors={theme.gradients.success}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.heroTitle}>🏗️ Конструктор тренировки</Text>
          <Text style={styles.heroSubtitle}>
            Создайте свой уникальный план упражнений
          </Text>
        </LinearGradient>

        <View style={[styles.nameContainer, { backgroundColor: theme.bg }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Название тренировки
          </Text>
          <TextInput
            style={[styles.nameInput, { 
              backgroundColor: isDark ? theme.glass.weak : theme.surface,
              borderColor: theme.borderLight,
              color: theme.text 
            }]}
            value={name}
            onChangeText={setName}
            placeholder="Например: Тренировка груди"
            placeholderTextColor={theme.textMuted}
          />
        </View>

        <TouchableOpacity
          style={[styles.addExerciseBtn, { 
            backgroundColor: isDark ? theme.glass.weak : theme.bgSecondary,
            borderColor: theme.borderLight 
          }]}
          onPress={() => navigation.navigate('ExerciseLibrary')}
        >
          <Text style={[styles.addExerciseText, { color: theme.primary }]}>
            + Добавить упражнение из библиотеки
          </Text>
        </TouchableOpacity>
      </RNAnimated.View>

      <FlatList
        data={sets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          isDesktop && styles.listContentDesktop
        ]}
        ListEmptyComponent={
          <View style={[styles.emptyBox, { 
            backgroundColor: isDark ? theme.surface : theme.surface,
            borderColor: theme.borderLight 
          }]}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Пока нет упражнений. Добавьте из библиотеки выше.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <RNAnimated.View style={[
            styles.setCard,
            { 
              backgroundColor: isDark ? theme.surface : theme.surface,
              borderColor: theme.borderLight 
            }
          ]}>
            <View style={styles.setHeader}>
              <View style={[styles.setNumber, { backgroundColor: theme.primary }]}>
                <Text style={styles.setNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.setInfo}>
                <Text style={[styles.setName, { color: theme.text }]}>
                  {item.exercise.name}
                </Text>
                <Text style={[styles.setMeta, { color: theme.textMuted }]}>
                  {item.exercise.muscle_group || 'Мышечная группа не указана'}
                </Text>
              </View>
              <TouchableOpacity 
                style={[styles.removeBtn, { 
                  backgroundColor: `${theme.error}15`,
                  borderColor: `${theme.error}40`
                }]} 
                onPress={() => removeSet(item.id)}
              >
                <Text style={[styles.removeText, { color: theme.error }]}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputsRow}>
              <View style={styles.inputBlock}>
                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
                  Повторения
                </Text>
                <TextInput
                  style={[styles.smallInput, { 
                    backgroundColor: isDark ? theme.glass.weak : theme.bgSecondary,
                    borderColor: theme.border,
                    color: theme.text 
                  }]}
                  keyboardType="numeric"
                  value={item.reps}
                  onChangeText={(t) => updateSet(item.id, 'reps', t)}
                  placeholder="10"
                  placeholderTextColor={theme.textMuted}
                />
              </View>
              <View style={styles.inputBlock}>
                <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
                  Вес (кг)
                </Text>
                <TextInput
                  style={[styles.smallInput, { 
                    backgroundColor: isDark ? theme.glass.weak : theme.bgSecondary,
                    borderColor: theme.border,
                    color: theme.text 
                  }]}
                  keyboardType="numeric"
                  value={item.weight_kg}
                  onChangeText={(t) => updateSet(item.id, 'weight_kg', t)}
                  placeholder="20"
                  placeholderTextColor={theme.textMuted}
                />
              </View>
            </View>
          </RNAnimated.View>
        )}
      />

      <View style={[styles.footer, { 
        backgroundColor: isDark ? theme.glass.medium : theme.surface,
        borderTopColor: theme.borderLight 
      }]}>
        <GradientButton
          title={saving ? 'Сохранение...' : 'Сохранить тренировку'}
          onPress={saveSession}
          disabled={saving || sets.length === 0}
          variant="success"
          style={styles.saveButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    fontWeight: '600',
  },
  nameContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  nameInput: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1.5,
    fontWeight: '600',
  },
  addExerciseBtn: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  addExerciseText: {
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  listContent: {
    padding: 20,
    paddingBottom: 120,
  },
  listContentDesktop: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  emptyBox: {
    marginTop: 40,
    borderRadius: 24,
    padding: 40,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 24,
  },
  setCard: {
    marginBottom: 16,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  setNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  setNumberText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  setInfo: {
    flex: 1,
  },
  setName: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  setMeta: {
    fontSize: 13,
    fontWeight: '600',
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  removeText: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 24,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputBlock: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  smallInput: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1.5,
    textAlign: 'center',
    fontWeight: '800',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1.5,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButton: {
    width: '100%',
  },
});
