import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { nutritionAPI } from '../services/api';
import { useApi } from '../hooks/useApi';
import { useTheme } from '../hooks/useTheme';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import StatCard from '../components/StatCard';
import MealCard from '../components/MealCard';
import { cache } from '../utils/cache';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '../components/GradientButton';

export default function NutritionScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const palette = theme; // для обратной совместимости
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  const [diary, setDiary] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { loading, error, execute, reset } = useApi();

  useEffect(() => {
    loadDiary();
  }, []);

  const loadDiary = async (useCache = true) => {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `diary_${today}`;

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

  const caloriesPercent = diary?.targets?.calories 
    ? Math.round((diary.totals?.calories || 0) / diary.targets.calories * 100)
    : 0;

  const heroGradient = isDark 
    ? ['#8B5CF6', '#EC4899', '#0F0F23']
    : ['#8B5CF6', '#EC4899', '#F8FAFC'];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.bg }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.primary} />
      }
    >
      <LinearGradient
        colors={heroGradient}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.heroTitle}>🍽️ Дневник питания</Text>
        <Text style={styles.heroDate}>
          {new Date().toLocaleDateString('ru-RU', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}
        </Text>
        {diary && (
          <View style={styles.heroProgress}>
            <Text style={styles.heroProgressLabel}>
              {diary.totals?.calories || 0} / {diary.targets?.calories || 0} ккал ({caloriesPercent}%)
            </Text>
          </View>
        )}
      </LinearGradient>

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
          <View style={[styles.statsContainer, isTablet && styles.statsContainerTablet]}>
            <StatCard
              icon="🔥"
              label="Калории"
              value={`${diary.totals?.calories || 0}`}
              subtitle={`Цель: ${diary.targets?.calories || 0} ккал`}
            />
            <StatCard
              icon="🥩"
              label="Белок"
              value={`${diary.totals?.protein || 0}г`}
              subtitle={`Цель: ${diary.targets?.protein || 0}г`}
            />
          </View>

          <View style={[styles.statsContainer, isTablet && styles.statsContainerTablet]}>
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
              <Text style={[styles.sectionTitle, { color: palette.text }]}>Приёмы пищи</Text>
              <TouchableOpacity onPress={handleAddMeal}>
                <Text style={[styles.addButton, { color: palette.primary }]}>+ Добавить</Text>
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
              <View style={[styles.emptyState, { 
                backgroundColor: isDark ? 'rgba(31, 32, 71, 0.6)' : palette.card,
                borderColor: palette.border 
              }]}>
                <Text style={[styles.emptyText, { color: palette.muted }]}>
                  Нет приёмов пищи на сегодня
                </Text>
                <GradientButton
                  title="Добавить первый приём"
                  onPress={handleAddMeal}
                  variant="secondary"
                  style={styles.emptyButton}
                />
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
  },
  hero: {
    padding: 28,
    paddingTop: 60,
    paddingBottom: 40,
    gap: 12,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  heroDate: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  heroProgress: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    marginTop: 8,
  },
  heroProgressLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  errorContainer: {
    margin: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statsContainerTablet: {
    padding: 20,
    gap: 16,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  addButton: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  emptyState: {
    borderRadius: 28,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 17,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyButton: {
    minWidth: 240,
  },
  programGrid: {
    gap: 16,
  },
  programGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  programGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  programCard: {
    marginBottom: 0,
    borderRadius: 28,
    borderWidth: 1.5,
    padding: 20,
    gap: 10,
  },
  programCardTablet: {
    width: '48%',
  },
  programCardDesktop: {
    width: '31%',
  },
  programTag: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  programTagText: {
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  programTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  programSubtitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  programDesc: {
    fontSize: 14,
    lineHeight: 21,
  },
  programMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  programMetaBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  programMeta: {
    fontSize: 12,
    fontWeight: '600',
  },
  programCta: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  programCtaText: {
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
