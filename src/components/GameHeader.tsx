import React from 'react';
import { AppHeader, HeaderBackTo } from './ui';
import { speak } from '../services/voice';

type Props = {
  title: string;
  onBack?: () => void;
  onHome?: () => void;
  prompt?: string;
  onSpeak?: () => void;
  round?: number;
  backTo?: HeaderBackTo;
  backLabel?: string;
  backEmoji?: string;
  trail?: HeaderBackTo[];
};

/** Line 1: ← · title · speaker · Line 2: My World › World */
export function GameHeader({
  title,
  onBack,
  onHome,
  prompt,
  onSpeak,
  round,
  backTo,
  backLabel = 'My World',
  backEmoji,
  trail,
}: Props) {
  const parent: HeaderBackTo | undefined = backTo
    ? backTo
    : onBack
      ? { label: backLabel, emoji: backEmoji, onPress: onBack }
      : undefined;

  const resolvedTrail: HeaderBackTo[] | undefined =
    trail ??
    (parent
      ? onHome && backLabel !== 'My World'
        ? [
            { label: 'My World', emoji: '🌐', onPress: onHome },
            parent,
          ]
        : [parent]
      : undefined);

  return (
    <AppHeader
      title={title}
      subtitle={typeof round === 'number' ? `Round ${round + 1}` : undefined}
      left="back"
      right="speaker"
      backTo={parent}
      trail={resolvedTrail}
      onRightPress={() => {
        if (onSpeak) onSpeak();
        else if (prompt) speak(prompt);
        else speak(title);
      }}
    />
  );
}
