import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  useWindowDimensions,
  Animated as RNAnimated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { workoutsAPI, extractData } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import AnimatedCard from '../components/AnimatedCard';

export default function WorkoutDetailsScreen({ route, navigation }) {
  const { sessionId } = route.params || {};
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  const fade = useRef(new RNAnimated.Value(0)).current;
  const slide = useRef(new RNAnimated.Value(30)).current;

  useEffect(() => {
    if (!sessionId) {
      setError('ID тренировки не указан');
      setLoading(false);
      return;
    }

    loadSession();
  }, [sessionId]);

  useEffect(() => {
    if (!loading) {
      RNAnimated.parallel([
        RNAnimated.timing(fade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        RNAnimated.spring(slide, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

  const loadSession = async () => {
    try {
      const res = await workoutsAPI.getSession(sessionId);
      const data = extractData(res);
      setSession(data);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки тренировки');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <ActivityIndicator color={theme.primary} size="large" />
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>
          Загрузка тренировки...
        </Text>
      </View>
    );
  }

  if (error || !session) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.bg }]}>
        <Text style={[styles.errorText, { color: theme.error }]}>
          {error || 'Сессия не найдена'}
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const groupedSets = {};
  (session.sets || []).forEach((set) => {
    const exerciseName = set.exercise_name || 'Упражнение';
    if (!groupedSets[exerciseName]) {
      groupedSets[exerciseName] = [];
    }
    groupedSets[exerciseName].push(set);
  });

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.bg }]}
      showsVerticalScrollIndicator={false}
    >
      <RNAnimated.View style={[{ opacity: fade, transform: [{ translateY: slide }] }]}>
        <LinearGradient
          colors={theme.gradients.primary}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity 
            style={styles.backButtonHero}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonHeroText}>← Назад</Text>
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              {session.notes || 'Тренировка'}
            </Text>
            <View style={styles.heroMeta}>
              <View style={styles.heroMetaItem}>
                <Text style={styles.heroMetaLabel}>Дата</Text>
                <Text style={styles.heroMetaValue}>
                  {new Date(session.session_date).toLocaleDateString('ru-RU')}
                </Text>
              </View>
              <View style={styles.heroMetaDivider} />
              <View style={styles.heroMetaItem}>
                <Text style={styles.heroMetaLabel}>Длительность</Text>
                <Text style={styles.heroMetaValue}>{session.duration_min || 0} мин</Text>
              </View>
              {session.total_volume_kg > 0 && (
                <>
                  <View style={styles.heroMetaDivider} />
                  <View style={styles.heroMetaItem}>
                    <Text style={styles.heroMetaLabel}>Объём</Text>
                    <Text style={styles.heroMetaValue}>
                      {Math.round(session.total_volume_kg)} кг
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </LinearGradient>
      </RNAnimated.View>

      <View style={[styles.content, isDesktop && styles.contentDesktop]}>
        {Object.keys(groupedSets).length === 0 ? (
          <AnimatedCard index={0}>
            <View style={[styles.emptyCard, { 
              backgroundColor: isDark ? theme.surface : theme.surface,
              borderColor: theme.borderLight 
            }]}>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                Нет упражнений в этой тренировке
              </Text>
            </View>
          </AnimatedCard>
        ) : (
          Object.keys(groupedSets).map((exerciseName, index) => (
            <AnimatedCard key={exerciseName} index={index} style={styles.exerciseSection}>
              <View style={[styles.exerciseCard, { 
                backgroundColor: isDark ? theme.surface : theme.surface,
                borderColor: theme.borderLight 
              }]}>
                <Text style={[styles.exerciseName, { color: theme.text }]}>
                  {exerciseName}
                </Text>
                
                <View style={styles.setsContainer}>
                  {groupedSets[exerciseName].map((set, idx) => (
                    <View 
                      key={set.set_id} 
                      style={[
                        styles.setRow,
                        { 
                          backgroundColor: isDark ? theme.glass.weak : theme.bgSecondary,
                          borderColor: theme.border 
                        }
                      ]}
                    >
                      <View style={[styles.setNumber, { backgroundColor: theme.primary }]}>
                        <Text style={styles.setNumberText}>{set.set_number || idx + 1}</Text>
                      </View>
                      
                      <View style={styles.setInfo}>
                        {set.reps && (
                          <View style={styles.setInfoItem}>
                            <Text style={[styles.setInfoLabel, { color: theme.textMuted }]}>
                              Повторений
                            </Text>
                            <Text style={[styles.setInfoValue, { color: theme.text }]}>
                              {set.reps}
                            </Text>
                          </View>
                        )}
                        {set.weight_kg && (
                          <View style={styles.setInfoItem}>
                            <Text style={[styles.setInfoLabel, { color: theme.textMuted }]}>
                              Вес
                            </Text>
                            <Text style={[styles.setInfoValue, { color: theme.text }]}>
                              {set.weight_kg} кг
                            </Text>
                          </View>
                        )}
                        {set.duration_sec && (
                          <View style={styles.setInfoItem}>
                            <Text style={[styles.setInfoLabel, { color: theme.textMuted }]}>
                              Время
                            </Text>
                            <Text style={[styles.setInfoValue, { color: theme.text }]}>
                              {set.duration_sec} сек
                            </Text>
                          </View>
                        )}
                        {set.rest_sec && (
                          <View style={styles.setInfoItem}>
                            <Text style={[styles.setInfoLabel, { color: theme.textMuted }]}>
                              Отдых
                            </Text>
                            <Text style={[styles.setInfoValue, { color: theme.text }]}>
                              {set.rest_sec} сек
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </AnimatedCard>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  hero: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 28,
  },
  backButtonHero: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonHeroText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 24,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  heroMeta: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    flexWrap: 'wrap',
    gap: 12,
  },
  heroMetaItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  heroMetaDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroMetaLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    fontWeight: '600',
  },
  heroMetaValue: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  content: {
    padding: 20,
  },
  contentDesktop: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  exerciseSection: {
    marginBottom: 20,
  },
  exerciseCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  exerciseName: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  setsContainer: {
    gap: 12,
  },
  setRow: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  setNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  setNumberText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  setInfo: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  setInfoItem: {
    flex: 1,
    minWidth: 80,
  },
  setInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  setInfoValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyCard: {
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
