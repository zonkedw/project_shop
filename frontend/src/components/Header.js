import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const getDarkPalette = () => ({
  bg: '#0F0F23',
  panel: '#1A1B3E',
  accent: '#6366F1',
  accentSoft: '#818CF8',
  border: '#2A2B5A',
  text: '#F8FAFC',
  muted: '#CBD5E1',
});

const getLightPalette = () => ({
  bg: '#F8FAFC',
  panel: '#FFFFFF',
  accent: '#6366F1',
  accentSoft: '#818CF8',
  border: '#E2E8F0',
  text: '#0F172A',
  muted: '#64748B',
});

export default function Header({ navigation, user }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = isDark ? getDarkPalette() : getLightPalette();
  
  const headerGradient = isDark 
    ? [palette.bg, palette.panel]
    : ['#F8FAFC', '#FFFFFF'];

  return (
    <View style={styles.header}>
      <LinearGradient
        colors={headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.logoSection}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={[styles.logoMark, { 
              backgroundColor: palette.accent,
              shadowColor: palette.accent 
            }]}>FP</Text>
            <View>
              <Text style={[styles.logoText, { color: palette.text }]}>FitPilot</Text>
              <Text style={[styles.logoSub, { color: palette.muted }]}>Performance Lab</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.navSection}>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate('Landing')}
            >
              <Text style={[styles.navText, { color: palette.text }]}>Главная</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate('Programs')}
            >
              <Text style={[styles.navText, { color: palette.text }]}>Программы</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate('Nutrition')}
            >
              <Text style={[styles.navText, { color: palette.text }]}>Питание</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate('Workouts')}
            >
              <Text style={[styles.navText, { color: palette.text }]}>Тренировки</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate('Chat')}
            >
              <Text style={[styles.navText, { color: palette.text }]}>AI</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate('Features')}
            >
              <Text style={[styles.navText, { color: palette.text }]}>Функции</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate('About')}
            >
              <Text style={[styles.navText, { color: palette.text }]}>О нас</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate('Recipes')}
            >
              <Text style={[styles.navText, { color: palette.text }]}>Рецепты</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={[styles.navText, { color: palette.text }]}>Профиль</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.userSection}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={[styles.avatar, { 
              backgroundColor: `${palette.accent}33`,
              borderColor: palette.accent,
              shadowColor: palette.accent 
            }]}>
              <Text style={[styles.avatarText, { color: palette.accent }]}>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 48 : Platform.OS === 'web' ? 16 : 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  headerGradient: {
    paddingBottom: 16,
    borderBottomWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 12,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    color: '#0A0E1A',
    fontWeight: '900',
    fontSize: 17,
    letterSpacing: 1.2,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    paddingTop: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  logoSub: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  navSection: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  navItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  navText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  userSection: {
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
