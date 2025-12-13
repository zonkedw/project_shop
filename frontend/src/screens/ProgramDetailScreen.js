import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientButton from '../components/GradientButton';

const palette = {
  bg: '#0B1220',
  card: '#111827',
  border: '#1F2937',
  primary: '#22D3EE',
  text: '#E2E8F0',
  muted: '#94A3B8',
};

export default function ProgramDetailScreen({ route, navigation }) {
  const program = route.params || {};

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#22D3EE', '#2563EB', '#0F172A']}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.tag}>{program.tag || 'Программа'}</Text>
        <Text style={styles.title}>{program.title || 'Программа FitPilot'}</Text>
        <Text style={styles.subtitle}>{program.subtitle || ''}</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Описание</Text>
        <Text style={styles.text}>{program.desc || 'Программа для вашего уровня и цели.'}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Уровень</Text>
            <Text style={styles.metaValue}>{program.level || '—'}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Инвентарь</Text>
            <Text style={styles.metaValue}>{program.equipment || '—'}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Фокус</Text>
            <Text style={styles.metaValue}>{program.focus || '—'}</Text>
          </View>
        </View>

        <GradientButton
          title="Начать тренировку"
          onPress={() => navigation.navigate('Workouts')}
          variant="primary"
          style={styles.cta}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  hero: {
    padding: 20,
    borderRadius: 0,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 8,
  },
  tag: {
    color: '#E0F2FE',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: '#E2E8F0',
    fontSize: 14,
  },
  card: {
    backgroundColor: palette.card,
    margin: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  text: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaBox: {
    flex: 1,
    minWidth: 110,
    backgroundColor: '#0C1627',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: palette.border,
  },
  metaLabel: {
    color: palette.muted,
    fontSize: 12,
    marginBottom: 4,
  },
  metaValue: {
    color: palette.text,
    fontWeight: '800',
    fontSize: 14,
  },
  cta: {
    minWidth: 200,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
});


