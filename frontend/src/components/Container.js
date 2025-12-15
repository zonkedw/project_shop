import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

/**
 * Адаптивный контейнер с максимальной шириной
 * Автоматически центрируется и добавляет правильные отступы
 */
export default function Container({ children, size = 'default', style, ...props }) {
  const { width } = useWindowDimensions();
  
  const maxWidths = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
    default: 1200,
    full: '100%',
  };
  
  const paddingHorizontal = width < 768 ? 20 : width < 1024 ? 32 : 40;
  
  return (
    <View 
      style={[
        styles.container, 
        { 
          maxWidth: maxWidths[size] || maxWidths.default,
          paddingHorizontal,
        },
        style
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
  },
});
