import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Mood = 'happy' | 'thinking' | 'excited' | 'proud';

const faces: Record<Mood, string> = {
  happy: '🦊',
  thinking: '🦊',
  excited: '🦊',
  proud: '🦊',
};

export function FoxMascot({
  mood = 'happy',
  size = 96,
  bounce = false,
}: {
  mood?: Mood;
  size?: number;
  bounce?: boolean;
}) {
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!bounce) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: -10, duration: 700, useNativeDriver: true }),
        Animated.timing(y, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bounce, y]);

  return (
    <Animated.View style={{ transform: [{ translateY: y }] }}>
      <View style={[styles.bubble, { width: size + 24, height: size + 24 }]}>
        <Text style={{ fontSize: size * 0.72 }}>{faces[mood]}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
