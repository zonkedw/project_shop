import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { nutritionAPI } from '../services/api';
import { useApi } from '../hooks/useApi';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import StatCard from '../components/StatCard';
import MealCard from '../components/MealCard';
import { cache } from '../utils/cache';

export default function NutritionScreen({ navigation }) {
  const [diary, setDiary] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { loading, error, execute, reset } = useApi();

  useEffect(() => {
    loadDiary();
  }, []);

  const loadDiary = async (useCache = true) => {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `diary_${today}`;

    // Проверяем кэш
    if (useCache) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        setDiary(cached);
        return;
      }
    }

    await execute(
      async () => {
        const response = await nutritionAPI.getDiary(today);
        const data = response.data;
        
        // Сохраняем в кэш
        await cache.set(cacheKey, data);
        setDiary(data);
        
        return data;
      },
      { showError: false }
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    reset();
    await loadDiary(false);
    setRefreshing(false);
  };

  const handleAddMeal = () => {
    navigation.navigate('AddMeal');
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Дневник питания</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('ru-RU', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <ErrorMessage message={error} onRetry={() => loadDiary(false)} />
        </View>
      )}

      {loading && !refreshing && !diary && (
        <LoadingIndicator message="Загрузка дневника..." />
      )}

      {diary && (
        <>
          <View style={styles.statsContainer}>
            <StatCard
              icon="🔥"
              label="Калории"
              value={`${diary.totals?.calories || 0} / ${diary.targets?.calories || 0}`}
              subtitle={`Осталось: ${Math.max(0, (diary.targets?.calories || 0) - (diary.totals?.calories || 0))} ккал`}
            />
            <StatCard
              icon="🥩"
              label="Белок"
              value={`${diary.totals?.protein || 0}г`}
              subtitle={`Цель: ${diary.targets?.protein || 0}г`}
            />
          </View>

          <View style={styles.statsContainer}>
            <StatCard
              icon="🍞"
              label="Углеводы"
              value={`${diary.totals?.carbs || 0}г`}
              subtitle={`Цель: ${diary.targets?.carbs || 0}г`}
            />
            <StatCard
              icon="🥑"
              label="Жиры"
              value={`${diary.totals?.fats || 0}г`}
              subtitle={`Цель: ${diary.targets?.fats || 0}г`}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Приёмы пищи</Text>
              <TouchableOpacity onPress={handleAddMeal}>
                <Text style={styles.addButton}>+ Добавить</Text>
              </TouchableOpacity>
            </View>

            {diary.meals && diary.meals.length > 0 ? (
              diary.meals.map((meal) => (
                <MealCard
                  key={meal.meal_id}
                  meal={meal}
                  onPress={() => {
                    // TODO: Навигация на детали приёма пищи
                  }}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Нет приёмов пищи на сегодня</Text>
                <TouchableOpacity style={styles.emptyButton} onPress={handleAddMeal}>
                  <Text style={styles.emptyButtonText}>Добавить первый приём</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    margin: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  addButton: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
