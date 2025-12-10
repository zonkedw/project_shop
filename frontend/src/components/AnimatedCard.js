import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Animated as RNAnimated } from 'react-native';

// Безопасный импорт reanimated
let Reanimated;
let useSharedValue;
let useAnimatedStyle;
let withSpring;
let withTiming;

try {
  if (Platform.OS !== 'web') {
    Reanimated = require('react-native-reanimated');
    useSharedValue = Reanimated.useSharedValue;
    useAnimatedStyle = Reanimated.useAnimatedStyle;
    withSpring = Reanimated.withSpring;
    withTiming = Reanimated.withTiming;
  }
} catch (e) {
  console.warn('react-native-reanimated not available, using fallback');
}

/**
 * Анимированная карточка с эффектами
 * Использует react-native-reanimated на мобильных платформах
 * Fallback на стандартный Animated API на web
 */
export default function AnimatedCard({ 
  children, 
  style, 
  onPress, 
  delay = 0,
  index = 0,
  ...props 
}) {
  const Component = onPress ? TouchableOpacity : View;

  // Используем reanimated на мобильных платформах
  if (Platform.OS !== 'web' && Reanimated && useSharedValue) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(50);
    const scale = useSharedValue(0.9);

    useEffect(() => {
      const timer = setTimeout(() => {
        opacity.value = withTiming(1, { duration: 400 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
        scale.value = withSpring(1, { damping: 15, stiffness: 100 });
      }, delay + index * 50);

      return () => clearTimeout(timer);
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: opacity.value,
        transform: [
          { translateY: translateY.value },
          { scale: scale.value },
        ],
      };
    });

    return (
      <Reanimated.View style={[styles.container, animatedStyle]}>
        <Component
          style={[styles.card, style]}
          onPress={onPress}
          activeOpacity={0.8}
          {...props}
        >
          {children}
        </Component>
      </Reanimated.View>
    );
  }

  // Fallback для web - используем стандартный Animated API
  const opacity = useRef(new RNAnimated.Value(0)).current;
  const translateY = useRef(new RNAnimated.Value(50)).current;
  const scale = useRef(new RNAnimated.Value(0.9)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      RNAnimated.parallel([
        RNAnimated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        RNAnimated.spring(translateY, {
          toValue: 0,
          damping: 15,
          stiffness: 100,
          useNativeDriver: true,
        }),
        RNAnimated.spring(scale, {
          toValue: 1,
          damping: 15,
          stiffness: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay + index * 50);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = {
    opacity,
    transform: [
      { translateY },
      { scale },
    ],
  };

  return (
    <RNAnimated.View style={[styles.container, animatedStyle]}>
      <Component
        style={[styles.card, style]}
        onPress={onPress}
        activeOpacity={0.8}
        {...props}
      >
        {children}
      </Component>
    </RNAnimated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
});

