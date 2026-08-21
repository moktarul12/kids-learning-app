import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/** Soft sky + rainbow + rolling hills — matches new Color/My World UX board */
export function SoftParkBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#C8EAF8', '#E8F6FC', '#D4F0C8']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Soft rainbow behind content */}
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

      {/* Rolling hills */}
      <View style={[styles.hill, styles.hillBack]} pointerEvents="none" />
      <View style={[styles.hill, styles.hillMid]} pointerEvents="none" />
      <View style={[styles.hill, styles.hillFront]} pointerEvents="none" />

      {/* Tiny flowers (decorative only — never steal taps) */}
      <View
        pointerEvents="none"
        style={[styles.flower, { left: '12%', bottom: 52, backgroundColor: '#FF8AB8' }]}
      />
      <View
        pointerEvents="none"
        style={[styles.flower, { left: '28%', bottom: 44, backgroundColor: '#FFD54F' }]}
      />
      <View
        pointerEvents="none"
        style={[styles.flower, { right: '18%', bottom: 48, backgroundColor: '#FF6B6B' }]}
      />

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
  hill: {
    position: 'absolute',
    borderRadius: 200,
  },
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
