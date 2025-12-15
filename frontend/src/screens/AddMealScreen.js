import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  Animated,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { nutritionAPI } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import GradientButton from '../components/GradientButton';

export default function AddMealScreen({ navigation, route }) {
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]); // [{product, grams}]
  const [submitting, setSubmitting] = useState(false);
  const [mealType, setMealType] = useState('breakfast'); // breakfast | lunch | dinner | snack
  const editingMeal = route?.params?.meal;

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fade]);

  // Инициализация при редактировании существующего приёма
  useEffect(() => {
    if (editingMeal && editingMeal.items) {
      setMealType(editingMeal.meal_type || 'breakfast');
      const mapped = editingMeal.items.map((it) => ({
        product: {
          id: it.product_id,
          product_id: it.product_id,
          name: it.product_name || it.recipe_name || 'Продукт',
          calories_per_100: it.calories && it.quantity_g
            ? (it.calories * 100) / it.quantity_g
            : undefined,
        },
        grams: it.quantity_g || 100,
      }));
      setSelected(mapped);
    }
  }, [editingMeal]);

  // Принять от сканера найденный продукт
  useEffect(() => {
    const product = route?.params?.scannedProduct;
    if (product) {
      addToSelected(product);
      navigation.setParams({ scannedProduct: undefined });
    }
  }, [route?.params?.scannedProduct]);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await nutritionAPI.searchProducts(query.trim());
      setResults(res.data?.products || res.data || []);
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось выполнить поиск');
    } finally {
      setLoading(false);
    }
  };

  const addToSelected = (product) => {
    const pid = product.product_id ?? product.id;
    if (selected.find((i) => (i.product.product_id ?? i.product.id) === pid)) return;
    setSelected((p) => [...p, { product, grams: 100 }]);
  };

  const changeGrams = (id, gramsText) => {
    const grams = Math.max(0, parseInt(gramsText || '0', 10));
    setSelected((list) => list.map((i) => (i.product.id === id || i.product.product_id === id ? { ...i, grams } : i)));
  };

  const removeItem = (id) => {
    setSelected((list) => list.filter((i) => (i.product.id || i.product.product_id) !== id));
  };

  const calcCalories = (product, grams) => {
    const per100 = product.calories_per_100 ?? product.calories_per_100g ?? product.calories ?? 0;
    return Math.round((per100 * grams) / 100);
  };

  const totalCalories = selected.reduce((sum, i) => sum + calcCalories(i.product, i.grams), 0);

  const submit = async () => {
    if (!selected.length) {
      Alert.alert('Добавьте продукты', 'Выберите хотя бы один продукт');
      return;
    }
    setSubmitting(true);
    try {
      const today = new Date();
      const meal_date = editingMeal?.meal_date || today.toISOString().split('T')[0];
      const meal_type = mealType;
      const items = selected.map((i) => ({ 
        product_id: i.product.product_id ?? i.product.id, 
        quantity_g: i.grams 
      }));
      const mealData = { meal_date, meal_type, items };
      if (editingMeal?.meal_id) {
        await nutritionAPI.updateMeal(editingMeal.meal_id, mealData);
      } else {
        await nutritionAPI.addMeal(mealData);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Ошибка', e.response?.data?.error || 'Не удалось сохранить приём пищи');
    } finally {
      setSubmitting(false);
    }
  };

  const mealTypes = [
    { k: 'breakfast', t: 'Завтрак', icon: '🌅' },
    { k: 'lunch', t: 'Обед', icon: '🍽️' },
    { k: 'dinner', t: 'Ужин', icon: '🌙' },
    { k: 'snack', t: 'Перекус', icon: '🍪' },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View style={{ opacity: fade }}>
        <LinearGradient
          colors={theme.gradients.secondary}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.heroTitle}>
            {editingMeal ? '✏️ Редактировать приём' : '🍽️ Добавить приём пищи'}
          </Text>
          <Text style={styles.heroSubtitle}>
            Найдите продукт в базе или отсканируйте штрих-код
          </Text>
        </LinearGradient>
      </Animated.View>

      <View style={[styles.typeRow, { backgroundColor: theme.bg }]}>
        {mealTypes.map((m) => (
          <TouchableOpacity 
            key={m.k} 
            style={[
              styles.chip, 
              { 
                backgroundColor: mealType === m.k ? theme.primary : (isDark ? theme.glass.weak : theme.bgSecondary),
                borderColor: mealType === m.k ? theme.primary : theme.border
              }
            ]} 
            onPress={() => setMealType(m.k)}
          >
            <Text style={[
              styles.chipText, 
              { color: mealType === m.k ? '#FFFFFF' : theme.text }
            ]}>
              {m.icon} {m.t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.searchRow, { backgroundColor: theme.bg }]}>
        <TextInput
          style={[styles.search, { 
            backgroundColor: isDark ? theme.glass.weak : theme.surface,
            borderColor: theme.borderLight,
            color: theme.text 
          }]}
          placeholder="Поиск продуктов..."
          placeholderTextColor={theme.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
          returnKeyType="search"
        />
        <TouchableOpacity 
          style={[styles.searchBtn, { backgroundColor: theme.primary }]} 
          onPress={search} 
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchText}>🔍</Text>}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.scanBtn, { 
            backgroundColor: isDark ? theme.surface : theme.bgSecondary,
            borderColor: theme.border 
          }]} 
          onPress={() => navigation.navigate('Scanner')}
        >
          <Text style={[styles.scanText, { color: theme.text }]}>📷</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item, idx) => String(item.id || item.product_id || idx)}
        contentContainerStyle={[
          styles.listContent,
          isDesktop && styles.listContentDesktop
        ]}
        ListEmptyComponent={
          !loading && (
            <View style={[styles.emptyBox, { 
              backgroundColor: isDark ? theme.surface : theme.surface,
              borderColor: theme.borderLight 
            }]}>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                {query ? 'Продукты не найдены' : 'Начните с поиска продуктов'}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.resultItem, { 
              backgroundColor: isDark ? theme.surface : theme.surface,
              borderColor: theme.borderLight 
            }]} 
            onPress={() => addToSelected(item)}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.resultName, { color: theme.text }]}>
                {item.name || item.title || 'Продукт'}
              </Text>
              <Text style={[styles.resultMeta, { color: theme.textMuted }]}>
                {(item.calories_per_100g ?? item.calories ?? 0)} ккал на 100 г
              </Text>
            </View>
            <View style={[styles.addBtn, { backgroundColor: `${theme.success}20` }]}>
              <Text style={[styles.addHint, { color: theme.success }]}>+ Добавить</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {selected.length > 0 && (
        <View style={[styles.selectedBox, { 
          backgroundColor: isDark ? theme.surface : theme.surface,
          borderTopColor: theme.borderLight 
        }]}>
          <ScrollView style={styles.selectedScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.selectedTitle, { color: theme.text }]}>
              Выбрано продуктов: {selected.length}
            </Text>
            {selected.map((i) => (
              <View 
                key={i.product.id || i.product.product_id} 
                style={[styles.selCard, { 
                  backgroundColor: isDark ? theme.glass.weak : theme.bgSecondary,
                  borderColor: theme.border 
                }]}
              >
                <View style={styles.selHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.selName, { color: theme.text }]}>
                      {i.product.name || i.product.title || 'Продукт'}
                    </Text>
                    <Text style={[styles.selMeta, { color: theme.textMuted }]}>
                      {calcCalories(i.product, i.grams)} ккал • {i.grams} г
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.removeBtn, { 
                      backgroundColor: `${theme.error}15`,
                      borderColor: `${theme.error}40`
                    }]} 
                    onPress={() => removeItem(i.product.id || i.product.product_id)}
                  >
                    <Text style={[styles.removeText, { color: theme.error }]}>×</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputRow}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Граммы:</Text>
                  <TextInput
                    style={[styles.gramsInput, { 
                      backgroundColor: isDark ? theme.bg : theme.surface,
                      borderColor: theme.border,
                      color: theme.text 
                    }]}
                    keyboardType="numeric"
                    value={String(i.grams)}
                    onChangeText={(t) => changeGrams(i.product.id || i.product.product_id, t)}
                  />
                  <View style={styles.quickRow}>
                    {[50, 100, 150, 200].map((g) => (
                      <TouchableOpacity 
                        key={g} 
                        style={[styles.quickBtn, { 
                          backgroundColor: i.grams === g ? theme.primary : (isDark ? theme.glass.weak : theme.bgSecondary),
                          borderColor: i.grams === g ? theme.primary : theme.border
                        }]} 
                        onPress={() => changeGrams(i.product.id || i.product.product_id, String(g))}
                      >
                        <Text style={[
                          styles.quickText, 
                          { color: i.grams === g ? '#FFFFFF' : theme.text }
                        ]}>
                          {g}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.borderLight }]}>
            <View style={[styles.totalCard, { 
              backgroundColor: `${theme.primary}15`,
              borderColor: theme.primary 
            }]}>
              <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Итого:</Text>
              <Text style={[styles.totalText, { color: theme.primary }]}>
                {totalCalories} ккал
              </Text>
            </View>
            <GradientButton
              title={submitting ? 'Сохранение...' : 'Сохранить приём'}
              onPress={submit}
              disabled={submitting}
              variant="success"
              style={styles.saveButton}
            />
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    fontWeight: '600',
  },

  typeRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    gap: 8, 
    paddingHorizontal: 20, 
    paddingVertical: 16 
  },
  chip: { 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: { 
    fontWeight: '700', 
    fontSize: 14,
    letterSpacing: 0.3,
  },

  searchRow: { 
    flexDirection: 'row', 
    gap: 8, 
    paddingHorizontal: 20, 
    marginBottom: 16 
  },
  search: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1.5,
    fontWeight: '600',
  },
  searchBtn: { 
    borderRadius: 20, 
    paddingHorizontal: 20, 
    justifyContent: 'center',
    minWidth: 56,
    alignItems: 'center',
  },
  searchText: { 
    fontSize: 20,
  },
  scanBtn: { 
    borderRadius: 20, 
    paddingHorizontal: 20, 
    justifyContent: 'center',
    borderWidth: 1.5,
    minWidth: 56,
    alignItems: 'center',
  },
  scanText: { 
    fontSize: 20,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  listContentDesktop: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  emptyBox: {
    marginTop: 20,
    borderRadius: 24,
    padding: 40,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  emptyText: { 
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },

  resultItem: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultName: { 
    fontSize: 16, 
    fontWeight: '700',
    marginBottom: 4,
  },
  resultMeta: { 
    fontSize: 13, 
    fontWeight: '600',
  },
  addBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  addHint: { 
    fontWeight: '700',
    fontSize: 13,
  },

  selectedBox: {
    borderTopWidth: 1.5,
    paddingTop: 16,
    maxHeight: '50%',
  },
  selectedScroll: {
    paddingHorizontal: 20,
  },
  selectedTitle: { 
    fontWeight: '800', 
    marginBottom: 12,
    fontSize: 17,
    letterSpacing: -0.2,
  },
  selCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
  },
  selHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selName: { 
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  selMeta: { 
    fontSize: 13, 
    fontWeight: '600',
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  removeText: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 22,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  gramsInput: {
    width: 70,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 16,
  },
  quickRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  quickText: {
    fontWeight: '700',
    fontSize: 13,
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1.5,
    gap: 12,
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  totalText: { 
    fontWeight: '900',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  saveButton: {
    width: '100%',
  },
});
