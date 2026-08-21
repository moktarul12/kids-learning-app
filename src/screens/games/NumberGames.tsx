import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RootStackProps } from '../../navigation/types';
import { GameShell } from '../../components/GameShell';
import { BigButton } from '../../components/BigButton';
import { LivingIcon } from '../../components/KidAnimations';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useGameSession, randInt, shuffle } from '../../hooks/useGameSession';
import { speak } from '../../services/voice';

export function NumberIntroScreen({ navigation }: RootStackProps<'NumberIntro'>) {
  const [n, setN] = useState(1);
  const prompt = `Number ${n}`;
  const { showReward, celebrate, playNext, streak, round } = useGameSession({
    gameId: 'number_intro',
    skill: 'numbers',
    prompt,
  });
  useEffect(() => setN(1), [round]);
  useEffect(() => speak(prompt), [n, prompt]);

  return (
    <GameShell
      title="Meet Numbers"
      prompt={prompt}
      promptEmoji="🔢"
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Number World"
      backEmoji="🔢"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
    >
      <LivingIcon motion="pulse">
        <Text style={styles.mega}>{n}</Text>
      </LivingIcon>
      <Text style={styles.stars}>{'⭐'.repeat(n)}</Text>
      <BigButton
        label={n < 10 ? 'Next' : 'Finish'}
        onPress={() => (n < 10 ? setN(n + 1) : celebrate())}
        color={colors.blue}
        textColor="#FFF"
      />
    </GameShell>
  );
}

export function CountObjectsScreen({ navigation }: RootStackProps<'CountObjects'>) {
  const prompt = 'How many apples?';
  const { showReward, hint, celebrate, almost, playNext, streak, round } = useGameSession({
    gameId: 'count_objects',
    skill: 'numbers',
    dailyTaskId: 'count_five',
    prompt,
  });
  const count = useMemo(() => randInt(2, 8), [round]);
  const options = useMemo(() => shuffle([count, count + 1, Math.max(1, count - 1)]), [count, round]);

  return (
    <GameShell
      title="Count"
      prompt={prompt}
      promptEmoji="🍎"
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Number World"
      backEmoji="🔢"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      <View style={styles.wrap}>
        {Array.from({ length: count }).map((_, i) => (
          <Text key={i} style={{ fontSize: 42 }}>
            🍎
          </Text>
        ))}
      </View>
      <View style={styles.row}>
        {options.map((o) => (
          <Pressable
            key={`${round}-${o}`}
            style={styles.opt}
            onPress={() => (o === count ? (speak(`Yes! ${count}`), celebrate()) : almost())}
          >
            <Text style={styles.optText}>{o}</Text>
          </Pressable>
        ))}
      </View>
    </GameShell>
  );
}

export function CountCollectScreen({ navigation }: RootStackProps<'CountCollect'>) {
  const { showReward, celebrate, playNext, streak, round } = useGameSession({
    gameId: 'count_collect',
    skill: 'numbers',
    prompt: 'Feed the monster',
  });
  const need = useMemo(() => randInt(3, 6), [round]);
  const [given, setGiven] = useState(0);
  const prompt = `Give ${need} apples`;

  useEffect(() => {
    setGiven(0);
    speak(prompt);
  }, [round, prompt]);

  return (
    <GameShell
      title="Feed Monster"
      prompt={prompt}
      promptEmoji="👾"
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Number World"
      backEmoji="🔢"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      rewardMessage="Yum!"
    >
      <LivingIcon motion="sway">
        <Text style={{ fontSize: 72 }}>👾</Text>
      </LivingIcon>
      <Text style={styles.seq}>
        {given}/{need} {'🍎'.repeat(given)}
      </Text>
      <View style={styles.wrap}>
        {Array.from({ length: need + 2 }).map((_, i) => (
          <Pressable
            key={i}
            onPress={() => {
              if (given >= need) return;
              const next = given + 1;
              setGiven(next);
              speak(String(next));
              if (next === need) setTimeout(() => celebrate('Yum!'), 250);
            }}
          >
            <Text style={{ fontSize: 40 }}>🍎</Text>
          </Pressable>
        ))}
      </View>
    </GameShell>
  );
}

export function BeforeAfterScreen({ navigation }: RootStackProps<'BeforeAfter'>) {
  const { showReward, hint, celebrate, almost, playNext, streak, round } = useGameSession({
    gameId: 'before_after',
    skill: 'numbers',
    prompt: 'What number?',
  });
  const mode = useMemo(() => (Math.random() > 0.5 ? 'before' : 'after'), [round]);
  const n = useMemo(() => randInt(3, 9), [round]);
  const answer = mode === 'before' ? n - 1 : n + 1;
  const options = useMemo(
    () => shuffle([answer, answer + 1, Math.max(1, answer - 1)]),
    [answer, round],
  );
  const prompt = mode === 'before' ? `Before ${n}?` : `After ${n}?`;

  useEffect(() => speak(prompt), [round, prompt]);

  return (
    <GameShell
      title={mode === 'before' ? 'Before' : 'After'}
      prompt={prompt}
      promptEmoji="↔️"
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Number World"
      backEmoji="🔢"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      <Text style={styles.seq}>{mode === 'before' ? `? → ${n}` : `${n} → ?`}</Text>
      <View style={styles.row}>
        {options.map((o) => (
          <Pressable key={`${round}-${o}`} style={styles.opt} onPress={() => (o === answer ? celebrate() : almost())}>
            <Text style={styles.optText}>{o}</Text>
          </Pressable>
        ))}
      </View>
    </GameShell>
  );
}

