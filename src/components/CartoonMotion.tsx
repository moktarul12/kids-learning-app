import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

export const CARTOON_SPRING = { friction: 4, tension: 140, useNativeDriver: true as const };
export const CARTOON_BOUNCE = Easing.bezier(0.34, 1.56, 0.64, 1);

export function CartoonSquash({
  children,
  style,
  phase = 0,
  intensity = 1,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  phase?: number;
  intensity?: number;
}) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, {
          toValue: 1,
          duration: 900 + phase * 120,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(t, {
          toValue: 0,
          duration: 900 + phase * 120,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [t, phase]);

  const sx = t.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1 + 0.08 * intensity, 1 - 0.06 * intensity],
  });
  const sy = t.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1 - 0.06 * intensity, 1 + 0.1 * intensity],
  });
  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [0, -10 * intensity] });

  return (
    <Animated.View style={[style, { transform: [{ translateY: ty }, { scaleX: sx }, { scaleY: sy }] }]}>
      {children}
    </Animated.View>
  );
}

export function CartoonCollectible({
  emoji,
  phase = 0,
  size = 32,
}: {
  emoji: string;
  phase?: number;
  size?: number;
}) {
  const spin = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 2400 + phase * 200, easing: Easing.linear, useNativeDriver: true }),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 700, easing: CARTOON_BOUNCE, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, [spin, bob, phase]);

  return (
    <Animated.Text
      style={{
        fontSize: size,
        transform: [
          { translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) },
          { rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '8deg'] }) },
          { scale: bob.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.12, 1] }) },
        ],
      }}
    >
      {emoji}
    </Animated.Text>
  );
}

export function CartoonWheel({ size = 14, speed = 1 }: { size?: number; speed?: number }) {
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rot, {
        toValue: 1,
        duration: 400 / speed,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [rot, speed]);

  return (
    <Animated.View
      style={[
        styles.wheel,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ rotate: rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
        },
      ]}
    >
      <View style={[styles.wheelHub, { width: size * 0.35, height: size * 0.35, borderRadius: size * 0.2 }]} />
    </Animated.View>
  );
}

export function CartoonSpeedLines({ active }: { active: boolean }) {
  const lines = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!active) return;
    const anims = lines.map((l, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 60),
          Animated.timing(l, { toValue: 1, duration: 180, useNativeDriver: true }),
          Animated.timing(l, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ),
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [active, lines]);

  if (!active) return null;

  return (
    <View pointerEvents="none" style={styles.speedBox}>
      {lines.map((l, i) => (
        <Animated.View
          key={i}
          style={[
            styles.speedLine,
            {
              top: 8 + i * 14,
              opacity: l.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.9, 0] }),
              transform: [
                { translateX: l.interpolate({ inputRange: [0, 1], outputRange: [20, -40] }) },
                { scaleX: l.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.2] }) },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

export function CartoonParallaxTree({
  side,
  scroll,
  emoji,
  top,
}: {
  side: 'left' | 'right';
  scroll: Animated.Value;
  emoji: string;
  top: number;
}) {
  return (
    <Animated.Text
      style={[
        styles.parallaxTree,
        {
          [side]: 4,
          top,
          transform: [{ translateY: scroll.interpolate({ inputRange: [0, 1], outputRange: [0, 48] }) }],
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

export function CartoonCrashStars({ active }: { active: boolean }) {
  const stars = useRef(['💫', '⭐', '💥'].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!active) return;
    stars.forEach((s, i) => {
      s.setValue(0);
      Animated.timing(s, {
        toValue: 1,
        duration: 500,
        delay: i * 80,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: true,
      }).start();
    });
  }, [active, stars]);

  if (!active) return null;

  const emojis = ['💫', '⭐', '💥'];
  const offsets = [-28, 0, 28];

  return (
    <View pointerEvents="none" style={styles.crashBox}>
      {stars.map((s, i) => (
        <Animated.Text
          key={i}
          style={{
            position: 'absolute',
            fontSize: 22,
            left: offsets[i],
            opacity: s.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
            transform: [
              { scale: s.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.4] }) },
              { translateY: s.interpolate({ inputRange: [0, 1], outputRange: [10, -30] }) },
            ],
          }}
        >
          {emojis[i]}
        </Animated.Text>
      ))}
    </View>
  );
}

export function CartoonRunner({
  emoji,
  running,
  size = 44,
}: {
  emoji: string;
  running: boolean;
  size?: number;
}) {
  const hop = useRef(new Animated.Value(0)).current;
  const tilt = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!running) {
      hop.setValue(0);
      tilt.setValue(0);
      return;
    }
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(hop, { toValue: 1, duration: 180, easing: CARTOON_BOUNCE, useNativeDriver: true }),
          Animated.timing(tilt, { toValue: 1, duration: 180, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(hop, { toValue: 0, duration: 180, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(tilt, { toValue: 0, duration: 180, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, [running, hop, tilt]);

  return (
    <Animated.View
      style={{
        transform: [
          { translateY: hop.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) },
          { rotate: tilt.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-8deg'] }) },
          { scaleX: hop.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.08, 0.95] }) },
        ],
      }}
    >
      <Text style={{ fontSize: size }}>{emoji}</Text>
      {running ? <Text style={[styles.dustPuff, { fontSize: size * 0.35 }]}>💨</Text> : null}
    </Animated.View>
  );
}

export function CartoonDriftCloud({
  top,
  start,
  size = 1,
  duration = 16000,
}: {
  top: number | `${number}%`;
  start: number;
  size?: number;
  duration?: number;
}) {
  const x = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(x, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, [x, bob, duration]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.driftCloud,
        {
          top,
          transform: [
            { scale: size },
            { translateX: x.interpolate({ inputRange: [0, 1], outputRange: [start, start + 140] }) },
            { translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) },
          ],
        },
      ]}
    >
      <View style={[styles.cloudPuff, { width: 32, height: 32, marginTop: 8 }]} />
      <View style={[styles.cloudPuff, { width: 44, height: 44, marginLeft: -10 }]} />
      <View style={[styles.cloudPuff, { width: 36, height: 36, marginLeft: -8, marginTop: 6 }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wheel: {
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#555',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelHub: { backgroundColor: '#888' },
  speedBox: { position: 'absolute', left: -36, top: 10, width: 40, height: 60 },
  speedLine: {
    position: 'absolute',
    left: 0,
    width: 28,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 2,
  },
  parallaxTree: { position: 'absolute', fontSize: 30, zIndex: 1 },
  crashBox: {
    position: 'absolute',
    top: -36,
    left: '50%',
    marginLeft: -20,
    width: 56,
    height: 40,
    alignItems: 'center',
  },
  dustPuff: { position: 'absolute', bottom: -4, right: -8 },
  driftCloud: { position: 'absolute', flexDirection: 'row', alignItems: 'flex-end', opacity: 0.9 },
  cloudPuff: { backgroundColor: '#FFFFFF', borderRadius: 999 },
});
