import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export type BalloonColorDef = {
  id: string;
  name: string;
  hex: string;
  light: string;
  dark: string;
};

export const BALLOON_COLORS: BalloonColorDef[] = [
  { id: 'red', name: 'red', hex: '#FF5252', light: '#FF8A80', dark: '#E53935' },
  { id: 'blue', name: 'blue', hex: '#4BA3FF', light: '#82C4FF', dark: '#2E7DE0' },
  { id: 'yellow', name: 'yellow', hex: '#FFD93D', light: '#FFE566', dark: '#F5C518' },
  { id: 'green', name: 'green', hex: '#7ED957', light: '#A8E06A', dark: '#5ECF5A' },
  { id: 'purple', name: 'purple', hex: '#9B7BFF', light: '#B89EFF', dark: '#7B5FE0' },
  { id: 'pink', name: 'pink', hex: '#FF7AB8', light: '#FFA6D0', dark: '#E85A9A' },
  { id: 'orange', name: 'orange', hex: '#FF9A3C', light: '#FFB86C', dark: '#E07A20' },
];

export function getBalloonColor(id: string): BalloonColorDef {
  return BALLOON_COLORS.find((c) => c.id === id) ?? BALLOON_COLORS[0];
}

export function CartoonPopBurst({
  x,
  y,
  color,
  trigger,
}: {
  x: number;
  y: number;
  color: string;
  trigger: number;
}) {
  const ring = useRef(new Animated.Value(0)).current;
  const parts = useRef(
    ['💥', '✨', '⭐', '🎊'].map(() => ({
      o: new Animated.Value(0),
      s: new Animated.Value(0.3),
      x: new Animated.Value(0),
      y: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    ring.setValue(0);
    Animated.timing(ring, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    parts.forEach((p, i) => {
      p.o.setValue(1);
      p.s.setValue(0.4);
      p.x.setValue(0);
      p.y.setValue(0);
      const angle = (i / parts.length) * Math.PI * 2;
      Animated.parallel([
        Animated.timing(p.s, { toValue: 1.4, duration: 380, useNativeDriver: true }),
        Animated.timing(p.x, { toValue: Math.cos(angle) * 36, duration: 400, useNativeDriver: true }),
        Animated.timing(p.y, { toValue: Math.sin(angle) * 36, duration: 400, useNativeDriver: true }),
        Animated.timing(p.o, { toValue: 0, duration: 450, delay: 80, useNativeDriver: true }),
      ]).start();
    });
  }, [trigger, ring, parts]);

  return (
    <View style={[styles.burstWrap, { left: `${x}%`, top: `${y}%` }]} pointerEvents="none">
      <Animated.View
        style={[
          styles.burstRing,
          {
            borderColor: color,
            opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] }),
            transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.3, 2.2] }) }],
          },
        ]}
      />
      {parts.map((p, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.burstPart,
            {
              opacity: p.o,
              transform: [{ scale: p.s }, { translateX: p.x }, { translateY: p.y }],
            },
          ]}
        >
          {['💥', '✨', '⭐', '🎊'][i]}
        </Animated.Text>
      ))}
    </View>
  );
}

