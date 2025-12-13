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
  TouchableOpacity,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nutritionAPI, workoutsAPI, extractData } from '../services/api';
import { useApi } from '../hooks/useApi';
import ErrorMessage from '../components/ErrorMessage';
import AnimatedCard from '../components/AnimatedCard';
import Header from '../components/Header';

const palette = {
  bg: '#0B1220',
  panel: '#0F172A',
  card: '#111827',
  border: '#1F2937',
  primary: '#22D3EE',
  accent: '#7C3AED',
  accentGreen: '#22C55E',
  text: '#E2E8F0',
  muted: '#94A3B8',
};

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

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [todayStats, setTodayStats] = useState({
    calories: 0,
    targetCalories: 2200,
    workouts: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const { loading, error, execute, reset } = useApi();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;
  const isSmallPhone = width < 420;

  const featureItems = [
    {
      tag: 'AI',
      title: 'AI-ассистент',
      description: 'Ответы без шаблонов, рационы и тренировки с учётом ваших данных.',
      accent: palette.primary,
      screen: 'Chat',
    },
    {
      tag: 'Food',
      title: 'Питание',
      description: 'Контроль дефицита/набора, баланс БЖУ, продукты РФ.',
      accent: palette.accent,
      screen: 'Nutrition',
    },
    {
      tag: 'Train',
      title: 'Тренировки',
      description: 'Дом/зал, оборудование и время учитываются в планах.',
      accent: palette.accentGreen,
      screen: 'Workouts',
    },
    {
      tag: 'Stats',
      title: 'Прогресс',
      description: 'Динамика веса, калорий и нагрузок без лишнего визуального шума.',
      accent: '#F59E0B',
      screen: 'Profile',
    },
  ];

  const featureScales = useRef(featureItems.map(() => new RNAnimated.Value(1))).current;
  const statScales = useRef([new RNAnimated.Value(1), new RNAnimated.Value(1)]).current;

  // Анимации
  const heroOpacity = useRef(new RNAnimated.Value(0)).current;
  const heroScale = useRef(new RNAnimated.Value(0.9)).current;
  const scrollY = useRef(new RNAnimated.Value(0)).current;
  const blocksOpacity = useRef(new RNAnimated.Value(0)).current;
  const blocksTranslate = useRef(new RNAnimated.Value(20)).current;

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
      RNAnimated.timing(blocksOpacity, {
        toValue: 1,
        duration: 800,
        delay: 150,
        useNativeDriver: true,
      }),
      RNAnimated.spring(blocksTranslate, {
        toValue: 0,
        delay: 150,
        tension: 50,
        friction: 9,
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

        const diaryData = extractData(diaryResponse) || diaryResponse.data || {};
        const sessionsData = extractData(sessionsResponse) || sessionsResponse.data || {};

        setTodayStats({
          calories: diaryData.totals?.calories || 0,
          targetCalories: diaryData.targets?.calories || 2200,
          workouts: sessionsData.sessions?.length || 0,
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

  const blocksAnimatedStyle = {
    opacity: blocksOpacity,
    transform: [{ translateY: blocksTranslate }],
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  const pressTo = (val, toValue) => {
    RNAnimated.spring(val, {
      toValue,
      useNativeDriver: true,
      friction: 6,
      tension: 120,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} user={user} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.primary} />
        }
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={RNAnimated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Hero Section */}
        <RNAnimated.View style={[
          styles.heroSection,
          heroAnimatedStyle,
          isTablet && styles.heroSectionTablet,
          isDesktop && styles.heroSectionDesktop
        ]}>
          <LinearGradient
            colors={[palette.bg, palette.panel, palette.bg]}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
          <View style={[
            styles.heroContent,
            isTablet && styles.heroContentTablet,
            isDesktop && styles.heroContentDesktop
          ]}>
              <Text style={styles.heroGreeting}>{getGreeting()},</Text>
              <Text style={styles.heroTitle}>
                {user?.username || 'спортсмен'}
              </Text>
              <Text style={styles.heroSubtitle}>
                Цифровой тренер и нутриолог. Конкретные планы питания и тренировок под ваши цели.
              </Text>

              {/* Quick Stats */}
            <View style={[
              styles.quickStats,
              (isSmallPhone || isTablet) && styles.quickStatsWrap
            ]}>
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

        {/* Progress Card + sections */}
        <RNAnimated.View style={[styles.content, blocksAnimatedStyle]}>
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

            <View style={[
              styles.featuresGrid,
              isTablet && styles.featuresGridTablet,
              isDesktop && styles.featuresGridDesktop
            ]}>
              {featureItems.map((feature, index) => (
                <Pressable
                  key={feature.screen}
                  onPressIn={() => pressTo(featureScales[index], 0.97)}
                  onPressOut={() => pressTo(featureScales[index], 1)}
                  onPress={() => navigation.navigate(feature.screen)}
                >
                  <AnimatedCard
                    index={index + 1}
                    style={[
                      styles.featureCardWrapper,
                      isTablet && styles.featureCardWrapperTablet,
                      isDesktop && styles.featureCardWrapperDesktop,
                      { transform: [{ scale: featureScales[index] }] },
                    ]}
                  >
                    <View style={[styles.featureCard, { borderColor: feature.accent }]}>
                      <View style={[styles.featureTag, { backgroundColor: `${feature.accent}22` }]}>
                        <Text style={[styles.featureTagText, { color: feature.accent }]}>{feature.tag}</Text>
                      </View>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                      <View style={[styles.featureArrow, { backgroundColor: `${feature.accent}15` }]}>
                        <Text style={[styles.featureArrowText, { color: feature.accent }]}>Перейти</Text>
                      </View>
                    </View>
                  </AnimatedCard>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Статистика</Text>
            <View style={[
              styles.statsRow,
              isSmallPhone && styles.statsRowStacked
            ]}>
              <Pressable
                onPressIn={() => pressTo(statScales[0], 0.98)}
                onPressOut={() => pressTo(statScales[0], 1)}
              >
                <AnimatedCard index={5} style={[styles.statCard, { transform: [{ scale: statScales[0] }] }]}>
                  <View style={styles.statGradient}>
                    <Text style={styles.statLabel}>Калории сегодня</Text>
                    <Text style={styles.statValue}>{todayStats.calories}</Text>
                    <Text style={styles.statHint}>Цель {todayStats.targetCalories}</Text>
                  </View>
                </AnimatedCard>
              </Pressable>

              <Pressable
                onPressIn={() => pressTo(statScales[1], 0.98)}
                onPressOut={() => pressTo(statScales[1], 1)}
              >
                <AnimatedCard index={6} style={[styles.statCard, { transform: [{ scale: statScales[1] }] }]}>
                  <View style={styles.statGradient}>
                    <Text style={styles.statLabel}>Тренировки</Text>
                    <Text style={styles.statValue}>{todayStats.workouts}</Text>
                    <Text style={styles.statHint}>За сегодня</Text>
                  </View>
                </AnimatedCard>
              </Pressable>
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <LinearGradient
              colors={[palette.primary, palette.accent]}
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
        </RNAnimated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
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
  heroSectionTablet: {
    marginBottom: 28,
  },
  heroSectionDesktop: {
    marginBottom: 32,
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
  heroContentTablet: {
    maxWidth: 760,
    alignSelf: 'center',
  },
  heroContentDesktop: {
    maxWidth: 860,
    alignSelf: 'center',
  },
  heroGreeting: {
    fontSize: 18,
    color: palette.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: palette.text,
    letterSpacing: -1,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: palette.muted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    flexWrap: 'wrap',
  },
  quickStatsWrap: {
    justifyContent: 'space-between',
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    minWidth: 160,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: palette.text,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    color: palette.muted,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  progressCard: {
    marginBottom: 32,
    backgroundColor: palette.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: palette.border,
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
    color: palette.text,
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: palette.muted,
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0C1627',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.primary,
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#0C1627',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.border,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: palette.primary,
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
    color: palette.muted,
    marginBottom: 4,
  },
  progressItemValue: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.text,
  },
  progressDivider: {
    width: 1,
    backgroundColor: palette.border,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: palette.muted,
    marginBottom: 24,
    lineHeight: 24,
  },
  featuresGrid: {
    gap: 16,
    flexDirection: 'column',
  },
  featuresGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featuresGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
  },
  featureCardWrapper: {
    marginBottom: 0,
  },
  featureCardWrapperTablet: {
    width: '48%',
  },
  featureCardWrapperDesktop: {
    width: '48%',
  },
  featureCard: {
    borderRadius: 18,
    padding: 20,
    minHeight: 160,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
  },
  featureTag: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  featureTagText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  featureDescription: {
    fontSize: 14,
    color: palette.muted,
    lineHeight: 20,
    marginBottom: 16,
  },
  featureArrow: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  featureArrowText: {
    fontSize: 13,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statsRowStacked: {
    flexDirection: 'column',
    gap: 12,
  },
  statCard: {
    flex: 1,
    marginBottom: 0,
  },
  statGradient: {
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: palette.muted,
    fontWeight: '700',
    textAlign: 'center',
  },
  statHint: {
    fontSize: 12,
    color: palette.muted,
    marginTop: 6,
  },
  ctaSection: {
    marginBottom: 32,
  },
  ctaCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: palette.muted,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: palette.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 26,
    minWidth: 200,
  },
  ctaButtonText: {
    color: '#0B1220',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorContainer: {
    marginTop: 16,
  },
});
