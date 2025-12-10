import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { aiAPI } from '../services/api';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import AnimatedCard from '../components/AnimatedCard';
import { colors } from '../theme/colors';

export default function ChatScreen({ route }) {
  const [messages, setMessages] = useState([
    {
      id: 'sys1',
      role: 'assistant',
      text: 'Привет! Я AI-ассистент FitPilot. Я могу помочь вам с вопросами о фитнесе, питании и тренировках, а также ответить на любые другие ваши вопросы. Задайте вопрос или выберите действие ниже.',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [lastPlan, setLastPlan] = useState(null);
  const [lastWorkout, setLastWorkout] = useState(null);
  const listRef = useRef(null);
  const [snack, setSnack] = useState({ visible: false, text: '' });
  const typingTimeoutRef = useRef(null);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    scrollToEnd();
  }, [messages]);

  // Анимация мигания курсора
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const didAutoRef = useRef(false);
  useEffect(() => {
    const init = route?.params?.initialMessage;
    if (init && !didAutoRef.current) {
      didAutoRef.current = true;
      send(String(init));
    }
  }, [route?.params?.initialMessage]);

  const scrollToEnd = () => setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 50);

  // Функция для анимации печатания текста
  const typeText = (messageId, fullText, speed = 30) => {
    let currentIndex = 0;
    const fullTextStr = String(fullText || '');
    
    const typeChar = () => {
      if (currentIndex < fullTextStr.length) {
        const partialText = fullTextStr.substring(0, currentIndex + 1);
        setMessages((m) => {
          const updated = m.map((msg) => 
            msg.id === messageId 
              ? { ...msg, text: partialText, isLoading: true }
              : msg
          );
          return updated;
        });
        currentIndex++;
        typingTimeoutRef.current = setTimeout(typeChar, speed);
      } else {
        // Завершили печатание
        setMessages((m) => {
          const updated = m.map((msg) => 
            msg.id === messageId 
              ? { ...msg, isLoading: false }
              : msg
          );
          return updated;
        });
      }
    };
    
    typeChar();
  };

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput('');
    const userMsg = { id: String(Date.now()), role: 'user', text: msg };
    setMessages((m) => [...m, userMsg]);
    setSending(true);

    // Очищаем предыдущий таймер печатания
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const thinkingId = String(Date.now() + 1);
    const thinkingMessages = ['Думаю...', 'Анализирую...', 'Обрабатываю запрос...'];
    const thinkingText = thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];
    setMessages((m) => [...m, { id: thinkingId, role: 'assistant', text: thinkingText, isLoading: true }]);

    try {
      const res = await aiAPI.chat(msg);
      const reply = res.data?.reply || 'Не удалось получить ответ';

      // Удаляем сообщение "Думаю..." и добавляем новое с анимацией печатания
      const newMessageId = String(Date.now() + 2);
      setMessages((m) => {
        const filtered = m.filter((msg) => msg.id !== thinkingId);
        const newMessage = { id: newMessageId, role: 'assistant', text: '', isLoading: true };
        return [...filtered, newMessage];
      });

      // Запускаем анимацию печатания
      setTimeout(() => {
        typeText(newMessageId, reply, 20); // 20ms на символ для плавности
      }, 100);
    } catch (e) {
      const errorMsg = e.message || 'Ошибка AI. Попробуйте позже.';

      setMessages((m) => {
        const filtered = m.filter((msg) => msg.id !== thinkingId);
        return [
          ...filtered,
          {
            id: String(Date.now() + 2),
            role: 'assistant',
            text: errorMsg,
            isError: true,
            isLoading: false,
          },
        ];
      });

      setSnack({ visible: true, text: errorMsg });
    } finally {
      setSending(false);
    }
  };

  const applyPlan = async () => {
    if (!lastPlan) {
      setMessages((msgs) => [
        ...msgs,
        { id: String(Date.now() + 1), role: 'assistant', text: 'Сначала сгенерируйте рацион.' },
      ]);
      return;
    }
    setSending(true);
    try {
      const res = await aiAPI.applyMealplan(lastPlan, lastPlan.date);
      setMessages((msgs) => [
        ...msgs,
        {
          id: String(Date.now() + 2),
          role: 'assistant',
          text: `Готово: ${res.data?.message || 'Рацион добавлен'} на ${res.data?.date || lastPlan.date}`,
        },
      ]);
      setSnack({ visible: true, text: 'Рацион добавлен в дневник' });
    } catch (e) {
      setMessages((msgs) => [
        ...msgs,
        { id: String(Date.now() + 2), role: 'assistant', text: 'Не удалось добавить рацион в дневник.' },
      ]);
      setSnack({ visible: true, text: 'Ошибка добавления рациона' });
    } finally {
      setSending(false);
    }
  };

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
      if (plan.target_macros)
        lines.push(
          `БЖУ: Б ${plan.target_macros.protein || '-'} г • Ж ${plan.target_macros.fats || '-'} г • У ${plan.target_macros.carbs || '-'} г`
        );
      lines.push('План создан на основе ваших целей и профиля активности.');
      if (Array.isArray(plan.plan)) {
        plan.plan.forEach((m, idx) => {
          lines.push(`\n${idx + 1}. ${m.title} — ${m.total_calories || '-'} ккал`);
          (m.items || []).forEach((it) => {
            lines.push(`   • ${it.name} — ${it.grams || '-'} г (${it.calories || '-'} ккал)`);
          });
        });
      }
      setMessages((msgs) => [
        ...msgs,
        { id: String(Date.now() + 1), role: 'assistant', text: lines.join('\n') },
      ]);
    } catch (e) {
      setMessages((msgs) => [
        ...msgs,
        { id: String(Date.now() + 1), role: 'assistant', text: 'Не удалось сгенерировать рацион.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  const genWorkout = async () => {
    setSending(true);
    setMessages((m) => [...m, { id: String(Date.now()), role: 'user', text: 'Сгенерируй тренировку' }]);
    try {
      const res = await aiAPI.workout({ location: 'gym', duration_min: 45 });
      const plan = res.data;
      setLastWorkout(plan);
      const lines = [];
      lines.push(`Тренировка: ${plan.title || 'Силовая'}`);
      lines.push(`Дата: ${plan.date}`);
      if (Array.isArray(plan.sets)) {
        lines.push(`Сетов: ${plan.sets.length}`);
        plan.sets.forEach((s) => {
          const ex = s.exercise?.name || 'Упражнение';
          lines.push(`• ${ex} — сет ${s.set_number}: ${s.reps || '-'} повторов${s.weight_kg ? ` с ${s.weight_kg} кг` : ''}`);
        });
      }
      setMessages((msgs) => [
        ...msgs,
        { id: String(Date.now() + 1), role: 'assistant', text: lines.join('\n') },
      ]);
    } catch (e) {
      setMessages((msgs) => [
        ...msgs,
        { id: String(Date.now() + 1), role: 'assistant', text: 'Не удалось сгенерировать тренировку.' },
      ]);
    } finally {
      setSending(false);
    }
  };

  const quickActions = [
    { icon: '🍽️', title: 'Сгенерировать рацион', action: genMealplan },
    { icon: '🏋️', title: 'Создать тренировку', action: genWorkout },
    { icon: '📊', title: 'Итоги на сегодня', action: () => send('Итоги на сегодня') },
    { icon: '💡', title: 'Совет по тренировке', action: () => send('Совет по тренировке сегодня') },
  ];

  const renderItem = ({ item }) => {
    if (item.isLoading && !item.text) {
      // Показываем индикатор загрузки только если текста еще нет
      return (
        <View style={[styles.messageRow, styles.assistantMessage]}>
          <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>AI</Text>
          </LinearGradient>
          <View style={styles.messageBubble}>
            <ActivityIndicator size="small" color="#667EEA" />
            <Text style={[styles.messageText, { marginLeft: 8, fontStyle: 'italic' }]}>Думаю...</Text>
          </View>
        </View>
      );
    }

    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.userMessage : styles.assistantMessage]}>
        {!isUser && (
          <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>AI</Text>
          </LinearGradient>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
            item.isError && styles.errorBubble,
          ]}
        >
          <Text style={[
            styles.messageText,
            isUser && styles.userBubbleText,
            item.isError && styles.errorText
          ]}>
            {item.text}
            {item.isLoading && item.text && cursorVisible && (
              <Text style={styles.typingCursor}>|</Text>
            )}
          </Text>
        </View>
        {isUser && <View style={styles.userAvatar} />}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* AI Header */}
      <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.aiIconContainer}>
            <Text style={styles.aiIcon}>🤖</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>AI-Помощник FitPilot</Text>
            <Text style={styles.headerSubtitle}>Персональный фитнес-ассистент с искусственным интеллектом</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Быстрые действия</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionButton}
                onPress={action.action}
                disabled={sending}
              >
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Apply buttons */}
      {lastPlan && (
        <View style={styles.applyContainer}>
          <TouchableOpacity style={styles.applyButton} onPress={applyPlan} disabled={sending}>
            <Text style={styles.applyButtonText}>Применить рацион в дневник</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Задайте вопрос AI-помощнику..."
          placeholderTextColor="#94A3B8"
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          editable={!sending}
        />
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={() => send()}
          disabled={sending || !input.trim()}
        >
          {sending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.sendButtonText}>→</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  aiIcon: {
    fontSize: 32,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  messagesList: {
    padding: 20,
    paddingBottom: 100,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  aiBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 16,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorBubble: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.textDark,
  },
  userBubbleText: {
    color: '#FFFFFF',
  },
  errorText: {
    color: '#DC2626',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  quickActionsScroll: {
    flexDirection: 'row',
  },
  quickActionButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDark,
    textAlign: 'center',
  },
  applyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  applyButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
    color: colors.textDark,
    marginRight: 12,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  typingCursor: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
});
