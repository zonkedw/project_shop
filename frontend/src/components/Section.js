import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Container from './Container';

/**
 * Секция страницы с адаптивными отступами
 */
export default function Section({ 
  children, 
  containerSize = 'default', 
  noContainer = false,
  style, 
  ...props 
}) {
  const { width } = useWindowDimensions();
  
  // Адаптивные вертикальные отступы
  const paddingVertical = width < 768 ? 40 : width < 1024 ? 60 : 80;
  
  const content = (
    <View style={[styles.section, { paddingVertical }, style]} {...props}>
      {children}
    </View>
  );
  
  if (noContainer) {
    return content;
  }
  
  return (
    <Container size={containerSize}>
      {content}
    </Container>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
  },
});
