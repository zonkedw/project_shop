import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import { usersAPI } from '../services/api';

export default function OnboardingScreen({ navigation }) {
  const [step, setStep] = useState(0); // 0: цель, 1: параметры, 2: активность
  const [saving, setSaving] = useState(false);

  const [goal, setGoal] = useState('maintain'); // lose | gain | maintain
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('normal'); // low | normal | high

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fade]);

  const next = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else {
      saveProfile();
    }
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const saveProfile = async () => {
    const h = parseInt(height || '0', 10);
    const w = parseFloat(weight || '0');
    if (!h || !w) {
      Alert.alert('Заполните данные', 'Укажите рост и вес');
      return;
    }
    setSaving(true);
    try {
      await usersAPI.updateProfile({
        goal,
        height_cm: h,
        weight_kg: w,
        activity_level: activity,
      });
      navigation.replace('Home');
    } catch (e) {
      Alert.alert('Ошибка', e.response?.data?.error || 'Не удалось сохранить профиль');
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <View style={styles.card}>
          <Text style={styles.stepTitle}>Ваша цель</Text>
          <Text style={styles.stepSubtitle}>Это поможет подобрать калории и тренировки</Text>
          <View style={styles.rowBtns}>
            {[{ k: 'lose', t: 'Похудение' }, { k: 'maintain', t: 'Поддержание' }, { k: 'gain', t: 'Набор' }].map((g) => (
              <TouchableOpacity
                key={g.k}
                style={[styles.chip, goal === g.k && styles.chipActive]}
                onPress={() => setGoal(g.k)}
              >
                <Text style={[styles.chipText, goal === g.k && styles.chipTextActive]}>{g.t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }
    if (step === 1) {
      return (
        <View style={styles.card}>
          <Text style={styles.stepTitle}>Параметры</Text>
          <Text style={styles.stepSubtitle}>Рост и вес нужны для расчёта таргетов</Text>
          <Text style={styles.label}>Рост (см)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholder="Например, 180"
            placeholderTextColor="#94A3B8"
          />
          <Text style={styles.label}>Вес (кг)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="Например, 75"
            placeholderTextColor="#94A3B8"
          />
        </View>
      );
    }
    return (
      <View style={styles.card}>
        <Text style={styles.stepTitle}>Активность</Text>
        <Text style={styles.stepSubtitle}>Сколько вы двигаетесь в обычный день</Text>
        <View style={styles.rowBtns}>
          {[{ k: 'low', t: 'Низкая' }, { k: 'normal', t: 'Средняя' }, { k: 'high', t: 'Высокая' }].map((a) => (
            <TouchableOpacity
              key={a.k}
              style={[styles.chip, activity === a.k && styles.chipActive]}
              onPress={() => setActivity(a.k)}
            >
              <Text style={[styles.chipText, activity === a.k && styles.chipTextActive]}>{a.t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const stepTitle = step === 0 ? 'Цель' : step === 1 ? 'Параметры' : 'Активность';

  return (
    <View style={styles.container}>
      <View style={styles.backgroundTop} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.header, { opacity: fade }]}> 
            <Text style={styles.logoText}>FitPilot</Text>
            <Text style={styles.logoSubtitle}>Настроим план под вас</Text>
          </Animated.View>

          <Text style={styles.progressText}>Шаг {step + 1} из 3 · {stepTitle}</Text>

          {renderStep()}

          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[styles.navBtn, step === 0 && { opacity: 0.3 }]}
              onPress={prev}
              disabled={step === 0 || saving}
            >
              <Text style={styles.navText}>Назад</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navBtnPrimary, saving && { opacity: 0.6 }]}
              onPress={next}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.navTextPrimary}>{step === 2 ? 'Завершить' : 'Далее'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  flex: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  backgroundTop: {
    position: 'absolute',
    top: -80,
    left: -40,
    right: -40,
    height: 260,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    backgroundColor: '#1D4ED8',
    opacity: 0.9,
  },
  header: { marginTop: 72, paddingHorizontal: 24 },
  logoText: { fontSize: 34, fontWeight: '800', letterSpacing: 1, color: '#EEF2FF' },
  logoSubtitle: { marginTop: 6, fontSize: 15, color: 'rgba(226,232,240,0.9)' },
  progressText: { marginTop: 16, paddingHorizontal: 24, color: '#9CA3AF', fontSize: 13 },
  card: {
    marginTop: 20,
    marginHorizontal: 24,
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  stepTitle: { color: '#E5E7EB', fontSize: 20, fontWeight: '700' },
  stepSubtitle: { color: '#9CA3AF', marginTop: 6, fontSize: 13 },
  label: { color: '#CBD5E1', fontWeight: '600', marginTop: 14, marginBottom: 6 },
  input: {
    backgroundColor: '#020617',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#E5E7EB',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  rowBtns: { flexDirection: 'row', gap: 8, marginTop: 14 },
  chip: {
    backgroundColor: '#020617',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  chipActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  chipText: { color: '#E5E7EB' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  footerRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, marginTop: 24 },
  navBtn: {
    flex: 1,
    backgroundColor: '#020617',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  navBtnPrimary: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  navText: { color: '#E5E7EB', fontWeight: '600' },
  navTextPrimary: { color: '#fff', fontWeight: '700' },
});
