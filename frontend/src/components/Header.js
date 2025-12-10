import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

export default function Header({ navigation, user }) {
  return (
    <View style={styles.header}>
      <LinearGradient
        colors={['rgba(102, 126, 234, 0.95)', 'rgba(118, 75, 162, 0.95)']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.logoSection}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.logo}>💪</Text>
            <Text style={styles.logoText}>FitPilot</Text>
          </TouchableOpacity>
          
          <View style={styles.navSection}>
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
              <Text style={styles.navText}>Возможности</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate('About')}
            >
              <Text style={styles.navText}>О нас</Text>
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
    paddingTop: Platform.OS === 'ios' ? 50 : Platform.OS === 'web' ? 20 : 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  headerGradient: {
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    fontSize: 28,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  navSection: {
    flexDirection: 'row',
    gap: 16,
    flex: 1,
    justifyContent: 'center',
  },
  navItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  userSection: {
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

