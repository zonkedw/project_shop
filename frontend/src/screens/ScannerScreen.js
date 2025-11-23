import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { nutritionAPI } from '../services/api';

export default function ScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data, type }) => {
    if (!scanning) return;
    setScanning(false);
    try {
      const code = String(data).replace(/\D/g, '');
      if (!code || code.length < 8) {
        Alert.alert('Ошибка', 'Неверный штрих‑код');
        setScanning(true);
        return;
      }
      const res = await nutritionAPI.getProductByBarcode(code);
      const product = res.data?.product || res.data;
      if (!product) {
        Alert.alert('Не найдено', 'Продукт по этому коду не найден');
        setScanning(true);
        return;
      }
      navigation.navigate('AddMeal', { scannedProduct: product });
    } catch (e) {
      Alert.alert('Ошибка', e.response?.data?.error || 'Не удалось распознать код');
      setScanning(true);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centered}><ActivityIndicator color="#6366F1" size="large" /></View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>Нет доступа к камере</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.overlay}>
        <Text style={styles.hint}>Наведите камеру на штрих‑код</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Отмена</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B1220' },
  overlay: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  hint: { color: '#fff', marginBottom: 12 },
  btn: { backgroundColor: '#4F46E5', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 20 },
  btnText: { color: '#fff', fontWeight: '700' },
  text: { color: '#E5E7EB', marginBottom: 12 },
});
