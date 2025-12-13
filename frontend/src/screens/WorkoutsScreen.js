import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { workoutsAPI, extractData } from '../services/api';
import { useApi } from '../hooks/useApi';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import StatCard from '../components/StatCard';
import WorkoutCard from '../components/WorkoutCard';
import { cache } from '../utils/cache';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedCard from '../components/AnimatedCard';

const palette = {
  bg: '#0B1220',
  card: '#111827',
  border: '#1F2937',
  primary: '#22D3EE',
  text: '#E2E8F0',
  muted: '#94A3B8',
};

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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={['#0EA5E9', '#2563EB', '#0F172A']}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.heroTitle}>Тренировки</Text>
        <Text style={styles.heroSubtitle}>
          Выбирайте готовые планы или собирайте свои. AI подскажет нагрузки.
        </Text>
        <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
          <Text style={styles.startButtonText}>+ Начать тренировку</Text>
        </TouchableOpacity>
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
        <View style={styles.statsContainer}>
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
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Последние тренировки</Text>

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
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Нет записанных тренировок</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleStartWorkout}>
              <Text style={styles.emptyButtonText}>Начать первую тренировку</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Рекомендуем начать</Text>
        <View style={styles.programGrid}>
          {featuredPrograms.map((p, idx) => (
            <AnimatedCard
              key={`${p.title}-${idx}`}
              index={idx}
              onPress={() => navigation.navigate('ProgramDetail', p)}
              style={styles.programCard}
            >
              <View style={styles.programTag}>
                <Text style={styles.programTagText}>{p.tag}</Text>
              </View>
              <Text style={styles.programTitle}>{p.title}</Text>
              <Text style={styles.programSubtitle}>{p.subtitle}</Text>
              <Text style={styles.programDesc}>{p.desc}</Text>
              <View style={styles.programMetaRow}>
                <Text style={styles.programMeta}>Уровень: {p.level}</Text>
                <Text style={styles.programMeta}>Инвентарь: {p.equipment}</Text>
              </View>
              <TouchableOpacity
                style={styles.programCta}
                onPress={() => navigation.navigate('ProgramDetail', p)}
              >
                <Text style={styles.programCtaText}>Подробнее</Text>
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
    backgroundColor: palette.bg,
  },
  hero: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 32,
    gap: 10,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: palette.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  startButtonText: {
    color: '#0B1220',
    fontSize: 14,
    fontWeight: '800',
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: palette.text,
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: palette.card,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    color: palette.muted,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: palette.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    color: '#0B1220',
    fontSize: 14,
    fontWeight: '800',
  },
  programGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  programCard: {
    marginBottom: 0,
    backgroundColor: palette.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 14,
    width: '48%',
    gap: 8,
  },
  programTag: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
  },
  programTagText: {
    color: palette.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.text,
  },
  programSubtitle: {
    fontSize: 13,
    color: palette.muted,
  },
  programDesc: {
    fontSize: 13,
    color: palette.muted,
    lineHeight: 18,
  },
  programMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  programMeta: {
    fontSize: 12,
    color: palette.muted,
    backgroundColor: '#0C1627',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
  },
  programCta: {
    marginTop: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(34, 211, 238, 0.14)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.4)',
  },
  programCtaText: {
    color: palette.primary,
    fontWeight: '800',
    fontSize: 13,
  },
});
