import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

const getDarkPalette = () => ({
  card: 'rgba(31, 32, 71, 0.6)',
  border: 'rgba(99, 102, 241, 0.3)',
  text: '#F8FAFC',
  muted: '#CBD5E1',
  primary: '#6366F1',
});

const getLightPalette = () => ({
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  muted: '#64748B',
  primary: '#6366F1',
});

/**
 * Компонент карточки приёма пищи с поддержкой темной/светлой темы
 */
export default function MealCard({ meal, onPress, style }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = isDark ? getDarkPalette() : getLightPalette();

  const getMealTypeLabel = (type) => {
    const labels = {
      breakfast: 'Завтрак',
      lunch: 'Обед',
      dinner: 'Ужин',
      snack: 'Перекус',
    };
    return labels[type] || type;
  };

  const getMealIcon = (type) => {
    const icons = {
      breakfast: '🌅',
      lunch: '🍽️',
      dinner: '🌙',
      snack: '🍎',
    };
    return icons[type] || '🍴';
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: palette.card,
          borderColor: palette.border 
        },
        style
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{getMealIcon(meal.meal_type)}</Text>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: palette.text }]}>
            {getMealTypeLabel(meal.meal_type)}
          </Text>
          {meal.notes && (
            <Text style={[styles.notes, { color: palette.muted }]} numberOfLines={1}>
              {meal.notes}
            </Text>
          )}
        </View>
        <Text style={[styles.calories, { color: palette.primary }]}>
          {Math.round(meal.total_calories || 0)} ккал
        </Text>
      </View>
      
      <View style={styles.macros}>
        <View style={[styles.macroItem, { 
          backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#F8FAFC',
          borderColor: palette.border 
        }]}>
          <Text style={[styles.macroLabel, { color: palette.muted }]}>Б</Text>
          <Text style={[styles.macroValue, { color: palette.text }]}>
            {Math.round(meal.total_protein || 0)}г
          </Text>
        </View>
        <View style={[styles.macroItem, { 
          backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#F8FAFC',
          borderColor: palette.border 
        }]}>
          <Text style={[styles.macroLabel, { color: palette.muted }]}>Ж</Text>
          <Text style={[styles.macroValue, { color: palette.text }]}>
            {Math.round(meal.total_fats || 0)}г
          </Text>
        </View>
        <View style={[styles.macroItem, { 
          backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : '#F8FAFC',
          borderColor: palette.border 
        }]}>
          <Text style={[styles.macroLabel, { color: palette.muted }]}>У</Text>
          <Text style={[styles.macroValue, { color: palette.text }]}>
            {Math.round(meal.total_carbs || 0)}г
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 28,
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  notes: {
    fontSize: 13,
    marginTop: 3,
    fontWeight: '500',
  },
  calories: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  macros: {
    flexDirection: 'row',
    gap: 10,
  },
  macroItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  macroValue: {
    fontSize: 15,
    fontWeight: '700',
  },
});
