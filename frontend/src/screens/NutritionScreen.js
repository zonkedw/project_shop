import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { Card, Button, Snackbar } from 'react-native-paper';
import { nutritionAPI } from '../services/api';

export default function NutritionScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, fats: 0, carbs: 0 });
  const [targets, setTargets] = useState({ calories: 2200 });
  const [meals, setMeals] = useState([]);
  const [stats7d, setStats7d] = useState(null);
  const [statsDays, setStatsDays] = useState(7);
  const [snack, setSnack] = useState({ visible: false, text: '' });

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fade]);

  useEffect(() => {
    loadDiary();
    loadStats(statsDays);
  }, []);

  const loadDiary = async () => {
    setLoading(true);
    try {
      const date = new Date().toISOString().split('T')[0];
      const res = await nutritionAPI.getDiary(date).catch(() => ({ data: { totals: {}, targets: {}, meals: [] } }));
      setTotals({
        calories: res.data.totals?.calories || 0,
        protein: res.data.totals?.protein || 0,
        fats: res.data.totals?.fats || 0,
        carbs: res.data.totals?.carbs || 0,
      });
      setTargets({ calories: res.data.targets?.calories || 2200 });
      setMeals(res.data.meals || []);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDiary();
    await loadStats(statsDays);
    setRefreshing(false);
  };

  const loadStats = async (days = 7) => {
    try {
      const res = await nutritionAPI.getDiaryStats(days);
      setStats7d(res.data);
    } catch (e) {
      // тихо игнорируем, чтобы не ломать экран
    }
  };

  const confirmDelete = (mealId) => {
    Alert.alert('Удалить приём?', 'Действие нельзя отменить', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: async () => {
          try {
            setLoading(true);
            await nutritionAPI.deleteMeal(mealId);
            await loadDiary();
            setSnack({ visible: true, text: 'Приём удалён' });
          } finally {
            setLoading(false);
          }
        }
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}> 
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <>
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Animated.View style={[styles.header, { opacity: fade }]}>
        <Text style={styles.title}>Питание сегодня</Text>
        <Text style={styles.subtitle}>Контролируйте рацион и цель</Text>
      </Animated.View>

      <View style={styles.cardsRow}>
        <View style={[styles.card, styles.cardPrimary]}>
          <Text style={styles.cardLabel}>Калории</Text>
          <Text style={styles.cardValue}>{totals.calories} / {targets.calories}</Text>
          <Text style={styles.cardHint}>за сегодня</Text>
        </View>
        <View style={[styles.card, styles.cardNeutral]}>
          <Text style={styles.cardLabel}>Остаток</Text>
          <Text style={styles.cardValue}>{Math.max(targets.calories - totals.calories, 0)}</Text>
          <Text style={styles.cardHint}>ккал</Text>
        </View>
      </View>

      <View style={styles.macrosRow}>
        <View style={styles.macroCard}><Text style={styles.macroLabel}>Б</Text><Text style={styles.macroVal}>{totals.protein} г</Text></View>
        <View style={styles.macroCard}><Text style={styles.macroLabel}>Ж</Text><Text style={styles.macroVal}>{totals.fats} г</Text></View>
        <View style={styles.macroCard}><Text style={styles.macroLabel}>У</Text><Text style={styles.macroVal}>{totals.carbs} г</Text></View>
      </View>

      {stats7d && (
        <Card style={styles.statsBox}>
          <View style={styles.statsHeaderRow}>
            <Text style={styles.statsTitle}>За {statsDays} дней</Text>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <TouchableOpacity
                style={[styles.toggleBtn, statsDays === 7 && styles.toggleBtnActive]}
                onPress={async () => { setStatsDays(7); await loadStats(7); }}
              >
                <Text style={[styles.toggleText, statsDays === 7 && styles.toggleTextActive]}>7</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, statsDays === 30 && styles.toggleBtnActive]}
                onPress={async () => { setStatsDays(30); await loadStats(30); }}
              >
                <Text style={[styles.toggleText, statsDays === 30 && styles.toggleTextActive]}>30</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.statsSubtitle}>{stats7d.days_with_target} дн. в диапазоне цели</Text>
          <View style={styles.statsRow}>
            <View style={styles.statsCol}>
              <Text style={styles.statsLabel}>Средние калории</Text>
              <Text style={styles.statsValue}>{stats7d.averages?.calories || 0} ккал</Text>
            </View>
            <View style={styles.statsCol}>
              <Text style={styles.statsLabel}>Средний белок</Text>
              <Text style={styles.statsValue}>{stats7d.averages?.protein || 0} г</Text>
            </View>
          </View>
        </Card>
      )}

      <Text style={styles.sectionTitle}>Приёмы пищи</Text>
      {meals.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Пока ничего не добавлено</Text>
        </View>
      ) : (
        meals.map((meal, idx) => (
          <Card
            key={idx}
            style={styles.mealItem}
            onPress={() => navigation.navigate('AddMeal', { meal })}
          >
            <View style={styles.mealLeft}>
              <Text style={styles.mealTitle}>{labelForMealType(meal.meal_type) || 'Приём пищи'}</Text>
              <Text style={styles.mealMeta}>
                {meal.items?.length ? `${meal.items.length} поз.` : ''}
              </Text>
              {(meal.total_protein || meal.total_carbs || meal.total_fats) && (
                <View style={styles.tagsRow}>
                  {meal.total_protein ? (
                    <View style={styles.tag}><Text style={styles.tagText}>Б {Math.round(meal.total_protein)} г</Text></View>
                  ) : null}
                  {meal.total_fats ? (
                    <View style={styles.tag}><Text style={styles.tagText}>Ж {Math.round(meal.total_fats)} г</Text></View>
                  ) : null}
                  {meal.total_carbs ? (
                    <View style={styles.tag}><Text style={styles.tagText}>У {Math.round(meal.total_carbs)} г</Text></View>
                  ) : null}
                </View>
              )}
            </View>
            <View style={styles.mealRight}>
              <Text style={styles.mealKcal}>{Math.round(meal.total_calories || meal.calories || 0)} ккал</Text>
              <Button mode="text" textColor="#FCA5A5" onPress={() => confirmDelete(meal.meal_id)}>Удалить</Button>
            </View>
          </Card>
        ))
      )}

      <Button mode="contained" style={styles.addButton} onPress={() => navigation.navigate('AddMeal')}>
        + Добавить приём пищи
      </Button>
    </ScrollView>
    <Snackbar visible={snack.visible} onDismiss={() => setSnack({ visible: false, text: '' })} duration={2500}>
      {snack.text}
    </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B1220',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: {
    color: '#E5E7EB',
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94A3B8',
    marginTop: 4,
    fontSize: 13,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  cardPrimary: {
    backgroundColor: '#1D4ED8',
  },
  cardNeutral: {
    backgroundColor: '#111827',
  },
  cardLabel: {
    color: '#C7D2FE',
    fontSize: 12,
  },
  cardValue: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
  },
  cardHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 8,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)'
  },
  macroLabel: {
    fontSize: 12,
    color: '#93C5FD',
  },
  macroVal: {
    marginTop: 6,
    fontSize: 16,
    color: '#E5E7EB',
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#CBD5E1',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  statsBox: {
    marginTop: 12,
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  emptyBox: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  mealLeft: { flex: 1 },
  mealRight: { marginLeft: 12 },
  mealTitle: { color: '#E5E7EB', fontSize: 15, fontWeight: '600' },
  mealMeta: { color: '#94A3B8', marginTop: 2, fontSize: 12 },
  mealKcal: { color: '#F9FAFB', fontSize: 15, fontWeight: '700' },
  addButton: {
    marginHorizontal: 16,
    marginVertical: 18,
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    alignItems: 'center',
    padding: 14,
  },
  addText: { color: '#F9FAFB', fontSize: 15, fontWeight: '600' },
  deleteBtn: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#1F2937',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.35)'
  },
  deleteText: { color: '#FCA5A5', fontSize: 12, fontWeight: '700' },
});

function labelForMealType(type) {
  switch (type) {
    case 'breakfast': return 'Завтрак';
    case 'lunch': return 'Обед';
    case 'dinner': return 'Ужин';
    case 'snack': return 'Перекус';
    default: return 'Приём пищи';
  }
}
