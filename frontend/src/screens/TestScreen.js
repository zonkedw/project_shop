import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { spacing, borderRadius } from '../theme/spacing';
import { createCommonStyles } from '../theme/styles';

export default function TestScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const commonStyles = createCommonStyles(theme);

  return (
    <ScrollView style={[commonStyles.container]}>
      <LinearGradient
        colors={theme.gradients.primary}
        style={styles.hero}
      >
        <View style={[styles.heroContent, isDesktop && styles.heroContentDesktop]}>
          <Text style={styles.heroTitle}>✅ Обновленный дизайн</Text>
          <Text style={styles.heroSubtitle}>
            Тема: {isDark ? 'Тёмная 🌙' : 'Светлая ☀️'}
          </Text>
          <Text style={styles.heroDescription}>
            Улучшенная цветовая схема, модульность и адаптивность
          </Text>
        </View>
      </LinearGradient>

      <View style={[commonStyles.section, isDesktop && commonStyles.sectionDesktop]}>
        <View style={[commonStyles.contentContainer, isDesktop && commonStyles.contentContainerDesktop]}>
          
          {/* Демо улучшений */}
          <Text style={commonStyles.title}>Что нового?</Text>
          
          <View style={[commonStyles.card, isDesktop && commonStyles.cardDesktop]}>
            <Text style={[commonStyles.body, commonStyles.mb3]}>
              🎨 <Text style={{ fontWeight: '700' }}>Улучшенная цветовая схема</Text>
            </Text>
            <Text style={commonStyles.bodySecondary}>
              Темная и светлая темы теперь более контрастны и приятны для глаз
            </Text>
          </View>

          <View style={[commonStyles.card, isDesktop && commonStyles.cardDesktop]}>
            <Text style={[commonStyles.body, commonStyles.mb3]}>
              📐 <Text style={{ fontWeight: '700' }}>Модульная система отступов</Text>
            </Text>
            <Text style={commonStyles.bodySecondary}>
              Модули больше не "слипаются" - правильные отступы на всех устройствах
            </Text>
          </View>

          <View style={[commonStyles.card, isDesktop && commonStyles.cardDesktop]}>
            <Text style={[commonStyles.body, commonStyles.mb3]}>
              💻 <Text style={{ fontWeight: '700' }}>Адаптивность для ПК</Text>
            </Text>
            <Text style={commonStyles.bodySecondary}>
              Улучшенный layout для больших экранов с максимальной шириной контента
            </Text>
          </View>

          <View style={[commonStyles.card, isDesktop && commonStyles.cardDesktop]}>
            <Text style={[commonStyles.body, commonStyles.mb3]}>
              🔘 <Text style={{ fontWeight: '700' }}>Мягкие кнопки</Text>
            </Text>
            <Text style={commonStyles.bodySecondary}>
              Кнопки менее контрастные, с плавными тенями и мягкими цветами
            </Text>
          </View>

          <View style={commonStyles.divider} />

          <Text style={[commonStyles.title, commonStyles.mt6]}>Демо кнопок</Text>
          
          {/* Новые мягкие кнопки */}
          <TouchableOpacity
            style={[commonStyles.button, commonStyles.buttonPrimary, commonStyles.mb4]}
            onPress={() => navigation.navigate('Landing')}
          >
            <Text style={commonStyles.buttonText}>Перейти на Landing</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.button, commonStyles.buttonSecondary, commonStyles.mb4]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[commonStyles.buttonText, commonStyles.buttonTextSecondary]}>
              Войти
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.button, commonStyles.buttonSecondary]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={[commonStyles.buttonText, commonStyles.buttonTextSecondary]}>
              Регистрация
            </Text>
          </TouchableOpacity>

          {/* Информация */}
          <View style={[styles.infoCard, { 
            backgroundColor: isDark ? theme.glass.weak : theme.glass.medium,
            borderColor: theme.borderLight 
          }]}>
            <Text style={[styles.infoText, { color: theme.textMuted }]}>
              Ширина экрана: {Math.round(width)}px
            </Text>
            <Text style={[styles.infoText, { color: theme.textMuted }]}>
              Режим: {isDesktop ? 'Desktop' : 'Mobile/Tablet'}
            </Text>
          </View>

        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 60,
    paddingBottom: 48,
    paddingHorizontal: spacing.containerPadding,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: 600,
  },
  heroContentDesktop: {
    maxWidth: 800,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: spacing.md,
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  heroSubtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  infoCard: {
    marginTop: spacing.xxxl,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: spacing.xs,
  },
});
