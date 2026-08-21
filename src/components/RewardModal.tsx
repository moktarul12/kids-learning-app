import React, { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';
import { BigButton } from './BigButton';
import { ConfettiBurst, LivingIcon } from './KidAnimations';
import { FoxMascot } from './FoxMascot';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { speak } from '../services/voice';

type Props = {
  visible: boolean;
  stars?: number;
  coins?: number;
  message?: string;
  streak?: number;
  onNext?: () => void;
  onContinue?: () => void;
};

export function RewardModal({
  visible,
  stars = 3,
  coins = 10,
  message = 'Great Job!',
  streak = 0,
  onNext,
  onContinue,
}: Props) {
  const pop = useRef(new Animated.Value(0)).current;
  const next = onNext ?? onContinue ?? (() => {});

  useEffect(() => {
    if (!visible) return;
    pop.setValue(0);
    Animated.spring(pop, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    speak('Amazing!');
  }, [visible, pop]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <ConfettiBurst active={visible} />
        <Animated.View style={[styles.card, { transform: [{ scale: pop }] }]}>
          <LivingIcon motion="pulse">
            <Text style={styles.emoji}>🎉</Text>
          </LivingIcon>
          <Text style={styles.message}>{message}</Text>
          <FoxMascot mood="excited" size={64} bounce={false} />
          {streak > 1 ? <Text style={styles.streak}>Streak ×{streak}</Text> : null}
          <View style={styles.row}>
            <Text style={styles.reward}>⭐ +{stars}</Text>
            <Text style={styles.reward}>🪙 +{coins}</Text>
          </View>
          <BigButton label="Continue" onPress={next} color={colors.red} textColor="#FFF" style={{ width: '100%' }} />
        </Animated.View>
      </View>
    </Modal>
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
    flex: 1,
    backgroundColor: 'rgba(20, 50, 90, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    gap: 6,
    borderWidth: 4,
    borderColor: '#FFE08A',
  },
  emoji: { fontSize: 32 },
  message: { ...typography.title, fontSize: 28, color: colors.red },
  streak: { ...typography.subtitle, color: colors.orange },
  row: { flexDirection: 'row', gap: 20, marginVertical: 10 },
  reward: { ...typography.title, fontSize: 22 },
  toast: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  toastText: { ...typography.body, color: '#FFF' },
});
