import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  TextInput,
  useWindowDimensions,
  Animated as RNAnimated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { workoutsAPI } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import AnimatedCard from '../components/AnimatedCard';

export default function ExerciseLibraryScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [selectedMuscle, setSelectedMuscle] = useState('Все');

  const fade = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!loading) {
      RNAnimated.timing(fade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

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
    applyFilters(text, selectedMuscle);
  };

  const onSelectMuscle = (muscle) => {
    setSelectedMuscle(muscle);
    applyFilters(query, muscle);
  };

  const applyFilters = (searchText, muscle) => {
    let result = exercises;

    // Фильтр по мышечной группе
    if (muscle !== 'Все') {
      result = result.filter((ex) => 
        (ex.muscle_group || '').toLowerCase() === muscle.toLowerCase()
      );
    }

    // Фильтр по поисковому запросу
    const q = searchText.trim().toLowerCase();
    if (q) {
      result = result.filter((ex) =>
        (ex.name || '').toLowerCase().includes(q) || 
        (ex.muscle_group || '').toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  };

  const muscleGroups = ['Все', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Abs'];

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>
          Загрузка упражнений...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <RNAnimated.View style={{ opacity: fade }}>
        <LinearGradient
          colors={theme.gradients.success}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.heroTitle}>💪 Библиотека упражнений</Text>
          <Text style={styles.heroSubtitle}>
            {exercises.length} упражнений для всех мышечных групп
          </Text>
        </LinearGradient>

        {/* Поиск */}
        <View style={[styles.searchContainer, { backgroundColor: theme.bg }]}>
          <TextInput
            style={[styles.search, { 
              backgroundColor: isDark ? theme.glass.weak : theme.surface,
              borderColor: theme.borderLight,
              color: theme.text 
            }]}
            placeholder="Поиск по названию или мышце..."
            placeholderTextColor={theme.textMuted}
            value={query}
            onChangeText={onSearch}
          />
        </View>

        {/* Фильтры по мышечным группам */}
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            data={muscleGroups}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  { 
                    backgroundColor: selectedMuscle === item 
                      ? theme.primary 
                      : (isDark ? theme.glass.weak : theme.bgSecondary),
                    borderColor: selectedMuscle === item 
                      ? theme.primary 
                      : theme.border
                  }
                ]}
                onPress={() => onSelectMuscle(item)}
              >
                <Text style={[
                  styles.filterText,
                  { color: selectedMuscle === item ? '#FFFFFF' : theme.text }
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </RNAnimated.View>

      <FlatList
        data={filtered}
        keyExtractor={(item, idx) => String(item.exercise_id || idx)}
        contentContainerStyle={[
          styles.list,
          isDesktop && styles.listDesktop
        ]}
        numColumns={isTablet || isDesktop ? 2 : 1}
        key={isTablet || isDesktop ? 'two-columns' : 'one-column'}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.cardWrapper,
              (isTablet || isDesktop) && styles.cardWrapperTablet
            ]}
            onPress={() => {
              if (navigation.canGoBack() && navigation.getState()?.routes?.slice(-2)[0]?.name === 'WorkoutBuilder') {
                navigation.navigate('WorkoutBuilder', { selectedExercise: item });
              }
            }}
          >
            <AnimatedCard index={index} style={styles.card}>
              <View style={[styles.cardContent, { 
                backgroundColor: isDark ? theme.surface : theme.surface,
                borderColor: theme.borderLight 
              }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.muscleTag, { 
                    backgroundColor: `${theme.primary}20`,
                    borderColor: theme.primary 
                  }]}>
                    <Text style={[styles.muscleTagText, { color: theme.primary }]}>
                      {item.muscle_group || 'General'}
                    </Text>
                  </View>
                  {item.difficulty && (
                    <Text style={[styles.difficulty, { color: theme.textMuted }]}>
                      {item.difficulty}
                    </Text>
                  )}
                </View>

                <Text style={[styles.cardName, { color: theme.text }]}>
                  {item.name}
                </Text>

                {item.equipment && (
                  <Text style={[styles.equipment, { color: theme.textSecondary }]}>
                    🎯 {item.equipment}
                  </Text>
                )}

                <View style={[styles.addButton, { backgroundColor: `${theme.success}20` }]}>
                  <Text style={[styles.addButtonText, { color: theme.success }]}>
                    + Добавить
                  </Text>
                </View>
              </View>
            </AnimatedCard>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={[styles.emptyBox, { 
            backgroundColor: isDark ? theme.surface : theme.surface,
            borderColor: theme.borderLight 
          }]}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              {query || selectedMuscle !== 'Все' 
                ? 'Упражнения не найдены. Попробуйте другой запрос.'
                : 'Упражнения пока не загружены'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  search: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1.5,
    fontWeight: '500',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filters: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  list: {
    padding: 20,
  },
  listDesktop: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  cardWrapper: {
    flex: 1,
    marginBottom: 16,
  },
  cardWrapperTablet: {
    margin: 8,
  },
  card: {
    marginBottom: 0,
  },
  cardContent: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  muscleTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  muscleTagText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  difficulty: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  equipment: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  emptyBox: {
    marginHorizontal: 20,
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
});
