import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../hooks/useTheme';

/**
 * Универсальная карточка с адаптивным дизайном
 */
export default function Card({ 
  children, 
  onPress,
  variant = 'default', // default | elevated | glass
  style,
  ...props 
}) {
  const { theme, isDark } = useTheme();
  const Component = onPress ? TouchableOpacity : View;
  
  const variantStyles = {
    default: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadow.sm,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 2,
    },
    elevated: {
      backgroundColor: theme.surfaceLight,
      borderWidth: 1,
      borderColor: theme.borderLight,
      shadowColor: theme.shadow.lg,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 24,
      elevation: 8,
    },
    glass: {
      backgroundColor: theme.glass.medium,
      borderWidth: 1,
      borderColor: theme.glass.border,
      shadowColor: theme.shadow.md,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 4,
    },
  };
  
  return (
    <Component
      style={[
        styles.card,
        variantStyles[variant],
        style
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      {...props}
    >
      {children}
    </Component>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
  },
});
