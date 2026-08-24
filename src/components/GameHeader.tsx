import React from 'react';
import { AppHeader, HeaderBackTo } from './ui';
import { speak } from '../services/voice';

type Props = {
  title: string;
  titleEmoji?: string;
  onBack?: () => void;
  prompt?: string;
  onSpeak?: () => void;
  round?: number;
  backTo?: HeaderBackTo;
  backLabel?: string;
  backEmoji?: string;
};

/** Back arrow · full-width title banner · speaker */
export function GameHeader({
  title,
  titleEmoji,
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
      titleEmoji={titleEmoji ?? backEmoji}
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
