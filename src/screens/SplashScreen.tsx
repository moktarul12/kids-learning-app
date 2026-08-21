import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RootStackProps } from '../navigation/types';
import { WorldScene } from '../components/SkyBackground';
import { FoxMascot } from '../components/FoxMascot';
import { useProgress } from '../state/ProgressContext';

const LETTERS = [
  { ch: 'K', color: '#FF5A5A' },
  { ch: 'I', color: '#FFD93D' },
  { ch: 'D', color: '#5ECF5A' },
  { ch: 'S', color: '#4BA3FF' },
];

/** Screen 1 — Splash */
export function SplashScreen({ navigation }: RootStackProps<'Splash'>) {
  const { ready, hasStarted } = useProgress();

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      if (hasStarted) navigation.replace('MainTabs', { screen: 'World' });
      else navigation.replace('Welcome');
    }, 2200);
    return () => clearTimeout(t);
  }, [ready, hasStarted, navigation]);

  return (
    <WorldScene mood="night">
      <View style={styles.center}>
        <FoxMascot mood="excited" size={100} />
        <View style={styles.brandRow}>
          {LETTERS.map((l) => (
            <Text key={l.ch} style={[styles.letter, { color: l.color }]}>
              {l.ch}
            </Text>
          ))}
        </View>
        <Text style={styles.tag}>Play · Learn · Create</Text>
      </View>
    </WorldScene>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  brandRow: { flexDirection: 'row', gap: 2, marginTop: 6 },
  letter: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 52,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 2 },
  },
  tag: {
    fontFamily: 'Fredoka_500Medium',
    color: 'rgba(255,255,255,0.92)',
    fontSize: 16,
  },
});
