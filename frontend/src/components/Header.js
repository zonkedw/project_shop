import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

const palette = {
  bg: '#0B1220',
  panel: '#0F172A',
  accent: '#22D3EE',
  accentSoft: '#38BDF8',
  border: '#1F2937',
  text: '#E2E8F0',
  muted: '#94A3B8',
};

export default function Header({ navigation, user }) {
  return (
    <View style={styles.header}>
      <LinearGradient
        colors={[palette.bg, palette.panel]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.logoSection}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.logoMark}>FP</Text>
            <View>
              <Text style={styles.logoText}>FitPilot</Text>
              <Text style={styles.logoSub}>Performance Lab</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.navSection}>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate('Landing')}
            >
              <Text style={styles.navText}>Главная</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate('Programs')}
            >
              <Text style={styles.navText}>Программы</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate('Nutrition')}
            >
              <Text style={styles.navText}>Питание</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate('Workouts')}
            >
              <Text style={styles.navText}>Тренировки</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate('Chat')}
            >
              <Text style={styles.navText}>AI</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate('Features')}
            >
              <Text style={styles.navText}>Функции</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate('About')}
            >
              <Text style={styles.navText}>О нас</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate('Recipes')}
            >
              <Text style={styles.navText}>Рецепты</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.userSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
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
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: palette.border,
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
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: palette.accent,
    color: '#0B1220',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    paddingTop: 12,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.text,
    letterSpacing: 0.5,
  },
  logoSub: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.muted,
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
    color: palette.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  userSection: {
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 211, 238, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.border,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: palette.text,
  },
});

