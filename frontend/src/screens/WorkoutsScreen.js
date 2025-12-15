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
import { workoutsAPI, extractData } from '../services/api';
import { useApi } from '../hooks/useApi';
import { useTheme } from '../hooks/useTheme';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import StatCard from '../components/StatCard';
import WorkoutCard from '../components/WorkoutCard';
import { cache } from '../utils/cache';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedCard from '../components/AnimatedCard';
import GradientButton from '../components/GradientButton';

const featuredPrograms = [
  {
    title: 'Утренняя йога',
    subtitle: '8 тренировок • 30 мин',
    tag: 'Йога',
    desc: 'Мягкие виньясы для подвижности и тонуса. Отлично для старта дня.',
    level: 'Лёгкий',
    equipment: 'Коврик',
    focus: 'Гибкость, осанка, дыхание',
  },
  {
    title: 'Кардио зарядка',
    subtitle: '10 тренировок • 15 мин',
    tag: 'Кардио',
    desc: 'Короткие кардио-сессии без инвентаря для сжигания калорий и поддержания тонуса.',
    level: 'Лёгкий',
    equipment: 'Без инвентаря',
    focus: 'Кардио, координация',
  },
  {
    title: 'HIIT с весом тела',
    subtitle: '12 тренировок • 20 мин',
    tag: 'Похудение',
    desc: 'Интервальные тренировки высокой интенсивности. Минимум времени — максимум результата.',
    level: 'Средний',
    equipment: 'Без инвентаря',
    focus: 'Кардио, жиросжигание',
  },
];

export default function WorkoutsScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const palette = theme; // для обратной совместимости
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { loading, error, execute, reset } = useApi();

  useEffect(() => {
    loadWorkouts();
    loadStats();
  }, []);

  const loadWorkouts = async (useCache = true) => {
    const cacheKey = 'workouts_recent';

    if (useCache) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        setSessions(cached);
        return;
      }
    }

    await execute(
      async () => {
        const response = await workoutsAPI.getSessions({ limit: 10 });
        const responseData = extractData(response);
        const data = responseData?.sessions || [];
        
        await cache.set(cacheKey, data);
        setSessions(data);
        
        return data;
      },
      { showError: false }
    );
  };

  const loadStats = async (useCache = true) => {
    const cacheKey = 'workouts_stats';

    if (useCache) {
      const cached = await cache.get(cacheKey);
      if (cached) {
        setStats(cached);
        return;
      }
    }

    await execute(
      async () => {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
          .toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];

        const response = await workoutsAPI.getStats({ 
          start_date: startDate, 
          end_date: endDate 
        });
        const responseData = extractData(response);
        const data = responseData?.overall || {};
        
        await cache.set(cacheKey, data);
        setStats(data);
        
        return data;
      },
      { showError: false }
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    reset();
    await Promise.all([loadWorkouts(false), loadStats(false)]);
    setRefreshing(false);
  };

  const handleStartWorkout = () => {
    navigation.navigate('WorkoutBuilder');
  };

  const heroGradient = isDark 
    ? ['#6366F1', '#8B5CF6', '#0F0F23']
    : ['#6366F1', '#8B5CF6', '#F8FAFC'];

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
        <Text style={styles.heroTitle}>💪 Тренировки</Text>
        <Text style={styles.heroSubtitle}>
          Выбирайте готовые планы или собирайте свои. AI подскажет нагрузки.
        </Text>
        <GradientButton
          title="+ Начать тренировку"
          onPress={handleStartWorkout}
          variant="primary"
          style={styles.startButton}
        />
      </LinearGradient>

      {error && (
        <View style={styles.errorContainer}>
          <ErrorMessage message={error} onRetry={() => {
            loadWorkouts(false);
            loadStats(false);
          }} />
        </View>
      )}

      {loading && !refreshing && !stats && (
        <LoadingIndicator message="Загрузка данных..." />
      )}

      {stats && (
        <View style={[styles.statsContainer, isTablet && styles.statsContainerTablet]}>
          <StatCard
            icon="💪"
            label="Тренировок"
            value={stats.total_workouts || 0}
            subtitle="В этом месяце"
          />
          <StatCard
            icon="⏱️"
            label="Время"
            value={`${Math.round(stats.total_minutes || 0)} мин`}
            subtitle="Всего"
          />
          <StatCard
            icon="🔥"
            label="Объём"
            value={`${Math.round((stats.total_volume_kg || 0) / 1000)} т`}
            subtitle="Поднято"
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Последние тренировки</Text>

        {sessions.length > 0 ? (
          sessions.map((session) => (
            <WorkoutCard
              key={session.session_id}
              session={session}
              onPress={() => {
                navigation.navigate('WorkoutDetails', { sessionId: session.session_id });
              }}
            />
          ))
        ) : (
          <View style={[styles.emptyState, { 
            backgroundColor: isDark ? 'rgba(31, 32, 71, 0.6)' : '#FFFFFF',
            borderColor: palette.border 
          }]}>
            <Text style={[styles.emptyText, { color: palette.muted }]}>
              Нет записанных тренировок
            </Text>
            <GradientButton
              title="Начать первую тренировку"
              onPress={handleStartWorkout}
              variant="primary"
              style={styles.emptyButton}
            />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Рекомендуем начать</Text>
        <View style={[
          styles.programGrid,
          isTablet && styles.programGridTablet,
          isDesktop && styles.programGridDesktop
        ]}>
          {featuredPrograms.map((p, idx) => (
            <AnimatedCard
              key={`${p.title}-${idx}`}
              index={idx}
              onPress={() => navigation.navigate('ProgramDetail', p)}
              style={[
                styles.programCard,
                { 
                  backgroundColor: isDark ? 'rgba(31, 32, 71, 0.6)' : palette.card,
                  borderColor: isDark ? 'rgba(99, 102, 241, 0.25)' : palette.border
                },
                isTablet && styles.programCardTablet,
                isDesktop && styles.programCardDesktop
              ]}
            >
              <View style={[styles.programTag, { backgroundColor: `${palette.primary}20` }]}>
                <Text style={[styles.programTagText, { color: palette.primary }]}>{p.tag}</Text>
              </View>
              <Text style={[styles.programTitle, { color: palette.text }]}>{p.title}</Text>
              <Text style={[styles.programSubtitle, { color: palette.muted }]}>{p.subtitle}</Text>
              <Text style={[styles.programDesc, { color: palette.muted }]}>{p.desc}</Text>
              <View style={styles.programMetaRow}>
                <View style={[styles.programMetaBadge, { 
                  backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#F1F5F9',
                  borderColor: palette.border 
                }]}>
                  <Text style={[styles.programMeta, { color: palette.muted }]}>📊 {p.level}</Text>
                </View>
                <View style={[styles.programMetaBadge, { 
                  backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#F1F5F9',
                  borderColor: palette.border 
                }]}>
                  <Text style={[styles.programMeta, { color: palette.muted }]}>🎯 {p.equipment}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.programCta, { 
                  backgroundColor: `${palette.primary}20`,
                  borderColor: `${palette.primary}40`
                }]}
                onPress={() => navigation.navigate('ProgramDetail', p)}
              >
                <Text style={[styles.programCtaText, { color: palette.primary }]}>Подробнее</Text>
              </TouchableOpacity>
            </AnimatedCard>
          ))}
        </View>
      </View>
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
    gap: 14,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.95)',
    lineHeight: 24,
  },
  startButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -0.4,
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
    flexDirection: 'column',
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
