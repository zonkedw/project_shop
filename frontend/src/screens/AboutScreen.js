import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated as RNAnimated,
  TouchableOpacity,
  useWindowDimensions,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import AnimatedCard from '../components/AnimatedCard';

export default function AboutScreen({ navigation }) {
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

  const team = [
    { name: 'AI Engine', role: 'OpenAI GPT-4', icon: '🤖', description: 'Интеллектуальный движок для персонализации' },
    { name: 'Backend', role: 'Node.js + Express', icon: '⚙️', description: 'Надёжный и быстрый сервер' },
    { name: 'Frontend', role: 'React Native + Expo', icon: '📱', description: 'Кроссплатформенное приложение' },
    { name: 'Database', role: 'PostgreSQL', icon: '🗄️', description: 'Безопасное хранение данных' },
  ];

  const features = [
    {
      icon: '🤖',
      title: 'AI-ассистент',
      desc: 'Умный помощник, который знает ваши цели и прогресс',
      gradient: theme.gradients.primary,
    },
    {
      icon: '🍽️',
      title: 'Питание',
      desc: 'Дневник, рецепты, сканер штрих-кодов',
      gradient: theme.gradients.secondary,
    },
    {
      icon: '💪',
      title: 'Тренировки',
      desc: 'Конструктор, библиотека упражнений, трекинг',
      gradient: theme.gradients.success,
    },
    {
      icon: '📊',
      title: 'Аналитика',
      desc: 'Графики прогресса и подробная статистика',
      gradient: theme.gradients.ocean,
    },
  ];

  const contacts = [
    { icon: '📧', label: 'Email', value: 'support@fitpilot.ru', action: () => Linking.openURL('mailto:support@fitpilot.ru') },
    { icon: '🌐', label: 'Сайт', value: 'fitpilot.ru', action: () => Linking.openURL('https://fitpilot.ru') },
    { icon: '📱', label: 'Telegram', value: '@fitpilot_app', action: () => Linking.openURL('https://t.me/fitpilot_app') },
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
            О FitPilot
          </Text>
          <Text style={[styles.heroSubtitle, { color: isDark ? 'rgba(255,255,255,0.9)' : '#475569' }]}>
            Ваш персональный AI-тренер и нутриолог в одном приложении
          </Text>
        </LinearGradient>
      </RNAnimated.View>

      <View style={[styles.content, isDesktop && styles.contentDesktop]}>
        {/* О проекте */}
        <AnimatedCard index={0} style={styles.section}>
          <View style={[styles.card, { backgroundColor: isDark ? theme.surface : theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              💡 О проекте
            </Text>
            <Text style={[styles.paragraph, { color: theme.textMuted }]}>
              FitPilot — это современное приложение для фитнеса, которое объединяет силу искусственного интеллекта 
              и удобные инструменты для отслеживания питания и тренировок.
            </Text>
            <Text style={[styles.paragraph, { color: theme.textMuted }]}>
              Мы создали платформу, которая помогает людям достигать своих фитнес-целей через персонализированный 
              подход и умные рекомендации на основе ваших данных и предпочтений.
            </Text>
          </View>
        </AnimatedCard>

        {/* Возможности */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitleMain, { color: theme.text }]}>
            ✨ Возможности
          </Text>
          <View style={[
            styles.featuresGrid,
            isTablet && styles.featuresGridTablet,
            isDesktop && styles.featuresGridDesktop
          ]}>
            {features.map((feature, index) => (
              <AnimatedCard key={index} index={index + 1} style={styles.featureCard}>
                <LinearGradient
                  colors={feature.gradient}
                  style={styles.featureGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.desc}</Text>
                </LinearGradient>
              </AnimatedCard>
            ))}
          </View>
        </View>

        {/* Технологии */}
        <AnimatedCard index={5} style={styles.section}>
          <View style={[styles.card, { backgroundColor: isDark ? theme.surface : theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              ⚡ Технологии
            </Text>
            <View style={styles.teamGrid}>
              {team.map((member, index) => (
                <View key={index} style={[styles.teamCard, { 
                  backgroundColor: isDark ? theme.glass.weak : theme.bgSecondary,
                  borderColor: theme.borderLight 
                }]}>
                  <Text style={styles.teamIcon}>{member.icon}</Text>
                  <Text style={[styles.teamName, { color: theme.text }]}>{member.name}</Text>
                  <Text style={[styles.teamRole, { color: theme.primary }]}>{member.role}</Text>
                  <Text style={[styles.teamDesc, { color: theme.textMuted }]}>{member.description}</Text>
                </View>
              ))}
            </View>
          </View>
        </AnimatedCard>

        {/* Контакты */}
        <AnimatedCard index={6} style={styles.section}>
          <View style={[styles.card, { backgroundColor: isDark ? theme.surface : theme.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              📞 Контакты
            </Text>
            {contacts.map((contact, index) => (
              <TouchableOpacity 
                key={index}
                style={[styles.contactRow, { borderBottomColor: theme.border }]}
                onPress={contact.action}
              >
                <Text style={styles.contactIcon}>{contact.icon}</Text>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactLabel, { color: theme.textMuted }]}>
                    {contact.label}
                  </Text>
                  <Text style={[styles.contactValue, { color: theme.primary }]}>
                    {contact.value}
                  </Text>
                </View>
                <Text style={[styles.contactArrow, { color: theme.textMuted }]}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </AnimatedCard>

        {/* Версия */}
        <View style={styles.version}>
          <Text style={[styles.versionText, { color: theme.textMuted }]}>
            FitPilot v1.0.0
          </Text>
          <Text style={[styles.versionText, { color: theme.textMuted }]}>
            © 2025 FitPilot. Все права защищены.
          </Text>
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
  section: {
    marginBottom: 24,
  },
  card: {
    borderRadius: 28,
    padding: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.15)',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  sectionTitleMain: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -0.6,
    paddingHorizontal: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 14,
  },
  featuresGrid: {
    gap: 16,
  },
  featuresGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featuresGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureCard: {
    marginBottom: 0,
  },
  featureGradient: {
    borderRadius: 24,
    padding: 24,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  featureDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 21,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  teamCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  teamIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  teamRole: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  teamDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  contactIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  contactArrow: {
    fontSize: 20,
    fontWeight: '700',
  },
  version: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
