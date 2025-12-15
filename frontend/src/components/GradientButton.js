import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform, Animated as RNAnimated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';

// Безопасный импорт reanimated
let Reanimated;
let useSharedValue;
let useAnimatedStyle;
let withSpring;
let AnimatedTouchable;

try {
  if (Platform.OS !== 'web') {
    Reanimated = require('react-native-reanimated');
    useSharedValue = Reanimated.useSharedValue;
    useAnimatedStyle = Reanimated.useAnimatedStyle;
    withSpring = Reanimated.withSpring;
    AnimatedTouchable = Reanimated.createAnimatedComponent(TouchableOpacity);
  }
} catch (e) {
  console.warn('react-native-reanimated not available, using fallback');
}

/**
 * Кнопка с градиентом и анимацией
 * Использует react-native-reanimated на мобильных платформах
 * Fallback на стандартный Animated API на web
 */
export default function GradientButton({ 
  title, 
  onPress, 
  disabled = false, 
  loading = false,
  variant = 'primary',
  style,
  ...props 
}) {
  const { theme, isDark } = useTheme();

  // Более мягкие градиенты, завязанные на тему
  const gradientsFromTheme = theme.gradients || {};

  const baseGradients = {
    primary: gradientsFromTheme.primary || ['#6366F1', '#8B5CF6'],
    success: gradientsFromTheme.success || ['#22C55E', '#4ADE80'],
    danger: ['#EF4444', '#F97373'],
    secondary: gradientsFromTheme.secondary || ['#EC4899', '#F472B6'],
    pink: gradientsFromTheme.purple || ['#EC4899', '#F472B6'],
    cyan: gradientsFromTheme.cyan || ['#06B6D4', '#22D3EE'],
    indigo: gradientsFromTheme.ocean || ['#6366F1', '#818CF8'],
    ocean: gradientsFromTheme.ocean || ['#3B82F6', '#60A5FA'],
  };

  let colors = baseGradients[variant] || baseGradients.primary;

  // Ослабляем контраст в светлой теме
  if (!isDark && !disabled) {
    colors = colors.map((c, idx) => (idx === 0 ? `${c}E6` : c));
  }

  // Цвета для отключённой кнопки разных тем
  const disabledColors = isDark
    ? ['#4B5563', '#374151']
    : ['#E5E7EB', '#D1D5DB'];

  const gradientColors = disabled ? disabledColors : colors;

  // Используем reanimated на мобильных платформах
  if (Platform.OS !== 'web' && Reanimated && useSharedValue && AnimatedTouchable) {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
      scale.value = withSpring(0.96);
    };

    const handlePressOut = () => {
      scale.value = withSpring(1);
    };

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
      };
    });

    return (
      <AnimatedTouchable
        style={[animatedStyle, style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        {...props}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, {
            shadowColor: isDark ? theme.shadow.md : theme.shadow.sm,
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.06)',
          }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.text}>{title}</Text>
          )}
        </LinearGradient>
      </AnimatedTouchable>
    );
  }

  // Fallback для web - используем стандартный Animated API
  const scale = useRef(new RNAnimated.Value(1)).current;

  const handlePressIn = () => {
    RNAnimated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    RNAnimated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: [{ scale }],
  };

  return (
    <RNAnimated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        {...props}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, {
            shadowColor: isDark ? theme.shadow.md : theme.shadow.sm,
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.06)',
          }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.text}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </RNAnimated.View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
    borderWidth: 1,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
