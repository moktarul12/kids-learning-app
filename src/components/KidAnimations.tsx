import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';

export type IconMotion = 'bob' | 'glow' | 'sway' | 'pulse' | 'tilt' | 'cartoon' | 'none';

/**
 * Subtle living motion for an icon only (apple bob, light glow…).
 * Does NOT bounce the whole card — keeps UI calm.
 */
export function LivingIcon({
  children,
  motion = 'bob',
  style,
}: {
  children: React.ReactNode;
  motion?: IconMotion;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (motion === 'none') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, {
          toValue: 1,
          duration: motion === 'cartoon' ? 1200 : motion === 'glow' || motion === 'pulse' ? 1400 : 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(t, {
          toValue: 0,
          duration: motion === 'cartoon' ? 1200 : motion === 'glow' || motion === 'pulse' ? 1400 : 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [t, motion]);

  if (motion === 'none') {
    return <View style={style}>{children}</View>;
  }

  const transform =
    motion === 'cartoon'
      ? [
          { translateY: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -8, -4] }) },
          { scaleX: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.06, 0.96] }) },
          { scaleY: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.94, 1.06] }) },
        ]
      : motion === 'bob'
      ? [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }]
      : motion === 'sway'
        ? [{ rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '6deg'] }) }]
        : motion === 'tilt'
          ? [{ rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] }) }]
          : motion === 'pulse' || motion === 'glow'
            ? [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }]
            : [];

  const opacity =
    motion === 'glow'
      ? t.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] })
      : 1;

  return (
    <Animated.View style={[style, { transform, opacity }]}>{children}</Animated.View>
  );
}

/** One-shot bounce by default. Pass loop for mystery gift etc. */
export function BounceView({
  children,
  style,
  delay = 0,
  amount = 10,
  loop = false,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
  amount?: number;
  loop?: boolean;
}) {
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const once = Animated.sequence([
      Animated.delay(delay),
      Animated.timing(y, {
        toValue: -amount,
        duration: 450,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(y, {
        toValue: 0,
        duration: 450,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ]);
    if (loop) {
      const l = Animated.loop(once);
      l.start();
      return () => l.stop();
    }
    once.start();
  }, [y, delay, amount, loop]);
  return <Animated.View style={[style, { transform: [{ translateY: y }] }]}>{children}</Animated.View>;
}

/** Gentle float for card titles — kid-friendly, not noisy */
export function BobbingLabel({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 420,
      delay,
      useNativeDriver: true,
    }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(y, {
          toValue: 1,
          duration: 1700,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(y, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [y, opacity, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY: y.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function PopIn({
  children,
  trigger,
  style,
}: {
  children: React.ReactNode;
  trigger: number | string;
  style?: StyleProp<ViewStyle>;
}) {
  const scale = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    scale.setValue(0.6);
    Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
  }, [trigger, scale]);
  return <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>;
}

export function PulseRing({ active }: { active: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active) return;
    scale.setValue(1);
    opacity.setValue(0.7);
    Animated.parallel([
      Animated.timing(scale, { toValue: 1.8, duration: 500, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [active, scale, opacity]);
  if (!active) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.ring, { opacity, transform: [{ scale }] }]}
    />
  );
}

const CONFETTI = ['⭐', '✨', '🎉', '🌟', '💛', '🎈', '🦊', '🌈'];

export function ConfettiBurst({ active }: { active: boolean }) {
  const pieces = useRef(
    CONFETTI.map((_, i) => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      o: new Animated.Value(0),
      emoji: CONFETTI[i],
      left: 10 + (i % 4) * 22,
    })),
  ).current;

  useEffect(() => {
    if (!active) return;
    pieces.forEach((p, i) => {
      p.x.setValue(0);
      p.y.setValue(0);
      p.o.setValue(1);
      Animated.parallel([
        Animated.timing(p.x, {
          toValue: (i % 2 === 0 ? -1 : 1) * (40 + i * 18),
          duration: 900 + i * 40,
          useNativeDriver: true,
        }),
        Animated.timing(p.y, {
          toValue: -120 - i * 16,
          duration: 900 + i * 40,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(p.o, { toValue: 0, duration: 1000, delay: 200, useNativeDriver: true }),
      ]).start();
    });
  }, [active, pieces]);

  if (!active) return null;
  return (
    <View pointerEvents="none" style={styles.confettiBox}>
      {pieces.map((p, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.confetti,
            {
              left: `${p.left}%`,
              opacity: p.o,
              transform: [{ translateX: p.x }, { translateY: p.y }],
            },
          ]}
        >
          {p.emoji}
        </Animated.Text>
      ))}
    </View>
  );
}

export function WiggleView({
  children,
  trigger,
  style,
}: {
  children: React.ReactNode;
  trigger: number;
  style?: StyleProp<ViewStyle>;
}) {
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!trigger) return;
    Animated.sequence([
      Animated.timing(x, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(x, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(x, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(x, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [trigger, x]);
  return <Animated.View style={[style, { transform: [{ translateX: x }] }]}>{children}</Animated.View>;
}

export function FloatingDecor() {
  const items = [
    { emoji: '☁️', top: '8%', left: '6%', delay: 0 },
    { emoji: '⭐', top: '18%', right: '10%', delay: 200 },
    { emoji: '🎈', top: '70%', left: '8%', delay: 400 },
    { emoji: '✨', top: '75%', right: '12%', delay: 100 },
  ];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {items.map((it, i) => (
        <BounceView
          key={i}
          delay={it.delay}
          amount={6}
          loop
          style={[styles.float, { top: it.top as any, left: it.left as any, right: it.right as any }]}
        >
          <Text style={{ fontSize: 28, opacity: 0.45 }}>{it.emoji}</Text>
        </BounceView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    ...StyleSheet.absoluteFill,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: '#FFD54A',
  },
  confettiBox: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  confetti: {
    position: 'absolute',
    fontSize: 28,
    top: '45%',
  },
  float: { position: 'absolute' },
});
