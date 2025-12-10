import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { workoutsAPI } from '../services/api';
import { useApi } from '../hooks/useApi';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import StatCard from '../components/StatCard';
import WorkoutCard from '../components/WorkoutCard';
import { cache } from '../utils/cache';

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
        const data = response.data.sessions || [];
        
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
        const data = response.data.overall || {};
        
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
      <View style={styles.header}>
        <Text style={styles.title}>Тренировки</Text>
        <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
          <Text style={styles.startButtonText}>+ Начать тренировку</Text>
        </TouchableOpacity>
      </View>

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
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 16,
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
