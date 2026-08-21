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
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);

  useEffect(() => {
    setPicked(null);
    setWrong(null);
  }, [round]);

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
      {/* Orchard stage — big apples to count */}
      <View style={styles.orchard}>
        <Text style={styles.orchardLabel}>Count the apples</Text>
        <View style={styles.appleGrid}>
          {Array.from({ length: count }).map((_, i) => (
            <LivingIcon key={`${round}-${i}`} motion="bob">
              <Text style={styles.apple}>{['🍎', '🍏'][i % 2]}</Text>
            </LivingIcon>
          ))}
        </View>
        <View style={styles.basketHint}>
          <Text style={styles.basketEmoji}>🧺</Text>
          <Text style={styles.basketText}>Tap the number below</Text>
        </View>
      </View>

      <View style={styles.answerRow}>
        {options.map((o) => {
          const isWrong = wrong === o;
          const isRight = picked === o && o === count;
          return (
            <Pressable
              key={`${round}-${o}`}
              onPress={() => {
                if (o === count) {
                  setPicked(o);
                  speak(`Yes! ${count}`);
                  celebrate();
                } else {
                  setWrong(o);
                  setTimeout(() => setWrong(null), 450);
                  almost('Count again!');
                }
              }}
              style={({ pressed }) => [
                styles.numBtn,
                isRight && styles.numBtnRight,
                isWrong && styles.numBtnWrong,
                { transform: [{ scale: pressed ? 0.94 : 1 }] },
              ]}
            >
              <Text style={[styles.numBtnText, isRight && { color: '#FFF' }, isWrong && { color: '#FFF' }]}>
                {o}
              </Text>
            </Pressable>
          );
        })}
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
  const [wrong, setWrong] = useState<number | null>(null);
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    setWrong(null);
    setFilled(false);
    speak('Fix the number train');
  }, [round]);

  const cars = [1, 2, 3, 4, 5];

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
      <Text style={styles.trainHint}>Which number is missing?</Text>

      {/* Track + train */}
      <View style={styles.trainStage}>
        <LivingIcon motion="bob">
          <Text style={styles.engine}>🚂</Text>
        </LivingIcon>

        <View style={styles.trainCars}>
          {cars.map((c) => {
            const isGap = c === missing && !filled;
            const isFilled = c === missing && filled;
            return (
              <View key={c} style={styles.carWrap}>
                <View
                  style={[
                    styles.car,
                    isGap && styles.carGap,
                    isFilled && styles.carFilled,
                    !isGap && !isFilled && styles.carSolid,
                  ]}
                >
                  <Text style={[styles.carNum, isGap && styles.carNumGap]}>
                    {isGap ? '?' : c}
                  </Text>
                </View>
                <View style={styles.wheels}>
                  <View style={styles.wheel} />
                  <View style={styles.wheel} />
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.track} />
        <View style={styles.trackTies}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.tie} />
          ))}
        </View>
      </View>

      <Text style={styles.pickLabel}>Pick the missing number</Text>

      <View style={styles.answerRow}>
        {options.map((o) => {
          const isWrong = wrong === o;
          return (
            <Pressable
              key={`${round}-${o}`}
              onPress={() => {
                if (o === missing) {
                  setFilled(true);
                  speak(`Yes! ${missing}`);
                  setTimeout(() => celebrate('Choo choo!'), 400);
                } else {
                  setWrong(o);
                  setTimeout(() => setWrong(null), 450);
                  almost('Try another car!');
                }
              }}
              style={({ pressed }) => [
                styles.numBtn,
                isWrong && styles.numBtnWrong,
                { transform: [{ scale: pressed ? 0.94 : 1 }] },
              ]}
            >
              <Text style={[styles.numBtnText, isWrong && { color: '#FFF' }]}>{o}</Text>
            </Pressable>
          );
        })}
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
  orchard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#E8FBE8',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#B8E8B8',
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 12,
  },
  orchardLabel: {
    ...typography.kidLabel,
    fontSize: 16,
    color: colors.inkMuted,
  },
  appleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    minHeight: 140,
    alignItems: 'center',
  },
  apple: {
    fontSize: 68,
    lineHeight: 76,
  },
  basketHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  basketEmoji: { fontSize: 22 },
  basketText: {
    ...typography.kidLabel,
    fontSize: 14,
    color: colors.ink,
  },
  answerRow: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'center',
    marginTop: 4,
  },
  numBtn: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBtnRight: {
    backgroundColor: colors.lime,
    borderColor: colors.lime,
  },
  numBtnWrong: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  numBtnText: {
    ...typography.title,
    fontSize: 36,
    color: colors.blue,
  },
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
  trainHint: {
    ...typography.kidLabel,
    fontSize: 16,
    color: colors.inkMuted,
  },
  trainStage: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    backgroundColor: '#E8F6FC',
    borderRadius: 28,
    paddingTop: 12,
    paddingBottom: 18,
    paddingHorizontal: 8,
    borderWidth: 3,
    borderColor: '#B8DFF0',
  },
  engine: {
    fontSize: 72,
    lineHeight: 80,
    marginBottom: 4,
  },
  trainCars: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  carWrap: {
    alignItems: 'center',
    gap: 4,
  },
  car: {
    width: 56,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  carSolid: {
    backgroundColor: colors.coral,
    borderColor: '#E04545',
  },
  carGap: {
    backgroundColor: '#FFF8E1',
    borderColor: colors.yellow,
    borderStyle: 'dashed',
  },
  carFilled: {
    backgroundColor: colors.lime,
    borderColor: '#5ECF5A',
  },
  carNum: {
    ...typography.title,
    fontSize: 28,
    color: '#FFF',
  },
  carNumGap: {
    color: colors.inkMuted,
    fontSize: 30,
  },
  wheels: {
    flexDirection: 'row',
    gap: 10,
  },
  wheel: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4A5568',
  },
  track: {
    marginTop: 8,
    width: '92%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8B7355',
  },
  trackTies: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '88%',
    marginTop: 4,
  },
  tie: {
    width: 14,
    height: 6,
    borderRadius: 2,
    backgroundColor: '#A08060',
  },
  pickLabel: {
    ...typography.kidLabel,
    fontSize: 15,
    color: colors.ink,
    marginTop: 4,
  },
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
