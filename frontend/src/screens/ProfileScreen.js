import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import AnimatedCard from '../components/AnimatedCard';
import { colors } from '../theme/colors';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
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
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      // TODO: Загрузить профиль с сервера
      // const response = await authAPI.getProfile();
      // setProfile(response.data);
      // setFormData(response.data);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить данные профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // TODO: Сохранить профиль на сервере
      // await authAPI.updateProfile(formData);
      setEditing(false);
      Alert.alert('Успех', 'Профиль обновлён');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить профиль');
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
    { value: 'lose_weight', label: 'Похудение', icon: '📉' },
    { value: 'maintain_weight', label: 'Поддержание', icon: '⚖️' },
    { value: 'gain_weight', label: 'Набор веса', icon: '📈' },
    { value: 'gain_muscle', label: 'Набор мышечной массы', icon: '💪' },
  ];

  const activityLevels = [
    { value: 'sedentary', label: 'Малоподвижный' },
    { value: 'light', label: 'Лёгкая активность' },
    { value: 'moderate', label: 'Умеренная активность' },
    { value: 'active', label: 'Высокая активность' },
    { value: 'very_active', label: 'Очень высокая активность' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={colors.gradients.primary}
        style={styles.header}
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

      <View style={styles.content}>
        <AnimatedCard index={0}>
          <Text style={styles.sectionTitle}>Цели и настройки</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Цель</Text>
            <View style={styles.goalsGrid}>
              {goals.map((goal) => (
                <TouchableOpacity
                  key={goal.value}
                  style={[
                    styles.goalCard,
                    formData.goal === goal.value && styles.goalCardActive,
                  ]}
                  onPress={() => setFormData({ ...formData, goal: goal.value })}
                  disabled={!editing}
                >
                  <Text style={styles.goalIcon}>{goal.icon}</Text>
                  <Text
                    style={[
                      styles.goalLabel,
                      formData.goal === goal.value && styles.goalLabelActive,
                    ]}
                  >
                    {goal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Уровень активности</Text>
            <View style={styles.activityRow}>
              {activityLevels.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.activityChip,
                    formData.activity_level === level.value && styles.activityChipActive,
                  ]}
                  onPress={() => setFormData({ ...formData, activity_level: level.value })}
                  disabled={!editing}
                >
                  <Text
                    style={[
                      styles.activityText,
                      formData.activity_level === level.value && styles.activityTextActive,
                    ]}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </AnimatedCard>

        <AnimatedCard index={1}>
          <Text style={styles.sectionTitle}>Питание</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Цель калорий (ккал/день)</Text>
            <TextInput
              style={styles.input}
              value={formData.daily_calories_target}
              onChangeText={(text) => setFormData({ ...formData, daily_calories_target: text })}
              keyboardType="numeric"
              placeholder="2200"
              editable={editing}
            />
          </View>

          <View style={styles.macrosRow}>
            <View style={styles.macroInput}>
              <Text style={styles.label}>Белок (г)</Text>
              <TextInput
                style={styles.input}
                value={formData.protein_target_g}
                onChangeText={(text) => setFormData({ ...formData, protein_target_g: text })}
                keyboardType="numeric"
                placeholder="150"
                editable={editing}
              />
            </View>
            <View style={styles.macroInput}>
              <Text style={styles.label}>Углеводы (г)</Text>
              <TextInput
                style={styles.input}
                value={formData.carbs_target_g}
                onChangeText={(text) => setFormData({ ...formData, carbs_target_g: text })}
                keyboardType="numeric"
                placeholder="250"
                editable={editing}
              />
            </View>
            <View style={styles.macroInput}>
              <Text style={styles.label}>Жиры (г)</Text>
              <TextInput
                style={styles.input}
                value={formData.fats_target_g}
                onChangeText={(text) => setFormData({ ...formData, fats_target_g: text })}
                keyboardType="numeric"
                placeholder="70"
                editable={editing}
              />
            </View>
          </View>
        </AnimatedCard>

        <AnimatedCard index={2}>
          <Text style={styles.sectionTitle}>Физические параметры</Text>
          
          <View style={styles.macrosRow}>
            <View style={styles.macroInput}>
              <Text style={styles.label}>Вес (кг)</Text>
              <TextInput
                style={styles.input}
                value={formData.current_weight_kg}
                onChangeText={(text) => setFormData({ ...formData, current_weight_kg: text })}
                keyboardType="numeric"
                placeholder="70"
                editable={editing}
              />
            </View>
            <View style={styles.macroInput}>
              <Text style={styles.label}>Рост (см)</Text>
              <TextInput
                style={styles.input}
                value={formData.height_cm}
                onChangeText={(text) => setFormData({ ...formData, height_cm: text })}
                keyboardType="numeric"
                placeholder="175"
                editable={editing}
              />
            </View>
          </View>
        </AnimatedCard>

        <View style={styles.actions}>
          {editing ? (
            <>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <LinearGradient
                  colors={colors.gradients.success}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Сохранить</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setEditing(false);
                  loadData();
                }}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(true)}
            >
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>Редактировать</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  username: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    padding: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.textDark,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroInput: {
    flex: 1,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  goalCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#EEF2FF',
  },
  goalIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  goalLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  activityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityChipActive: {
    borderColor: colors.primary,
    backgroundColor: '#EEF2FF',
  },
  activityText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  activityTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  actions: {
    marginTop: 8,
    marginBottom: 32,
  },
  editButton: {
    marginBottom: 12,
  },
  saveButton: {
    marginBottom: 12,
  },
  buttonGradient: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 8,
  },
  logoutText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
});
