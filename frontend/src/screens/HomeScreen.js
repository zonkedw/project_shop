import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Animated as RNAnimated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nutritionAPI, workoutsAPI } from '../services/api';
import { useApi } from '../hooks/useApi';
import ErrorMessage from '../components/ErrorMessage';
import AnimatedCard from '../components/AnimatedCard';
import Header from '../components/Header';
import { colors } from '../theme/colors';

// Безопасный импорт reanimated
let Reanimated;
let useSharedValue;
let useAnimatedStyle;
let withTiming;

try {
  if (Platform.OS !== 'web') {
    Reanimated = require('react-native-reanimated');
    useSharedValue = Reanimated.useSharedValue;
    useAnimatedStyle = Reanimated.useAnimatedStyle;
    withTiming = Reanimated.withTiming;
  }
} catch (e) {
  console.warn('react-native-reanimated not available');
}

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [todayStats, setTodayStats] = useState({
    calories: 0,
    targetCalories: 2200,
    workouts: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const { loading, error, execute, reset } = useApi();

  // Анимации
  const heroOpacity = useRef(new RNAnimated.Value(0)).current;
  const heroScale = useRef(new RNAnimated.Value(0.9)).current;
  const scrollY = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    loadUserData();
    checkAuthAndLoad();
    startAnimations();
  }, []);

  const startAnimations = () => {
    RNAnimated.parallel([
      RNAnimated.timing(heroOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      RNAnimated.spring(heroScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const checkAuthAndLoad = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      navigation.replace('Login');
      return;
    }
    loadTodayData();
  };

  const loadUserData = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  const loadTodayData = async () => {
    await execute(
      async () => {
        const today = new Date().toISOString().split('T')[0];
        const [diaryResponse, sessionsResponse] = await Promise.all([
          nutritionAPI.getDiary(today).catch(() => ({ data: { totals: {}, targets: {} } })),
          workoutsAPI.getSessions({ start_date: today, end_date: today }).catch(() => ({ data: { sessions: [] } })),
        ]);

        setTodayStats({
          calories: diaryResponse.data.totals?.calories || 0,
          targetCalories: diaryResponse.data.targets?.calories || 2200,
          workouts: sessionsResponse.data.sessions?.length || 0,
        });

        return { success: true };
      },
      { showError: false }
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    reset();
    await loadTodayData();
    setRefreshing(false);
  };

  const progressPercent = Math.min(100, (todayStats.calories / todayStats.targetCalories) * 100);
  const useReanimated = Platform.OS !== 'web' && Reanimated && useSharedValue;

  const progressWidthRef = useRef(useReanimated ? null : new RNAnimated.Value(0));
  const progressWidth = useReanimated ? useSharedValue(0) : progressWidthRef.current;

  useEffect(() => {
    if (useReanimated) {
      progressWidth.value = withTiming(progressPercent, { duration: 1000 });
    } else {
      RNAnimated.timing(progressWidth, {
        toValue: progressPercent,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [progressPercent, useReanimated]);

  const progressAnimatedStyle = useReanimated && useAnimatedStyle ? useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
    };
  }) : {
    width: progressWidth.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    }),
  };

  const heroAnimatedStyle = {
    opacity: heroOpacity,
    transform: [{ scale: heroScale }],
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  const features = [
    {
      icon: '🍽️',
      title: 'Умное питание',
      description: 'Отслеживайте калории и БЖУ с AI-помощником',
      gradient: ['#FF6B6B', '#FF8E53'],
      screen: 'Nutrition',
    },
    {
      icon: '🏋️',
      title: 'Персональные тренировки',
      description: 'Планы тренировок под ваши цели',
      gradient: ['#4ECDC4', '#44A08D'],
      screen: 'Workouts',
    },
    {
      icon: '🤖',
      title: 'AI-ассистент',
      description: 'Персональные советы 24/7',
      gradient: ['#667EEA', '#764BA2'],
      screen: 'Chat',
    },
    {
      icon: '📊',
      title: 'Аналитика прогресса',
      description: 'Детальная статистика и графики',
      gradient: ['#F093FB', '#F5576C'],
      screen: 'Profile',
    },
  ];

  return (
    <View style={styles.container}>
      <Header navigation={navigation} user={user} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={RNAnimated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Hero Section */}
        <RNAnimated.View style={[styles.heroSection, heroAnimatedStyle]}>
          <LinearGradient
            colors={['#667EEA', '#764BA2', '#F093FB']}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroGreeting}>{getGreeting()},</Text>
              <Text style={styles.heroTitle}>
                {user?.username || 'Пользователь'}! 👋
              </Text>
              <Text style={styles.heroSubtitle}>
                Достигайте своих фитнес-целей с умным помощником
              </Text>

              {/* Quick Stats */}
              <View style={styles.quickStats}>
                <View style={styles.quickStatCard}>
                  <Text style={styles.quickStatValue}>{todayStats.calories}</Text>
                  <Text style={styles.quickStatLabel}>ккал сегодня</Text>
                </View>
                <View style={styles.quickStatCard}>
                  <Text style={styles.quickStatValue}>{todayStats.workouts}</Text>
                  <Text style={styles.quickStatLabel}>тренировок</Text>
                </View>
                <View style={styles.quickStatCard}>
                  <Text style={styles.quickStatValue}>{Math.round(progressPercent)}%</Text>
                  <Text style={styles.quickStatLabel}>от цели</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </RNAnimated.View>

        {/* Progress Card */}
        <View style={styles.content}>
          <AnimatedCard index={0} style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressTitle}>Ваш прогресс сегодня</Text>
                <Text style={styles.progressSubtitle}>
                  {todayStats.calories} / {todayStats.targetCalories} ккал
                </Text>
              </View>
              <View style={styles.progressCircle}>
                <Text style={styles.progressPercent}>{Math.round(progressPercent)}%</Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                {useReanimated && Reanimated ? (
                  <Reanimated.View style={[styles.progressBarFill, progressAnimatedStyle]} />
                ) : (
                  <RNAnimated.View style={[styles.progressBarFill, progressAnimatedStyle]} />
                )}
              </View>
            </View>
            <View style={styles.progressFooter}>
              <View style={styles.progressItem}>
                <Text style={styles.progressItemLabel}>Осталось</Text>
                <Text style={styles.progressItemValue}>
                  {Math.max(0, todayStats.targetCalories - todayStats.calories)} ккал
                </Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressItem}>
                <Text style={styles.progressItemLabel}>Съедено</Text>
                <Text style={styles.progressItemValue}>{todayStats.calories} ккал</Text>
              </View>
            </View>
          </AnimatedCard>

          {/* Features Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Возможности FitPilot</Text>
            <Text style={styles.sectionSubtitle}>
              Все инструменты для достижения ваших фитнес-целей в одном месте
            </Text>

            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <AnimatedCard
                  key={feature.screen}
                  index={index + 1}
                  onPress={() => navigation.navigate(feature.screen)}
                  style={styles.featureCardWrapper}
                >
                  <LinearGradient
                    colors={feature.gradient}
                    style={styles.featureCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.featureIcon}>{feature.icon}</Text>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                    <View style={styles.featureArrow}>
                      <Text style={styles.featureArrowText}>→</Text>
                    </View>
                  </LinearGradient>
                </AnimatedCard>
              ))}
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Статистика</Text>
            <View style={styles.statsRow}>
              <AnimatedCard index={5} style={styles.statCard}>
                <LinearGradient
                  colors={['#FF6B6B', '#FF8E53']}
                  style={styles.statGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.statIcon}>🔥</Text>
                  <Text style={styles.statValue}>{todayStats.calories}</Text>
                  <Text style={styles.statLabel}>Калории</Text>
                </LinearGradient>
              </AnimatedCard>

              <AnimatedCard index={6} style={styles.statCard}>
                <LinearGradient
                  colors={['#4ECDC4', '#44A08D']}
                  style={styles.statGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.statIcon}>💪</Text>
                  <Text style={styles.statValue}>{todayStats.workouts}</Text>
                  <Text style={styles.statLabel}>Тренировки</Text>
                </LinearGradient>
              </AnimatedCard>
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              style={styles.ctaCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.ctaTitle}>Готовы начать?</Text>
              <Text style={styles.ctaSubtitle}>
                Получите персональный план от AI-ассистента прямо сейчас
              </Text>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => navigation.navigate('Chat')}
              >
                <Text style={styles.ctaButtonText}>Начать с AI</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <ErrorMessage message={error} onRetry={loadTodayData} />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 120 : Platform.OS === 'web' ? 90 : 110,
  },
  heroSection: {
    marginBottom: 24,
  },
  heroGradient: {
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroGreeting: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  progressCard: {
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressItemLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  progressItemValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
  },
  progressDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textDark,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 24,
  },
  featuresGrid: {
    gap: 16,
  },
  featureCardWrapper: {
    marginBottom: 0,
  },
  featureCard: {
    borderRadius: 20,
    padding: 24,
    minHeight: 160,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 16,
  },
  featureArrow: {
    alignSelf: 'flex-end',
  },
  featureArrowText: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    marginBottom: 0,
  },
  statGradient: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  statIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  ctaSection: {
    marginBottom: 32,
  },
  ctaCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 200,
  },
  ctaButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorContainer: {
    marginTop: 16,
  },
});
