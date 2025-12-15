import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Platform,
  Animated as RNAnimated,
  useWindowDimensions,
  Pressable,
  ImageBackground,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedCard from '../components/AnimatedCard';
import GradientButton from '../components/GradientButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../hooks/useTheme';

export default function LandingScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const textPrimary = isDark ? '#F8FAFC' : '#0F172A';
  const textMuted = isDark ? '#CBD5E1' : '#334155';
  const palette = { ...theme, text: textPrimary, muted: textMuted }; // фиксируем читаемые цвета
  const styles = createStyles(palette); // создаём стили с учётом темы
  
  const heroGradientColors = isDark ? ['#0D1025', '#4F46E5', '#A855F7'] : ['#EEF2FF', '#E0E7FF', '#C7D2FE'];
  const devicesGradientColors = isDark ? ['#11142B', '#1E1F3D'] : ['#FFFFFF', '#EEF2FF'];
  const statsGradientColors = isDark ? ['#0F172A', '#111827'] : ['#FFFFFF', '#F8FAFC'];
  const ctaGradientColors = isDark
    ? ['#1C1F3A', '#7C3AED']
    : ['#4F46E5', '#EC4899'];

  const { width } = useWindowDimensions();
  const isSmallPhone = width < 420;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isLargeDesktop = width >= 1440;
  const scrollRef = useRef(null);
  const [activeTag, setActiveTag] = useState('Все');
  const [hasToken, setHasToken] = useState(false);
  const colorPulse = useRef(new RNAnimated.Value(0)).current;
  const CARD_WIDTH = 300;
  const CARD_SPACING = 18;
  const featurePadding = isLargeDesktop ? 24 : isDesktop ? 16 : isTablet ? 8 : 4;
  const PROG_CARD_WIDTH = 260;
  const PROG_SPACING = 12;
  const programsScrollRef = useRef(null);
  const [programIndex, setProgramIndex] = useState(0);

  const programTags = ['Все', 'Похудение', 'Силовые', 'Йога', 'Здоровье', 'Кардио'];
  const programs = [
    {
      title: 'Функциональные силовые',
      subtitle: '21 тренировка • 22 мин',
      tag: 'Силовые',
      desc: 'Силовая выносливость, всё тело. Зал/дом, гантели.',
      level: 'Средний',
      equipment: 'Гантели/эспандер',
      focus: 'Ноги, спина, корпус',
    },
    {
      title: 'Утренняя йога',
      subtitle: '8 тренировок • 30 мин',
      tag: 'Йога',
      desc: 'Мягкие виньясы, подвижность и тонус, лучший старт дня.',
      level: 'Лёгкий',
      equipment: 'Коврик',
      focus: 'Гибкость, осанка, дыхание',
    },
    {
      title: 'Кардио зарядка',
      subtitle: '10 тренировок • 15 мин',
      tag: 'Кардио',
      desc: 'Короткие HIIT/кардио без инвентаря для сжигания калорий.',
      level: 'Лёгкий',
      equipment: 'Без инвентаря',
      focus: 'Кардио, координация',
    },
    {
      title: 'Растяжка спины',
      subtitle: '6 тренировок • 18 мин',
      tag: 'Здоровье',
      desc: 'Профилактика зажимов, дыхательные практики, мягкая мобилизация.',
      level: 'Лёгкий',
      equipment: 'Коврик',
      focus: 'Подвижность, спина',
    },
    {
      title: 'HIIT с весом тела',
      subtitle: '12 тренировок • 20 мин',
      tag: 'Похудение',
      desc: 'Интервалы высокой интенсивности без инвентаря.',
      level: 'Средний',
      equipment: 'Без инвентаря',
      focus: 'Кардио, жиросжигание',
    },
  ];

  const filteredPrograms = useMemo(
    () => programs.filter((p) => activeTag === 'Все' || p.tag === activeTag),
    [activeTag]
  );

  useEffect(() => {
    setProgramIndex(0);
    programsScrollRef.current?.scrollTo({ x: 0, y: 0, animated: true });
  }, [activeTag, filteredPrograms.length]);

  const featuresScrollRef = useRef(null);
  const [featureIndex, setFeatureIndex] = useState(0);

  const features = [
    {
      tag: 'AI',
      title: 'AI-помощник 24/7',
      description: 'Быстрые ответы, планы питания и тренировки по твоим данным.',
      accent: '#6366F1',
      workouts: 'до 20 сек ответ',
      duration: 'Персонально',
      level: 'Поддержка 24/7',
    },
    {
      tag: 'Food',
      title: 'Питание под цель',
      description: 'Рационы под дефицит/набор, продукты из РФ, контроль БЖУ.',
      accent: '#A855F7',
      workouts: 'Рационы',
      duration: 'до 7 дней',
      level: 'Баланс БЖУ',
    },
    {
      tag: 'Train',
      title: 'Тренировки под уровень',
      description: 'Дом/зал, время и инвентарь учитываются. Подбор прогрессий.',
      accent: '#22C55E',
      workouts: '3–5 в неделю',
      duration: '15–45 мин',
      level: 'Beginner–Pro',
    },
    {
      tag: 'Data',
      title: 'Аналитика и прогресс',
      description: 'Тренды по калориям, весу, нагрузкам. Подсказки, где ускориться.',
      accent: '#F59E0B',
      workouts: 'Графики',
      duration: 'Ежедневно',
      level: 'Автоподсказки',
    },
    {
      tag: 'Recovery',
      title: 'Восстановление',
      description: 'Растяжка, сон, дыхание. Лёгкие дни и разгрузки.',
      accent: '#3B82F6',
      workouts: 'До 20 мин',
      duration: 'Гибкость',
      level: 'Лёгкие дни',
    },
    {
      tag: 'Coach',
      title: 'Планы с экспертом',
      description: 'Челленджи 4–8 недель, сплиты, проверенные тренерами.',
      accent: '#EC4899',
      workouts: 'Челлендж',
      duration: '4–8 недель',
      level: 'Прогрессия',
    },
  ];

  const featureScales = useRef(features.map(() => new RNAnimated.Value(1))).current;
  const featureListRef = useRef(null);

  const stats = [
    { value: '10K+', label: 'Пользователей' },
    { value: '50K+', label: 'Тренировок' },
    { value: '100K+', label: 'Рационов' },
    { value: '24/7', label: 'AI-поддержка' },
  ];

  const recipes = [
    { title: 'Панкейки из зелёной гречки', tag: 'Завтрак', meta: '25 мин • 222 ккал' },
    { title: 'Йогурт с чиа и тыквой', tag: 'Перекус', meta: '40 мин • 103 ккал' },
    { title: 'Перловка с индейкой', tag: 'Ужин', meta: '45 мин • 126 ккал' },
    { title: 'Смузи с имбирём', tag: 'Перекус', meta: '10 мин • 95 ккал' },
    { title: 'Рагу с индейкой', tag: 'Обед', meta: '45 мин • 145 ккал' },
  ];

  const testimonials = [
    { name: 'Анна, 29', text: 'За 6 недель минус 4 кг и без срывов — рацион и тренировки подобраны под мой график.' },
    { name: 'Дмитрий, 34', text: 'Тренируюсь дома, AI быстро отвечает и корректирует нагрузки. Спина перестала болеть.' },
    { name: 'Мария, 26', text: 'Понравились быстрые рецепты и отчёт по калориям. Удобно, что всё в одном приложении.' },
  ];

  const media = ['Forbes', 'РБК', 'Marie Claire', 'Executive', 'VC.ru'];

  const trainers = [
    { name: 'Ольга Дерендеева', tag: 'Тонус мышц', programs: '60 программ', img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600' },
    { name: 'Иванна Идуш', tag: 'Похудение', programs: '34 программы', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600' },
    { name: 'Михаил Прыгунов', tag: 'Силовые', programs: '23 программы', img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&sig=2' },
    { name: 'Анастасия Завистовская', tag: 'Гибкость', programs: '32 программы', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&sig=3' },
  ];

  const courses = [
    { tag: 'Уход за лицом', title: 'Здоровые стопы', meta: '14 тренировок • 11 мин', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&sig=4' },
    { tag: 'Женское здоровье', title: 'После родов', meta: '7 тренировок • 12 мин', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&sig=5' },
    { tag: 'Профессии', title: 'Блогер с нуля', meta: '5 тренировок • 16 мин', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&sig=6' },
    { tag: 'Здоровье', title: 'Сила коллагена', meta: '10 тренировок • 7 мин', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&sig=7' },
  ];

  const fadeAnim = useRef(new RNAnimated.Value(0)).current;
  const slideAnim = useRef(new RNAnimated.Value(50)).current;
  const blocksOpacity = useRef(new RNAnimated.Value(0)).current;
  const blocksTranslate = useRef(new RNAnimated.Value(20)).current;
  const statScales = useRef(stats.map(() => new RNAnimated.Value(1))).current;

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
    loadToken();
    startColorPulse();
    highlightFeature(0);
  }, []);

  const loadToken = async () => {
        const token = await AsyncStorage.getItem('token');
    setHasToken(!!token);
  };

  const startColorPulse = () => {
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(colorPulse, { toValue: 1, duration: 2200, useNativeDriver: true }),
        RNAnimated.timing(colorPulse, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  };

  const highlightFeature = (activeIndex) => {
    featureScales.forEach((val, idx) => {
      RNAnimated.timing(val, {
        toValue: idx === activeIndex ? 1.05 : 0.94,
        duration: 240,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleFeatureScroll = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    const idx = Math.round(x / (CARD_WIDTH + CARD_SPACING));
    const safeIdx = Math.max(0, Math.min(idx, features.length - 1));
    setFeatureIndex(safeIdx);
    highlightFeature(safeIdx);
  };

  const scrollToFeature = (direction) => {
    const next = Math.max(0, Math.min(featureIndex + direction, features.length - 1));
    const x = featurePadding + next * (CARD_WIDTH + CARD_SPACING);
    featureListRef.current?.scrollToOffset({ offset: x, animated: true });
    setFeatureIndex(next);
    highlightFeature(next);
  };

  const handleProgramScroll = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    const idx = Math.round(x / (PROG_CARD_WIDTH + PROG_SPACING));
    setProgramIndex(Math.max(0, Math.min(idx, filteredPrograms.length - 1)));
  };

  const scrollToProgram = (direction) => {
    const next = Math.max(0, Math.min(programIndex + direction, filteredPrograms.length - 1));
    const x = next * (PROG_CARD_WIDTH + PROG_SPACING);
    programsScrollRef.current?.scrollTo({ x, y: 0, animated: true });
    setProgramIndex(next);
  };

  const blobStyle = (delay = 0, size = 180, top = 0, left = 0) => ({
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: size / 2,
    top,
    left,
    opacity: colorPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.18, 0.5],
    }),
    transform: [
      {
        scale: colorPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 1.08],
        }),
      },
    ],
  });

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  const blocksAnimatedStyle = {
    opacity: blocksOpacity,
    transform: [{ translateY: blocksTranslate }],
  };

  const gotoAI = () => {
    if (hasToken) {
      navigation.navigate('Chat');
    } else {
      navigation.navigate('Login');
    }
  };

  const pressTo = (val, toValue) => {
    RNAnimated.spring(val, {
      toValue,
      useNativeDriver: true,
      friction: 6,
      tension: 120,
    }).start();
  };

  const goStart = () => {
    if (hasToken) {
      navigation.navigate('Home');
    } else {
      navigation.navigate('Register');
    }
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.container, { backgroundColor: palette.bg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <RNAnimated.View style={[styles.heroSection, animatedStyle]}>
        <LinearGradient
          colors={heroGradientColors}
          style={[
            styles.heroGradient,
            isTablet && styles.heroGradientTablet,
            isDesktop && styles.heroGradientDesktop,
            isLargeDesktop && styles.heroGradientLargeDesktop,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <RNAnimated.View style={[styles.blob, blobStyle(0, 240, -40, -30), { backgroundColor: 'rgba(124, 58, 237, 0.35)' }]} />
          <RNAnimated.View style={[styles.blob, blobStyle(0, 180, 40, 220), { backgroundColor: 'rgba(59, 130, 246, 0.28)' }]} />
          <View style={[
            styles.heroContent,
            isDesktop && styles.heroContentDesktop,
            isLargeDesktop && styles.heroContentLargeDesktop
          ]}>
            <Text style={[styles.heroBadge, { 
              color: isDark ? '#FFFFFF' : '#6366F1',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(99, 102, 241, 0.15)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(99, 102, 241, 0.3)'
            }]}>
              FITNESS OS • AI INSIDE
            </Text>
            <Text style={[
              styles.heroTitle,
              { color: textPrimary },
              isTablet && styles.heroTitleTablet,
              isDesktop && styles.heroTitleDesktop,
              isLargeDesktop && styles.heroTitleLargeDesktop
            ]}>
              FitPilot — цифровой тренер и нутриолог
            </Text>
            <Text style={[
              styles.heroSubtitle,
              { color: textMuted },
              isTablet && styles.heroSubtitleTablet,
              isDesktop && styles.heroSubtitleDesktop,
              isLargeDesktop && styles.heroSubtitleLargeDesktop
            ]}>
              Сильный AI, планы питания и тренировки, построенные под ваш режим, цели и оборудование. Без общих фраз — только конкретные действия.
            </Text>
            <View style={styles.heroButtons}>
              <GradientButton
                title="Начать бесплатно"
                onPress={goStart}
                variant="primary"
                style={styles.heroButton}
              />
              <TouchableOpacity
                style={styles.heroButtonSecondary}
                onPress={() => navigation.navigate('Features')}
              >
                <Text style={styles.heroButtonSecondaryText}>Смотреть возможности</Text>
          </TouchableOpacity>
      </View>
            <View style={styles.heroStats}>
              {[
                { label: 'AI-ответ', value: 'до 20 сек' },
                { label: 'Рационы', value: 'по целям и БЖУ' },
                { label: 'Тренировки', value: 'дом/зал' },
              ].map((item, idx) => (
                <View key={idx} style={styles.heroStatCard}>
                  <Text style={styles.heroStatValue}>{item.value}</Text>
                  <Text style={styles.heroStatLabel}>{item.label}</Text>
        </View>
              ))}
        </View>
            <View style={[
              styles.heroMetrics,
              isSmallPhone && styles.heroMetricsStacked,
              isTablet && styles.heroMetricsTablet
            ]}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>AI-ответ</Text>
                <Text style={styles.metricValue}>до 20 сек</Text>
        </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Рацион</Text>
                <Text style={styles.metricValue}>по целям и БЖУ</Text>
      </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Тренировки</Text>
                <Text style={styles.metricValue}>дом/зал</Text>
              </View>
            </View>
        </View>
        </LinearGradient>
      </RNAnimated.View>

      {/* AI Highlight Section */}
      <RNAnimated.View style={[styles.aiSection, blocksAnimatedStyle]}>
        <AnimatedCard index={0} style={styles.aiCard}>
          <LinearGradient
            colors={[palette.card, palette.panel]}
            style={styles.aiGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.aiContent}>
              <Text style={styles.aiTitle}>AI — ядро FitPilot</Text>
              <Text style={styles.aiDescription}>
                Вопросы любых тем, но приоритет — ваши цели. Берём профиль, дневник питания, тренировки и историю диалога, чтобы отвечать по делу, а не шаблоном.
              </Text>
              <View style={styles.aiFeatures}>
                <View style={styles.aiFeatureItem}>
                  <View style={[styles.aiBullet, { backgroundColor: palette.primary }]} />
                  <Text style={styles.aiFeatureText}>Рационы под дефицит/набор, продукты РФ, баланс БЖУ</Text>
          </View>
                <View style={styles.aiFeatureItem}>
                  <View style={[styles.aiBullet, { backgroundColor: palette.accent }]} />
                  <Text style={styles.aiFeatureText}>Тренировки с учётом локации, инвентаря и времени</Text>
                </View>
                <View style={styles.aiFeatureItem}>
                  <View style={[styles.aiBullet, { backgroundColor: '#22C55E' }]} />
                  <Text style={styles.aiFeatureText}>Анализ прогресса и конкретные корректировки по ходу</Text>
            </View>
        </View>
              <GradientButton
                title="Попробовать AI"
              onPress={gotoAI}
                variant="primary"
                style={styles.aiButton}
              />
      </View>
          </LinearGradient>
        </AnimatedCard>
      </RNAnimated.View>

      {/* Features Section */}
      <View style={styles.sectionSpacer} />
      <RNAnimated.View style={[
        styles.section,
        blocksAnimatedStyle,
        isDesktop && styles.sectionDesktop,
        isLargeDesktop && styles.sectionLargeDesktop
      ]}>
        <View style={styles.featuresPanel}>
          <View style={[
            styles.sectionContent,
            isDesktop && styles.sectionContentDesktop,
            isLargeDesktop && styles.sectionContentLargeDesktop
          ]}>
            <Text style={[
              styles.sectionTitle,
              isTablet && styles.sectionTitleTablet,
              isDesktop && styles.sectionTitleDesktop
            ]}>Возможности</Text>
            <Text style={[
              styles.sectionSubtitle,
              isTablet && styles.sectionSubtitleTablet,
              isDesktop && styles.sectionSubtitleDesktop
            ]}>
              Набор инструментов для контроля тела, питания и нагрузки
            </Text>
            <View style={styles.tagRow}>
              {programTags.map((tag) => {
                const active = activeTag === tag;
                return (
                  <Pressable
                    key={tag}
                    onPress={() => setActiveTag(tag)}
                    style={[styles.tagChip, active && styles.tagChipActive]}
                  >
                    <Text style={[styles.tagText, active && styles.tagTextActive]}>{tag}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.carouselNavRow}>
              <TouchableOpacity
                style={[styles.carouselNavBtn, programIndex === 0 && styles.carouselNavBtnDisabled]}
                onPress={() => scrollToProgram(-1)}
                disabled={programIndex === 0}
              >
                <Text style={styles.carouselNavText}>←</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.carouselNavBtn, programIndex === filteredPrograms.length - 1 && styles.carouselNavBtnDisabled]}
                onPress={() => scrollToProgram(1)}
                disabled={programIndex === filteredPrograms.length - 1}
              >
                <Text style={styles.carouselNavText}>→</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dotsRow}>
              {filteredPrograms.map((_, i) => (
                <TouchableOpacity
                  key={`prog-dot-${i}`}
                  style={[
                    styles.dot,
                    i === programIndex && styles.dotActive,
                  ]}
                  onPress={() => {
                    const x = i * (PROG_CARD_WIDTH + PROG_SPACING);
                    programsScrollRef.current?.scrollTo({ x, y: 0, animated: true });
                    setProgramIndex(i);
                  }}
                />
              ))}
            </View>
            <ScrollView
              ref={programsScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.carousel}
              contentContainerStyle={styles.carouselContent}
              pagingEnabled
              scrollEnabled
              snapToInterval={PROG_CARD_WIDTH + PROG_SPACING}
              decelerationRate="fast"
              snapToAlignment="start"
              onMomentumScrollEnd={handleProgramScroll}
              onScrollEndDrag={handleProgramScroll}
              scrollEventThrottle={16}
            >
              {filteredPrograms.map((p, idx) => (
                    <AnimatedCard
                      key={`${p.title}-${idx}`}
                      index={idx}
                      onPress={() => navigation.navigate('ProgramDetail', p)}
                      style={styles.programCard}
                    >
                      <View style={styles.programTag}>
                        <Text style={styles.programTagText}>{p.tag}</Text>
                      </View>
                      <Text style={styles.programTitle}>{p.title}</Text>
                      <Text style={styles.programSubtitle}>{p.subtitle}</Text>
                      <TouchableOpacity
                        style={styles.programCta}
                        onPress={() => navigation.navigate('ProgramDetail', p)}
                      >
                        <Text style={styles.programCtaText}>Открыть</Text>
                      </TouchableOpacity>
                    </AnimatedCard>
              ))}
            </ScrollView>
            <View style={styles.carouselNavRow}>
              <TouchableOpacity
                style={[styles.carouselNavBtn, featureIndex === 0 && styles.carouselNavBtnDisabled]}
                onPress={() => scrollToFeature(-1)}
                disabled={featureIndex === 0}
              >
                <Text style={styles.carouselNavText}>←</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.carouselNavBtn, featureIndex === features.length - 1 && styles.carouselNavBtnDisabled]}
                onPress={() => scrollToFeature(1)}
                disabled={featureIndex === features.length - 1}
              >
                <Text style={styles.carouselNavText}>→</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dotsRow}>
              {features.map((_, i) => (
                <TouchableOpacity
                  key={`feat-dot-${i}`}
                  style={[
                    styles.dot,
                    i === featureIndex && styles.dotActive,
                  ]}
                  onPress={() => {
                    const x = featurePadding + i * (CARD_WIDTH + CARD_SPACING);
                    featureListRef.current?.scrollToOffset({ offset: x, animated: true });
                    setFeatureIndex(i);
                    highlightFeature(i);
                  }}
                />
              ))}
            </View>
            <FlatList
              ref={featureListRef}
              data={features}
              keyExtractor={(item, idx) => `${item.tag}-${idx}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[
                styles.featuresCarousel,
                { paddingHorizontal: featurePadding },
              ]}
              renderItem={({ item: feature, index }) => (
                <Pressable
                  onPressIn={() => pressTo(featureScales[index], 0.97)}
                  onPressOut={() => pressTo(featureScales[index], 1)}
                  style={[
                    styles.featureCardWrapper,
                    { width: CARD_WIDTH, marginRight: CARD_SPACING },
                  ]}
                >
                  <AnimatedCard
                    index={index + 1}
                    style={[
                      { transform: [{ scale: featureScales[index] }] },
                    ]}
                  >
                    <LinearGradient
                      colors={[`${feature.accent}33`, `${feature.accent}0F`]}
                      style={[
                        styles.featureCard,
                        isDesktop && styles.featureCardDesktop,
                        isLargeDesktop && styles.featureCardLargeDesktop,
                        { borderColor: feature.accent },
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={[styles.featureTag, { backgroundColor: `${feature.accent}22` }]}>
                        <Text style={[styles.featureTagText, { color: feature.accent }]}>{feature.tag}</Text>
                      </View>
                      <Text
                        style={[
                          styles.featureTitle,
                          isDesktop && styles.featureTitleDesktop,
                          isLargeDesktop && styles.featureTitleLargeDesktop,
                        ]}
                      >
                        {feature.title}
                      </Text>
                      <Text
                        style={[
                          styles.featureDescription,
                          isDesktop && styles.featureDescriptionDesktop,
                          isLargeDesktop && styles.featureDescriptionLargeDesktop,
                        ]}
                      >
                        {feature.description}
                      </Text>
                      <View style={styles.featureStatsRow}>
                        <View style={styles.featureStatItem}>
                          <Text style={[styles.featureStatValue, { color: feature.accent }]}>{feature.workouts}</Text>
                          <Text style={[styles.featureStatLabel, { color: palette.muted }]}>Нагрузка</Text>
                        </View>
                        <View style={styles.featureStatItem}>
                          <Text style={[styles.featureStatValue, { color: palette.text }]}>{feature.duration}</Text>
                          <Text style={[styles.featureStatLabel, { color: palette.muted }]}>Формат</Text>
                        </View>
                        <View style={styles.featureStatItem}>
                          <Text style={[styles.featureStatValue, { color: palette.text }]}>{feature.level}</Text>
                          <Text style={[styles.featureStatLabel, { color: palette.muted }]}>Уровень</Text>
                        </View>
                      </View>
                      <View style={[styles.featureArrow, { backgroundColor: `${feature.accent}15` }]}>
                        <Text style={[styles.featureArrowText, { color: feature.accent }]}>Подробнее</Text>
                      </View>
                    </LinearGradient>
                  </AnimatedCard>
                </Pressable>
              )}
              snapToInterval={CARD_WIDTH + CARD_SPACING}
              decelerationRate="fast"
              snapToAlignment="center"
              pagingEnabled
              scrollEnabled
              onMomentumScrollEnd={({ nativeEvent }) => handleFeatureScroll({ nativeEvent })}
              onScrollEndDrag={({ nativeEvent }) => handleFeatureScroll({ nativeEvent })}
              scrollEventThrottle={16}
              getItemLayout={(_, index) => ({
                length: CARD_WIDTH + CARD_SPACING,
                offset: featurePadding + (CARD_WIDTH + CARD_SPACING) * index,
                index,
              })}
            />
          </View>
        </View>
      </RNAnimated.View>

      {/* Stats Section */}
      <RNAnimated.View style={[styles.statsSection, blocksAnimatedStyle]}>
        <LinearGradient
          colors={statsGradientColors}
          style={[
            styles.statsGradient,
            isDesktop && styles.statsGradientDesktop,
            isLargeDesktop && styles.statsGradientLargeDesktop
          ]}
        >
          <Text style={styles.statsTitle}>FitPilot в цифрах</Text>
          <View style={[
            styles.statsGrid,
            isTablet && styles.statsGridTablet,
            isDesktop && styles.statsGridDesktop
          ]}>
            {stats.map((stat, index) => (
              <Pressable
                key={index}
                onPressIn={() => pressTo(statScales[index], 0.98)}
                onPressOut={() => pressTo(statScales[index], 1)}
              >
                <RNAnimated.View
                  style={[
                    styles.statItem,
                    isTablet && styles.statItemTablet,
                    isDesktop && styles.statItemDesktop,
                    { transform: [{ scale: statScales[index] }] },
                  ]}
                >
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </RNAnimated.View>
              </Pressable>
            ))}
        </View>
        </LinearGradient>
      </RNAnimated.View>

      {/* Devices Section */}
      <RNAnimated.View style={[
        styles.devicesSection,
        blocksAnimatedStyle,
        isDesktop && styles.devicesSectionDesktop,
        isLargeDesktop && styles.devicesSectionLargeDesktop
      ]}>
        <LinearGradient
          colors={devicesGradientColors}
          style={[
            styles.devicesCard,
            isDesktop && styles.devicesCardDesktop,
            isLargeDesktop && styles.devicesCardLargeDesktop
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.devicesTextBlock}>
            <Text style={styles.devicesTitle}>Доступно на всех устройствах</Text>
            <Text style={styles.devicesSubtitle}>
              Смартфон, планшет, ТВ — одна подписка и ваш AI-тренер всегда под рукой.
            </Text>
            <View style={styles.devicesBadges}>
              {['Google Play', 'App Store', 'Android TV', 'Yandex TV', 'Салют ТВ'].map((store) => (
                <View key={store} style={styles.storeBadge}>
                  <Text style={styles.storeBadgeText}>{store}</Text>
          </View>
              ))}
          </View>
            <GradientButton
              title="Начать тренироваться"
              onPress={goStart}
              variant="primary"
              style={styles.devicesButton}
            />
          </View>
          <View style={styles.devicesMock}>
            <View style={styles.mockScreen}>
              <Text style={styles.mockLabel}>AI-план на сегодня</Text>
              <Text style={styles.mockValue}>2200 ккал · 45 мин тренировка</Text>
        </View>
            <View style={[styles.mockScreen, styles.mockScreenSmall]}>
              <Text style={styles.mockLabel}>Ответ AI</Text>
              <Text style={styles.mockValue}>до 20 сек</Text>
        </View>
          </View>
        </LinearGradient>
      </RNAnimated.View>

      {/* Recipes Section */}
      <RNAnimated.View style={[styles.section, blocksAnimatedStyle]}>
        <Text style={styles.sectionTitle}>Рационы и рецепты</Text>
        <Text style={styles.sectionSubtitle}>
          Быстрые блюда под ваши цели — дефицит, поддержание или набор.
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
          contentContainerStyle={styles.carouselContent}
        >
          {recipes.map((r, idx) => (
            <AnimatedCard
              key={`${r.title}-${idx}`}
              index={idx}
              style={styles.recipeCard}
            >
              <View style={styles.recipeTag}>
                <Text style={styles.recipeTagText}>{r.tag}</Text>
        </View>
              <Text style={styles.recipeTitle}>{r.title}</Text>
              <Text style={styles.recipeMeta}>{r.meta}</Text>
              <TouchableOpacity
                style={styles.programCta}
                onPress={() => navigation.navigate('Nutrition')}
              >
                <Text style={styles.programCtaText}>Смотреть</Text>
              </TouchableOpacity>
            </AnimatedCard>
          ))}
        </ScrollView>
      </RNAnimated.View>

      {/* Testimonials */}
      <RNAnimated.View style={[styles.section, blocksAnimatedStyle]}>
        <Text style={styles.sectionTitle}>Результаты пользователей</Text>
        <Text style={styles.sectionSubtitle}>
          Что отмечают о FitPilot: быстро, конкретно, без лишней воды.
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
          contentContainerStyle={styles.carouselContent}
        >
          {testimonials.map((t, idx) => (
            <AnimatedCard
              key={`${t.name}-${idx}`}
              index={idx}
              style={styles.testimonialCard}
            >
              <Text style={styles.testimonialText}>{t.text}</Text>
              <Text style={styles.testimonialName}>{t.name}</Text>
            </AnimatedCard>
          ))}
        </ScrollView>
      </RNAnimated.View>

      {/* Trainers */}
      <RNAnimated.View style={[styles.section, blocksAnimatedStyle]}>
        <Text style={styles.sectionTitle}>Тренеры</Text>
        <Text style={styles.sectionSubtitle}>Подбираем программы вместе с экспертами</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
          contentContainerStyle={styles.carouselContent}
        >
          {trainers.map((t, idx) => (
            <AnimatedCard
              key={`${t.name}-${idx}`}
              index={idx}
              style={styles.trainerCard}
            >
              <ImageBackground
                source={{ uri: t.img }}
                style={styles.trainerImage}
                imageStyle={{ borderRadius: 28 }}
              >
                <View style={styles.trainerOverlay} />
                <View style={styles.trainerTag}>
                  <Text style={styles.trainerTagText}>{t.tag}</Text>
      </View>
                <Text style={styles.trainerName}>{t.name}</Text>
                <Text style={styles.trainerMeta}>{t.programs}</Text>
              </ImageBackground>
            </AnimatedCard>
          ))}
        </ScrollView>
      </RNAnimated.View>

      {/* Courses */}
      <RNAnimated.View style={[styles.section, blocksAnimatedStyle]}>
        <Text style={styles.sectionTitle}>Курсы и медитации</Text>
        <Text style={styles.sectionSubtitle}>Расслабление, красота, женское здоровье</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
          contentContainerStyle={styles.carouselContent}
        >
          {courses.map((c, idx) => (
            <AnimatedCard
              key={`${c.title}-${idx}`}
              index={idx}
              style={styles.courseCard}
            >
              <ImageBackground
                source={{ uri: c.img }}
                style={styles.courseImage}
                imageStyle={{ borderRadius: 28 }}
              >
                <View style={styles.courseOverlay} />
                <View style={styles.courseTag}>
                  <Text style={styles.courseTagText}>{c.tag}</Text>
                </View>
                <Text style={styles.courseTitle}>{c.title}</Text>
                <Text style={styles.courseMeta}>{c.meta}</Text>
              </ImageBackground>
            </AnimatedCard>
          ))}
        </ScrollView>
      </RNAnimated.View>

      {/* Media Logos */}
      <RNAnimated.View style={[styles.mediaSection, blocksAnimatedStyle]}>
        <Text style={styles.mediaTitle}>Нас отмечают</Text>
        <View style={styles.mediaRow}>
          {media.map((m) => (
            <View key={m} style={styles.mediaBadge}>
              <Text style={styles.mediaBadgeText}>{m}</Text>
            </View>
          ))}
        </View>
      </RNAnimated.View>

      {/* CTA Section (показываем только если нет токена) */}
      {!hasToken && (
        <RNAnimated.View style={[
          styles.ctaSection,
          blocksAnimatedStyle,
          isDesktop && styles.ctaSectionDesktop,
          isLargeDesktop && styles.ctaSectionLargeDesktop
        ]}>
          <AnimatedCard index={5} style={styles.ctaCard}>
            <LinearGradient
              colors={ctaGradientColors}
              style={[
                styles.ctaGradient,
                isDesktop && styles.ctaGradientDesktop,
                isLargeDesktop && styles.ctaGradientLargeDesktop
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.ctaTitle}>Начните сегодня</Text>
              <Text style={styles.ctaSubtitle}>
                Подключите AI-ассистента и получите свой первый рацион и тренировку за минуту
              </Text>
              <GradientButton
                title="Создать аккаунт"
                onPress={() => navigation.navigate('Register')}
                variant="primary"
                style={styles.ctaButton}
              />
            </LinearGradient>
          </AnimatedCard>
        </RNAnimated.View>
      )}

      {/* Footer */}
      <View style={[
        styles.footer,
        isDesktop && styles.footerDesktop,
        isLargeDesktop && styles.footerLargeDesktop
      ]}> 
        <Text style={styles.footerLogo}>FitPilot</Text>
        <View style={styles.footerRow}>
          <View style={styles.footerCol}>
            <Text style={styles.footerColTitle}>Приложение</Text>
            <Text style={styles.footerLink}>iOS</Text>
            <Text style={styles.footerLink}>Android</Text>
            <Text style={styles.footerLink}>Android TV</Text>
            <Text style={styles.footerLink}>Yandex TV</Text>
      </View>
          <View style={styles.footerCol}>
            <Text style={styles.footerColTitle}>Поддержка</Text>
            <Text style={styles.footerLink}>FAQ</Text>
            <Text style={styles.footerLink}>Служба поддержки</Text>
            <Text style={styles.footerLink}>Политика данных</Text>
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.footerColTitle}>О проекте</Text>
            <Text style={styles.footerLink}>О нас</Text>
            <Text style={styles.footerLink}>Возможности</Text>
            <Text style={styles.footerLink}>Медиа</Text>
          </View>
          <View style={styles.footerCol}>
            <Text style={styles.footerColTitle}>AI</Text>
            <Text style={styles.footerLink}>Чат с AI</Text>
            <Text style={styles.footerLink}>Рационы</Text>
            <Text style={styles.footerLink}>Тренировки</Text>
          </View>
        </View>
        <View style={styles.footerBottom}>
          <Text style={styles.footerSmall}>© 2025 FitPilot</Text>
          <Text style={styles.footerSmall}>Все права защищены</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.scrollTopButton}
        onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
      >
        <Text style={styles.scrollTopText}>↑</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (palette) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  heroSection: {
    minHeight: 520,
  },
  heroGradient: {
    flex: 1,
    paddingTop: 96,
    paddingBottom: 72,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroGradientTablet: {
    paddingTop: 110,
    paddingBottom: 80,
  },
  heroGradientDesktop: {
    paddingTop: 140,
    paddingBottom: 90,
  },
  heroGradientLargeDesktop: {
    paddingTop: 160,
    paddingBottom: 100,
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: 720,
    width: '100%',
    position: 'relative',
    zIndex: 2,
  },
  heroContentDesktop: {
    maxWidth: 900,
  },
  heroContentLargeDesktop: {
    maxWidth: 1200,
  },
  heroBadge: {
    fontSize: 13,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
    marginBottom: 24,
    fontWeight: '800',
    letterSpacing: 1.6,
    borderWidth: 1,
    zIndex: 2,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
    lineHeight: 44,
  },
  heroTitleTablet: {
    fontSize: 42,
    lineHeight: 50,
  },
  heroTitleDesktop: {
    fontSize: 48,
    lineHeight: 56,
  },
  heroTitleLargeDesktop: {
    fontSize: 52,
    lineHeight: 60,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    maxWidth: 680,
  },
  heroSubtitleTablet: {
    fontSize: 17,
    lineHeight: 26,
  },
  heroSubtitleDesktop: {
    fontSize: 18,
    lineHeight: 28,
    maxWidth: 760,
  },
  heroSubtitleLargeDesktop: {
    fontSize: 19,
    lineHeight: 30,
    maxWidth: 900,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroButton: {
    minWidth: 180,
  },
  heroButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 180,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  heroButtonSecondaryText: {
    color: palette.text,
    fontSize: 15,
    fontWeight: '700',
  },
  heroStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroStatCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    minWidth: 130,
    alignItems: 'center',
    shadowColor: 'transparent',
    elevation: 0,
    // web-only
    boxShadow: '0 8px 24px rgba(0,0,0,0.24)',
  },
  heroStatValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  heroMetrics: {
    marginTop: 32,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 16,
    flexWrap: 'wrap',
    shadowColor: 'transparent',
    elevation: 0,
    // web-only
    boxShadow: '0 10px 28px rgba(0,0,0,0.22)',
  },
  heroMetricsStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
  },
  heroMetricsTablet: {
    paddingHorizontal: 22,
    paddingVertical: 18,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    color: palette.muted,
    fontSize: 12,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  metricValue: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  metricDivider: {
    width: 1,
    height: 34,
    backgroundColor: palette.border,
  },
  aiSection: {
    padding: 24,
    marginTop: -28,
  },
  aiCard: {
    marginBottom: 0,
  },
  aiGradient: {
    borderRadius: 32,
    padding: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  aiContent: {
    alignItems: 'flex-start',
    gap: 12,
  },
  aiTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: palette.text,
    letterSpacing: -0.3,
  },
  aiDescription: {
    fontSize: 15,
    color: palette.muted,
    lineHeight: 22,
  },
  aiFeatures: {
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
    gap: 10,
  },
  aiFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiBullet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.9,
  },
  aiFeatureText: {
    fontSize: 14,
    color: palette.text,
    flex: 1,
    lineHeight: 20,
  },
  aiButton: {
    minWidth: 220,
    marginTop: 8,
  },
  section: {
    padding: 24,
    paddingTop: 8,
    width: '100%',
  },
  sectionDesktop: {
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 48,
    paddingHorizontal: 32,
  },
  sectionLargeDesktop: {
    paddingHorizontal: 48,
  },
  sectionContent: {
    width: '100%',
  },
  sectionContentDesktop: {
    maxWidth: 1200,
    alignSelf: 'center',
  },
  sectionContentLargeDesktop: {
    maxWidth: 1400,
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: palette.text,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.6,
  },
  sectionTitleTablet: {
    fontSize: 34,
  },
  sectionTitleDesktop: {
    fontSize: 38,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: palette.muted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  sectionSubtitleTablet: {
    fontSize: 16,
    lineHeight: 24,
  },
  sectionSubtitleDesktop: {
    fontSize: 17,
    lineHeight: 26,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 16,
  },
  tagChip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 32, 71, 0.6)',
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  tagChipActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderColor: palette.primary,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tagText: {
    color: palette.muted,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  tagTextActive: {
    color: palette.text,
  },
  carousel: {
    marginBottom: 12,
  },
  carouselContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  programCard: {
    backgroundColor: 'rgba(31, 32, 71, 0.6)',
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    padding: 20,
    width: 260,
    minHeight: 210,
    gap: 10,
    justifyContent: 'space-between',
    shadowColor: 'transparent',
    elevation: 0,
    // web-only
    boxShadow: '0 10px 28px rgba(0,0,0,0.22)',
  },
  programTag: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  programTagText: {
    color: palette.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.text,
    letterSpacing: -0.2,
  },
  programSubtitle: {
    fontSize: 13,
    color: palette.text,
    flexShrink: 1,
  },
  programCta: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  programCtaText: {
    color: palette.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  featuresCarousel: {
    paddingVertical: 8,
  },
  featureCardWrapper: {
    width: 300,
    marginRight: 18,
    flexShrink: 0,
  },
  featureCard: {
    marginBottom: 0,
    borderRadius: 24,
    borderWidth: 1.5,
    backgroundColor: 'rgba(31, 32, 71, 0.6)',
    padding: 24,
    minHeight: 320,
    flexDirection: 'column',
    justifyContent: 'space-between',
    shadowColor: 'transparent',
    elevation: 0,
    // web-only
    boxShadow: '0 12px 32px rgba(0,0,0,0.22)',
  },
  featureCardDesktop: {
    padding: 24,
    minHeight: 260,
    borderRadius: 20,
  },
  featureCardLargeDesktop: {
    padding: 28,
    minHeight: 260,
    borderRadius: 22,
  },
  featureMiniRow: {
    display: 'none',
  },
  featureStatsRow: {
    marginTop: 12,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    gap: 10,
  },
  featureStatItem: {
    flex: 1,
  },
  featureStatValue: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  featureStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.8,
  },
  carouselNavRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginBottom: 8,
  },
  carouselNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  carouselNavBtnDisabled: {
    opacity: 0.35,
  },
  carouselNavText: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#8B5CF6',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionSpacer: {
    height: 32,
  },
  featuresPanel: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
  },
  featureTag: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureTagText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.text,
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  featureTitleDesktop: {
    fontSize: 20,
    marginBottom: 12,
  },
  featureTitleLargeDesktop: {
    fontSize: 22,
    marginBottom: 14,
  },
  featureDescription: {
    fontSize: 14,
    color: palette.muted,
    lineHeight: 20,
    flex: 1,
    marginBottom: 12,
  },
  featureDescriptionDesktop: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  featureDescriptionLargeDesktop: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  featureArrow: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginTop: 'auto',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureArrowText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statsSection: {
    marginVertical: 36,
    width: '100%',
  },
  statsGradient: {
    paddingVertical: 52,
    paddingHorizontal: 32,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  statsGradientDesktop: {
    paddingVertical: 52,
    paddingHorizontal: 32,
  },
  statsGradientLargeDesktop: {
    paddingVertical: 60,
    paddingHorizontal: 48,
    maxWidth: 1400,
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: palette.text,
    textAlign: 'center',
    marginBottom: 26,
    letterSpacing: -0.2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 18,
  },
  statsGridTablet: {
    justifyContent: 'space-between',
  },
  statsGridDesktop: {
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    minWidth: 140,
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(31, 32, 71, 0.6)',
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  statItemTablet: {
    minWidth: '45%',
  },
  statItemDesktop: {
    minWidth: '22%',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: palette.text,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  statLabel: {
    fontSize: 13,
    color: palette.muted,
    fontWeight: '700',
    textAlign: 'center',
  },
  devicesSection: {
    padding: 24,
    paddingBottom: 8,
    width: '100%',
  },
  devicesSectionDesktop: {
    paddingHorizontal: 32,
  },
  devicesSectionLargeDesktop: {
    paddingHorizontal: 48,
    maxWidth: 1400,
    alignSelf: 'center',
  },
  devicesCard: {
    borderRadius: 32,
    padding: 32,
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  devicesCardDesktop: {
    padding: 32,
    borderRadius: 24,
  },
  devicesCardLargeDesktop: {
    padding: 40,
    borderRadius: 28,
  },
  devicesTextBlock: {
    flex: 1,
    gap: 10,
  },
  devicesTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0A0E1A',
    letterSpacing: -0.3,
  },
  devicesSubtitle: {
    fontSize: 15,
    color: '#0A0E1A',
    opacity: 0.85,
    lineHeight: 22,
  },
  devicesBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  storeBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  storeBadgeText: {
    color: '#0A0E1A',
    fontWeight: '800',
    fontSize: 12,
  },
  devicesButton: {
    minWidth: 200,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  devicesMock: {
    width: 200,
    gap: 12,
  },
  mockScreen: {
    backgroundColor: 'rgba(10, 14, 26, 0.6)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  mockScreenSmall: {
    alignSelf: 'flex-start',
  },
  mockLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  mockValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  recipeCard: {
    backgroundColor: palette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    width: 240,
    gap: 8,
  },
  recipeTag: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
  },
  recipeTagText: {
    color: '#A78BFA',
    fontWeight: '800',
    fontSize: 12,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.text,
    letterSpacing: -0.2,
  },
  recipeMeta: {
    fontSize: 13,
    color: palette.muted,
  },
  testimonialCard: {
    backgroundColor: palette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    width: 280,
    gap: 12,
  },
  testimonialText: {
    color: palette.text,
    fontSize: 14,
    lineHeight: 20,
  },
  testimonialName: {
    color: palette.muted,
    fontWeight: '800',
    fontSize: 12,
  },
  mediaSection: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  mediaTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.muted,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  mediaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  mediaBadge: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
  },
  mediaBadgeText: {
    color: palette.text,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  trainerCard: {
    marginBottom: 0,
    width: 260,
  },
  trainerImage: {
    height: 320,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 16,
  },
  trainerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 12,
  },
  trainerTag: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(34,211,238,0.22)',
    marginBottom: 6,
  },
  trainerTagText: {
    color: '#06B6D4',
    fontWeight: '800',
    fontSize: 12,
  },
  trainerName: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: -0.2,
  },
  trainerMeta: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  courseCard: {
    marginBottom: 0,
    width: 260,
    shadowColor: 'transparent',
    elevation: 0,
    // web-only
    boxShadow: '0 12px 32px rgba(0,0,0,0.22)',
  },
  courseImage: {
    height: 260,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 16,
  },
  courseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 15, 35, 0.75)',
    borderRadius: 12,
  },
  courseTag: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
  },
  courseTagText: {
    color: '#C4B5FD',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  courseTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: -0.4,
  },
  courseMeta: {
    color: '#F8FAFC',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
  },
  scrollTopButton: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  scrollTopText: {
    color: '#0A0E1A',
    fontWeight: '900',
    fontSize: 20,
  },
  footer: {
    paddingVertical: 36,
    paddingHorizontal: 24,
    backgroundColor: '#0A0E1A',
    borderTopWidth: 1,
    borderColor: '#1A2332',
    gap: 24,
    width: '100%',
  },
  footerDesktop: {
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  footerLargeDesktop: {
    paddingHorizontal: 48,
    paddingVertical: 48,
    maxWidth: 1400,
    alignSelf: 'center',
  },
  footerLogo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.6,
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  footerCol: {
    minWidth: 140,
    gap: 8,
  },
  footerColTitle: {
    color: '#E2E8F0',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 4,
  },
  footerLink: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  footerBottom: {
    borderTopWidth: 1,
    borderColor: '#1A2332',
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  footerSmall: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  ctaSection: {
    padding: 24,
    paddingBottom: 60,
    width: '100%',
  },
  ctaSectionDesktop: {
    paddingHorizontal: 32,
  },
  ctaSectionLargeDesktop: {
    paddingHorizontal: 48,
    maxWidth: 1400,
    alignSelf: 'center',
  },
  ctaCard: {
    marginBottom: 0,
  },
  ctaGradient: {
    borderRadius: 32,
    padding: 48,
    alignItems: 'center',
    gap: 18,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  ctaGradientDesktop: {
    padding: 48,
    borderRadius: 24,
  },
  ctaGradientLargeDesktop: {
    padding: 56,
    borderRadius: 28,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0A0E1A',
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#0A0E1A',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 4,
    opacity: 0.9,
  },
  ctaButton: {
    minWidth: 220,
  },
});
