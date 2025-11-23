import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';
import { aiAPI } from '../services/api';

export default function ChatScreen({ route }) {
  const [messages, setMessages] = useState([
    { id: 'sys1', role: 'assistant', text: 'Я AI‑ассистент FitPilot. Задайте вопрос или нажмите подсказку ниже.' },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [lastPlan, setLastPlan] = useState(null);
  const [lastWorkout, setLastWorkout] = useState(null);
  const listRef = useRef(null);
  const [snack, setSnack] = useState({ visible: false, text: '' });

  useEffect(() => { scrollToEnd(); }, [messages]);

  // Авто‑сообщение из лендинга (однократно)
  const didAutoRef = useRef(false);
  useEffect(() => {
    const init = route?.params?.initialMessage;
    if (init && !didAutoRef.current) {
      didAutoRef.current = true;
      send(String(init));
    }
  }, [route?.params?.initialMessage]);
  const scrollToEnd = () => setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 50);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput('');
    const userMsg = { id: String(Date.now()), role: 'user', text: msg };
    setMessages((m) => [...m, userMsg]);
    setSending(true);
    try {
      const res = await aiAPI.chat(msg);
      const reply = res.data?.reply || 'Не удалось получить ответ';
      setMessages((m) => [...m, { id: String(Date.now()+1), role: 'assistant', text: reply }]);
    } catch (e) {
      setMessages((m) => [...m, { id: String(Date.now()+1), role: 'assistant', text: 'Ошибка AI. Попробуйте позже.' }]);
    } finally {
      setSending(false);
    }
  };

  const applyPlan = async () => {
    if (!lastPlan) {
      setMessages((msgs) => [...msgs, { id: String(Date.now()+1), role: 'assistant', text: 'Сначала сгенерируйте рацион.' }]);
      return;
    }
    setSending(true);
    try {
      const res = await aiAPI.applyMealplan(lastPlan, lastPlan.date);
      setMessages((msgs) => [...msgs, { id: String(Date.now()+2), role: 'assistant', text: `Готово: ${res.data?.message || 'Рацион добавлен'} на ${res.data?.date || lastPlan.date}` }]);
      setSnack({ visible: true, text: 'Рацион добавлен в дневник' });
    } catch (e) {
      setMessages((msgs) => [...msgs, { id: String(Date.now()+2), role: 'assistant', text: 'Не удалось добавить рацион в дневник.' }]);
      setSnack({ visible: true, text: 'Ошибка добавления рациона' });
    } finally {
      setSending(false);
    }
  };

  const quickPrompts = [
    'Итоги на сегодня',
    'Совет по тренировке сегодня',
  ];

  const genMealplan = async () => {
    setSending(true);
    setMessages((m) => [...m, { id: String(Date.now()), role: 'user', text: 'Сгенерируй рацион на день' }]);
    try {
      const res = await aiAPI.mealplan(4);
      const plan = res.data;
      setLastPlan(plan);
      const lines = [];
      lines.push(`Рацион на ${plan.date}`);
      if (plan.target_calories) lines.push(`Цель: ${plan.target_calories} ккал`);
      if (plan.target_macros) lines.push(`БЖУ: Б ${plan.target_macros.protein||'-'} г • Ж ${plan.target_macros.fats||'-'} г • У ${plan.target_macros.carbs||'-'} г`);
      lines.push('План строится исходя из ваших целей и профиля активности, чтобы дневная калорийность была близка к целевой.');
      if (Array.isArray(plan.plan)) {
        plan.plan.forEach((m, idx) => {
          lines.push(`\n${idx+1}. ${m.title} — ${m.total_calories || '-'} ккал`);
          (m.items||[]).forEach(it => {
            lines.push(`   • ${it.name} — ${it.grams||'-'} г (${it.calories||'-'} ккал)`);
          });
        });
      }
      setMessages((msgs) => [...msgs, { id: String(Date.now()+1), role: 'assistant', text: lines.join('\n') }]);
    } catch (e) {
      setMessages((msgs) => [...msgs, { id: String(Date.now()+1), role: 'assistant', text: 'Не удалось сгенерировать рацион.' }]);
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.row, item.role === 'assistant' ? styles.assistant : styles.user]}>
      <Text style={styles.msgText}>{item.text}</Text>
    </View>
  );

  const genWorkout = async () => {
    setSending(true);
    setMessages((m) => [...m, { id: String(Date.now()), role: 'user', text: 'Сгенерируй тренировку' }]);
    try {
      const res = await aiAPI.workout({ location: 'gym', duration_min: 45 });
      const plan = res.data;
      setLastWorkout(plan);
      const lines = [];
      lines.push(`Тренировка: ${plan.title || 'План'}`);
      lines.push(`Дата: ${plan.date}`);
      lines.push('Упражнения и объём подобраны под типичную 45‑минутную сессию с учётом основных мышечных групп.');
      if (Array.isArray(plan.sets)) {
        plan.sets.forEach((s) => {
          lines.push(`• ${s.exercise?.name || 'Упражнение'} — сет ${s.set_number || ''}: ${s.reps || '-'} повторов ${s.weight_kg ? `с ${s.weight_kg} кг` : ''}`);
        });
      }
      setMessages((msgs) => [...msgs, { id: String(Date.now()+1), role: 'assistant', text: lines.join('\n') }]);
    } catch (e) {
      setMessages((msgs) => [...msgs, { id: String(Date.now()+1), role: 'assistant', text: 'Не удалось сгенерировать тренировку.' }]);
    } finally {
      setSending(false);
    }
  };

  const applyWorkout = async () => {
    if (!lastWorkout) {
      setMessages((msgs) => [...msgs, { id: String(Date.now()+1), role: 'assistant', text: 'Сначала сгенерируйте тренировку.' }]);
      return;
    }
    setSending(true);
    try {
      const res = await aiAPI.applyWorkout(lastWorkout);
      setMessages((msgs) => [...msgs, { id: String(Date.now()+2), role: 'assistant', text: `Тренировка добавлена (сеанс ${res.data?.session_id}).` }]);
      setSnack({ visible: true, text: 'Тренировка добавлена' });
    } catch (e) {
      setMessages((msgs) => [...msgs, { id: String(Date.now()+2), role: 'assistant', text: 'Не удалось добавить тренировку.' }]);
      setSnack({ visible: true, text: 'Ошибка добавления тренировки' });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.presetBar}>
        <Button mode="outlined" compact style={{ borderRadius: 999 }} onPress={() => send('Сгенерируй рацион на день под дефицит ~500 ккал с упором на белок')} disabled={sending}>Похудение</Button>
        <Button mode="outlined" compact style={{ borderRadius: 999 }} onPress={() => send('Сгенерируй рацион на день под профицит ~300 ккал для набора')} disabled={sending}>Набор</Button>
        <Button mode="outlined" compact style={{ borderRadius: 999 }} onPress={() => send('Сгенерируй тренировку дома на 45 минут без оборудования')} disabled={sending}>Дом</Button>
        <Button mode="outlined" compact style={{ borderRadius: 999 }} onPress={() => send('Сгенерируй силовую тренировку на 45 минут в зале')} disabled={sending}>Зал</Button>
      </View>

      {(lastPlan || lastWorkout) && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Последние планы</Text>
          {lastPlan && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Рацион</Text>
              <Text style={styles.summaryLine}>{lastPlan.date}</Text>
              {!!lastPlan.target_calories && (
                <Text style={styles.summaryLine}>Цель: {lastPlan.target_calories} ккал</Text>
              )}
              {lastPlan.plan?.length > 0 && (
                <Text style={styles.summaryMuted}>Приёмов: {lastPlan.plan.length}</Text>
              )}
            </View>
          )}
          {lastWorkout && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Тренировка</Text>
              <Text style={styles.summaryLine}>{lastWorkout.date}</Text>
              {!!lastWorkout.title && (
                <Text style={styles.summaryLine}>{lastWorkout.title}</Text>
              )}
              {Array.isArray(lastWorkout.sets) && (
                <Text style={styles.summaryMuted}>Сетов: {lastWorkout.sets.length}</Text>
              )}
            </View>
          )}
        </View>
      )}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      <View style={styles.quickBar}>
        <Button mode="contained" compact style={{ borderRadius: 999 }} onPress={genMealplan} disabled={sending}>Сгенерировать рацион</Button>
        <Button mode="outlined" compact style={{ borderRadius: 999 }} onPress={applyPlan} disabled={sending || !lastPlan}>Добавить в дневник</Button>
        <Button mode="contained" compact style={{ borderRadius: 999 }} onPress={genWorkout} disabled={sending}>Сгенерировать тренировку</Button>
        <Button mode="outlined" compact style={{ borderRadius: 999 }} onPress={applyWorkout} disabled={sending || !lastWorkout}>Добавить тренировку</Button>
        {quickPrompts.map((q) => (
          <Button key={q} mode="text" compact onPress={() => send(q)} disabled={sending}>{q}</Button>
        ))}
      </View>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Напишите сообщение..."
          placeholderTextColor="#94A3B8"
          value={input}
          onChangeText={setInput}
          editable={!sending}
          onSubmitEditing={() => send()}
        />
        <TouchableOpacity style={[styles.sendBtn, sending && { opacity: 0.6 }]} onPress={() => send()} disabled={sending}>
          {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendText}>Отправить</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    <Snackbar visible={snack.visible} onDismiss={() => setSnack({ visible: false, text: '' })} duration={2500}>
      {snack.text}
    </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  list: { padding: 16 },
  row: { borderRadius: 12, padding: 12, marginBottom: 8, maxWidth: '90%' },
  assistant: { backgroundColor: '#0F172A', borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)' },
  user: { backgroundColor: '#1D4ED8', alignSelf: 'flex-end' },
  msgText: { color: '#E5E7EB' },
  inputBar: { flexDirection: 'row', padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: 'rgba(148,163,184,0.2)' },
  input: { flex: 1, backgroundColor: '#0F172A', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#E5E7EB', borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)' },
  sendBtn: { backgroundColor: '#4F46E5', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: '700' },
  quickBar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 12, paddingBottom: 6 },
  quickBtn: { backgroundColor: '#0F172A', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)' },
  quickText: { color: '#E5E7EB', fontSize: 12 },
  presetBar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 12, paddingTop: 8 },
  chip: { backgroundColor: '#111827', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)' },
  chipText: { color: '#CBD5E1', fontSize: 12, fontWeight: '600' },
  summaryBox: { marginTop: 8, paddingHorizontal: 12, gap: 6 },
  summaryTitle: { color: '#CBD5E1', fontSize: 13, fontWeight: '700', marginBottom: 2 },
  summaryCard: { backgroundColor: '#020617', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: 'rgba(148,163,184,0.3)', marginTop: 4 },
  summaryLabel: { color: '#A5B4FC', fontSize: 12, fontWeight: '700' },
  summaryLine: { color: '#E5E7EB', fontSize: 12, marginTop: 2 },
  summaryMuted: { color: '#9CA3AF', fontSize: 11, marginTop: 2 },
});
