import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

/**
 * Адаптивная сетка
 * Автоматически меняет количество колонок в зависимости от ширины экрана
 */
export default function Grid({ 
  children, 
  cols = { xs: 1, sm: 2, md: 3, lg: 4 }, // Количество колонок для разных breakpoints
  gap = 16,
  style,
  ...props 
}) {
  const { width } = useWindowDimensions();
  
  // Определяем текущий breakpoint
  const getColumns = () => {
    if (width >= 1280) return cols.lg || cols.md || cols.sm || cols.xs || 1;
    if (width >= 1024) return cols.md || cols.sm || cols.xs || 1;
    if (width >= 768) return cols.sm || cols.xs || 1;
    return cols.xs || 1;
  };
  
  const columns = getColumns();
  
  // Группируем children по колонкам
  const childrenArray = React.Children.toArray(children);
  const rows = [];
  for (let i = 0; i < childrenArray.length; i += columns) {
    rows.push(childrenArray.slice(i, i + columns));
  }
  
  return (
    <View style={[styles.grid, style]} {...props}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { gap }]}>
          {row.map((child, colIndex) => (
            <View 
              key={colIndex} 
              style={[
                styles.column, 
                { 
                  flex: 1,
                  maxWidth: `${100 / columns}%`,
                }
              ]}
            >
              {child}
            </View>
          ))}
          {/* Заполнители для последней строки */}
          {row.length < columns && 
            Array(columns - row.length)
              .fill(null)
              .map((_, i) => (
                <View key={`placeholder-${i}`} style={{ flex: 1, maxWidth: `${100 / columns}%` }} />
              ))
          }
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  column: {
    minWidth: 0, // Для предотвращения переполнения
  },
});
