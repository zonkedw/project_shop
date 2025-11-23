import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { TextInput as PaperTextInput, Button, Snackbar } from 'react-native-paper';
import { usersAPI } from '../services/api';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ visible: false, text: '' });

  const [username, setUsername] = useState('');
  const [goal, setGoal] = useState('maintain'); // lose | gain | maintain
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('normal'); // low | normal | high

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fade]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getProfile();
      const p = res.data || {};
      setUsername(p.username || '');
      setGoal(p.goal || 'maintain');
      setHeight(p.height_cm ? String(p.height_cm) : '');
      setWeight(p.weight_kg ? String(p.weight_kg) : '');
      setActivity(p.activity_level || 'normal');
    } catch (e) {
      // возможно, профиль пуст — это ок для первой настройки
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!username.trim()) return Alert.alert('Ошибка', 'Введите имя пользователя');
    const h = parseInt(height || '0', 10);
    const w = parseFloat(weight || '0');
    if (h <= 0 || w <= 0) return Alert.alert('Ошибка', 'Укажите рост и вес');

    setSaving(true);
    try {
      await usersAPI.updateProfile({
        username: username.trim(),
        goal,
        height_cm: h,
        weight_kg: w,
        activity_level: activity,
      });
      setSnack({ visible: true, text: 'Профиль сохранён' });
    } catch (e) {
      setSnack({ visible: true, text: e.response?.data?.error || 'Не удалось сохранить профиль' });
    } finally {
      setSaving(false);
    }
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
    <ScrollView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fade }]}> 
        <Text style={styles.title}>Профиль</Text>
        <Text style={styles.subtitle}>Цели и параметры</Text>
      </Animated.View>

      <View style={styles.card}>
        <Text style={styles.label}>Имя пользователя</Text>
        <PaperTextInput
          mode="outlined"
          value={username}
          onChangeText={setUsername}
          placeholder="Введите имя"
          outlineStyle={{ borderRadius: 12 }}
          theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
          style={{ backgroundColor: 'transparent' }}
        />

        <Text style={styles.label}>Цель</Text>
        <View style={styles.rowBtns}>
          {[
            { k: 'lose', t: 'Похудение' },
            { k: 'maintain', t: 'Поддержание' },
            { k: 'gain', t: 'Набор' },
          ].map((g) => (
            <TouchableOpacity
              key={g.k}
              style={[styles.chip, goal === g.k && styles.chipActive]}
              onPress={() => setGoal(g.k)}
            >
              <Text style={[styles.chipText, goal === g.k && styles.chipTextActive]}>{g.t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Активность</Text>
        <View style={styles.rowBtns}>
          {[
            { k: 'low', t: 'Низкая' },
            { k: 'normal', t: 'Средняя' },
            { k: 'high', t: 'Высокая' },
          ].map((a) => (
            <TouchableOpacity
              key={a.k}
              style={[styles.chip, activity === a.k && styles.chipActive]}
              onPress={() => setActivity(a.k)}
            >
              <Text style={[styles.chipText, activity === a.k && styles.chipTextActive]}>{a.t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Рост (см)</Text>
        <PaperTextInput
          mode="outlined"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
          placeholder="Например, 180"
          outlineStyle={{ borderRadius: 12 }}
          theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
          style={{ backgroundColor: 'transparent' }}
        />

        <Text style={styles.label}>Вес (кг)</Text>
        <PaperTextInput
          mode="outlined"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          placeholder="Например, 75"
          outlineStyle={{ borderRadius: 12 }}
          theme={{ colors: { onSurfaceVariant: '#94A3B8' } }}
          style={{ backgroundColor: 'transparent' }}
        />
      </View>

      <Button mode="contained" style={styles.saveBtn} onPress={save} disabled={saving}>
        {saving ? 'Сохранение…' : 'Сохранить'}
      </Button>
    </ScrollView>
    <Snackbar visible={snack.visible} onDismiss={() => setSnack({ visible: false, text: '' })} duration={2500}>
      {snack.text}
    </Snackbar>
  </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B1220' },
  header: { paddingTop: 20, paddingHorizontal: 16, paddingBottom: 8 },
  title: { color: '#E5E7EB', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#94A3B8', marginTop: 4, fontSize: 13 },
  card: {
    margin: 16,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)'
  },
  label: { color: '#CBD5E1', fontWeight: '600', marginTop: 10, marginBottom: 6 },
  input: {
    backgroundColor: '#0B1220',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#E5E7EB',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)'
  },
  rowBtns: { flexDirection: 'row', gap: 8 },
  chip: {
    backgroundColor: '#0B1220',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)'
  },
  chipActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  chipText: { color: '#E5E7EB' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  saveBtn: {
    marginHorizontal: 16,
    marginVertical: 18,
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    alignItems: 'center',
    padding: 14,
  },
  saveText: { color: '#fff', fontWeight: '700' },
});
