import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RootStackProps } from '../../navigation/types';
import {
  AppShell,
  ActivityHeader,
  ContentStage,
  AnswerCard,
  PrimaryButton,
  ProgressIndicator,
} from '../../components/ui';
import { LivingIcon } from '../../components/KidAnimations';
import { RewardModal } from '../../components/RewardModal';
import { colors, fonts, radii, shadows, spacing } from '../../theme';
import { learningColors } from '../../theme/colors';
import { useGameSession } from '../../hooks/useGameSession';
import { speak } from '../../services/voice';
import {
  BACKGROUNDS,
  FIND_COLOR_ACTIVITIES,
  LEARN_COLOR_STEPS,
  FindColorActivity,
} from '../../data/colorActivities';

function ActivityFrame({
  background,
  title,
  round,
  prompt,
  onBack,
  onHome,
  onSpeak,
  progressCurrent,
  progressTotal = 10,
  children,
  showReward,
  onNext,
  streak,
}: {
  background: number;
  title: string;
  round: number;
  prompt: string;
  onBack: () => void;
  onHome: () => void;
  onSpeak: () => void;
  progressCurrent: number;
  progressTotal?: number;
  children: React.ReactNode;
  showReward: boolean;
  onNext: () => void;
  streak: number;
}) {
  return (
    <AppShell background={background}>
      <ActivityHeader
        title={title}
        round={round}
        onSpeak={onSpeak}
        backTo={{ label: 'Color World', emoji: '🎨', onPress: onBack }}
        trail={[
          { label: 'My World', emoji: '🌐', onPress: onHome },
          { label: 'Color World', emoji: '🎨', onPress: onBack },
        ]}
      />
      <View style={styles.body}>
        <ContentStage>
          <Text style={styles.prompt}>{prompt}</Text>
          <View style={styles.content}>{children}</View>
          <ProgressIndicator current={progressCurrent} total={progressTotal} />
        </ContentStage>
      </View>
      <RewardModal visible={showReward} onNext={onNext} streak={streak} message="Great Job!" />
    </AppShell>
  );
}

/** LEARN COLORS — plan.txt */
export function LearnColorScreen({ navigation }: RootStackProps<'LearnColor'>) {
  const [idx, setIdx] = useState(0);
  const step = LEARN_COLOR_STEPS[idx];
  const prompt = `🎨 This is ${step.name}`;
  const { showReward, celebrate, playNext, streak, round } = useGameSession({
    gameId: 'learn_color',
    skill: 'colors',
    badge: 'color_explorer',
    prompt: `This is ${step.name}`,
  });

  useEffect(() => setIdx(0), [round]);
  useEffect(() => speak(`This is ${step.name}`), [idx, step.name]);

  return (
    <ActivityFrame
      background={BACKGROUNDS.learnColors}
      title="Learn Colors"
      round={round}
      prompt={prompt}
      onBack={() => navigation.goBack()}
      onHome={() => navigation.navigate('MainTabs' as never)}
      onSpeak={() => speak(`This is ${step.name}`)}
      progressCurrent={idx + 1}
      progressTotal={LEARN_COLOR_STEPS.length}
      showReward={showReward}
      onNext={playNext}
      streak={streak}
    >
      <LivingIcon motion="bob">
        <Text style={{ fontSize: 88 }}>{step.heroEmoji}</Text>
      </LivingIcon>

      <View style={[styles.colorBanner, { backgroundColor: step.hex }, shadows.soft]}>
        <Text style={styles.colorBannerText}>{step.name.toUpperCase()}</Text>
      </View>

      <View style={styles.choiceRow}>
        {step.choices.map((emoji) => (
          <AnswerCard key={emoji} emoji={emoji} size={84} onPress={() => speak(step.name)} />
        ))}
      </View>

      <View style={styles.dots}>
        {LEARN_COLOR_STEPS.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, { backgroundColor: i <= idx ? step.hex : colors.line }]}
          />
        ))}
      </View>

      <PrimaryButton
        label={idx < LEARN_COLOR_STEPS.length - 1 ? 'Next Color ›' : 'Finish'}
        color={step.hex}
        onPress={() => (idx < LEARN_COLOR_STEPS.length - 1 ? setIdx(idx + 1) : celebrate())}
        style={{ width: '100%', marginTop: 8 }}
      />
    </ActivityFrame>
  );
}

