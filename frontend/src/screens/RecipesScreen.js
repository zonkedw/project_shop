import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated as RNAnimated, useWindowDimensions } from 'react-native';
import AnimatedCard from '../components/AnimatedCard';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';

const recipes = [
  { tag: 'Завтрак', title: 'Панкейки из зелёной гречки', meta: '25 мин • 222 ккал', gradient: ['#6366F1', '#8B5CF6'] },
  { tag: 'Перекус', title: 'Йогурт с чиа и тыквой', meta: '40 мин • 103 ккал', gradient: ['#A855F7', '#EC4899'] },
  { tag: 'Ужин', title: 'Перловка с индейкой', meta: '45 мин • 126 ккал', gradient: ['#22C55E', '#4ADE80'] },
  { tag: 'Перекус', title: 'Смузи с имбирём', meta: '10 мин • 95 ккал', gradient: ['#F59E0B', '#F97316'] },
  { tag: 'Обед', title: 'Рагу с индейкой', meta: '45 мин • 145 ккал', gradient: ['#3B82F6', '#60A5FA'] },
];

export default function RecipesScreen() {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;
  
  const fade = useRef(new RNAnimated.Value(0)).current;
  const slide = useRef(new RNAnimated.Value(20)).current;

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      RNAnimated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} showsVerticalScrollIndicator={false}>
      <RNAnimated.View style={[styles.hero, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <LinearGradient colors={theme.gradients.accent} style={styles.heroGradient}>
          <Text style={styles.heroBadge}>
            🍳 Рационы и рецепты
          </Text>
          <Text style={styles.heroTitle}>
            Быстрые блюда под ваши цели
          </Text>
          <Text style={styles.heroSubtitle}>
            Дефицит, поддержание или набор — готовые идеи с реальными продуктами из РФ.
          </Text>
        </LinearGradient>
      </RNAnimated.View>

      <View style={styles.grid}>
        {recipes.map((r, idx) => (
          <AnimatedCard key={r.title} index={idx} style={styles.cardWrapper}>
            <LinearGradient colors={r.gradient} style={styles.card}>
              <Text style={styles.tag}>{r.tag}</Text>
              <Text style={styles.title}>{r.title}</Text>
              <Text style={styles.meta}>{r.meta}</Text>
            </LinearGradient>
          </AnimatedCard>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    padding: 20,
  },
  heroGradient: {
    borderRadius: 24,
    padding: 24,
    gap: 10,
  },
  heroBadge: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 1,
    opacity: 0.95,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  grid: {
    padding: 20,
    gap: 12,
  },
  cardWrapper: {
    marginBottom: 0,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    justifyContent: 'flex-end',
  },
  tag: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  meta: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
});
