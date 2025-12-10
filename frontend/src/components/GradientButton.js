import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform, Animated as RNAnimated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
  const gradients = {
    primary: ['#667EEA', '#764BA2'],
    success: ['#11998E', '#38EF7D'],
    danger: ['#EB3349', '#F45C43'],
    secondary: ['#4A90E2', '#357ABD'],
  };

  const colors = gradients[variant] || gradients.primary;

  // Используем reanimated на мобильных платформах
  if (Platform.OS !== 'web' && Reanimated && useSharedValue && AnimatedTouchable) {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
      scale.value = withSpring(0.95);
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
        activeOpacity={0.8}
        {...props}
      >
        <LinearGradient
          colors={disabled ? ['#9CA3AF', '#6B7280'] : colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
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
      toValue: 0.95,
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
        activeOpacity={0.8}
        {...props}
      >
        <LinearGradient
          colors={disabled ? ['#9CA3AF', '#6B7280'] : colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
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
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

