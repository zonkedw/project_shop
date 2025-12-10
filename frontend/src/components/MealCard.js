import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Компонент карточки приёма пищи
 */
export default function MealCard({ meal, onPress, style }) {
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
      style={[styles.container, style]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{getMealIcon(meal.meal_type)}</Text>
        <View style={styles.headerText}>
          <Text style={styles.title}>{getMealTypeLabel(meal.meal_type)}</Text>
          {meal.notes && (
            <Text style={styles.notes} numberOfLines={1}>{meal.notes}</Text>
          )}
        </View>
        <Text style={styles.calories}>{Math.round(meal.total_calories || 0)} ккал</Text>
      </View>
      
      <View style={styles.macros}>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Б</Text>
          <Text style={styles.macroValue}>{Math.round(meal.total_protein || 0)}г</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>Ж</Text>
          <Text style={styles.macroValue}>{Math.round(meal.total_fats || 0)}г</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroLabel}>У</Text>
          <Text style={styles.macroValue}>{Math.round(meal.total_carbs || 0)}г</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  notes: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  calories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  macros: {
    flexDirection: 'row',
    gap: 16,
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  macroValue: {
    fontSize: 14,
    color: '#111',
    fontWeight: '600',
  },
});

