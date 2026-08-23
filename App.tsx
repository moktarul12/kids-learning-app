import 'react-native-gesture-handler';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Fredoka_500Medium, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { ProgressProvider } from './src/state/ProgressContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';
import { initSound, unloadSound } from './src/services/sound';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded] = useFonts({
    Fredoka_500Medium,
    Fredoka_700Bold,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Poppins_500Medium,
    Poppins_700Bold,
  });
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (fontsLoaded) setAppReady(true);
  }, [fontsLoaded]);

  useEffect(() => {
    if (!appReady) return;
    initSound().catch(() => {});
    return () => {
      unloadSound().catch(() => {});
    };
  }, [appReady]);

  const onLayout = useCallback(() => {
    if (appReady) SplashScreen.hideAsync().catch(() => {});
  }, [appReady]);

  if (!appReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.skyTop }}>
        <ActivityIndicator color={colors.white} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.lightBlue }} onLayout={onLayout}>
        <ProgressProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </ProgressProvider>
      </View>
    </SafeAreaProvider>
  );
}
