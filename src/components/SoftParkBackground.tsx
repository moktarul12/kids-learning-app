import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CartoonDriftCloud } from './CartoonMotion';

function BobbingFlower({ left, bottom, color }: { left: `${number}%`; bottom: number; color: string }) {
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.flower,
        {
          left,
          bottom,
          backgroundColor: color,
          transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
        },
      ]}
    />
  );
}

/** Soft sky + rainbow + rolling hills — cartoon movie background */
export function SoftParkBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#C8EAF8', '#E8F6FC', '#D4F0C8']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <CartoonDriftCloud top="6%" start={-30} size={0.85} duration={22000} />
      <CartoonDriftCloud top="14%" start={80} size={1.1} duration={28000} />
      <CartoonDriftCloud top="22%" start={20} size={0.7} duration={18000} />

      <View style={styles.rainbowWrap} pointerEvents="none">
        {['#FF6B6B', '#FF9A3C', '#FFD93D', '#5ECF5A', '#4BA3FF', '#A78BFA'].map((c, i) => (
          <View
            key={c}
            style={[
              styles.rainbowArc,
              {
                borderColor: c,
                width: 280 + i * 28,
                height: 140 + i * 14,
                borderRadius: 200,
                opacity: 0.55 - i * 0.04,
              },
            ]}
          />
        ))}
      </View>

      <View style={[styles.hill, styles.hillBack]} pointerEvents="none" />
      <View style={[styles.hill, styles.hillMid]} pointerEvents="none" />
      <View style={[styles.hill, styles.hillFront]} pointerEvents="none" />

      <BobbingFlower left="12%" bottom={52} color="#FF8AB8" />
      <BobbingFlower left="28%" bottom={44} color="#FFD54F" />
      <BobbingFlower left="78%" bottom={48} color="#FF6B6B" />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#C8EAF8', overflow: 'hidden' },
  rainbowWrap: {
    position: 'absolute',
    bottom: 40,
    left: -40,
    right: 0,
    height: 220,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    paddingLeft: 10,
  },
  rainbowArc: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    borderWidth: 10,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
  },
  hill: { position: 'absolute', borderRadius: 200 },
  hillBack: {
    bottom: -70,
    left: -100,
    width: 360,
    height: 160,
    backgroundColor: '#7BC96A',
    opacity: 0.55,
  },
  hillMid: {
    bottom: -50,
    right: -80,
    width: 300,
    height: 140,
    backgroundColor: '#8FD97A',
    opacity: 0.7,
  },
  hillFront: {
    bottom: -80,
    left: 40,
    width: 400,
    height: 150,
    backgroundColor: '#A8E88A',
    opacity: 0.9,
  },
  flower: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
