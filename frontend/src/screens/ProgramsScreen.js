import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated as RNAnimated,
  TouchableOpacity,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import AnimatedCard from '../components/AnimatedCard';

export default function ProgramsScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  const [activeFilter, setActiveFilter] = useState('Все');

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

  const filters = ['Все', 'Похудение', 'Силовые', 'Йога', 'Кардио', 'Здоровье'];

  const programs = [
    {
      id: 1,
      title: 'Функциональные силовые',
      subtitle: '21 тренировка • 22 мин',
      tag: 'Силовые',
      desc: 'Силовая выносливость с упором на всё тело. Подходит для зала и дома с гантелями.',
      level: 'Средний',
      equipment: 'Гантели/эспандер',
      focus: 'Ноги, спина, корпус',
      duration: '6 недель',
      gradient: ['#6366F1', '#8B5CF6'],
      icon: '🏋️',
    },
    {
      id: 2,
      title: 'Утренняя йога',
      subtitle: '8 тренировок • 30 мин',
      tag: 'Йога',
      desc: 'Мягкие виньясы для подвижности и тонуса. Отлично для старта дня.',
      level: 'Лёгкий',
      equipment: 'Коврик',
      focus: 'Гибкость, осанка, дыхание',
      duration: '4 недели',
      gradient: ['#A855F7', '#EC4899'],
      icon: '🧘',
    },
    {
      id: 3,
      title: 'HIIT с весом тела',
      subtitle: '12 тренировок • 20 мин',
      tag: 'Похудение',
      desc: 'Интервальные тренировки высокой интенсивности. Минимум времени — максимум результата.',
      level: 'Средний',
      equipment: 'Без инвентаря',
      focus: 'Кардио, жиросжигание',
      duration: '4 недели',
      gradient: ['#EF4444', '#F97316'],
      icon: '🔥',
    },
    {
      id: 4,
      title: 'Кардио зарядка',
      subtitle: '10 тренировок • 15 мин',
      tag: 'Кардио',
      desc: 'Короткие кардио-сессии без инвентаря для сжигания калорий и поддержания тонуса.',
      level: 'Лёгкий',
      equipment: 'Без инвентаря',
      focus: 'Кардио, координация',
      duration: '2 недели',
      gradient: ['#3B82F6', '#60A5FA'],
      icon: '🏃',
    },
    {
      id: 5,
      title: 'Растяжка спины',
      subtitle: '6 тренировок • 18 мин',
      tag: 'Здоровье',
      desc: 'Профилактика зажимов и боли в спине. Дыхательные практики и мягкая мобилизация.',
      level: 'Лёгкий',
      equipment: 'Коврик',
      focus: 'Подвижность, спина',
      duration: '2 недели',
      gradient: ['#22C55E', '#4ADE80'],
      icon: '🌿',
    },
    {
      id: 6,
      title: 'Силовой сплит',
      subtitle: '24 тренировки • 45 мин',
      tag: 'Силовые',
      desc: 'Классическая сплит-программа на все группы мышц. Для опытных спортсменов.',
      level: 'Продвинутый',
      equipment: 'Зал',
      focus: 'Мышечная масса, сила',
      duration: '8 недель',
      gradient: ['#8B5CF6', '#A855F7'],
      icon: '💪',
    },
  ];

  const filteredPrograms = activeFilter === 'Все' 
    ? programs 
    : programs.filter(p => p.tag === activeFilter);

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
            Программы тренировок
          </Text>
          <Text style={[styles.heroSubtitle, { color: isDark ? 'rgba(255,255,255,0.9)' : '#475569' }]}>
            Готовые планы от экспертов для разных целей и уровней подготовки
          </Text>
        </LinearGradient>
      </RNAnimated.View>

      <View style={[styles.content, isDesktop && styles.contentDesktop]}>
        {/* Фильтры */}
        <View style={styles.filtersSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {filters.map((filter) => (
              <Pressable
                key={filter}
                style={[
                  styles.filterChip,
                  { 
                    backgroundColor: activeFilter === filter 
                      ? (isDark ? theme.primary : theme.primary)
                      : (isDark ? theme.glass.weak : theme.bgSecondary),
                    borderColor: activeFilter === filter 
                      ? theme.primary 
                      : theme.border
                  }
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[
                  styles.filterText,
                  { color: activeFilter === filter ? '#FFFFFF' : theme.text }
                ]}>
                  {filter}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Программы */}
        <View style={[
          styles.programsGrid,
          isTablet && styles.programsGridTablet,
          isDesktop && styles.programsGridDesktop
        ]}>
          {filteredPrograms.map((program, index) => (
            <AnimatedCard 
              key={program.id} 
              index={index}
              style={[
                styles.programCardWrapper,
                isTablet && styles.programCardWrapperTablet,
                isDesktop && styles.programCardWrapperDesktop
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('ProgramDetail', { program })}
              >
                <LinearGradient
                  colors={program.gradient}
                  style={styles.programCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Header */}
                  <View style={styles.programHeader}>
                    <View style={styles.programIconContainer}>
                      <Text style={styles.programIcon}>{program.icon}</Text>
                    </View>
                    <View style={styles.programBadge}>
                      <Text style={styles.programBadgeText}>{program.tag}</Text>
                    </View>
                  </View>

                  {/* Content */}
                  <Text style={styles.programTitle}>{program.title}</Text>
                  <Text style={styles.programSubtitle}>{program.subtitle}</Text>
                  <Text style={styles.programDesc}>{program.desc}</Text>

                  {/* Meta */}
                  <View style={styles.programMeta}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Уровень</Text>
                      <Text style={styles.metaValue}>{program.level}</Text>
                    </View>
                    <View style={styles.metaDivider} />
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>Длительность</Text>
                      <Text style={styles.metaValue}>{program.duration}</Text>
                    </View>
                  </View>

                  {/* CTA */}
                  <View style={styles.programCta}>
                    <Text style={styles.programCtaText}>Подробнее</Text>
                    <Text style={styles.programCtaArrow}>→</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </AnimatedCard>
          ))}
        </View>

        {filteredPrograms.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: isDark ? theme.surface : theme.surface }]}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              Программ в этой категории пока нет
            </Text>
          </View>
        )}
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
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  filtersSection: {
    marginBottom: 24,
  },
  filters: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 4,
  },
  filterChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  programsGrid: {
    gap: 16,
  },
  programsGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  programsGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  programCardWrapper: {
    marginBottom: 0,
  },
  programCardWrapperTablet: {
    width: '48%',
  },
  programCardWrapperDesktop: {
    width: '32%',
  },
  programCard: {
    borderRadius: 28,
    padding: 24,
    minHeight: 340,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  programIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  programIcon: {
    fontSize: 24,
  },
  programBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  programBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  programTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  programSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    fontWeight: '600',
  },
  programDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 21,
    marginBottom: 16,
  },
  programMeta: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  metaLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  programCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    gap: 8,
  },
  programCtaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  programCtaArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyState: {
    borderRadius: 28,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
