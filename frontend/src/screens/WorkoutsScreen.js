import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Card, Button, Snackbar } from 'react-native-paper';
import { workoutsAPI, aiAPI } from '../services/api';

export default function WorkoutsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [snack, setSnack] = useState({ visible: false, text: '' });

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fade]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await workoutsAPI
        .getSessions({ start_date: today, end_date: today })
        .catch(() => ({ data: { sessions: [] } }));
      setSessions(res.data.sessions || []);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const startWorkout = async () => {
    try {
      setLoading(true);
      // Сгенерировать простую тренировку и применить её как сессию
      const planRes = await aiAPI.workout({ location: 'gym', duration_min: 45 });
      await aiAPI.applyWorkout(planRes.data);
      await loadSessions();
      setSnack({ visible: true, text: 'Тренировка создана' });
    } catch (e) {
      // можно показать Alert, если нужно
      setSnack({ visible: true, text: 'Ошибка создания тренировки' });
    } finally {
      setLoading(false);
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
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Animated.View style={[styles.header, { opacity: fade }]}> 
        <Text style={styles.title}>Тренировки</Text>
        <Text style={styles.subtitle}>Сегодняшние сессии</Text>
      </Animated.View>

      <View style={styles.actionsRow}>
        <Button mode="contained" style={styles.actionBtn} onPress={() => navigation.navigate('WorkoutBuilder')}>Конструктор</Button>
        <Button mode="outlined" style={styles.actionBtn} onPress={() => navigation.navigate('ExerciseLibrary')}>Упражнения</Button>
      </View>

      {sessions.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Ещё нет записанных тренировок за сегодня</Text>
        </View>
      ) : (
        sessions.map((s, idx) => (
          <Card key={idx} style={styles.sessionItem} onPress={() => navigation.navigate('WorkoutDetails', { id: s.session_id })}>
            <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sessionTitle}>{s.notes || 'Тренировка'}</Text>
                <Text style={styles.sessionMeta}>{(s.sets?.length || s.total_sets || 0)} подходов</Text>
              </View>
              <Text style={styles.sessionTime}>{(s.duration_min || 0)} мин</Text>
            </Card.Content>
          </Card>
        ))
      )}

      <Button mode="contained" style={styles.startBtn} onPress={startWorkout}>Начать тренировку</Button>
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
  actionsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 8 },
  actionBtn: { flex: 1, borderRadius: 12 },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  secondaryText: { color: '#E5E7EB', fontWeight: '600', fontSize: 13 },
  emptyBox: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)'
  },
  emptyText: { color: '#94A3B8', textAlign: 'center' },
  sessionItem: {
    marginHorizontal: 16,
    marginTop: 10,
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
  sessionTitle: { color: '#E5E7EB', fontWeight: '700' },
  sessionMeta: { color: '#94A3B8', marginTop: 2, fontSize: 12 },
  sessionTime: { color: '#E5E7EB', fontWeight: '700' },
  startBtn: { marginHorizontal: 16, marginVertical: 18, borderRadius: 14 },
  startText: { color: '#fff', fontWeight: '700' },
});
