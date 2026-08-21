import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackProps } from '../navigation/types';
import { WorldScene, WhiteStage } from '../components/SkyBackground';
import { FoxMascot } from '../components/FoxMascot';
import { BigButton } from '../components/BigButton';
import { colors } from '../theme/colors';
import { useProgress } from '../state/ProgressContext';
import { VOICE } from '../services/voice';

/** Screen 2 — Welcome / Start */
export function WelcomeScreen({ navigation }: RootStackProps<'Welcome'>) {
  const insets = useSafeAreaInsets();
  const { startAdventure, hasStarted } = useProgress();

  useEffect(() => {
    VOICE.welcome();
  }, []);

  const go = () => {
    startAdventure();
    navigation.replace('MainTabs', { screen: 'World' });
  };

  return (
    <WorldScene mood="soft">
      <View style={[styles.wrap, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.brand}>KIDS</Text>
        <WhiteStage style={styles.card}>
          <FoxMascot mood="happy" size={72} />
          <View style={styles.avatar}>
            <Text style={{ fontSize: 64 }}>🧒</Text>
          </View>
          <Text style={styles.hello}>Let&apos;s Play & Learn!</Text>
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
    gap: 12,
  },
  brand: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 40,
    color: '#2C3E50',
    letterSpacing: 2,
  },
  card: {
    flex: 0,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    gap: 10,
    paddingVertical: 22,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFF8EE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFE08A',
  },
  hello: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 22,
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  btn: { width: '100%', maxWidth: 280 },
});
