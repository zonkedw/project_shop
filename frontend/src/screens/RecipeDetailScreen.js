import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AnimatedCard from '../components/AnimatedCard';
import GradientButton from '../components/GradientButton';
import { useTheme } from '../hooks/useTheme';

export default function RecipeDetailScreen({ route, navigation }) {
  const { recipe } = route.params || {};
  const { theme, isDark } = useTheme();

  const calories = useMemo(() => {
    if (recipe?.calories) return recipe.calories;
    const match = recipe?.meta?.match(/(\d+)\s*ккал/);
    return match ? Number(match[1]) : 250;
  }, [recipe]);

  const cookTime = useMemo(() => {
    const match = recipe?.meta?.match(/(\d+)\s*мин/);
    return match ? `${match[1]} мин` : '20 мин';
  }, [recipe]);

  const ingredients = recipe?.ingredients || [
    'Овсяные хлопья — 60 г',
    'Яйцо — 1 шт',
    'Молоко/вода — 120 мл',
    'Соль/подсластитель — по вкусу',
  ];

  const steps = recipe?.steps || [
    'Смешайте все ингредиенты до однородности.',
    'Обжарьте на среднем огне 2–3 минуты с каждой стороны.',
    'Подавайте с ягодами или йогуртом.',
  ];

  const gradient = recipe?.gradient || (isDark ? ['#11142B', '#4338CA'] : ['#8B5CF6', '#EC4899']);

  const recipeId = recipe?.recipe_id || recipe?.id;
  const prefillProduct = {
    id: `recipe-${recipe?.title || 'custom'}`,
    name: recipe?.title || 'Рецепт',
    calories_per_100: calories / 2 || 125,
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={gradient} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={styles.tag}>{recipe?.tag || 'Рецепт'}</Text>
        <Text style={styles.title}>{recipe?.title || 'Рецепт'}</Text>
        <Text style={styles.meta}>{recipe?.meta || `${cookTime} • ${calories} ккал`}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <AnimatedCard index={0} style={styles.infoCard}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Калории</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{calories} ккал</Text>
          </AnimatedCard>
          <AnimatedCard index={1} style={styles.infoCard}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Время</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{cookTime}</Text>
          </AnimatedCard>
        </View>

        <AnimatedCard index={2} style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Ингредиенты</Text>
          {ingredients.map((ing, idx) => (
            <Text key={idx} style={[styles.listItem, { color: theme.textMuted }]}>• {ing}</Text>
          ))}
        </AnimatedCard>

        <AnimatedCard index={3} style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Шаги</Text>
          {steps.map((step, idx) => (
            <Text key={idx} style={[styles.listItem, { color: theme.textMuted }]}>
              {idx + 1}. {step}
            </Text>
          ))}
        </AnimatedCard>

        <AnimatedCard index={4} style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Добавить в дневник</Text>
          <Text style={[styles.listItem, { color: theme.textMuted, marginBottom: 8 }]}>
            Добавим рецепт как продукт с калорийностью {Math.round(prefillProduct.calories_per_100)} ккал на 100 г.
          </Text>
          <GradientButton
            title="Добавить в приём пищи"
            onPress={() => navigation.navigate('AddMeal', recipeId ? { prefillRecipe: { ...recipe, recipe_id: recipeId, calories_per_portion: calories } } : { prefillProduct })}
            variant="primary"
            style={{ marginTop: 8 }}
          />
        </AnimatedCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    gap: 6,
  },
  tag: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.6,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  meta: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
  },
  content: {
    padding: 20,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  sectionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.25)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  listItem: {
    fontSize: 14,
    lineHeight: 20,
  },
});


