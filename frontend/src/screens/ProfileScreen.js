import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
  Animated as RNAnimated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, usersAPI, nutritionAPI, workoutsAPI, extractData } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import AnimatedCard from '../components/AnimatedCard';
import GradientButton from '../components/GradientButton';

export default function ProfileScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const palette = theme; // для обратной совместимости
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [todayStats, setTodayStats] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    targetCalories: 0,
    workouts: 0,
  });
  const [waterToday, setWaterToday] = useState(2000);
  const pulse = useRef(new RNAnimated.Value(0.8)).current;
  const slide = useRef(new RNAnimated.Value(0)).current;
  const [formData, setFormData] = useState({
    full_name: '',
    target_weight_kg: '',
    training_location: '',
    available_equipment: '',
    water_target_ml: '',
    daily_calories_target: '',
    protein_target_g: '',
    carbs_target_g: '',
    fats_target_g: '',
    current_weight_kg: '',
    height_cm: '',
    goal: 'maintain_weight',
    activity_level: 'moderate',
  });

  useEffect(() => {
    loadData();
    startInfographics();
  }, []);

  useEffect(() => {
    loadTodayData();
    loadWaterFromStorage();
  }, []);

  const loadTodayData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [diaryResponse, sessionsResponse] = await Promise.all([
        nutritionAPI.getDiary(today).catch(() => ({ data: { totals: {}, targets: {} } })),
        workoutsAPI.getSessions({ start_date: today, end_date: today }).catch(() => ({ data: { sessions: [] } })),
      ]);

      const diaryData = extractData(diaryResponse) || diaryResponse.data || {};
      const sessionsData = extractData(sessionsResponse) || sessionsResponse.data || {};

      setTodayStats({
        calories: diaryData.totals?.calories || 0,
        protein: diaryData.totals?.protein || 0,
        carbs: diaryData.totals?.carbs || 0,
        fats: diaryData.totals?.fats || 0,
        targetCalories: diaryData.targets?.calories || 2200,
        workouts: sessionsData.sessions?.length || 0,
      });
    } catch (e) {
      // ignore on profile
    }
  };

  const loadWaterFromStorage = async () => {
    const today = new Date().toISOString().split('T')[0];
    const key = `water_${today}`;
    const stored = await AsyncStorage.getItem(key);
    if (stored) {
      setWaterToday(Number(stored));
    } else {
      setWaterToday(2000);
    }
  };

  const addWater = async (ml = 250) => {
    const today = new Date().toISOString().split('T')[0];
    const key = `water_${today}`;
    const next = (waterToday || 0) + ml;
    setWaterToday(next);
    await AsyncStorage.setItem(key, String(next));
  };

  const startInfographics = () => {
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        RNAnimated.timing(pulse, { toValue: 0.8, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    RNAnimated.loop(
      RNAnimated.timing(slide, { toValue: 1, duration: 1800, useNativeDriver: true })
    ).start();
  };

  const numberToString = (val) => (val === null || val === undefined ? '' : String(val));
  const numOrNull = (val) => {
    const trimmed = String(val ?? '').trim();
    if (trimmed === '') return null;
    const num = Number(trimmed);
    return Number.isNaN(num) ? null : num;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      const response = await usersAPI.getProfile();
      const data = response.data || response;
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        target_weight_kg: numberToString(data.target_weight_kg),
        training_location: data.training_location || '',
        available_equipment: data.available_equipment || '',
        water_target_ml: numberToString(data.water_target_ml),
        daily_calories_target: numberToString(data.daily_calories_target),
        protein_target_g: numberToString(data.protein_target_g),
        carbs_target_g: numberToString(data.carbs_target_g),
        fats_target_g: numberToString(data.fats_target_g),
        current_weight_kg: numberToString(data.current_weight_kg),
        height_cm: numberToString(data.height_cm),
        goal: data.goal || 'maintain_weight',
        activity_level: data.activity_level || 'moderate',
      });
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить данные профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        full_name: formData.full_name || null,
        target_weight_kg: numOrNull(formData.target_weight_kg),
        training_location: formData.training_location || null,
        available_equipment: formData.available_equipment || null,
        water_target_ml: numOrNull(formData.water_target_ml),
        height_cm: numOrNull(formData.height_cm),
        current_weight_kg: numOrNull(formData.current_weight_kg),
        activity_level: formData.activity_level || null,
        goal: formData.goal || null,
      };
      await usersAPI.updateProfile(payload);
      setEditing(false);
      Alert.alert('Успех', 'Профиль обновлён');
      loadData();
    } catch (error) {
      Alert.alert('Ошибка', error?.message || 'Не удалось сохранить профиль');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const goals = [
    { value: 'lose_weight', label: 'Похудение', icon: '📉', color: '#EC4899' },
    { value: 'maintain_weight', label: 'Поддержание', icon: '⚖️', color: '#8B5CF6' },
    { value: 'gain_weight', label: 'Набор веса', icon: '📈', color: '#22C55E' },
    { value: 'gain_muscle', label: 'Набор мышечной массы', icon: '💪', color: '#F59E0B' },
  ];

  const activityLevels = [
    { value: 'sedentary', label: 'Малоподвижный' },
    { value: 'light', label: 'Лёгкая активность' },
    { value: 'moderate', label: 'Умеренная активность' },
    { value: 'active', label: 'Высокая активность' },
    { value: 'very_active', label: 'Очень высокая активность' },
  ];

  const heroGradient = isDark 
    ? ['#6366F1', '#8B5CF6', '#0F0F23']
    : ['#6366F1', '#8B5CF6', '#F8FAFC'];

  const goalLabels = goals.reduce((acc, g) => ({ ...acc, [g.value]: g.label }), {});
  const activityLabels = activityLevels.reduce((acc, a) => ({ ...acc, [a.value]: a.label }), {});

  const goalTip = () => {
    switch (formData.goal) {
      case 'lose_weight':
        return 'Держите дефицит 400-600 ккал, 8-10k шагов и 2-3 силовых в неделю.';
      case 'gain_weight':
        return 'Добавьте профицит ~300 ккал, белок 1.8-2.2 г/кг и прогрессию весов.';
      case 'gain_muscle':
        return 'Белок 2 г/кг, силовые 3-4 раза/нед, отдых 7-9 часов, шаги 6-8k.';
      default:
        return 'Поддерживайте баланс: белок 1.6-2 г/кг, шаги 8k, силовые 2-3 раза/нед.';
    }
  };

  const calories = todayStats.calories || Number(formData.daily_calories_target) || 2200;
  const protein = todayStats.protein || Number(formData.protein_target_g) || 150;
  const carbs = todayStats.carbs || Number(formData.carbs_target_g) || 250;
  const fats = todayStats.fats || Number(formData.fats_target_g) || 70;
  const water = waterToday || Number(formData.water_target_ml) || 2000;

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: palette.bg }]}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: palette.bg }]} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={heroGradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.username}>{user?.username || 'Пользователь'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
        </View>
      </LinearGradient>

      {/* Инфографика боков/акценты */}
      <View style={[styles.infoRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderColor: palette.border }]}>
        <AnimatedCard index={-1} style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={[styles.infoLabel, { color: palette.muted }]}>Баланс дня</Text>
            <Text style={[styles.infoValue, { color: palette.text }]}>{calories} ккал</Text>
          </View>
          <View style={styles.progressShell}>
            <View style={styles.progressTrack}>
              <RNAnimated.View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(100, (Number(calories) / Number(todayStats.targetCalories || formData.daily_calories_target || calories)) * 100)}%` }
                ]}
              />
              <RNAnimated.View
                style={[
                  styles.glowDot,
                  {
                    transform: [
                      {
                        translateX: slide.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 280],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
            <Text style={[styles.infoHint, { color: palette.muted }]}>Цель {formData.daily_calories_target || calories} ккал</Text>
          </View>
          <View style={styles.infoActions}>
            <GradientButton
              title="Добавить приём пищи"
              onPress={() => navigation.navigate('AddMeal')}
              variant="secondary"
              style={styles.infoActionBtn}
            />
          </View>
        </AnimatedCard>

        <AnimatedCard index={-2} style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={[styles.infoLabel, { color: palette.muted }]}>Гидратация</Text>
            <Text style={[styles.infoValue, { color: palette.text }]}>{water} мл</Text>
          </View>
          <View style={styles.pulseCircleWrap}>
            <RNAnimated.View
              style={[
                styles.pulseCircle,
                {
                  backgroundColor: isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)',
                  transform: [{ scale: pulse }],
                },
              ]}
            />
            <Text style={[styles.infoHint, { color: palette.muted }]}>Рекомендуем ≥ {water} мл</Text>
          </View>
          <View style={styles.infoActions}>
            <GradientButton
              title="+250 мл"
              onPress={() => addWater(250)}
              variant="secondary"
              style={styles.infoActionBtn}
            />
            <GradientButton
              title="+500 мл"
              onPress={() => addWater(500)}
              variant="secondary"
              style={styles.infoActionBtn}
            />
          </View>
        </AnimatedCard>

        <AnimatedCard index={-3} style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={[styles.infoLabel, { color: palette.muted }]}>Тренировки</Text>
            <Text style={[styles.infoValue, { color: palette.text }]}>{todayStats.workouts} сессий</Text>
          </View>
          <Text style={[styles.infoHint, { color: palette.muted, marginBottom: 8 }]}>
            За сегодня. Планируйте или отмечайте выполненное.
          </Text>
          <View style={styles.infoActions}>
            <GradientButton
              title="К сессиям"
              onPress={() => navigation.navigate('Workouts')}
              variant="secondary"
              style={styles.infoActionBtn}
            />
            <GradientButton
              title="Построить тренировку"
              onPress={() => navigation.navigate('WorkoutBuilder')}
              variant="secondary"
              style={styles.infoActionBtn}
            />
          </View>
        </AnimatedCard>
      </View>

      <View style={[styles.content, isDesktop && styles.contentDesktop]}>
        <AnimatedCard index={0}>
          <View style={[styles.cardContent, { backgroundColor: isDark ? palette.card : palette.card }]}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>🎯 Цели и настройки</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: palette.muted }]}>Цель</Text>
              <View style={[styles.goalsGrid, isTablet && styles.goalsGridTablet]}>
                {goals.map((goal) => (
                  <TouchableOpacity
                    key={goal.value}
                    style={[
                      styles.goalCard,
                      { 
                        backgroundColor: formData.goal === goal.value 
                          ? (isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF')
                          : (isDark ? palette.inputBg : palette.card),
                        borderColor: formData.goal === goal.value 
                          ? goal.color 
                          : palette.border
                      },
                    ]}
                    onPress={() => setFormData({ ...formData, goal: goal.value })}
                    disabled={!editing}
                  >
                    <Text style={styles.goalIcon}>{goal.icon}</Text>
                    <Text
                      style={[
                        styles.goalLabel,
                        { color: formData.goal === goal.value ? goal.color : palette.text }
                      ]}
                    >
                      {goal.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: palette.muted }]}>Уровень активности</Text>
              <View style={styles.activityRow}>
                {activityLevels.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    style={[
                      styles.activityChip,
                      { 
                        backgroundColor: formData.activity_level === level.value 
                          ? (isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF')
                          : (isDark ? palette.inputBg : palette.card),
                        borderColor: formData.activity_level === level.value 
                          ? palette.primary 
                          : palette.border
                      },
                    ]}
                    onPress={() => setFormData({ ...formData, activity_level: level.value })}
                    disabled={!editing}
                  >
                    <Text
                      style={[
                        styles.activityText,
                        { color: formData.activity_level === level.value ? palette.primary : palette.text }
                      ]}
                    >
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[
              styles.recoCard,
              { 
                borderColor: palette.border,
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F8FAFC'
              }
            ]}>
              <Text style={[styles.recoTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>Что это даст?</Text>
              <Text style={[styles.recoLine, { color: isDark ? '#E2E8F0' : '#1F2937' }]}>
                Цель: {goalLabels[formData.goal] || '—'} • Активность: {activityLabels[formData.activity_level] || '—'}
              </Text>
              <Text style={[styles.recoLine, { color: isDark ? '#E2E8F0' : '#1F2937' }]}>
                Текущие таргеты: {calories} ккал / Б {protein} г / У {carbs} г / Ж {fats} г / Вода {water} мл
              </Text>
              <Text style={[styles.recoTip, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>{goalTip()}</Text>
            </View>
          </View>
        </AnimatedCard>

        <AnimatedCard index={1}>
          <View style={[styles.cardContent, { backgroundColor: isDark ? palette.card : palette.card }]}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>🍽️ Питание</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: palette.muted }]}>Цель калорий (ккал/день)</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: palette.inputBg, 
                  borderColor: palette.inputBorder,
                  color: palette.text 
                }]}
                value={formData.daily_calories_target}
                onChangeText={(text) => setFormData({ ...formData, daily_calories_target: text })}
                keyboardType="numeric"
                placeholder="2200"
                placeholderTextColor={palette.muted}
                editable={editing}
              />
            </View>

            <View style={[styles.macrosRow, isTablet && styles.macrosRowTablet]}>
              <View style={styles.macroInput}>
                <Text style={[styles.label, { color: palette.muted }]}>Белок (г)</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: palette.inputBg, 
                    borderColor: palette.inputBorder,
                    color: palette.text 
                  }]}
                  value={formData.protein_target_g}
                  onChangeText={(text) => setFormData({ ...formData, protein_target_g: text })}
                  keyboardType="numeric"
                  placeholder="150"
                  placeholderTextColor={palette.muted}
                  editable={editing}
                />
              </View>
              <View style={styles.macroInput}>
                <Text style={[styles.label, { color: palette.muted }]}>Углеводы (г)</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: palette.inputBg, 
                    borderColor: palette.inputBorder,
                    color: palette.text 
                  }]}
                  value={formData.carbs_target_g}
                  onChangeText={(text) => setFormData({ ...formData, carbs_target_g: text })}
                  keyboardType="numeric"
                  placeholder="250"
                  placeholderTextColor={palette.muted}
                  editable={editing}
                />
              </View>
              <View style={styles.macroInput}>
                <Text style={[styles.label, { color: palette.muted }]}>Жиры (г)</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: palette.inputBg, 
                    borderColor: palette.inputBorder,
                    color: palette.text 
                  }]}
                  value={formData.fats_target_g}
                  onChangeText={(text) => setFormData({ ...formData, fats_target_g: text })}
                  keyboardType="numeric"
                  placeholder="70"
                  placeholderTextColor={palette.muted}
                  editable={editing}
                />
              </View>
            </View>
          </View>
        </AnimatedCard>

        <AnimatedCard index={2}>
          <View style={[styles.cardContent, { backgroundColor: isDark ? palette.card : palette.card }]}>
            <Text style={[styles.sectionTitle, { color: palette.text }]}>📊 Физические параметры</Text>
            
            <View style={[styles.macrosRow, isTablet && styles.macrosRowTablet]}>
              <View style={styles.macroInput}>
                <Text style={[styles.label, { color: palette.muted }]}>Вес (кг)</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: palette.inputBg, 
                    borderColor: palette.inputBorder,
                    color: palette.text 
                  }]}
                  value={formData.current_weight_kg}
                  onChangeText={(text) => setFormData({ ...formData, current_weight_kg: text })}
                  keyboardType="numeric"
                  placeholder="70"
                  placeholderTextColor={palette.muted}
                  editable={editing}
                />
              </View>
              <View style={styles.macroInput}>
                <Text style={[styles.label, { color: palette.muted }]}>Рост (см)</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: palette.inputBg, 
                    borderColor: palette.inputBorder,
                    color: palette.text 
                  }]}
                  value={formData.height_cm}
                  onChangeText={(text) => setFormData({ ...formData, height_cm: text })}
                  keyboardType="numeric"
                  placeholder="175"
                  placeholderTextColor={palette.muted}
                  editable={editing}
                />
              </View>
            </View>
          </View>
        </AnimatedCard>

        <View style={[styles.quickNavRow, { borderColor: palette.border }]}>
          <GradientButton
            title="На главную"
            onPress={() => navigation.navigate('Home')}
            variant="primary"
            style={styles.quickNavButton}
          />
          <GradientButton
            title="AI-помощник"
            onPress={() => navigation.navigate('Chat')}
            variant="secondary"
            style={styles.quickNavButton}
          />
        </View>

        <View style={styles.actions}>
          {editing ? (
            <>
              <GradientButton
                title={saving ? 'Сохранение...' : 'Сохранить изменения'}
                onPress={handleSave}
                variant="success"
                style={styles.actionButton}
                disabled={saving}
              />
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: palette.border }]}
                onPress={() => {
                  setEditing(false);
                  loadData();
                }}
              >
                <Text style={[styles.cancelButtonText, { color: palette.muted }]}>Отмена</Text>
              </TouchableOpacity>
            </>
          ) : (
            <GradientButton
              title="Редактировать профиль"
              onPress={() => setEditing(true)}
              variant="primary"
              style={styles.actionButton}
            />
          )}

          <TouchableOpacity 
            style={[styles.logoutButton, { borderColor: palette.border }]} 
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Выйти из аккаунта</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 28,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  username: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  content: {
    padding: 20,
    paddingTop: 24,
  },
  contentDesktop: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  cardContent: {
    padding: 0,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -0.4,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  input: {
    borderRadius: 20,
    padding: 18,
    fontSize: 17,
    borderWidth: 1.5,
  },
  macrosRow: {
    flexDirection: 'column',
    gap: 16,
  },
  macrosRowTablet: {
    flexDirection: 'row',
  },
  macroInput: {
    flex: 1,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalsGridTablet: {
    gap: 16,
  },
  goalCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
  },
  goalIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  activityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  activityChip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  activityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    marginTop: 12,
    marginBottom: 40,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0,
    maxWidth: 1200,
    alignSelf: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    marginBottom: 8,
  },
  infoCard: {
    flex: 1,
    minWidth: '48%',
    padding: 14,
    borderRadius: 18,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  infoHint: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  progressShell: {
    marginTop: 4,
  },
  progressTrack: {
    height: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
  },
  glowDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#A78BFA',
    top: -2,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },
  pulseCircleWrap: {
    alignItems: 'flex-start',
    gap: 6,
    paddingVertical: 4,
  },
  pulseCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  infoActionBtn: {
    flex: 1,
    minWidth: 120,
  },
  quickNavRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  quickNavButton: {
    flex: 1,
  },
  actionButton: {
    width: '100%',
  },
  cancelButton: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    paddingVertical: 18,
    alignItems: 'center',
    borderTopWidth: 1.5,
    marginTop: 16,
    paddingTop: 24,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
});
