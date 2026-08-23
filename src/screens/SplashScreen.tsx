import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { RootStackProps } from '../navigation/types';
import { WorldScene } from '../components/SkyBackground';
import { useProgress } from '../state/ProgressContext';

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
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.brand}>Kiddo</Text>
        <Text style={styles.tag}>Learn · Explore · Grow</Text>
      </View>
    </WorldScene>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 24 },
  logo: { width: 200, height: 200 },
  brand: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 44,
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 2 },
  },
  tag: {
    fontFamily: 'Fredoka_500Medium',
    color: 'rgba(255,255,255,0.92)',
    fontSize: 16,
  },
});
