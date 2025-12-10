import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedCard from '../components/AnimatedCard';
import { colors } from '../theme/colors';

export default function AboutScreen({ navigation }) {
  const team = [
    { name: 'Качкалов Максим Олегович', role: 'Backend разработка' },
    { name: 'Чернышова Варвара Юрьевна', role: 'Frontend разработка' },
    { name: 'Шпитонков Константин Александрович', role: 'Дизайн и UX' },
  ];

  const technologies = [
    { name: 'React Native + Expo', description: 'Кроссплатформенная разработка мобильных приложений' },
    { name: 'Node.js + Express', description: 'Серверная часть с RESTful API' },
    { name: 'PostgreSQL', description: 'Надёжная реляционная база данных' },
    { name: 'AI Integration', description: 'Интеграция с внешними AI API для умных рекомендаций' },
    { name: 'JWT Authentication', description: 'Безопасная аутентификация пользователей' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient
        colors={['#667EEA', '#764BA2']}
        style={styles.hero}
      >
        <Text style={styles.heroTitle}>О проекте FitPilot</Text>
        <Text style={styles.heroSubtitle}>
          Современная платформа для управления фитнесом с искусственным интеллектом
        </Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Mission */}
        <AnimatedCard index={0} style={styles.card}>
          <Text style={styles.cardTitle}>Наша миссия</Text>
          <Text style={styles.cardText}>
            FitPilot создан для того, чтобы сделать фитнес доступным и персонализированным для каждого. 
            Используя передовые технологии искусственного интеллекта, мы помогаем пользователям достигать 
            своих целей быстрее и эффективнее.
          </Text>
        </AnimatedCard>

        {/* AI Focus */}
        <AnimatedCard index={1} style={styles.card}>
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            style={styles.aiCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.aiIcon}>🤖</Text>
            <Text style={styles.aiTitle}>Искусственный интеллект</Text>
            <Text style={styles.aiText}>
              Главное отличие FitPilot - это встроенный AI-помощник, который анализирует ваши данные, 
              цели и прогресс, чтобы создавать персональные планы питания и тренировок. 
              Наш AI постоянно учится и адаптируется под ваши потребности.
            </Text>
          </LinearGradient>
        </AnimatedCard>

        {/* Team */}
        <AnimatedCard index={2} style={styles.card}>
          <Text style={styles.cardTitle}>Команда разработки</Text>
          <View style={styles.teamList}>
            {team.map((member, index) => (
              <View key={index} style={styles.teamMember}>
                <View style={styles.teamAvatar}>
                  <Text style={styles.teamAvatarText}>
                    {member.name.split(' ')[1]?.[0] || 'T'}
                  </Text>
                </View>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{member.name}</Text>
                  <Text style={styles.teamRole}>{member.role}</Text>
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.supervisor}>
            Руководитель: Федотов Иван Вячеславович
          </Text>
        </AnimatedCard>

        {/* Technologies */}
        <AnimatedCard index={3} style={styles.card}>
          <Text style={styles.cardTitle}>Технологии</Text>
          <View style={styles.techList}>
            {technologies.map((tech, index) => (
              <View key={index} style={styles.techItem}>
                <Text style={styles.techName}>{tech.name}</Text>
                <Text style={styles.techDescription}>{tech.description}</Text>
              </View>
            ))}
          </View>
        </AnimatedCard>

        {/* Project Info */}
        <AnimatedCard index={4} style={styles.card}>
          <Text style={styles.cardTitle}>Информация о проекте</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Модуль:</Text>
              <Text style={styles.infoValue}>ПМ.09 Проектирование, разработка и оптимизация веб-приложений</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Группа:</Text>
              <Text style={styles.infoValue}>22ИС4-2</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Срок сдачи:</Text>
              <Text style={styles.infoValue}>19 декабря 2025</Text>
            </View>
          </View>
        </AnimatedCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    paddingTop: 100,
    paddingBottom: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 28,
  },
  content: {
    padding: 24,
  },
  card: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 16,
  },
  cardText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 26,
  },
  aiCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  aiIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  aiTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  aiText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 26,
    textAlign: 'center',
  },
  teamList: {
    marginBottom: 24,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  teamAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  teamAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 4,
  },
  teamRole: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  supervisor: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  techList: {
    gap: 16,
  },
  techItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  techName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 8,
  },
  techDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  infoList: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    minWidth: 120,
  },
  infoValue: {
    fontSize: 16,
    color: colors.textSecondary,
    flex: 1,
  },
});