/** FIND COLOR — data-driven (Find Red / Blue / Yellow…) */
export function FindColorScreen({ navigation }: RootStackProps<'FindColor'>) {
  const { showReward, celebrate, almost, playNext, streak, round } = useGameSession({
    gameId: 'find_color',
    skill: 'colors',
    dailyTaskId: 'find_red',
    prompt: 'Find the color',
  });

  const activity: FindColorActivity = useMemo(
    () => FIND_COLOR_ACTIVITIES[round % FIND_COLOR_ACTIVITIES.length],
    [round],
  );

  const [found, setFound] = useState<string[]>([]);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const correctNeeded = activity.options.filter((o) => o.colorId === activity.targetColor).length;
  const progress = Math.min(found.length, 3);

  useEffect(() => {
    setFound([]);
    setShakeId(null);
    speak(activity.title);
  }, [round, activity.title]);

  return (
    <ActivityFrame
      background={activity.targetColor === 'red' ? BACKGROUNDS.findRed : BACKGROUNDS.learnColors}
      title={activity.title}
      round={round}
      prompt={activity.prompt}
      onBack={() => navigation.goBack()}
      onHome={() => navigation.navigate('MainTabs' as never)}
      onSpeak={() => speak(activity.title)}
      progressCurrent={progress}
      progressTotal={Math.min(3, correctNeeded)}
      showReward={showReward}
      onNext={playNext}
      streak={streak}
    >
      <View style={[styles.targetCircle, { backgroundColor: activity.targetHex }, shadows.soft]} />

      <View style={styles.answerGrid}>
        {activity.options.slice(0, 8).map((opt) => {
          const isFound = found.includes(opt.id);
          return (
            <AnswerCard
              key={opt.id}
              emoji={opt.emoji}
              size={102}
              correctHighlight={isFound}
              shakeKey={shakeId === opt.id ? shakeKey : 0}
              onPress={() => {
                if (isFound) return;
                if (opt.colorId === activity.targetColor) {
                  speak('Yes!');
                  const next = [...found, opt.id];
                  setFound(next);
                  if (next.length >= Math.min(3, correctNeeded)) celebrate();
                } else {
                  setShakeId(opt.id);
                  setShakeKey((k) => k + 1);
                  almost('Try again!');
                }
              }}
            />
          );
        })}
      </View>
    </ActivityFrame>
  );
}

export function SortColorScreen({ navigation }: RootStackProps<'SortColor'>) {
  const { showReward, celebrate, almost, playNext, streak, round } = useGameSession({
    gameId: 'sort_color',
    skill: 'colors',
    prompt: 'Sort into baskets',
  });
  const makeQueue = () =>
    [
      { emoji: '🍎', colorId: 'red' },
      { emoji: '❤️', colorId: 'red' },
      { emoji: '💧', colorId: 'blue' },
      { emoji: '🐟', colorId: 'blue' },
      { emoji: '🚗', colorId: 'red' },
      { emoji: '🧢', colorId: 'blue' },
    ].sort(() => Math.random() - 0.5);
  const [queue, setQueue] = useState(makeQueue);
  const current = queue[0];
  useEffect(() => setQueue(makeQueue()), [round]);

  return (
    <ActivityFrame
      background={BACKGROUNDS.colorWorld}
      title="Color Sort"
      round={round}
      prompt="🧺 Sort into baskets"
      onBack={() => navigation.goBack()}
      onHome={() => navigation.navigate('MainTabs' as never)}
      onSpeak={() => speak('Sort into baskets')}
      progressCurrent={6 - queue.length}
      progressTotal={6}
      showReward={showReward}
      onNext={playNext}
      streak={streak}
    >
      {current ? (
        <LivingIcon motion="bob">
          <Text style={{ fontSize: 72 }}>{current.emoji}</Text>
        </LivingIcon>
      ) : null}
      <View style={styles.choiceRow}>
        {[learningColors[0], learningColors[1]].map((b) => (
          <PrimaryButton
            key={b.id}
            label={`${b.name} 🧺`}
            color={b.hex}
            onPress={() => {
              if (!current) return;
              if (current.colorId === b.id) {
                speak(b.name);
                const next = queue.slice(1);
                setQueue(next);
                if (!next.length) celebrate();
              } else almost();
            }}
            style={{ flex: 1 }}
          />
        ))}
      </View>
    </ActivityFrame>
  );
}

