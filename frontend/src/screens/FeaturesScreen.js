import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated as RNAnimated,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import AnimatedCard from '../components/AnimatedCard';

export default function FeaturesScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  const fade = useRef(new RNAnimated.Value(0)).current;
  const slide = useRef(new RNAnimated.Value(30)).current;

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(fade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      RNAnimated.spring(slide, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const features = [
    {
      tag: 'AI',
      title: 'AI-ассистент 24/7',
      description: 'Умный помощник, который знает ваши цели, анализирует прогресс и дает персонализированные рекомендации по питанию и тренировкам без воды и общих фраз.',
      icon: '🤖',
      gradient: theme.gradients.primary,
      highlights: [
        'Персональные ответы на основе ваших данных',
        'Генерация рационов питания под цели',
        'Создание планов тренировок',
        'Анализ прогресса и корректировки',
      ],
    },
    {
      tag: 'Food',
      title: 'Дневник питания',
      description: 'Полный контроль над питанием: отслеживание калорий и макронутриентов, дневник приёмов пищи, сканер штрих-кодов для быстрого добавления продуктов.',
      icon: '🍽️',
      gradient: theme.gradients.secondary,
      highlights: [
        'Дневник приёмов пищи с БЖУ',
        'Сканер штрих-кодов продуктов',
        'База продуктов из РФ',
        'Контроль дефицита/профицита',
      ],
    },
    {
      tag: 'Train',
      title: 'Тренировки',
      description: 'Конструктор тренировок, библиотека упражнений, отслеживание прогресса. Создавайте планы под себя: дом или зал, с оборудованием или без.',
      icon: '💪',
      gradient: theme.gradients.success,
      highlights: [
        'Конструктор тренировок',
        'Библиотека 200+ упражнений',
        'Трекинг весов и повторений',
        'Статистика по объёму нагрузки',
      ],
    },
    {
      tag: 'Analytics',
      title: 'Аналитика и прогресс',
      description: 'Подробная статистика вашего прогресса: графики веса, калорий, объёма тренировок. Визуализация достижений и тенденций.',
      icon: '📊',
      gradient: theme.gradients.ocean,
      highlights: [
        'Графики динамики веса',
        'Статистика по калориям',
        'Трекинг объёма тренировок',
        'Анализ БЖУ',
      ],
    },
    {
      tag: 'Recipes',
      title: 'Рецепты',
      description: 'Коллекция здоровых рецептов с подсчётом калорий и БЖУ. Быстрые блюда под разные цели: похудение, набор массы, поддержание.',
      icon: '👨‍🍳',
      gradient: theme.gradients.purple,
      highlights: [
        'Рецепты с расчётом БЖУ',
        'Фильтр по целям',
        'Быстрые блюда (до 30 мин)',
        'Продукты из РФ',
      ],
    },
    {
      tag: 'Programs',
      title: 'Готовые программы',
      description: 'Проверенные тренировочные программы от экспертов: для похудения, набора массы, функциональной подготовки, йоги и растяжки.',
      icon: '🎯',
      gradient: theme.gradients.cyan,
      highlights: [
        'Программы на 4-12 недель',
        'Для дома и зала',
        'Разные уровни подготовки',
        'Проверены тренерами',
      ],
    },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.bg }]} 
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <RNAnimated.View style={[{ opacity: fade, transform: [{ translateY: slide }] }]}>
        <LinearGradient
          colors={theme.gradients.hero}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.heroTitle, { color: isDark ? '#FFFFFF' : '#1E293B' }]}>
            Возможности FitPilot
          </Text>
          <Text style={[styles.heroSubtitle, { color: isDark ? 'rgba(255,255,255,0.9)' : '#475569' }]}>
            Всё, что нужно для достижения ваших фитнес-целей в одном приложении
          </Text>
        </LinearGradient>
      </RNAnimated.View>

      <View style={[styles.content, isDesktop && styles.contentDesktop]}>
        {features.map((feature, index) => (
          <AnimatedCard key={index} index={index} style={styles.featureSection}>
            <LinearGradient
              colors={feature.gradient}
              style={[
                styles.featureCard,
                isTablet && styles.featureCardTablet,
                isDesktop && styles.featureCardDesktop
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.featureHeader}>
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                </View>
                <View style={styles.featureBadge}>
                  <Text style={styles.featureBadgeText}>{feature.tag}</Text>
                </View>
              </View>
              
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
              
              <View style={styles.highlightsContainer}>
                {feature.highlights.map((highlight, idx) => (
                  <View key={idx} style={styles.highlightRow}>
                    <View style={styles.highlightDot} />
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity 
                style={styles.tryButton}
                onPress={() => {
                  // Навигация к соответствующей функции
                  if (feature.tag === 'AI') navigation.navigate('Chat');
                  else if (feature.tag === 'Food') navigation.navigate('Nutrition');
                  else if (feature.tag === 'Train') navigation.navigate('Workouts');
                  else if (feature.tag === 'Recipes') navigation.navigate('Recipes');
                  else if (feature.tag === 'Programs') navigation.navigate('Programs');
                  else navigation.navigate('Home');
                }}
              >
                <Text style={styles.tryButtonText}>Попробовать</Text>
                <Text style={styles.tryButtonArrow}>→</Text>
              </TouchableOpacity>
            </LinearGradient>
          </AnimatedCard>
        ))}

        {/* CTA */}
        <AnimatedCard index={features.length} style={styles.ctaSection}>
          <LinearGradient
            colors={theme.gradients.primary}
            style={styles.ctaCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.ctaTitle}>Готовы начать?</Text>
            <Text style={styles.ctaSubtitle}>
              Все функции уже доступны в приложении
            </Text>
            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.ctaButtonText}>Перейти на главную</Text>
            </TouchableOpacity>
          </LinearGradient>
        </AnimatedCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
    maxWidth: 600,
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  contentDesktop: {
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
  },
  featureSection: {
    marginBottom: 20,
  },
  featureCard: {
    borderRadius: 32,
    padding: 28,
    minHeight: 320,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  featureCardTablet: {
    padding: 32,
  },
  featureCardDesktop: {
    padding: 36,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  featureIcon: {
    fontSize: 32,
  },
  featureBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  featureBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  featureTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.6,
  },
  featureDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 25,
    marginBottom: 24,
  },
  highlightsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  highlightDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  highlightText: {
    flex: 1,
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    lineHeight: 22,
  },
  tryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 8,
  },
  tryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  tryButtonArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  ctaSection: {
    marginTop: 16,
    marginBottom: 40,
  },
  ctaCard: {
    borderRadius: 32,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 14,
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 26,
  },
  ctaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    minWidth: 240,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
