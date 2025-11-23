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
} from 'react-native';
import { nutritionAPI } from '../services/api';

export default function AddMealScreen({ navigation, route }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]); // [{product, grams}]
  const [submitting, setSubmitting] = useState(false);
  const [mealType, setMealType] = useState('breakfast'); // breakfast | lunch | dinner | snack
  const editingMeal = route?.params?.meal;

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }).start();
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
      // очищаем параметр, чтобы не добавлялся повторно при возвращении
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
    setSelected((list) => list.map((i) => (i.product.id === id ? { ...i, grams } : i)));
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

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fade }]}> 
        <Text style={styles.title}>{editingMeal ? 'Редактировать приём' : 'Добавить приём пищи'}</Text>
        <Text style={styles.subtitle}>Найдите продукт и укажите граммы</Text>
      </Animated.View>

      <View style={styles.typeRow}>
        {[
          { k: 'breakfast', t: 'Завтрак' },
          { k: 'lunch', t: 'Обед' },
          { k: 'dinner', t: 'Ужин' },
          { k: 'snack', t: 'Перекус' },
        ].map((m) => (
          <TouchableOpacity key={m.k} style={[styles.chip, mealType === m.k && styles.chipActive]} onPress={() => setMealType(m.k)}>
            <Text style={[styles.chipText, mealType === m.k && styles.chipTextActive]}>{m.t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Поиск продуктов..."
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={search} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchText}>Найти</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.scanBtn} onPress={() => navigation.navigate('Scanner')}>
          <Text style={styles.scanText}>Сканер</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item, idx) => String(item.id || item.product_id || idx)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyBox}><Text style={styles.emptyText}>Начните с поиска продуктов</Text></View>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultItem} onPress={() => addToSelected(item)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.resultName}>{item.name || item.title || 'Продукт'}</Text>
              <Text style={styles.resultMeta}>{(item.calories_per_100g ?? item.calories ?? 0)} ккал на 100 г</Text>
            </View>
            <Text style={styles.addHint}>Добавить</Text>
          </TouchableOpacity>
        )}
      />

      {selected.length > 0 && (
        <View style={styles.selectedBox}>
          <Text style={styles.selectedTitle}>Выбрано</Text>
          {selected.map((i) => (
            <View key={i.product.id || i.product.product_id} style={styles.selRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.selName}>{i.product.name || i.product.title || 'Продукт'}</Text>
                <Text style={styles.selMeta}>{calcCalories(i.product, i.grams)} ккал • {i.grams} г</Text>
              </View>
              <TextInput
                style={styles.gramsInput}
                keyboardType="numeric"
                value={String(i.grams)}
                onChangeText={(t) => changeGrams(i.product.id || i.product.product_id, t)}
              />
              <View style={styles.quickRow}>
                {[50,100,150].map((g)=> (
                  <TouchableOpacity key={g} style={styles.quickBtn} onPress={() => changeGrams(i.product.id || i.product.product_id, String(g))}>
                    <Text style={styles.quickText}>{g} г</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <View style={styles.footerRow}>
            <Text style={styles.totalText}>Итого: {totalCalories} ккал</Text>
            <TouchableOpacity style={[styles.saveBtn, submitting && { opacity: 0.6 }]} onPress={submit} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Сохранить</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220' },
  header: { paddingTop: 12, paddingHorizontal: 16, paddingBottom: 8 },
  title: { color: '#E5E7EB', fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#94A3B8', marginTop: 4, fontSize: 13 },

  searchRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 12 },
  search: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#E5E7EB',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)'
  },
  searchBtn: { backgroundColor: '#4F46E5', borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  searchText: { color: '#fff', fontWeight: '600' },
  scanBtn: { backgroundColor: '#111827', borderRadius: 12, paddingHorizontal: 12, justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(148,163,184,0.35)' },
  scanText: { color: '#E5E7EB', fontWeight: '600' },

  emptyBox: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)'
  },
  emptyText: { color: '#94A3B8', textAlign: 'center' },

  resultItem: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultName: { color: '#E5E7EB', fontSize: 15, fontWeight: '600' },
  resultMeta: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  addHint: { color: '#A5B4FC', fontWeight: '600' },

  selectedBox: {
    marginTop: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.25)'
  },
  selectedTitle: { color: '#CBD5E1', fontWeight: '700', marginBottom: 6 },
  selRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  selName: { color: '#E5E7EB', fontWeight: '600' },
  selMeta: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  gramsInput: {
    width: 72,
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: '#E5E7EB',
    textAlign: 'right',
  },
  footerRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalText: { color: '#F9FAFB', fontWeight: '700' },
  saveBtn: { backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 },
  saveText: { color: '#fff', fontWeight: '600' },
});
