import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated as RNAnimated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedCard from '../components/AnimatedCard';
import GradientButton from '../components/GradientButton';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function LandingScreen({ navigation }) {
  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const slideAnim = useRef(new RNAnimated.Value(50)).current;

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      RNAnimated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  const features = [
    {
      icon: '🤖',
      title: 'AI-Помощник',
      description: 'Персональный фитнес-ассистент с искусственным интеллектом. Получайте индивидуальные рекомендации по питанию и тренировкам 24/7.',
      gradient: ['#667EEA', '#764BA2'],
      highlight: true,
    },
    {
      icon: '🍽️',
      title: 'Умное питание',
      description: 'Отслеживание калорий и БЖУ с базой продуктов РФ. Автоматический расчёт и анализ вашего рациона.',
      gradient: ['#FF6B6B', '#FF8E53'],
    },
    {
      icon: '🏋️',
      title: 'Тренировки',
      description: 'Персональные планы тренировок, библиотека упражнений и отслеживание прогресса.',
      gradient: ['#4ECDC4', '#44A08D'],
    },
    {
      icon: '📊',
      title: 'Аналитика',
      description: 'Детальная статистика, графики прогресса и анализ достижений.',
      gradient: ['#F093FB', '#F5576C'],
    },
  ];

  const stats = [
    { value: '10K+', label: 'Пользователей' },
    { value: '50K+', label: 'Тренировок' },
    { value: '100K+', label: 'Рационов' },
    { value: '24/7', label: 'AI-поддержка' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <RNAnimated.View style={[styles.heroSection, animatedStyle]}>
        <LinearGradient
          colors={['#667EEA', '#764BA2', '#F093FB']}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroBadge}>✨ С Искусственным Интеллектом</Text>
            <Text style={styles.heroTitle}>
              FitPilot
            </Text>
            <Text style={styles.heroSubtitle}>
              Персональный фитнес-помощник с AI. Достигайте своих целей быстрее с умным планированием питания и тренировок.
            </Text>
            <View style={styles.heroButtons}>
              <GradientButton
                title="Начать бесплатно"
                onPress={() => navigation.navigate('Register')}
                variant="primary"
                style={styles.heroButton}
              />
              <TouchableOpacity
                style={styles.heroButtonSecondary}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.heroButtonSecondaryText}>Войти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </RNAnimated.View>

      {/* AI Highlight Section */}
      <View style={styles.aiSection}>
        <AnimatedCard index={0} style={styles.aiCard}>
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            style={styles.aiGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.aiContent}>
              <Text style={styles.aiIcon}>🤖</Text>
              <Text style={styles.aiTitle}>AI-Помощник - Наша Главная Фишка</Text>
              <Text style={styles.aiDescription}>
                FitPilot использует передовые технологии искусственного интеллекта для создания персональных планов питания и тренировок. 
                Наш AI анализирует ваши данные, цели и прогресс, чтобы давать максимально точные рекомендации.
              </Text>
              <View style={styles.aiFeatures}>
                <View style={styles.aiFeatureItem}>
                  <Text style={styles.aiFeatureIcon}>✓</Text>
                  <Text style={styles.aiFeatureText}>Персональные рационы питания</Text>
                </View>
                <View style={styles.aiFeatureItem}>
                  <Text style={styles.aiFeatureIcon}>✓</Text>
                  <Text style={styles.aiFeatureText}>Индивидуальные планы тренировок</Text>
                </View>
                <View style={styles.aiFeatureItem}>
                  <Text style={styles.aiFeatureIcon}>✓</Text>
                  <Text style={styles.aiFeatureText}>Анализ прогресса и рекомендации</Text>
                </View>
                <View style={styles.aiFeatureItem}>
                  <Text style={styles.aiFeatureIcon}>✓</Text>
                  <Text style={styles.aiFeatureText}>Круглосуточная поддержка</Text>
                </View>
              </View>
              <GradientButton
                title="Попробовать AI-помощника"
                onPress={() => navigation.navigate('Register')}
                variant="primary"
                style={styles.aiButton}
              />
            </View>
          </LinearGradient>
        </AnimatedCard>
      </View>

      {/* Features Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Возможности</Text>
        <Text style={styles.sectionSubtitle}>
          Все инструменты для достижения ваших фитнес-целей
        </Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <AnimatedCard
              key={index}
              index={index + 1}
              style={[
                styles.featureCard,
                feature.highlight && styles.featureCardHighlight,
              ]}
            >
              <LinearGradient
                colors={feature.gradient}
                style={styles.featureGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </LinearGradient>
            </AnimatedCard>
          ))}
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <LinearGradient
          colors={['#1E293B', '#334155']}
          style={styles.statsGradient}
        >
          <Text style={styles.statsTitle}>FitPilot в цифрах</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <AnimatedCard index={5} style={styles.ctaCard}>
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.ctaTitle}>Готовы начать?</Text>
            <Text style={styles.ctaSubtitle}>
              Присоединяйтесь к тысячам пользователей, которые уже достигли своих целей с FitPilot
            </Text>
            <GradientButton
              title="Создать аккаунт"
              onPress={() => navigation.navigate('Register')}
              variant="primary"
              style={styles.ctaButton}
            />
          </LinearGradient>
        </AnimatedCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroSection: {
    minHeight: 600,
  },
  heroGradient: {
    flex: 1,
    paddingTop: 100,
    paddingBottom: 80,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: 600,
  },
  heroBadge: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 24,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -2,
  },
  heroSubtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 40,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroButton: {
    minWidth: 180,
  },
  heroButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroButtonSecondaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  aiSection: {
    padding: 24,
    marginTop: -40,
  },
  aiCard: {
    marginBottom: 0,
  },
  aiGradient: {
    borderRadius: 24,
    padding: 32,
  },
  aiContent: {
    alignItems: 'center',
  },
  aiIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  aiTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  aiDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  aiFeatures: {
    width: '100%',
    marginBottom: 32,
  },
  aiFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingLeft: 8,
  },
  aiFeatureIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    marginRight: 12,
    fontWeight: '700',
  },
  aiFeatureText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    flex: 1,
  },
  aiButton: {
    minWidth: 250,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -1,
  },
  sectionSubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 26,
  },
  featuresGrid: {
    gap: 20,
  },
  featureCard: {
    marginBottom: 0,
  },
  featureCardHighlight: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  featureGradient: {
    borderRadius: 20,
    padding: 28,
    minHeight: 200,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 24,
  },
  statsSection: {
    marginVertical: 40,
  },
  statsGradient: {
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  statsTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 120,
  },
  statValue: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textAlign: 'center',
  },
  ctaSection: {
    padding: 24,
    paddingBottom: 60,
  },
  ctaCard: {
    marginBottom: 0,
  },
  ctaGradient: {
    borderRadius: 24,
    padding: 48,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
  },
  ctaButton: {
    minWidth: 250,
  },
});
