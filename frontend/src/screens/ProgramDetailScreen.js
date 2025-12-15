import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated as RNAnimated,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import AnimatedCard from '../components/AnimatedCard';
import GradientButton from '../components/GradientButton';

export default function ProgramDetailScreen({ route, navigation }) {
  const { program } = route.params || {};
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

  if (!program) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <Text style={[styles.errorText, { color: theme.textMuted }]}>
          Программа не найдена
        </Text>
      </View>
    );
  }

  const handleStartProgram = () => {
    Alert.alert(
      'Начать программу',
      `Вы хотите начать программу "${program.title}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Начать', 
          onPress: () => {
            // TODO: Добавить логику старта программы
            Alert.alert('Успех', 'Программа добавлена в ваш план!');
            navigation.navigate('Workouts');
          }
        },
      ]
    );
  };

  const weeks = [
    {
      week: 1,
      title: 'Неделя 1: Введение',
      workouts: [
        { day: 'Понедельник', name: 'Грудь и трицепс', duration: '45 мин' },
        { day: 'Среда', name: 'Спина и бицепс', duration: '45 мин' },
        { day: 'Пятница', name: 'Ноги и плечи', duration: '50 мин' },
      ],
    },
    {
      week: 2,
      title: 'Неделя 2: Прогрессия',
      workouts: [
        { day: 'Понедельник', name: 'Верх тела (push)', duration: '50 мин' },
        { day: 'Среда', name: 'Нижняя часть', duration: '55 мин' },
        { day: 'Пятница', name: 'Верх тела (pull)', duration: '50 мин' },
      ],
    },
    {
      week: 3,
      title: 'Неделя 3: Интенсивность',
      workouts: [
        { day: 'Понедельник', name: 'Full Body A', duration: '60 мин' },
        { day: 'Среда', name: 'Full Body B', duration: '60 мин' },
        { day: 'Пятница', name: 'Full Body C', duration: '60 мин' },
      ],
    },
  ];

  const benefits = [
    { icon: '💪', title: 'Рост силы', desc: 'Увеличение силовых показателей на 15-20%' },
    { icon: '🔥', title: 'Жиросжигание', desc: 'Эффективное сжигание калорий' },
    { icon: '📈', title: 'Прогрессия', desc: 'Постепенное увеличение нагрузки' },
    { icon: '🎯', title: 'Конкретный план', desc: 'Понедельный структурированный план' },
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.bg }]} 
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <RNAnimated.View style={[{ opacity: fade, transform: [{ translateY: slide }] }]}>
        <LinearGradient
          colors={program.gradient || theme.gradients.primary}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{program.tag}</Text>
            </View>
            <Text style={styles.heroTitle}>{program.title}</Text>
            <Text style={styles.heroSubtitle}>{program.subtitle}</Text>
            
            <View style={styles.heroMeta}>
              <View style={styles.heroMetaItem}>
                <Text style={styles.heroMetaLabel}>Уровень</Text>
                <Text style={styles.heroMetaValue}>{program.level}</Text>
              </View>
              <View style={styles.heroMetaDivider} />
              <View style={styles.heroMetaItem}>
                <Text style={styles.heroMetaLabel}>Длительность</Text>
                <Text style={styles.heroMetaValue}>{program.duration}</Text>
              </View>
              <View style={styles.heroMetaDivider} />
              <View style={styles.heroMetaItem}>
                <Text style={styles.heroMetaLabel}>Оборудование</Text>
                <Text style={styles.heroMetaValue}>{program.equipment}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </RNAnimated.View>

      <View style={[styles.content, isDesktop && styles.contentDesktop]}>
        {/* Описание */}
        <AnimatedCard index={0} style={styles.section}>
          <View style={[styles.card, { 
            backgroundColor: isDark ? theme.surface : theme.surface,
            borderColor: theme.borderLight 
          }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              О программе
            </Text>
            <Text style={[styles.description, { color: theme.textMuted }]}>
              {program.desc}
            </Text>
            <View style={styles.focusContainer}>
              <Text style={[styles.focusLabel, { color: theme.textSecondary }]}>
                Фокус:
              </Text>
              <Text style={[styles.focusValue, { color: theme.primary }]}>
                {program.focus}
              </Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Преимущества */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitleMain, { color: theme.text }]}>
            Что вы получите
          </Text>
          <View style={[
            styles.benefitsGrid,
            isTablet && styles.benefitsGridTablet
          ]}>
            {benefits.map((benefit, index) => (
              <AnimatedCard key={index} index={index + 1} style={styles.benefitCard}>
                <LinearGradient
                  colors={program.gradient || theme.gradients.primary}
                  style={styles.benefitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.benefitIcon}>{benefit.icon}</Text>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDesc}>{benefit.desc}</Text>
                </LinearGradient>
              </AnimatedCard>
            ))}
          </View>
        </View>

        {/* План */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitleMain, { color: theme.text }]}>
            План программы
          </Text>
          {weeks.map((week, index) => (
            <AnimatedCard key={week.week} index={index + 5} style={styles.weekCard}>
              <View style={[styles.weekContent, { 
                backgroundColor: isDark ? theme.surface : theme.surface,
                borderColor: theme.borderLight 
              }]}>
                <View style={[styles.weekHeader, { borderBottomColor: theme.border }]}>
                  <View style={[styles.weekBadge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.weekNumber}>{week.week}</Text>
                  </View>
                  <Text style={[styles.weekTitle, { color: theme.text }]}>
                    {week.title}
                  </Text>
                </View>
                
                <View style={styles.workoutsList}>
                  {week.workouts.map((workout, idx) => (
                    <View key={idx} style={[styles.workoutRow, { borderBottomColor: theme.border }]}>
                      <View style={styles.workoutInfo}>
                        <Text style={[styles.workoutDay, { color: theme.primary }]}>
                          {workout.day}
                        </Text>
                        <Text style={[styles.workoutName, { color: theme.text }]}>
                          {workout.name}
                        </Text>
                      </View>
                      <Text style={[styles.workoutDuration, { color: theme.textMuted }]}>
                        {workout.duration}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </AnimatedCard>
          ))}
        </View>

        {/* CTA */}
        <AnimatedCard index={10} style={styles.ctaSection}>
          <View style={[styles.ctaCard, { 
            backgroundColor: isDark ? theme.surface : theme.surface,
            borderColor: theme.borderLight 
          }]}>
            <Text style={[styles.ctaTitle, { color: theme.text }]}>
              Готовы начать?
            </Text>
            <Text style={[styles.ctaDesc, { color: theme.textMuted }]}>
              Программа будет добавлена в ваш план тренировок
            </Text>
            <GradientButton
              title="Начать программу"
              onPress={handleStartProgram}
              variant="primary"
              style={styles.ctaButton}
            />
          </View>
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
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  heroMeta: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    flexWrap: 'wrap',
    gap: 12,
  },
  heroMetaItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  heroMetaDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroMetaLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    fontWeight: '600',
  },
  heroMetaValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  content: {
    padding: 20,
  },
  contentDesktop: {
    maxWidth: 900,
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
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  sectionTitleMain: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    lineHeight: 25,
    marginBottom: 16,
  },
  focusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  focusLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  focusValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  benefitsGrid: {
    gap: 16,
  },
  benefitsGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  benefitCard: {
    marginBottom: 0,
  },
  benefitGradient: {
    borderRadius: 24,
    padding: 24,
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  benefitIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  benefitDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 19,
  },
  weekCard: {
    marginBottom: 16,
  },
  weekContent: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1.5,
    gap: 16,
  },
  weekBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    letterSpacing: -0.3,
  },
  workoutsList: {
    padding: 20,
    gap: 16,
  },
  workoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutDay: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '700',
  },
  workoutDuration: {
    fontSize: 13,
    fontWeight: '600',
  },
  ctaSection: {
    marginBottom: 40,
  },
  ctaCard: {
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  ctaTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  ctaDesc: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 23,
  },
  ctaButton: {
    minWidth: 240,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 40,
  },
});

