import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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

const palette = {
  bg: '#0B1220',
  panel: '#0F172A',
  card: '#111827',
  border: '#1F2937',
  primary: '#22D3EE',
  primarySoft: '#38BDF8',
  accent: '#7C3AED',
  text: '#E2E8F0',
  muted: '#94A3B8',
};

export default function LandingScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 420;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isLargeDesktop = width >= 1440;
  const scrollRef = useRef(null);
  const [activeTag, setActiveTag] = useState('Все');
  const [hasToken, setHasToken] = useState(false);

  const features = [
    {
      tag: 'AI',
      title: 'AI-помощник 24/7',
      description: 'Собирает контекст из целей, дневника и прогресса, выдаёт конкретные планы питания, тренировки и ответы без воды.',
      accent: '#22D3EE',
    },
    {
      tag: 'Food',
      title: 'Питание под цель',
      description: 'Баланс БЖУ, продукты из РФ, готовые рацион-карты и контроль дефицита/набора.',
      accent: '#7C3AED',
    },
    {
      tag: 'Train',
      title: 'Тренировки под уровень',
      description: 'Дом/зал, время и инвентарь учитываются. Подбор упражнений и прогрессий.',
      accent: '#22C55E',
    },
    {
      tag: 'Data',
      title: 'Аналитика и прогресс',
      description: 'Тренды по весу, калориям и нагрузкам. Подсказки, где ускориться.',
      accent: '#F59E0B',
    },
    {
      tag: 'Recovery',
      title: 'Восстановление',
      description: 'Растяжка, сон, дыхание. Подбор лёгких дней и разгрузок.',
      accent: '#06B6D4',
    },
    {
      tag: 'Coach',
      title: 'Планы с экспертом',
      description: 'Готовые сплиты и челленджи на 4–8 недель, проверенные тренерами.',
      accent: '#EC4899',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Пользователей' },
    { value: '50K+', label: 'Тренировок' },
    { value: '100K+', label: 'Рационов' },
    { value: '24/7', label: 'AI-поддержка' },
  ];

  const programTags = ['Все', 'Похудение', 'Силовые', 'Йога', 'Здоровье', 'Кардио'];
  const programs = [
    {
      title: 'Функциональные силовые',
      subtitle: '21 тренировка • 22 мин',
      tag: 'Силовые',
      desc: 'Силовая выносливость с упором на всё тело. Подходит для зала и дома с гантелями.',
      level: 'Средний',
      equipment: 'Гантели/эспандер',
      focus: 'Ноги, спина, корпус',
    },
    {
      title: 'Утренняя йога',
      subtitle: '8 тренировок • 30 мин',
      tag: 'Йога',
      desc: 'Мягкие виньясы для подвижности и тонуса. Отлично для старта дня.',
      level: 'Лёгкий',
      equipment: 'Коврик',
      focus: 'Гибкость, осанка, дыхание',
    },
    {
      title: 'Кардио зарядка',
      subtitle: '10 тренировок • 15 мин',
      tag: 'Кардио',
      desc: 'Короткие кардио-сессии без инвентаря для сжигания калорий и поддержания тонуса.',
      level: 'Лёгкий',
      equipment: 'Без инвентаря',
      focus: 'Кардио, координация',
    },
    {
      title: 'Растяжка спины',
      subtitle: '6 тренировок • 18 мин',
      tag: 'Здоровье',
      desc: 'Профилактика зажимов и боли в спине. Дыхательные практики и мягкая мобилизация.',
      level: 'Лёгкий',
      equipment: 'Коврик',
      focus: 'Подвижность, спина',
    },
    {
      title: 'HIIT с весом тела',
      subtitle: '12 тренировок • 20 мин',
      tag: 'Похудение',
      desc: 'Интервальные тренировки высокой интенсивности. Минимум времени — максимум результата.',
      level: 'Средний',
      equipment: 'Без инвентаря',
      focus: 'Кардио, жиросжигание',
    },
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
  const featureScales = useRef(features.map(() => new RNAnimated.Value(1))).current;
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
  }, []);

  const loadToken = async () => {
        const token = await AsyncStorage.getItem('token');
    setHasToken(!!token);
  };

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  const blocksAnimatedStyle = {
    opacity: blocksOpacity,
    transform: [{ translateY: blocksTranslate }],
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
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <RNAnimated.View style={[styles.heroSection, animatedStyle]}>
        <LinearGradient
          colors={['#0EA5E9', '#2563EB', '#0F172A']}
          style={[
            styles.heroGradient,
            isTablet && styles.heroGradientTablet,
            isDesktop && styles.heroGradientDesktop,
            isLargeDesktop && styles.heroGradientLargeDesktop,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[
            styles.heroContent,
            isDesktop && styles.heroContentDesktop,
            isLargeDesktop && styles.heroContentLargeDesktop
          ]}>
            <Text style={styles.heroBadge}>FITNESS OS • AI INSIDE</Text>
            <Text style={[
              styles.heroTitle,
              isTablet && styles.heroTitleTablet,
              isDesktop && styles.heroTitleDesktop,
              isLargeDesktop && styles.heroTitleLargeDesktop
            ]}>
              FitPilot — цифровой тренер и нутриолог
            </Text>
            <Text style={[
              styles.heroSubtitle,
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
                onPress={() => navigation.navigate('Register')}
                variant="primary"
                style={styles.aiButton}
              />
      </View>
          </LinearGradient>
        </AnimatedCard>
      </RNAnimated.View>

      {/* Features Section */}
      <RNAnimated.View style={[
        styles.section,
        blocksAnimatedStyle,
        isDesktop && styles.sectionDesktop,
        isLargeDesktop && styles.sectionLargeDesktop
      ]}>
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.carousel}
            contentContainerStyle={styles.carouselContent}
          >
            {programs
              .filter((p) => activeTag === 'Все' || p.tag === activeTag)
              .map((p, idx) => (
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
          <View style={[
            styles.featuresGrid,
            isTablet && styles.featuresGridTablet,
            isDesktop && styles.featuresGridDesktop,
            isLargeDesktop && styles.featuresGridLargeDesktop
          ]}>
          {features.map((feature, index) => (
            <Pressable
              key={index}
              onPressIn={() => pressTo(featureScales[index], 0.97)}
              onPressOut={() => pressTo(featureScales[index], 1)}
            >
              <AnimatedCard
                index={index + 1}
                style={[
                  styles.featureCardWrapper,
                  isTablet && styles.featureCardWrapperTablet,
                  isDesktop && styles.featureCardWrapperDesktop,
                  isLargeDesktop && styles.featureCardWrapperLargeDesktop,
                  { transform: [{ scale: featureScales[index] }] },
                ]}
              >
                <LinearGradient
                  colors={[`${feature.accent}33`, `${feature.accent}0F`]}
                  style={[
                    styles.featureCard,
                    isDesktop && styles.featureCardDesktop,
                    isLargeDesktop && styles.featureCardLargeDesktop,
                    { borderColor: feature.accent }
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={[styles.featureTag, { backgroundColor: `${feature.accent}22` }]}>
                    <Text style={[styles.featureTagText, { color: feature.accent }]}>{feature.tag}</Text>
          </View>
                  <Text style={[
                    styles.featureTitle,
                    isDesktop && styles.featureTitleDesktop,
                    isLargeDesktop && styles.featureTitleLargeDesktop
                  ]}>{feature.title}</Text>
                  <Text style={[
                    styles.featureDescription,
                    isDesktop && styles.featureDescriptionDesktop,
                    isLargeDesktop && styles.featureDescriptionLargeDesktop
                  ]}>{feature.description}</Text>
                  <View style={[styles.featureArrow, { backgroundColor: `${feature.accent}15` }]}>
                    <Text style={[styles.featureArrowText, { color: feature.accent }]}>Подробнее</Text>
                </View>
                </LinearGradient>
              </AnimatedCard>
            </Pressable>
              ))}
          </View>
        </View>
      </RNAnimated.View>

      {/* Stats Section */}
      <RNAnimated.View style={[styles.statsSection, blocksAnimatedStyle]}>
        <LinearGradient
          colors={[palette.card, palette.panel]}
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
          colors={['#0EA5E9', '#2563EB']}
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
                imageStyle={{ borderRadius: 12 }}
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
                imageStyle={{ borderRadius: 12 }}
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

      {/* CTA Section */}
      <RNAnimated.View style={[
        styles.ctaSection,
        blocksAnimatedStyle,
        isDesktop && styles.ctaSectionDesktop,
        isLargeDesktop && styles.ctaSectionLargeDesktop
      ]}>
        <AnimatedCard index={5} style={styles.ctaCard}>
          <LinearGradient
            colors={[palette.primary, palette.accent]}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
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
  },
  heroContentDesktop: {
    maxWidth: 900,
  },
  heroContentLargeDesktop: {
    maxWidth: 1200,
  },
  heroBadge: {
    fontSize: 12,
    color: palette.primary,
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginBottom: 20,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: palette.text,
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
    color: palette.muted,
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
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    minWidth: 160,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
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
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minWidth: 120,
    alignItems: 'center',
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
    marginTop: 28,
    backgroundColor: palette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 12,
    flexWrap: 'wrap',
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
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: palette.border,
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
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: palette.border,
  },
  tagChipActive: {
    backgroundColor: 'rgba(34, 211, 238, 0.12)',
    borderColor: palette.primary,
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
    backgroundColor: palette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    width: 240,
    gap: 8,
  },
  programTag: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
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
    color: palette.muted,
  },
  programCta: {
    marginTop: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(34, 211, 238, 0.14)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.4)',
  },
  programCtaText: {
    color: palette.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -7,
    width: '100%',
  },
  featuresGridTablet: {
    marginHorizontal: -8,
  },
  featuresGridDesktop: {
    marginHorizontal: -10,
  },
  featuresGridLargeDesktop: {
    marginHorizontal: -12,
  },
  featureCardWrapper: {
    width: '100%',
    paddingHorizontal: 7,
    marginBottom: 14,
  },
  featureCardWrapperTablet: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  featureCardWrapperDesktop: {
    width: '33.333%',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  featureCardWrapperLargeDesktop: {
    width: '33.333%',
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  featureCard: {
    marginBottom: 0,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: palette.card,
    padding: 20,
    minHeight: 220,
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  featureCardDesktop: {
    padding: 24,
    minHeight: 240,
    borderRadius: 20,
  },
  featureCardLargeDesktop: {
    padding: 28,
    minHeight: 260,
    borderRadius: 22,
  },
  featureTag: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 12,
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
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 'auto',
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
    paddingVertical: 44,
    paddingHorizontal: 24,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.border,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
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
    minWidth: 120,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#0C1627',
    borderWidth: 1,
    borderColor: palette.border,
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
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
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
    fontSize: 24,
    fontWeight: '800',
    color: '#0B1220',
    letterSpacing: -0.3,
  },
  devicesSubtitle: {
    fontSize: 14,
    color: '#0B1220',
    opacity: 0.8,
    lineHeight: 20,
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
    color: '#0B1220',
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
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
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
    color: '#C084FC',
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
    width: 240,
  },
  trainerImage: {
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 12,
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
    color: '#22D3EE',
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
    width: 240,
  },
  courseImage: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 12,
  },
  courseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 12,
  },
  courseTag: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(124,58,237,0.22)',
    marginBottom: 6,
  },
  courseTagText: {
    color: '#C084FC',
    fontWeight: '800',
    fontSize: 12,
  },
  courseTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: -0.2,
  },
  courseMeta: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  scrollTopButton: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  scrollTopText: {
    color: '#0B1220',
    fontWeight: '900',
    fontSize: 18,
  },
  footer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#0A101B',
    borderTopWidth: 1,
    borderColor: '#111827',
    gap: 20,
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
    borderColor: '#111827',
    paddingTop: 12,
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
    borderRadius: 22,
    padding: 38,
    alignItems: 'center',
    gap: 14,
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
    fontSize: 26,
    fontWeight: '800',
    color: '#0B1220',
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 15,
    color: '#0B1220',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 4,
  },
  ctaButton: {
    minWidth: 220,
  },
});