function FluffyCloud({
  top,
  startLeft,
  scale = 1,
  speed = 12000,
  opacity = 0.95,
}: {
  top: `${number}%` | number;
  startLeft: number;
  scale?: number;
  speed?: number;
  opacity?: number;
}) {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(drift, {
        toValue: 1,
        duration: speed,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [drift, speed]);

  return (
    <Animated.View
      style={[
        styles.cloudCluster,
        {
          top,
          opacity,
          transform: [
            { scale },
            {
              translateX: drift.interpolate({
                inputRange: [0, 1],
                outputRange: [startLeft, startLeft + 120],
              }),
            },
          ],
        },
      ]}
    >
      <View style={[styles.cloudPuff, { width: 36, height: 36, marginTop: 10 }]} />
      <View style={[styles.cloudPuff, { width: 48, height: 48, marginLeft: -12 }]} />
      <View style={[styles.cloudPuff, { width: 40, height: 40, marginLeft: -8, marginTop: 8 }]} />
      <View style={[styles.cloudPuff, { width: 28, height: 28, marginLeft: -20, marginTop: 16 }]} />
    </Animated.View>
  );
}

function CartoonEyes({ size, phase }: { size: number; phase: number }) {
  const blink = useRef(new Animated.Value(1)).current;
  const look = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const blinkLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(2200 + phase * 700),
        Animated.timing(blink, { toValue: 0.08, duration: 90, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.delay(1800 + phase * 500),
      ]),
    );
    const lookLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(look, { toValue: 1, duration: 2000 + phase * 300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(look, { toValue: -1, duration: 2000 + phase * 300, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(look, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    blinkLoop.start();
    lookLoop.start();
    return () => {
      blinkLoop.stop();
      lookLoop.stop();
    };
  }, [blink, look, phase]);

  const eyeW = size * 0.18;
  const eyeH = size * 0.22;

  const Eye = () => (
    <Animated.View style={[styles.eyeWhite, { width: eyeW, height: eyeH, transform: [{ scaleY: blink }] }]}>
      <Animated.View
        style={[
          styles.pupil,
          {
            width: eyeW * 0.45,
            height: eyeH * 0.55,
            transform: [{ translateX: look.interpolate({ inputRange: [-1, 1], outputRange: [-3, 3] }) }],
          },
        ]}
      />
      <View style={[styles.eyeShine, { width: eyeW * 0.18, height: eyeH * 0.22 }]} />
    </Animated.View>
  );

  return (
    <View style={styles.eyeRow}>
      <Eye />
      <Eye />
    </View>
  );
}

type Props = {
  color: BalloonColorDef;
  size?: number;
  phase?: number;
  face?: boolean;
  highlight?: boolean;
  popping?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function CartoonBalloon({
  color,
  size = 72,
  phase = 0,
  face = true,
  highlight = false,
  popping = false,
  onPress,
  style,
}: Props) {
  const drift = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const popScale = useRef(new Animated.Value(1)).current;
  const popOpacity = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const pressSquish = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: 3200 + phase * 500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 3200 + phase * 500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1400 + phase * 180, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1400 + phase * 180, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: 2600 + phase * 350, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(sway, { toValue: 0, duration: 2600 + phase * 350, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ]),
    );
    driftLoop.start();
    bobLoop.start();
    swayLoop.start();
    shimmerLoop.start();
    return () => {
      driftLoop.stop();
      bobLoop.stop();
      swayLoop.stop();
      shimmerLoop.stop();
    };
  }, [drift, bob, sway, shimmer, phase]);

  useEffect(() => {
    if (!highlight) return;
    const g = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    );
    g.start();
    return () => g.stop();
  }, [highlight, glow]);

  useEffect(() => {
    if (!popping) return;
    Animated.sequence([
      Animated.timing(pressSquish, { toValue: 0.75, duration: 80, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(popScale, { toValue: 2, duration: 280, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true }),
        Animated.timing(popOpacity, { toValue: 0, duration: 320, useNativeDriver: true }),
      ]),
    ]).start();
  }, [popping, popScale, popOpacity, pressSquish]);

  const onPressIn = () => {
    if (popping) return;
    Animated.spring(pressSquish, { toValue: 0.92, friction: 4, useNativeDriver: true }).start();
  };
  const onPressOut = () => {
    if (popping) return;
    Animated.spring(pressSquish, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  const w = size;
  const h = size * 1.18;
  const knot = size * 0.14;

  const squashX = bob.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.06, 0.94] });
  const squashY = bob.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.94, 1.06] });

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: popOpacity,
          transform: [
            { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [-22 - phase * 3, 22 + phase * 3] }) },
            { translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -18 - phase] }) },
            { rotate: sway.interpolate({ inputRange: [0, 1], outputRange: ['-7deg', '7deg'] }) },
            { scale: Animated.multiply(popScale, pressSquish) },
            { scaleX: squashX },
            { scaleY: squashY },
          ],
        },
      ]}
    >
      {highlight ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glowHalo,
            {
              width: w + 24,
              height: h + 24,
              borderRadius: (w + 24) / 2,
              backgroundColor: color.hex,
              opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.45] }),
              transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }],
            },
          ]}
        />
      ) : null}

      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={popping}
        hitSlop={14}
      >
        <View style={{ alignItems: 'center' }}>
          <View style={[styles.balloonWrap, { width: w, height: h }]}>
            <LinearGradient
              colors={[color.light, color.hex, color.dark]}
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={[styles.balloonBody, { width: w, height: h, borderRadius: w * 0.48 }]}
            >
              <Animated.View
                style={[
                  styles.shineMain,
                  {
                    width: w * 0.32,
                    height: h * 0.26,
                    borderRadius: w * 0.22,
                    opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.75] }),
                    transform: [
                      { translateX: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0, 4] }) },
                    ],
                  },
                ]}
              />
              <View style={[styles.shineDot, { width: w * 0.1, height: w * 0.1, top: h * 0.2, left: w * 0.62 }]} />
              {face ? (
                <View style={styles.faceBlock}>
                  <CartoonEyes size={size} phase={phase} />
                  <Text style={[styles.smile, { fontSize: size * 0.2, color: color.dark }]}>◡</Text>
                  <View style={[styles.cheek, { backgroundColor: color.light, left: w * 0.12 }]} />
                  <View style={[styles.cheek, { backgroundColor: color.light, right: w * 0.12 }]} />
                </View>
              ) : null}
            </LinearGradient>
            <View style={[styles.knot, { backgroundColor: color.dark, width: knot, height: knot }]} />
          </View>
          <Animated.View
            style={[
              styles.string,
              {
                height: size * 0.62,
                backgroundColor: color.dark,
                transform: [
                  { rotate: sway.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] }) },
                ],
              },
            ]}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function BalloonSkyStage({ children }: { children: React.ReactNode }) {
  const sunPulse = useRef(new Animated.Value(0)).current;
  const sparkle = useRef(new Animated.Value(0)).current;
  const wave = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sunPulse, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(sunPulse, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkle, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(sparkle, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(wave, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(wave, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ).start();
  }, [sunPulse, sparkle, wave]);

  return (
    <View style={styles.stage}>
      <LinearGradient colors={['#5BB8FF', '#87CEEB', '#C5E8FF', '#E8F6FF']} style={StyleSheet.absoluteFill} />

      <Animated.View
        style={[
          styles.sunWrap,
          {
            transform: [
              { scale: sunPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) },
              { rotate: sunPulse.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '8deg'] }) },
            ],
          },
        ]}
      >
        <LinearGradient colors={['#FFE566', '#FFD93D', '#FFB020']} style={styles.sun}>
          <Text style={styles.sunFace}>😊</Text>
        </LinearGradient>
        {[0, 45, 90, 135].map((deg) => (
          <View key={deg} style={[styles.sunRay, { transform: [{ rotate: `${deg}deg` }] }]} />
        ))}
      </Animated.View>

      <FluffyCloud top="8%" startLeft={-20} scale={0.9} speed={14000} />
      <FluffyCloud top="16%" startLeft={60} scale={1.1} speed={18000} opacity={0.88} />
      <FluffyCloud top="28%" startLeft={10} scale={0.75} speed={11000} opacity={0.8} />

      <Animated.Text
        style={[
          styles.sparkle,
          { top: '42%', left: '12%', opacity: sparkle.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) },
        ]}
      >
        ✨
      </Animated.Text>
      <Animated.Text
        style={[
          styles.sparkle,
          { top: '35%', right: '15%', opacity: sparkle.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }) },
        ]}
      >
        ✨
      </Animated.Text>

      <View style={styles.hillBack} />
      <View style={styles.hillFront} />

      <View style={styles.grassStrip}>
        <LinearGradient colors={['#8AE06A', '#7ED957', '#5ECF5A']} style={StyleSheet.absoluteFill} />
        <Text style={styles.grassEmoji}>🌸 🦋 🌼 🐝 🌻 🦋 🌸</Text>
      </View>

      <View style={styles.playArea}>{children}</View>

      <Animated.View
        style={[
          styles.mascot,
          { transform: [{ rotate: wave.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '18deg'] }) }] },
        ]}
        pointerEvents="none"
      >
        <Text style={styles.mascotEmoji}>🧒</Text>
        <Text style={styles.mascotWave}>👋</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  burstWrap: { position: 'absolute', width: 80, height: 80, marginLeft: -40, marginTop: -40, zIndex: 30, alignItems: 'center', justifyContent: 'center' },
  burstRing: { position: 'absolute', width: 50, height: 50, borderRadius: 25, borderWidth: 4 },
  burstPart: { position: 'absolute', fontSize: 22 },
  cloudCluster: { position: 'absolute', flexDirection: 'row', alignItems: 'flex-end', left: 0 },
  cloudPuff: { backgroundColor: '#FFFFFF', borderRadius: 999, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  eyeRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  eyeWhite: { backgroundColor: '#FFF', borderRadius: 999, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.12)' },
  pupil: { backgroundColor: '#1E2A3A', borderRadius: 999 },
  eyeShine: { position: 'absolute', top: 2, right: 2, backgroundColor: '#FFF', borderRadius: 999 },
  glowHalo: { position: 'absolute', alignSelf: 'center', top: -8 },
  balloonWrap: { alignItems: 'center' },
  balloonBody: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  shineMain: { position: 'absolute', top: '12%', left: '14%', backgroundColor: 'rgba(255,255,255,0.6)' },
  shineDot: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 999 },
  faceBlock: { alignItems: 'center', marginTop: 4, width: '100%' },
  smile: { marginTop: -2, fontWeight: '900' },
  cheek: { position: 'absolute', bottom: 8, width: 10, height: 6, borderRadius: 8, opacity: 0.5 },
  knot: { borderRadius: 999, marginTop: -3, transform: [{ rotate: '45deg' }] },
  string: { width: 2.5, borderRadius: 2, opacity: 0.55 },
  stage: {
    width: '100%',
    maxWidth: 380,
    height: 360,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#5BB8FF',
    shadowColor: '#4BA3FF',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  sunWrap: { position: 'absolute', top: 14, right: 18, width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  sun: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  sunFace: { fontSize: 28 },
  sunRay: { position: 'absolute', width: 4, height: 14, backgroundColor: '#FFD93D', borderRadius: 2, top: -4, opacity: 0.7 },
  sparkle: { position: 'absolute', fontSize: 18 },
  hillBack: { position: 'absolute', bottom: 44, left: -30, width: 200, height: 80, backgroundColor: '#6BCB5A', borderTopLeftRadius: 100, borderTopRightRadius: 100, opacity: 0.55 },
  hillFront: { position: 'absolute', bottom: 44, right: -20, width: 180, height: 70, backgroundColor: '#7ED957', borderTopLeftRadius: 90, borderTopRightRadius: 90, opacity: 0.7 },
  grassStrip: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 52, justifyContent: 'center', alignItems: 'center' },
  grassEmoji: { fontSize: 15, zIndex: 2 },
  playArea: { ...StyleSheet.absoluteFill, bottom: 52 },
  mascot: { position: 'absolute', bottom: 54, left: 10, flexDirection: 'row', alignItems: 'flex-end', zIndex: 5 },
  mascotEmoji: { fontSize: 32 },
  mascotWave: { fontSize: 22, marginBottom: 4, marginLeft: -4 },
});