export function MatchColorScreen({ navigation }: RootStackProps<'MatchColor'>) {
  const { showReward, celebrate, almost, playNext, streak, round } = useGameSession({
    gameId: 'match_color',
    skill: 'colors',
    prompt: 'Match the colors',
  });
  const pairs = useMemo(
    () =>
      [
        { color: learningColors[0], emoji: '🍎' },
        { color: learningColors[3], emoji: '🌳' },
        { color: learningColors[2], emoji: '☀️' },
      ].sort(() => Math.random() - 0.5),
    [round],
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  useEffect(() => {
    setSelected(null);
    setMatched([]);
  }, [round]);

  return (
    <ActivityFrame
      background={BACKGROUNDS.learnColors}
      title="Color Match"
      round={round}
      prompt="🔗 Match the colors"
      onBack={() => navigation.goBack()}
      onHome={() => navigation.navigate('MainTabs' as never)}
      onSpeak={() => speak('Match the colors')}
      progressCurrent={matched.length}
      progressTotal={pairs.length}
      showReward={showReward}
      onNext={playNext}
      streak={streak}
    >
      <View style={styles.choiceRow}>
        {pairs.map((p) => (
          <Pressable
            key={p.color.id}
            onPress={() => !matched.includes(p.color.id) && setSelected(p.color.id)}
            style={[
              styles.colorChip,
              { backgroundColor: p.color.hex },
              selected === p.color.id && { borderWidth: 4, borderColor: colors.darkText },
              matched.includes(p.color.id) && { opacity: 0.35 },
            ]}
          />
        ))}
      </View>
      <View style={styles.choiceRow}>
        {[...pairs].reverse().map((p) => (
          <AnswerCard
            key={p.emoji}
            emoji={p.emoji}
            size={96}
            correctHighlight={matched.includes(p.color.id)}
            onPress={() => {
              if (!selected) return;
              if (selected === p.color.id) {
                speak('Match!');
                const next = [...matched, p.color.id];
                setMatched(next);
                setSelected(null);
                if (next.length === pairs.length) celebrate();
              } else almost();
            }}
          />
        ))}
      </View>
    </ActivityFrame>
  );
}

export function MixColorScreen({ navigation }: RootStackProps<'MixColor'>) {
  const mixes = [
    { a: learningColors[0], b: learningColors[2], result: learningColors[4], label: 'Orange' },
    { a: learningColors[1], b: learningColors[2], result: learningColors[3], label: 'Green' },
  ];
  const [step, setStep] = useState(0);
  const mix = mixes[step % mixes.length];
  const { showReward, celebrate, playNext, streak, round } = useGameSession({
    gameId: 'mix_color',
    skill: 'colors',
    prompt: `${mix.a.name} plus ${mix.b.name}`,
  });
  useEffect(() => setStep(0), [round]);
  useEffect(() => speak(`${mix.a.name} plus ${mix.b.name} makes ${mix.label}`), [step, mix]);

  return (
    <ActivityFrame
      background={BACKGROUNDS.colorWorld}
      title="Color Mix"
      round={round}
      prompt={`🧪 ${mix.a.name} + ${mix.b.name}`}
      onBack={() => navigation.goBack()}
      onHome={() => navigation.navigate('MainTabs' as never)}
      onSpeak={() => speak(`${mix.a.name} plus ${mix.b.name} makes ${mix.label}`)}
      progressCurrent={step + 1}
      progressTotal={mixes.length}
      showReward={showReward}
      onNext={playNext}
      streak={streak}
    >
      <View style={styles.choiceRow}>
        <View style={[styles.tube, { backgroundColor: mix.a.hex }]} />
        <Text style={styles.plus}>+</Text>
        <View style={[styles.tube, { backgroundColor: mix.b.hex }]} />
        <Text style={styles.plus}>=</Text>
        <View style={[styles.tube, { backgroundColor: mix.result.hex }]}>
          <Text style={styles.tubeLabel}>{mix.label}</Text>
        </View>
      </View>
      <PrimaryButton
        label={step < mixes.length - 1 ? 'Next Mix ›' : 'Finish'}
        color={mix.result.hex}
        onPress={() => (step < mixes.length - 1 ? setStep(step + 1) : celebrate())}
        style={{ width: '100%' }}
      />
    </ActivityFrame>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  prompt: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.darkText,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  colorBanner: {
    width: '100%',
    maxWidth: 280,
    borderRadius: radii.button,
    paddingVertical: 14,
    alignItems: 'center',
  },
  colorBannerText: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: colors.white,
    letterSpacing: 1,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
  },
  dots: { flexDirection: 'row', gap: 8, marginTop: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  targetCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 4,
  },
  answerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    maxWidth: 360,
  },
  colorChip: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  tube: {
    width: 64,
    height: 80,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  tubeLabel: { fontFamily: fonts.label, color: colors.white, fontSize: 11 },
  plus: { fontFamily: fonts.heading, fontSize: 28, color: colors.darkText },
});
