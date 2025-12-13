import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated as RNAnimated } from 'react-native';
import AnimatedCard from '../components/AnimatedCard';
import { LinearGradient } from 'expo-linear-gradient';

const palette = {
  bg: '#0B1220',
  card: '#111827',
  border: '#1F2937',
  primary: '#22D3EE',
  accent: '#7C3AED',
  text: '#E2E8F0',
  muted: '#94A3B8',
};

const recipes = [
  { tag: 'Завтрак', title: 'Панкейки из зелёной гречки', meta: '25 мин • 222 ккал', gradient: ['#22D3EE', '#2563EB'] },
  { tag: 'Перекус', title: 'Йогурт с чиа и тыквой', meta: '40 мин • 103 ккал', gradient: ['#7C3AED', '#4C1D95'] },
  { tag: 'Ужин', title: 'Перловка с индейкой', meta: '45 мин • 126 ккал', gradient: ['#22C55E', '#15803D'] },
  { tag: 'Перекус', title: 'Смузи с имбирём', meta: '10 мин • 95 ккал', gradient: ['#F97316', '#C2410C'] },
  { tag: 'Обед', title: 'Рагу с индейкой', meta: '45 мин • 145 ккал', gradient: ['#06B6D4', '#0E7490'] },
];

export default function RecipesScreen() {
  const fade = useRef(new RNAnimated.Value(0)).current;
  const slide = useRef(new RNAnimated.Value(20)).current;

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      RNAnimated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <RNAnimated.View style={[styles.hero, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <LinearGradient colors={['#22D3EE', '#2563EB', '#0F172A']} style={styles.heroGradient}>
          <Text style={styles.heroBadge}>Рационы и рецепты</Text>
          <Text style={styles.heroTitle}>Быстрые блюда под ваши цели</Text>
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
    backgroundColor: palette.bg,
  },
  hero: {
    padding: 20,
  },
  heroGradient: {
    borderRadius: 18,
    padding: 20,
    gap: 10,
  },
  heroBadge: {
    color: '#E0F2FE',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
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
  },
  tag: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '800',
    fontSize: 12,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 6,
    letterSpacing: -0.2,
  },
  meta: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 6,
  },
});


