import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nutritionAPI, workoutsAPI } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayStats, setTodayStats] = useState({
    calories: 0,
    targetCalories: 2200,
    workouts: 0,
  });

  useEffect(() => {
    loadUserData();
    loadTodayData();
  }, []);

  const loadUserData = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  const loadTodayData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [diaryResponse, sessionsResponse] = await Promise.all([
        nutritionAPI.getDiary(today).catch(() => ({ data: { totals: {} } })),
        workoutsAPI.getSessions({ start_date: today, end_date: today }).catch(() => ({ data: { sessions: [] } })),
      ]);

      setTodayStats({
        calories: diaryResponse.data.totals?.calories || 0,
        targetCalories: diaryResponse.data.targets?.calories || 2200,
        workouts: sessionsResponse.data.sessions?.length || 0,
      });
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Привет, {user?.username || 'Пользователь'}!</Text>
        <Text style={styles.subtitle}>Готовы к новым достижениям?</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statLabel}>Калории</Text>
          <Text style={styles.statValue}>
            {todayStats.calories} / {todayStats.targetCalories}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statIcon}>💪</Text>
          <Text style={styles.statLabel}>Тренировки</Text>
          <Text style={styles.statValue}>{todayStats.workouts}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Быстрые действия</Text>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('Nutrition')}
      >
        <View style={styles.actionIcon}>
          <Text style={styles.actionEmoji}>🍽️</Text>
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Добавить прием пищи</Text>
          <Text style={styles.actionSubtitle}>Зарегистрируйте питание</Text>
        </View>
        <Text style={styles.actionArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('Workouts')}
      >
        <View style={styles.actionIcon}>
          <Text style={styles.actionEmoji}>🏋️</Text>
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Начать тренировку</Text>
          <Text style={styles.actionSubtitle}>Запишите упражнения</Text>
        </View>
        <Text style={styles.actionArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => navigation.navigate('Profile')}
      >
        <View style={styles.actionIcon}>
          <Text style={styles.actionEmoji}>👤</Text>
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Профиль</Text>
          <Text style={styles.actionSubtitle}>Настройки и цели</Text>
        </View>
        <Text style={styles.actionArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Выйти</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  actionArrow: {
    fontSize: 24,
    color: '#ccc',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
