import React from 'react';
import { AppHeader, HeaderBackTo } from './ui';
import { speak } from '../services/voice';

type Props = {
  title: string;
  onBack?: () => void;
  prompt?: string;
  onSpeak?: () => void;
  round?: number;
  backTo?: HeaderBackTo;
  backLabel?: string;
  backEmoji?: string;
};

/** ← · title · speaker — back arrow only, no breadcrumb */
export function GameHeader({
  title,
  onBack,
  prompt,
  onSpeak,
  round,
  backTo,
  backLabel = 'My World',
  backEmoji,
}: Props) {
  const parent: HeaderBackTo | undefined = backTo
    ? backTo
    : onBack
      ? { label: backLabel, emoji: backEmoji, onPress: onBack }
      : undefined;

  return (
    <AppHeader
      title={title}
      subtitle={typeof round === 'number' ? `Round ${round + 1}` : undefined}
      left="back"
      right="speaker"
      backTo={parent}
      onRightPress={() => {
        if (onSpeak) onSpeak();
        else if (prompt) speak(prompt);
        else speak(title);
      }}
    />
  );
}
