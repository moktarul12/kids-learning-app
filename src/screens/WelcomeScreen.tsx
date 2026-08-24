import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackProps } from '../navigation/types';
import { WorldScene, WhiteStage } from '../components/SkyBackground';
import { BigButton } from '../components/BigButton';
import { colors } from '../theme/colors';
import { useProgress } from '../state/ProgressContext';
import { greetKid } from '../services/voice';

/** Screen 2 — Welcome / Start */
export function WelcomeScreen({ navigation }: RootStackProps<'Welcome'>) {
  const insets = useSafeAreaInsets();
  const { startAdventure, hasStarted, kidName } = useProgress();

  useEffect(() => {
    const t = setTimeout(() => greetKid(), 400);
    return () => clearTimeout(t);
  }, [kidName]);

  const go = () => {
    startAdventure();
    navigation.replace('MainTabs', { screen: 'World' });
  };

  return (
    <WorldScene mood="soft">
      <View style={[styles.wrap, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.brand}>Kiddo</Text>
        <WhiteStage style={styles.card}>
          <Text style={styles.hello}>Let&apos;s Play & Learn!</Text>
          <Text style={styles.sub}>Learn · Explore · Grow</Text>
          <BigButton label="Start" onPress={go} color={colors.yellow} style={styles.btn} />
          {hasStarted ? (
            <BigButton
              label="Continue"
              onPress={go}
              color={colors.blue}
              textColor="#FFF"
              size="md"
              style={styles.btn}
            />
          ) : null}
        </WhiteStage>
      </View>
    </WorldScene>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 10,
  },
  logo: { width: 140, height: 140 },
  brand: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 40,
    color: '#2C3E50',
    letterSpacing: 1,
  },
  card: {
    flex: 0,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    gap: 10,
    paddingVertical: 22,
  },
  hello: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 22,
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 2,
  },
  sub: {
    fontFamily: 'Fredoka_500Medium',
    fontSize: 14,
    color: '#6B7C93',
    marginBottom: 6,
  },
  btn: { width: '100%', maxWidth: 280 },
});
