import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { ConfettiBurst, LivingIcon } from './KidAnimations';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { speak } from '../services/voice';
import { playSuccessFanfare } from '../services/sound';

type Props = {
  visible: boolean;
  stars?: number;
  coins?: number;
  message?: string;
  streak?: number;
  onNext?: () => void;
  onContinue?: () => void;
};

/**
 * Brief celebration — clap + congratulations voice, then auto-advance.
 */
export function RewardModal({
  visible,
  stars = 3,
  coins = 10,
  message = 'Congratulations!',
  streak = 0,
  onNext,
  onContinue,
}: Props) {
  const pop = useRef(new Animated.Value(0)).current;
  const nextRef = useRef(onNext ?? onContinue ?? (() => {}));
  nextRef.current = onNext ?? onContinue ?? (() => {});

  const display =
    !message || message === 'Great Job!' || message === 'Yay!' ? 'Congratulations!' : message;

  useEffect(() => {
    if (!visible) return;
    pop.setValue(0);
    Animated.spring(pop, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    playSuccessFanfare().catch(() => {});
    const voiceT = setTimeout(() => {
      speak(display.replace(/!+$/, '') || 'Congratulations');
    }, 320);
    const t = setTimeout(() => nextRef.current(), 1900);
    return () => {
      clearTimeout(t);
      clearTimeout(voiceT);
    };
  }, [visible, pop, display]);

  if (!visible) return null;

  return (
    <View style={styles.backdrop} pointerEvents="none">
      <ConfettiBurst active={visible} />
      <Animated.View style={[styles.card, { transform: [{ scale: pop }] }]}>
        <LivingIcon motion="pulse">
          <Text style={styles.emoji}>👏</Text>
        </LivingIcon>
        <Text style={styles.message}>{display}</Text>
        {streak > 1 ? <Text style={styles.streak}>Streak ×{streak}</Text> : null}
        <View style={styles.row}>
          <Text style={styles.reward}>⭐ +{stars}</Text>
          <Text style={styles.reward}>🪙 +{coins}</Text>
        </View>
        <Text style={styles.nextHint}>Next one…</Text>
      </Animated.View>
    </View>
  );
}

export function FeedbackToast({ text }: { text: string }) {
  return (
    <View style={styles.toast}>
      <Text style={styles.toastText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(20, 50, 90, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    zIndex: 50,
  },
  card: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: '#FFF',
    borderRadius: 28,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 4,
    borderWidth: 4,
    borderColor: '#FFE08A',
  },
  emoji: { fontSize: 44 },
  message: { ...typography.title, fontSize: 22, color: colors.blue, textAlign: 'center' },
  streak: { ...typography.subtitle, color: colors.orange },
  row: { flexDirection: 'row', gap: 18, marginVertical: 8 },
  reward: { ...typography.title, fontSize: 20 },
  nextHint: { ...typography.caption, color: colors.inkMuted, marginTop: 4 },
  toast: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    zIndex: 60,
  },
  toastText: { ...typography.body, color: '#FFF' },
});
