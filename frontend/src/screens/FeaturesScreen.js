import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedCard from '../components/AnimatedCard';
import { colors } from '../theme/colors';

export default function FeaturesScreen({ navigation }) {
  const mainFeatures = [
    {
      icon: '🤖',
      title: 'AI-Помощник',
      description: 'Персональный фитнес-ассистент с искусственным интеллектом. Создаёт индивидуальные планы питания и тренировок на основе ваших целей и прогресса.',
      features: [
        'Генерация персональных рационов питания',
        'Создание планов тренировок',
        'Анализ прогресса и рекомендации',
        'Круглосуточная поддержка',
      ],
      gradient: ['#667EEA', '#764BA2'],
      highlight: true,
    },
    {
      icon: '🍽️',
      title: 'Умное питание',
      description: 'Полный контроль над вашим рационом с автоматическим расчётом калорий и БЖУ.',
      features: [
        'База продуктов РФ',
        'Автоматический расчёт калорий',
        'Отслеживание БЖУ',
        'Дневник питания',
      ],
      gradient: ['#FF6B6B', '#FF8E53'],
    },
    {
      icon: '🏋️',
      title: 'Тренировки',
      description: 'Персональные планы тренировок и отслеживание прогресса.',
      features: [
        'Библиотека упражнений',
        'Конструктор тренировок',
        'Отслеживание прогресса',
        'История тренировок',
      ],
      gradient: ['#4ECDC4', '#44A08D'],
    },
    {
      icon: '📊',
      title: 'Аналитика',
      description: 'Детальная статистика и визуализация вашего прогресса.',
      features: [
        'Графики прогресса',
        'Статистика по периодам',
        'Анализ достижений',
        'Отчёты',
      ],
      gradient: ['#F093FB', '#F5576C'],
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient
        colors={['#667EEA', '#764BA2']}
        style={styles.hero}
      >
        <Text style={styles.heroTitle}>Возможности FitPilot</Text>
        <Text style={styles.heroSubtitle}>
          Всё необходимое для достижения ваших фитнес-целей в одном приложении
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {mainFeatures.map((feature, index) => (
          <AnimatedCard
            key={index}
            index={index}
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
              
              <View style={styles.featuresList}>
                {feature.features.map((item, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <Text style={styles.featureCheck}>✓</Text>
                    <Text style={styles.featureText}>{item}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </AnimatedCard>
        ))}

        {/* Additional Features */}
        <AnimatedCard index={4} style={styles.card}>
          <Text style={styles.cardTitle}>Дополнительные возможности</Text>
          <View style={styles.additionalFeatures}>
            <View style={styles.additionalItem}>
              <Text style={styles.additionalIcon}>🔐</Text>
              <Text style={styles.additionalTitle}>Безопасность</Text>
              <Text style={styles.additionalText}>JWT аутентификация и защита данных</Text>
            </View>
            <View style={styles.additionalItem}>
              <Text style={styles.additionalIcon}>⚡</Text>
              <Text style={styles.additionalTitle}>Производительность</Text>
              <Text style={styles.additionalText}>Быстрая работа и кэширование данных</Text>
            </View>
            <View style={styles.additionalItem}>
              <Text style={styles.additionalIcon}>📱</Text>
              <Text style={styles.additionalTitle}>Кроссплатформенность</Text>
              <Text style={styles.additionalText}>Работает на iOS, Android и Web</Text>
            </View>
            <View style={styles.additionalItem}>
              <Text style={styles.additionalIcon}>🔄</Text>
              <Text style={styles.additionalTitle}>Синхронизация</Text>
              <Text style={styles.additionalText}>Данные синхронизируются в реальном времени</Text>
            </View>
          </View>
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
  hero: {
    paddingTop: 100,
    paddingBottom: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 28,
  },
  content: {
    padding: 24,
  },
  featureCard: {
    marginBottom: 24,
  },
  featureCardHighlight: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  featureGradient: {
    borderRadius: 20,
    padding: 32,
  },
  featureIcon: {
    fontSize: 56,
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 26,
    marginBottom: 24,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureCheck: {
    fontSize: 20,
    color: '#FFFFFF',
    marginRight: 12,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    flex: 1,
  },
  card: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 24,
  },
  additionalFeatures: {
    gap: 20,
  },
  additionalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  additionalIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  additionalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 4,
    flex: 1,
  },
  additionalText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
});

