import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';

/**
 * Кнопка с мягкими цветами и адаптивным дизайном
 */
export default function Button({
  title,
  onPress,
  variant = 'primary', // primary | secondary | outline | text
  size = 'md', // sm | md | lg
  disabled = false,
  loading = false,
  style,
  textStyle,
  ...props
}) {
  const { theme, isDark } = useTheme();
  
  const sizes = {
    sm: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14 },
    md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 16 },
    lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 18 },
  };
  
  const sizeStyle = sizes[size];
  
  // Мягкие цвета для кнопок
  const getButtonStyle = () => {
    if (disabled) {
      return {
        backgroundColor: theme.buttonDisabledBg,
        borderWidth: 0,
      };
    }
    
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: theme.buttonSecondaryBg,
          borderWidth: 1,
          borderColor: theme.border,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: theme.primary,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      default: // primary
        return {
          backgroundColor: theme.buttonPrimaryBg,
          borderWidth: 0,
        };
    }
  };
  
  const getTextColor = () => {
    if (disabled) return theme.textDisabled;
    if (variant === 'outline' || variant === 'text') return theme.primary;
    if (variant === 'secondary') return theme.text;
    return '#FFFFFF';
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        getButtonStyle(),
        {
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
        },
        style
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[
          styles.text,
          { 
            fontSize: sizeStyle.fontSize,
            color: getTextColor(),
          },
          textStyle
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