export function MissingNumberScreen({ navigation }: RootStackProps<'MissingNumber'>) {
  const { showReward, hint, celebrate, almost, playNext, streak, round } = useGameSession({
    gameId: 'missing_number',
    skill: 'numbers',
    prompt: 'What is missing?',
  });
  const mid = useMemo(() => randInt(3, 8), [round]);
  const options = useMemo(() => shuffle([mid, mid + 1, mid - 1]), [mid, round]);
  const prompt = 'What is missing?';

  useEffect(() => speak(prompt), [round]);

  return (
    <GameShell
      title="Missing Number"
      prompt={prompt}
      promptEmoji="❓"
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Number World"
      backEmoji="🔢"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      <Text style={styles.seq}>
        {mid - 1} → ? → {mid + 1}
      </Text>
      <View style={styles.row}>
        {options.map((o) => (
          <Pressable key={`${round}-${o}`} style={styles.opt} onPress={() => (o === mid ? celebrate() : almost())}>
            <Text style={styles.optText}>{o}</Text>
          </Pressable>
        ))}
      </View>
    </GameShell>
  );
}

export function NumberTrainScreen({ navigation }: RootStackProps<'NumberTrain'>) {
  const { showReward, hint, celebrate, almost, playNext, streak, round } = useGameSession({
    gameId: 'number_train',
    skill: 'numbers',
    badge: 'number_master',
    prompt: 'Fix the train',
  });
  const missing = useMemo(() => randInt(2, 4), [round]);
  const options = useMemo(
    () => shuffle([missing, missing + 2, Math.max(1, missing - 1)]),
    [missing, round],
  );

  useEffect(() => speak('Fix the number train'), [round]);

  return (
    <GameShell
      title="Number Train"
      prompt="Fix the train!"
      promptEmoji="🚂"
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Number World"
      backEmoji="🔢"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
      rewardMessage="Choo choo!"
    >
      <Text style={{ fontSize: 40 }}>🚂</Text>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((c) => (
          <View key={c} style={[styles.coach, c === missing && styles.missing]}>
            <Text style={styles.coachText}>{c === missing ? '?' : c}</Text>
          </View>
        ))}
      </View>
      <View style={styles.row}>
        {options.map((o) => (
          <Pressable
            key={`${round}-${o}`}
            style={styles.opt}
            onPress={() => (o === missing ? celebrate('Choo choo!') : almost())}
          >
            <Text style={styles.optText}>{o}</Text>
          </Pressable>
        ))}
      </View>
    </GameShell>
  );
}

export function MoreLessScreen({ navigation }: RootStackProps<'MoreLess'>) {
  const { showReward, hint, celebrate, almost, playNext, streak, round } = useGameSession({
    gameId: 'more_less',
    skill: 'numbers',
    prompt: 'Which has more?',
  });
  const a = useMemo(() => randInt(2, 6), [round]);
  const b = useMemo(() => {
    let x = randInt(2, 6);
    while (x === a) x = randInt(2, 6);
    return x;
  }, [a, round]);
  const more = a > b ? 'a' : 'b';

  useEffect(() => speak('Which has more?'), [round]);

  return (
    <GameShell
      title="More or Less"
      prompt="Which has more?"
      promptEmoji="⚖️"
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Number World"
      backEmoji="🔢"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      <View style={styles.row}>
        <Pressable style={styles.pile} onPress={() => (more === 'a' ? celebrate() : almost())}>
          <Text>{'🍎'.repeat(a)}</Text>
        </Pressable>
        <Pressable style={styles.pile} onPress={() => (more === 'b' ? celebrate() : almost())}>
          <Text>{'🍇'.repeat(b)}</Text>
        </Pressable>
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  mega: { ...typography.mega, color: colors.blue },
  stars: { fontSize: 28, letterSpacing: 4 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  opt: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#E8F4FF',
    borderWidth: 3,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optText: { ...typography.title, fontSize: 28, color: colors.blue },
  seq: { ...typography.mega, fontSize: 40, color: colors.ink },
  coach: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missing: { backgroundColor: colors.yellow },
  coachText: { ...typography.title, color: '#FFF', fontSize: 22 },
  pile: {
    backgroundColor: '#F3F8FF',
    borderRadius: 22,
    padding: 16,
    minWidth: 130,
    minHeight: 130,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D7E6F7',
  },
});
