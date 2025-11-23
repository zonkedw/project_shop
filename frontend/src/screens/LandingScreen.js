import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { aiAPI } from '../services/api';

export default function LandingScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  const [demoMeal, setDemoMeal] = useState(null);
  const [demoWorkout, setDemoWorkout] = useState(null);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const cardScales = [useRef(new Animated.Value(1)).current, useRef(new Animated.Value(1)).current, useRef(new Animated.Value(1)).current];
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 550, useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setIsAuthed(!!token);
      } catch {}
    })();
  }, []);

  const onHover = (idx, enter) => {
    if (Platform.OS === 'web') {
      Animated.spring(cardScales[idx], { toValue: enter ? 1.02 : 1, useNativeDriver: true, friction: 8 }).start();
    }
  };

  return (
    <Animated.ScrollView
      style={styles.container}
      contentContainerStyle={styles.cc}
      scrollEventThrottle={16}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
    >
      {/* Header */}
      <Animated.View pointerEvents="box-none" style={[styles.header, {
        backgroundColor: scrollY.interpolate({ inputRange: [0, 60], outputRange: ['rgba(2,6,23,0)', 'rgba(2,6,23,0.7)'], extrapolate: 'clamp' }),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(148,163,184,0.15)'
      }]}>
        <Text style={styles.brand}>FitPilot</Text>
        <View style={styles.nav}>
          <TouchableOpacity onPress={() => navigation.navigate('AI')}><Text style={styles.navLink}>AI</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Nutrition')}><Text style={styles.navLink}>Питание</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Workouts')}><Text style={styles.navLink}>Тренировки</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}><Text style={styles.navLink}>Профиль</Text></TouchableOpacity>
        </View>
      </Animated.View>

      {/* Hero */}
      <Animated.View style={[styles.hero, { opacity: fade, transform: [{ translateY: slide }] }] }>
        <View style={styles.gradientBlob} pointerEvents="none" />
        <Text style={styles.logo}>Система здоровья нового уровня</Text>
        <Text style={styles.subtitle}>Питайся осознанно, тренируйся эффективно, получай советы от AI</Text>
        <View style={styles.heroActions}>
          <Button
            mode="contained"
            icon="sparkles"
            onPress={() => navigation.navigate('AI')}
            style={{ borderRadius: 12 }}
            contentStyle={{ paddingVertical: 6 }}
          >
            Открыть AI‑ассистента
          </Button>
          {!isAuthed && (
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Login')}
              style={{ borderRadius: 12, borderWidth: 1 }}
              textColor="#E5E7EB"
              contentStyle={{ paddingVertical: 6 }}
            >
              Войти
            </Button>
          )}
        </View>
      </Animated.View>

      {/* Feature cards */}
      <View style={styles.cardsRow}>
        <Animated.View style={[styles.card, { transform: [{ scale: cardScales[0] }] }]} onMouseEnter={() => onHover(0, true)} onMouseLeave={() => onHover(0, false)}>
          <TouchableOpacity onPress={() => navigation.navigate('AI')}>
          <Ionicons name="chatbubbles-outline" size={24} color="#A5B4FC" />
          <Text style={styles.cardTitle}>AI‑ассистент</Text>
          <Text style={styles.cardText}>Персональные советы, генерация рационов и программ с учётом целей</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.card, { transform: [{ scale: cardScales[1] }] }]} onMouseEnter={() => onHover(1, true)} onMouseLeave={() => onHover(1, false)}>
          <TouchableOpacity onPress={() => navigation.navigate('Nutrition')}>
          <Ionicons name="nutrition-outline" size={24} color="#34D399" />
          <Text style={styles.cardTitle}>Питание</Text>
          <Text style={styles.cardText}>Дневник, БЖУ, цели, быстрые порции и сканер штрих‑кодов</Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.card, { transform: [{ scale: cardScales[2] }] }]} onMouseEnter={() => onHover(2, true)} onMouseLeave={() => onHover(2, false)}>
          <TouchableOpacity onPress={() => navigation.navigate('Workouts')}>
          <Ionicons name="barbell-outline" size={24} color="#F59E0B" />
          <Text style={styles.cardTitle}>Тренировки</Text>
          <Text style={styles.cardText}>Планы, подходы, прогресс. Добавление AI‑программы в 1 клик</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Highlights */}
      <View style={styles.features}>
        <View style={styles.featureItem}>
          <Ionicons name="time-outline" size={22} color="#93C5FD" />
          <Text style={styles.featureText}>Быстрый старт: готовые экраны и API под демонстрацию</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#6EE7B7" />
          <Text style={styles.featureText}>Безопасный backend: авторизация JWT, CORS, rate‑limit</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="sparkles-outline" size={22} color="#FDE047" />
          <Text style={styles.featureText}>AI интеграция: OpenAI‑совместимый адаптер + rule‑based fallback</Text>
        </View>
      </View>

      {/* Demo blocks */}
      <Animated.View style={[styles.demoRow, { opacity: scrollY.interpolate({ inputRange: [0, 200, 400], outputRange: [0, 0.5, 1], extrapolate: 'clamp' }) }]}>
        <View style={styles.demoCard}>
          <View style={styles.demoHeader}>
            <Ionicons name="restaurant-outline" size={20} color="#A5B4FC" />
            <Text style={styles.demoTitle}>Пример рациона</Text>
            <TouchableOpacity style={styles.demoBtn} disabled={loadingDemo} onPress={async () => {
              try { setLoadingDemo(true); const res = await aiAPI.mealplan(4); setDemoMeal(res.data); }
              finally { setLoadingDemo(false); }
            }}>
              <Text style={styles.demoBtnText}>{loadingDemo ? '...' : 'Сгенерировать'}</Text>
            </TouchableOpacity>
          </View>
          {demoMeal && (
            <View style={styles.demoBody}>
              <Text style={styles.demoMeta}>Цель: {demoMeal.target_calories} ккал</Text>
              {(demoMeal.plan||[]).slice(0,3).map((m, idx) => (
                <View key={idx} style={styles.demoItem}>
                  <Text style={styles.demoItemTitle}>{idx+1}. {m.title}</Text>
                  <Text style={styles.demoItemText}>{m.total_calories} ккал • {(m.items||[])[0]?.name || ''}</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('AI', { initialMessage: 'Сгенерируй рацион на день' })}>
                <Text style={styles.linkBtnText}>Открыть AI для полного плана →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.demoCard}>
          <View style={styles.demoHeader}>
            <Ionicons name="barbell-outline" size={20} color="#F59E0B" />
            <Text style={styles.demoTitle}>Пример тренировки</Text>
            <TouchableOpacity style={styles.demoBtn} disabled={loadingDemo} onPress={async () => {
              try { setLoadingDemo(true); const res = await aiAPI.workout({ location: 'gym', duration_min: 45 }); setDemoWorkout(res.data); }
              finally { setLoadingDemo(false); }
            }}>
              <Text style={styles.demoBtnText}>{loadingDemo ? '...' : 'Сгенерировать'}</Text>
            </TouchableOpacity>
          </View>
          {demoWorkout && (
            <View style={styles.demoBody}>
              <Text style={styles.demoMeta}>Дата: {demoWorkout.date}</Text>
              {(demoWorkout.sets||[]).slice(0,4).map((s, idx) => (
                <View key={idx} style={styles.demoItem}>
                  <Text style={styles.demoItemTitle}>{s.exercise?.name || 'Упражнение'}</Text>
                  <Text style={styles.demoItemText}>Сет {s.set_number} • Повт: {s.reps ?? '-'} {s.weight_kg ? `• Вес: ${s.weight_kg} кг` : ''}</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('AI', { initialMessage: 'Сгенерируй силовую тренировку на 45 минут в зале' })}>
                <Text style={styles.linkBtnText}>Открыть AI для полного плана →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Gallery */}
      <Animated.View style={[styles.gallery, { opacity: scrollY.interpolate({ inputRange: [100, 300, 500], outputRange: [0, 0.6, 1], extrapolate: 'clamp' }) }]}> 
        <Text style={styles.sectionTitle}>Как это выглядит</Text>
        <View style={styles.galleryRow}>
          <View style={styles.galleryCard}>
            <Ionicons name="reader-outline" size={22} color="#A5B4FC" />
            <Text style={styles.galleryTitle}>Дневник питания</Text>
            <Text style={styles.galleryText}>Распределение калорий, БЖУ и приёмы за день</Text>
          </View>
          <View style={styles.galleryCard}>
            <Ionicons name="pulse-outline" size={22} color="#34D399" />
            <Text style={styles.galleryTitle}>Детали тренировки</Text>
            <Text style={styles.galleryText}>Подходы, повторы, веса и длительность</Text>
          </View>
          <View style={styles.galleryCard}>
            <Ionicons name="chatbubbles-outline" size={22} color="#F59E0B" />
            <Text style={styles.galleryTitle}>AI‑чат</Text>
            <Text style={styles.galleryText}>Рационы и программы в одно нажатие</Text>
          </View>
        </View>
      </Animated.View>

      {/* Why section */}
      <View style={styles.why}> 
        <Text style={styles.sectionTitle}>Почему FitPilot</Text>
        <View style={styles.whyRow}>
          <View style={styles.whyItem}><Text style={styles.whyBullet}>•</Text><Text style={styles.whyText}>Единая система: питание, тренировки и AI</Text></View>
          <View style={styles.whyItem}><Text style={styles.whyBullet}>•</Text><Text style={styles.whyText}>Мгновенные рекомендации и генерации планов</Text></View>
          <View style={styles.whyItem}><Text style={styles.whyBullet}>•</Text><Text style={styles.whyText}>Простота демонстрации на защите: всё работает локально</Text></View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}> 
        <Text style={styles.footerText}>© {new Date().getFullYear()} FitPilot • Курсовой проект</Text>
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  cc: { paddingBottom: 40 },
  header: { position: 'sticky', top: 0, zIndex: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { color: '#E5E7EB', fontSize: 22, fontWeight: '800' },
  nav: { flexDirection: 'row', gap: 16 },
  navLink: { color: '#A5B4FC', fontWeight: '600' },
  hero: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24, position: 'relative', overflow: 'hidden' },
  gradientBlob: { position: 'absolute', top: -120, right: -120, width: 320, height: 320, borderRadius: 999, backgroundColor: '#1D4ED8', opacity: 0.3 },
  logo: { color: '#E5E7EB', fontSize: 36, fontWeight: '800', letterSpacing: 0.5 },
  subtitle: { marginTop: 8, color: '#94A3B8', fontSize: 16 },
  heroActions: { marginTop: 16, flexDirection: 'row', gap: 10 },
  cardsRow: { marginTop: 12, paddingHorizontal: 16, gap: 12, flexDirection: 'row', flexWrap: 'wrap' },
  card: { flexBasis: Platform.OS === 'web' ? '31%' : '100%', backgroundColor: '#0F172A', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)', minHeight: 126, justifyContent: 'space-between', gap: 8 },
  cardTitle: { color: '#E5E7EB', fontSize: 18, fontWeight: '700' },
  cardText: { color: '#94A3B8', marginTop: 8 },
  actions: { marginTop: 24, paddingHorizontal: 16, flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  primary: { backgroundColor: '#4F46E5', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  primaryText: { color: '#fff', fontWeight: '700' },
  secondary: { backgroundColor: '#111827', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)' },
  secondaryText: { color: '#E5E7EB', fontWeight: '700' },
  note: { color: '#94A3B8', marginTop: 18, paddingHorizontal: 16 },
  features: { marginTop: 20, paddingHorizontal: 16, gap: 10 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#0F172A', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)' },
  featureText: { color: '#CBD5E1' },
  sectionTitle: { color: '#E5E7EB', fontSize: 18, fontWeight: '800', paddingHorizontal: 16, marginTop: 18, marginBottom: 10 },
  gallery: { marginTop: 8 },
  galleryRow: { paddingHorizontal: 16, gap: 12, flexDirection: 'row', flexWrap: 'wrap' },
  galleryCard: { flexBasis: Platform.OS === 'web' ? '31%' : '100%', backgroundColor: '#0F172A', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)' },
  galleryTitle: { color: '#E5E7EB', fontWeight: '700', marginTop: 6 },
  galleryText: { color: '#94A3B8', marginTop: 4, fontSize: 12 },
  why: { marginTop: 10 },
  whyRow: { paddingHorizontal: 16, gap: 8 },
  whyItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  whyBullet: { color: '#A5B4FC', fontWeight: '900' },
  whyText: { color: '#CBD5E1' },
  demoRow: { marginTop: 16, paddingHorizontal: 16, gap: 12, flexDirection: 'row', flexWrap: 'wrap' },
  demoCard: { flexBasis: Platform.OS === 'web' ? '48%' : '100%', backgroundColor: '#0F172A', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)' },
  demoHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  demoTitle: { color: '#E5E7EB', fontWeight: '700', flex: 1 },
  demoBtn: { backgroundColor: '#1F2937', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(148,163,184,0.35)' },
  demoBtnText: { color: '#E5E7EB', fontWeight: '700' },
  demoBody: { marginTop: 10, gap: 6 },
  demoMeta: { color: '#94A3B8', marginBottom: 4 },
  demoItem: { backgroundColor: '#0B1220', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(148,163,184,0.2)' },
  demoItemTitle: { color: '#E5E7EB', fontWeight: '700' },
  demoItemText: { color: '#94A3B8', marginTop: 2, fontSize: 12 },
  linkBtn: { marginTop: 8 },
  linkBtnText: { color: '#A5B4FC', fontWeight: '700' },
  footer: { marginTop: 24, padding: 16, alignItems: 'center' },
  footerText: { color: '#64748B' }
});
