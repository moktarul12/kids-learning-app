import { useCallback, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { BadgeId, SkillId, useProgress } from '../state/ProgressContext';
import { speak, stopVoice } from '../services/voice';

export function useGameSession(opts: {
  gameId: string;
  skill: SkillId;
  badge?: BadgeId;
  stars?: number;
  coins?: number;
  dailyTaskId?: string;
  /** Spoken when the screen / round loads */
  prompt?: string;
}) {
  const navigation = useNavigation();
  const { addReward, completeDailyTask } = useProgress();
  const [showReward, setShowReward] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (opts.prompt) {
      const t = setTimeout(() => speak(opts.prompt!), 450);
      return () => {
        clearTimeout(t);
        stopVoice();
      };
    }
  }, [opts.prompt, round]);

  const speakPrompt = useCallback(() => {
    if (opts.prompt) speak(opts.prompt);
  }, [opts.prompt]);

  const celebrate = useCallback(
    (_customMsg?: string) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      addReward({
        stars: opts.stars ?? 3,
        coins: opts.coins ?? 10,
        skill: opts.skill,
        gameId: opts.gameId,
        badge: opts.badge,
      });
      if (opts.dailyTaskId) completeDailyTask(opts.dailyTaskId);
      setStreak((s) => s + 1);
      setShowReward(true);
    },
    [addReward, completeDailyTask, opts],
  );

  const almost = useCallback((msg = 'Try again!') => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    speak(msg);
    setHint(msg);
    setTimeout(() => setHint(null), 1600);
  }, []);

  /** Next question / round — stay in the game (silent — celebration already spoke) */
  const playNext = useCallback(() => {
    setShowReward(false);
    setRound((r) => r + 1);
  }, []);

  /** Leave the game */
  const goHome = useCallback(() => {
    setShowReward(false);
    stopVoice();
    navigation.goBack();
  }, [navigation]);

  /** @deprecated use playNext — kept so older calls still advance rounds */
  const finishContinue = playNext;

  return {
    showReward,
    hint,
    round,
    streak,
    celebrate,
    almost,
    playNext,
    goHome,
    finishContinue,
    speakPrompt,
  };
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
