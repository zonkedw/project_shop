import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nutritionAPI, workoutsAPI, usersAPI } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayStats, setTodayStats] = useState({
    calories: 0,
    targetCalories: 2200,
    protein: 0,
    carbs: 0,
    fats: 0,
    workouts: 0,
  });
  const [weekCalories, setWeekCalories] = useState([]); // [{date, calories}]
  const [weekWorkouts, setWeekWorkouts] = useState([]); // [{date, count}]
  const [workoutStats7d, setWorkoutStats7d] = useState(null);

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fade]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadUserData(), loadTodayData()]).finally(() => setLoading(false));
  };

  const getDateNDaysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  };

  const loadUserData = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  const loadTodayData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [profileRes, diaryRes, sessionsRes, workoutStatsRes] = await Promise.all([
        usersAPI.getProfile().catch(() => ({ data: {} })),
        nutritionAPI.getDiary(today).catch(() => ({ data: { totals: {}, targets: {} } })),
        workoutsAPI.getSessions({ start_date: today, end_date: today }).catch(() => ({ data: { sessions: [] } })),
        workoutsAPI.getStats({ start_date: getDateNDaysAgo(6), end_date: today }).catch(() => ({ data: null })),
      ]);

      if (profileRes?.data) setUser(profileRes.data);

      setTodayStats({
        calories: diaryRes.data.totals?.calories || 0,
        targetCalories: diaryRes.data.targets?.calories || profileRes?.data?.daily_calories_target || 2200,
        protein: diaryRes.data.totals?.protein || 0,
        carbs: diaryRes.data.totals?.carbs || 0,
        fats: diaryRes.data.totals?.fats || 0,
        workouts: sessionsRes.data.sessions?.length || 0,
      });

      if (workoutStatsRes?.data) {
        setWorkoutStats7d(workoutStatsRes.data);
      }

      // загрузка за 7 дней
      const days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });
      const diaryCalls = days.map(d => nutritionAPI.getDiary(d).catch(() => ({ data: { totals: {} } })));
      const wkCalls = workoutsAPI.getSessions({ start_date: days[0], end_date: days[6] }).catch(() => ({ data: { sessions: [] } }));
      const [diaries, wkRange] = await Promise.all([Promise.all(diaryCalls), wkCalls]);
      const cal = diaries.map((res, idx) => ({ date: days[idx], calories: res.data.totals?.calories || 0 }));
      const sessions = wkRange.data.sessions || [];
      const countsByDate = days.reduce((acc, d) => (acc[d] = 0, acc), {});
      sessions.forEach(s => { const d = (s.session_date || '').split('T')[0]; if (countsByDate[d] !== undefined) countsByDate[d]++; });
      const wks = days.map(d => ({ date: d, count: countsByDate[d] || 0 }));
      setWeekCalories(cal);
      setWeekWorkouts(wks);
    } catch (error) {
      console.error('Error loading today data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    navigation.replace('Login');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Animated.View style={[styles.hero, { opacity: fade }]}>
        <Text style={styles.heroHello}>Привет, {user?.username || 'Пользователь'}</Text>
        <Text style={styles.heroSubtitle}>Держим курс на цель</Text>
      </Animated.View>

      <View style={styles.statsRow}>
        <Card style={[styles.paperCard, { backgroundColor: '#1D4ED8' }]}> 
          <Card.Content>
            <Text style={styles.cardLabel}>Калории</Text>
            <Text style={styles.cardValue}>{todayStats.calories} / {todayStats.targetCalories}</Text>
            <Text style={styles.cardHint}>за сегодня</Text>
          </Card.Content>
        </Card>
        <Card style={[styles.paperCard, { backgroundColor: '#111827' }]}> 
          <Card.Content>
            <Text style={styles.cardLabel}>Тренировки</Text>
            <Text style={styles.cardValue}>{todayStats.workouts}</Text>
            <Text style={styles.cardHint}>сессии</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.macrosRow}>
        <View style={styles.macroCard}>
          <Text style={styles.macroLabel}>Б</Text>
          <Text style={styles.macroVal}>{todayStats.protein} г</Text>
        </View>
        <View style={styles.macroCard}>
          <Text style={styles.macroLabel}>Ж</Text>
          <Text style={styles.macroVal}>{todayStats.fats} г</Text>
        </View>
        <View style={styles.macroCard}>
          <Text style={styles.macroLabel}>У</Text>
          <Text style={styles.macroVal}>{todayStats.carbs} г</Text>
        </View>
      </View>

      {/* Weekly charts */}
      <Text style={styles.sectionTitle}>Динамика 7 дней</Text>
      <View style={styles.chartBlock}>
        <Text style={styles.chartTitle}>Калории</Text>
        <View style={styles.chartRow}>
          {weekCalories.map((d, idx) => {
            const max = Math.max(1, ...weekCalories.map(x => x.calories));
            const h = Math.max(4, Math.round((d.calories / max) * 56));
            return (
              <View key={idx} style={styles.barWrap}>
                <View style={[styles.bar, { height: h }]} />
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.chartBlock}>
        <Text style={styles.chartTitle}>Тренировки</Text>
        <View style={styles.chartRow}>
          {weekWorkouts.map((d, idx) => {
            const max = Math.max(1, ...weekWorkouts.map(x => x.count));
            const h = Math.max(4, Math.round((d.count / max) * 56));
            return (
              <View key={idx} style={styles.barWrap}>
                <View style={[styles.barAlt, { height: h }]} />
              </View>
            );
          })}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Быстрые действия</Text>

      <Card style={styles.action}> 
        <Card.Title title="Добавить приём пищи" titleStyle={{ color: '#E5E7EB' }} />
        <Card.Content>
          <Text style={styles.actionDesc}>Поиск по базе, штрих‑код, шаблоны</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={() => navigation.navigate('Nutrition')}>Открыть</Button>
        </Card.Actions>
      </Card>

      <Card style={styles.action}> 
        <Card.Title title="Начать тренировку" titleStyle={{ color: '#E5E7EB' }} />
        <Card.Content>
          <Text style={styles.actionDesc}>Выбор программы или свободная сессия</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={() => navigation.navigate('Workouts')}>Открыть</Button>
        </Card.Actions>
      </Card>

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Выйти</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  workoutStatsBox: {
    marginTop: 12,
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  workoutStatsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  workoutStatsCol: { flex: 1 },
  wsLabel: { color: '#9CA3AF', fontSize: 12 },
  wsValue: { color: '#F9FAFB', fontWeight: '700', marginTop: 4, fontSize: 14 },
  muscleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10, alignItems: 'center' },
  muscleTag: { color: '#A5B4FC', fontSize: 11, backgroundColor: '#020617', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(129,140,248,0.5)' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  heroHello: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E5E7EB',
  },
  heroSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#94A3B8',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
  },
  paperCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  cardPrimary: {
    backgroundColor: '#1D4ED8',
  },
  cardNeutral: {
    backgroundColor: '#111827',
  },
  cardLabel: {
    color: '#C7D2FE',
    fontSize: 12,
  },
  cardValue: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
  },
  cardHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 8,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
  },
  macroLabel: {
    fontSize: 12,
    color: '#93C5FD',
  },
  macroVal: {
    marginTop: 6,
    fontSize: 16,
    color: '#E5E7EB',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#CBD5E1',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  chartBlock: { paddingHorizontal: 16, marginBottom: 8 },
  chartTitle: { color: '#94A3B8', marginBottom: 6 },
  chartRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-end', height: 64 },
  barWrap: { flex: 1, backgroundColor: 'rgba(148,163,184,0.08)', borderRadius: 6, justifyContent: 'flex-end' },
  bar: { backgroundColor: '#3B82F6', borderRadius: 6 },
  barAlt: { backgroundColor: '#10B981', borderRadius: 6 },
  action: {
    backgroundColor: '#0F172A',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
  },
  actionTitle: {
    color: '#E5E7EB',
    fontSize: 16,
    fontWeight: '600',
  },
  actionDesc: {
    color: '#94A3B8',
    marginTop: 4,
    fontSize: 13,
  },
  logout: {
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 14,
    backgroundColor: '#111827',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutText: {
    color: '#FCA5A5',
    fontSize: 15,
    fontWeight: '600',
  },
});
