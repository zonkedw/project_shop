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
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { aiAPI, extractData } from '../services/api';
import AnimatedCard from '../components/AnimatedCard';
import { useTheme } from '../hooks/useTheme';

export default function ChatScreen({ route }) {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;
  
  const [messages, setMessages] = useState([
    {
      id: 'sys1',
      role: 'assistant',
      text: 'Привет! 👋 Я AI-ассистент FitPilot. Могу помочь с вопросами о фитнесе, питании, тренировках, а также ответить на любые другие ваши вопросы. Что вас интересует?',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [lastPlan, setLastPlan] = useState(null);
  const [lastWorkout, setLastWorkout] = useState(null);
  const listRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

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

  const send = async (text, isRetry = false) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    
    setInput('');
    setError(null);
    
    const userMsg = { id: String(Date.now()), role: 'user', text: msg };
    if (!isRetry) {
      setMessages((m) => [...m, userMsg]);
    }
    setSending(true);

    // Очищаем предыдущий таймер печатания
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const thinkingId = String(Date.now() + 1);
    const thinkingMessages = [
      '🤔 Думаю...',
      '🧠 Анализирую данные...',
      '✨ Готовлю ответ...',
      '📊 Обрабатываю информацию...'
    ];
    const thinkingText = thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];
    setMessages((m) => [...m, { id: thinkingId, role: 'assistant', text: thinkingText, isLoading: true }]);

    try {
      const res = await aiAPI.chat(msg);
      const data = extractData(res) || res.data || {};
      const reply = data.reply || 'Не удалось получить ответ';

      // Сбрасываем счётчик попыток при успешном ответе
      setRetryCount(0);

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
      console.error('AI Chat Error:', e);
      
      const errorMsg = e.response?.status === 429 
        ? '⚠️ Слишком много запросов. Попробуйте через несколько секунд.'
        : e.response?.status === 500
        ? '❌ Ошибка сервера. Попробую ещё раз...'
        : e.message || '❌ Ошибка AI. Проверьте подключение к интернету.';

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
            canRetry: true,
            retryMessage: msg,
          },
        ];
      });

      setError(errorMsg);
      
      // Автоматический retry при ошибке сервера (максимум 2 попытки)
      if (e.response?.status === 500 && retryCount < 2) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          send(msg, true);
        }, 2000); // Повторная попытка через 2 секунды
      }
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
      const data = extractData(res) || res.data || {};
      setMessages((msgs) => [
        ...msgs,
        {
          id: String(Date.now() + 2),
          role: 'assistant',
          text: `Готово: ${data.message || res.message || 'Рацион добавлен'} на ${data.date || lastPlan.date}`,
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
      const plan = extractData(res) || res.data;
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
      const plan = extractData(res) || res.data;
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
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* AI Header */}
      <LinearGradient colors={theme.gradients.primary} style={styles.header}>
        <View style={[
          styles.headerContent,
          isDesktop && styles.headerContentDesktop
        ]}>
          <View style={styles.aiIconContainer}>
            <Text style={styles.aiIcon}>🤖</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>AI-Ассистент FitPilot</Text>
            <Text style={styles.headerSubtitle}>
              Ваш умный помощник в фитнесе, питании и не только
            </Text>
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
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerContentDesktop: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  aiIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  aiIcon: {
    fontSize: 32,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 20,
    fontWeight: '500',
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 18,
    borderRadius: 24,
  },
  userBubble: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 6,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  assistantBubble: {
    backgroundColor: 'rgba(31, 32, 71, 0.7)',
    borderBottomLeftRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  errorBubble: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 25,
    color: '#F8FAFC',
    fontWeight: '500',
  },
  userBubbleText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorText: {
    color: '#FCA5A5',
    fontWeight: '600',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    marginLeft: 10,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
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
    color: '#64748B',
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
    color: '#0F172A',
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
    backgroundColor: '#6366F1',
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
    backgroundColor: 'rgba(31, 32, 71, 0.6)',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(99, 102, 241, 0.25)',
    alignItems: 'flex-end',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 35, 0.8)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 14,
    maxHeight: 120,
    fontSize: 16,
    color: '#F8FAFC',
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    fontWeight: '500',
  },
  sendButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },
  typingCursor: {
    color: '#818CF8',
    fontWeight: 'bold',
    fontSize: 20,
  },
});
