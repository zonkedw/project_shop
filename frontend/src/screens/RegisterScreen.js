import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated as RNAnimated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Безопасный импорт reanimated
let Reanimated;
let useSharedValue;
let useAnimatedStyle;
let withSpring;
let withTiming;
let withSequence;

try {
  if (Platform.OS !== 'web') {
    Reanimated = require('react-native-reanimated');
    useSharedValue = Reanimated.useSharedValue;
    useAnimatedStyle = Reanimated.useAnimatedStyle;
    withSpring = Reanimated.withSpring;
    withTiming = Reanimated.withTiming;
    withSequence = Reanimated.withSequence;
  }
} catch (e) {
  console.warn('react-native-reanimated not available');
}
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, extractData } from '../services/api';
import GradientButton from '../components/GradientButton';
import { colors } from '../theme/colors';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  // Используем reanimated на мобильных, fallback на web
  const useReanimated = Platform.OS !== 'web' && Reanimated && useSharedValue;
  
  // Используем useRef для web fallback
  const logoScaleRef = useRef(useReanimated ? null : new RNAnimated.Value(0));
  const logoRotationRef = useRef(useReanimated ? null : new RNAnimated.Value(0));
  const formOpacityRef = useRef(useReanimated ? null : new RNAnimated.Value(0));
  const formTranslateYRef = useRef(useReanimated ? null : new RNAnimated.Value(30));
  
  const logoScale = useReanimated ? useSharedValue(0) : logoScaleRef.current;
  const logoRotation = useReanimated ? useSharedValue(0) : logoRotationRef.current;
  const formOpacity = useReanimated ? useSharedValue(0) : formOpacityRef.current;
  const formTranslateY = useReanimated ? useSharedValue(30) : formTranslateYRef.current;

  useEffect(() => {
    if (useReanimated) {
      // Анимация с reanimated
      logoScale.value = withSpring(1, { damping: 10, stiffness: 100 });
      logoRotation.value = withSequence(
        withTiming(360, { duration: 1000 }),
        withSpring(0, { damping: 10 })
      );
      formOpacity.value = withTiming(1, { duration: 600 });
      formTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    } else {
      // Fallback для web
      RNAnimated.parallel([
        RNAnimated.spring(logoScale, { toValue: 1, useNativeDriver: true }),
        RNAnimated.sequence([
          RNAnimated.timing(logoRotation, { toValue: 360, duration: 1000, useNativeDriver: true }),
          RNAnimated.spring(logoRotation, { toValue: 0, useNativeDriver: true }),
        ]),
        RNAnimated.timing(formOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        RNAnimated.spring(formTranslateY, { toValue: 0, useNativeDriver: true }),
      ]).start();
    }
  }, []);

  const logoAnimatedStyle = useReanimated && useAnimatedStyle ? useAnimatedStyle(() => {
    return {
      transform: [
        { scale: logoScale.value },
        { rotate: `${logoRotation.value}deg` },
      ],
    };
  }) : {
    transform: [
      { scale: logoScale },
      { rotate: `${logoRotation}deg` },
    ],
  };

  const formAnimatedStyle = useReanimated && useAnimatedStyle ? useAnimatedStyle(() => {
    return {
      opacity: formOpacity.value,
      transform: [{ translateY: formTranslateY.value }],
    };
  }) : {
    opacity: formOpacity,
    transform: [{ translateY: formTranslateY }],
  };

  const AnimatedView = useReanimated && Reanimated ? Reanimated.View : RNAnimated.View;

  const handleRegister = async () => {
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен быть минимум 6 символов');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register(email, password, username);
      const data = extractData(response) || response.data || {};
      
      if (data?.token) {
        await AsyncStorage.setItem('token', data.token);
        if (data.user) {
          await AsyncStorage.setItem('user', JSON.stringify(data.user));
        }
        navigation.replace('Home');
      } else {
        Alert.alert('Ошибка', 'Токен не получен от сервера');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Ошибка регистрации';
      Alert.alert('Ошибка', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={colors.gradients.secondary}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <AnimatedView style={[styles.logoContainer, logoAnimatedStyle]}>
            <Text style={styles.logo}>💪</Text>
            <Text style={styles.logoText}>FitPilot</Text>
          </AnimatedView>

          <AnimatedView style={[styles.form, formAnimatedStyle]}>
            <Text style={styles.welcomeText}>Создайте аккаунт</Text>
            <Text style={styles.subtitleText}>Начните свой фитнес-путь</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'email' && styles.inputFocused,
                ]}
                placeholder="Email"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'username' && styles.inputFocused,
                ]}
                placeholder="Имя пользователя"
                placeholderTextColor="#94A3B8"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedInput('username')}
                onBlur={() => setFocusedInput(null)}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'password' && styles.inputFocused,
                ]}
                placeholder="Пароль"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'confirmPassword' && styles.inputFocused,
                ]}
                placeholder="Подтвердите пароль"
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
                editable={!loading}
              />
            </View>

            <GradientButton
              title="Зарегистрироваться"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.registerButton}
            />

            <Text
              style={styles.linkText}
              onPress={() => !loading && navigation.navigate('Login')}
            >
              Уже есть аккаунт? <Text style={styles.linkTextBold}>Войти</Text>
            </Text>
          </AnimatedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  form: {
    width: '100%',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputFocused: {
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  linkText: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontSize: 15,
  },
  linkTextBold: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
