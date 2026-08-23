import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RootStackProps } from '../../navigation/types';
import {
  AppShell,
  ActivityHeader,
  ContentStage,
  PrimaryButton,
  ProgressIndicator,
} from '../../components/ui';
import { LivingIcon } from '../../components/KidAnimations';
import { RewardModal, FeedbackToast } from '../../components/RewardModal';
import { colors, fonts, radii, shadows, spacing } from '../../theme';
import { learningColors } from '../../theme/colors';
import { useGameSession, shuffle } from '../../hooks/useGameSession';
import { speak } from '../../services/voice';
import {
  BACKGROUNDS,
  FIND_COLOR_ACTIVITIES,
  LEARN_COLOR_STEPS,
  FindColorActivity,
  FindColorOption,
} from '../../data/colorActivities';
import * as Haptics from 'expo-haptics';

function ActivityFrame({
  background,
  title,
  round,
  prompt,
  onBack,
  onSpeak,
  progressCurrent,
  progressTotal = 10,
  children,
  showReward,
  onNext,
  streak,
  hint,
}: {
  background: number;
  title: string;
  round: number;
  prompt: string;
  onBack: () => void;
  onSpeak: () => void;
  progressCurrent: number;
  progressTotal?: number;
  children: React.ReactNode;
  showReward: boolean;
  onNext: () => void;
  streak: number;
  hint?: string | null;
}) {
  return (
    <AppShell background={background}>
      <ActivityHeader
        title={title}
        round={round}
        onSpeak={onSpeak}
        backTo={{ label: 'Color World', onPress: onBack }}
      />
      <View style={styles.body}>
        <ContentStage>
          <Text style={styles.prompt}>{prompt}</Text>
          <View style={styles.content}>{children}</View>
          <ProgressIndicator current={progressCurrent} total={progressTotal} />
        </ContentStage>
      </View>
      {hint ? <FeedbackToast text={hint} /> : null}
      <RewardModal visible={showReward} onNext={onNext} streak={streak} message="Yay!" />
    </AppShell>
  );
}

/** LEARN COLORS — big hero + large example icons */
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
      onSpeak={() => speak(`This is ${step.name}`)}
      progressCurrent={idx + 1}
      progressTotal={LEARN_COLOR_STEPS.length}
      showReward={showReward}
      onNext={playNext}
      streak={streak}
    >
      {/* Hero color stage — oversized apple / object */}
      <View style={[styles.heroStage, { backgroundColor: step.hex + '22', borderColor: step.hex + '55' }]}>
        <LivingIcon motion="bob">
          <Text style={styles.heroEmoji}>{step.heroEmoji}</Text>
        </LivingIcon>
        <View style={[styles.colorChipLabel, { backgroundColor: step.hex }, shadows.soft]}>
          <Text style={styles.colorChipText}>{step.name.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.examplesLabel}>More {step.name.toLowerCase()} things</Text>

      {/* Large example tiles — heart / car / balloon */}
      <View style={styles.exampleRow}>
        {step.choices.map((emoji) => (
          <Pressable
            key={emoji}
            onPress={() => speak(step.name)}
            style={({ pressed }) => [
              styles.exampleTile,
              shadows.soft,
              { transform: [{ scale: pressed ? 0.94 : 1 }], borderColor: step.hex + '40' },
            ]}
          >
            <Text style={styles.exampleEmoji}>{emoji}</Text>
          </Pressable>
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
        style={{ width: '100%', marginTop: 4 }}
      />
    </ActivityFrame>
  );
}

/** FIND COLOR — always show enough targets; clear tap feedback */
export function FindColorScreen({ navigation }: RootStackProps<'FindColor'>) {
  const { showReward, celebrate, almost, playNext, streak, round, hint } = useGameSession({
    gameId: 'find_color',
    skill: 'colors',
    dailyTaskId: 'find_red',
    // Do not speak generic "Find the color" — screen speaks the target once
  });

  const activity: FindColorActivity = useMemo(
    () => FIND_COLOR_ACTIVITIES[round % FIND_COLOR_ACTIVITIES.length],
    [round],
  );

  /** Build an 8-tile grid that always includes `need` correct answers */
  const need = 2;
  const grid: FindColorOption[] = useMemo(() => {
    const targets = shuffle(activity.options.filter((o) => o.colorId === activity.targetColor));
    const others = shuffle(activity.options.filter((o) => o.colorId !== activity.targetColor));
    const pickTargets = targets.slice(0, Math.min(need, targets.length));
    const pickOthers = others.slice(0, 8 - pickTargets.length);
    return shuffle([...pickTargets, ...pickOthers]);
  }, [activity, round]);

  const [found, setFound] = useState<string[]>([]);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [flashYes, setFlashYes] = useState(false);

  useEffect(() => {
    setFound([]);
    setWrongId(null);
    setFlashYes(false);
    // One clear line — avoid "Find Find …"
    speak(`Tap the ${activity.targetColor} ones`);
  }, [round, activity.targetColor]);

  const onPick = (opt: FindColorOption) => {
    if (found.includes(opt.id) || showReward) return;

    if (opt.colorId === activity.targetColor) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      speak('Yes!');
      setFlashYes(true);
      setTimeout(() => setFlashYes(false), 700);
      const next = [...found, opt.id];
      setFound(next);
      if (next.length >= need) {
        setTimeout(() => celebrate(), 450);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setWrongId(opt.id);
      setTimeout(() => setWrongId(null), 500);
      almost('Not that one — find ' + activity.targetColor + '!');
    }
  };

  return (
    <ActivityFrame
      background={activity.targetColor === 'red' ? BACKGROUNDS.findRed : BACKGROUNDS.learnColors}
      title={activity.title}
      round={round}
      prompt={activity.prompt}
      onBack={() => navigation.goBack()}
      onSpeak={() => speak(`Tap the ${activity.targetColor} ones`)}
      progressCurrent={found.length}
      progressTotal={need}
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      {/* Big color target */}
      <View style={[styles.findTarget, { backgroundColor: activity.targetHex + '18', borderColor: activity.targetHex }]}>
        <View style={[styles.findTargetDot, { backgroundColor: activity.targetHex }, shadows.soft]} />
        <Text style={[styles.findTargetLabel, { color: activity.targetHex }]}>
          Tap {need} {activity.targetColor} things
        </Text>
      </View>

      {flashYes ? <Text style={styles.findYes}>Yes! ⭐</Text> : null}
      <Text style={styles.findStatus}>
        Found {found.length} of {need}
      </Text>

      <View style={styles.findGrid}>
        {grid.map((opt) => {
          const isFound = found.includes(opt.id);
          const isWrong = wrongId === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => onPick(opt)}
              disabled={isFound}
              style={({ pressed }) => [
                styles.findTile,
                shadows.soft,
                isFound && styles.findTileFound,
                isWrong && styles.findTileWrong,
                { transform: [{ scale: pressed && !isFound ? 0.94 : 1 }] },
              ]}
            >
              <Text style={styles.findTileEmoji}>{opt.emoji}</Text>
              {isFound ? (
                <View style={styles.findCheck}>
                  <Text style={styles.findCheckText}>✓</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </ActivityFrame>
  );
}

const SORT_SETS: {
  a: string;
  b: string;
  items: { emoji: string; colorId: string }[];
}[] = [
  {
    a: 'red',
    b: 'blue',
    items: [
      { emoji: '🍎', colorId: 'red' },
      { emoji: '❤️', colorId: 'red' },
      { emoji: '🚗', colorId: 'red' },
      { emoji: '🎈', colorId: 'red' },
      { emoji: '💧', colorId: 'blue' },
      { emoji: '🐟', colorId: 'blue' },
      { emoji: '🧢', colorId: 'blue' },
      { emoji: '🦋', colorId: 'blue' },
    ],
  },
  {
    a: 'yellow',
    b: 'green',
    items: [
      { emoji: '☀️', colorId: 'yellow' },
      { emoji: '🍌', colorId: 'yellow' },
      { emoji: '⭐', colorId: 'yellow' },
      { emoji: '🐥', colorId: 'yellow' },
      { emoji: '🌳', colorId: 'green' },
      { emoji: '🐸', colorId: 'green' },
      { emoji: '🥒', colorId: 'green' },
      { emoji: '🥬', colorId: 'green' },
    ],
  },
  {
    a: 'orange',
    b: 'purple',
    items: [
      { emoji: '🍊', colorId: 'orange' },
      { emoji: '🦊', colorId: 'orange' },
      { emoji: '🎃', colorId: 'orange' },
      { emoji: '🥕', colorId: 'orange' },
      { emoji: '🍇', colorId: 'purple' },
      { emoji: '🟣', colorId: 'purple' },
      { emoji: '👾', colorId: 'purple' },
      { emoji: '☂️', colorId: 'purple' },
    ],
  },
  {
    a: 'pink',
    b: 'brown',
    items: [
      { emoji: '🌸', colorId: 'pink' },
      { emoji: '🐷', colorId: 'pink' },
      { emoji: '🎀', colorId: 'pink' },
      { emoji: '🦩', colorId: 'pink' },
      { emoji: '🧸', colorId: 'brown' },
      { emoji: '🍪', colorId: 'brown' },
      { emoji: '🤎', colorId: 'brown' },
      { emoji: '🌰', colorId: 'brown' },
    ],
  },
];

function colorById(id: string) {
  return learningColors.find((c) => c.id === id)!;
}

export function SortColorScreen({ navigation }: RootStackProps<'SortColor'>) {
  const { showReward, celebrate, almost, playNext, streak, round, hint } = useGameSession({
    gameId: 'sort_color',
    skill: 'colors',
    prompt: 'Sort into baskets',
  });

  const set = SORT_SETS[round % SORT_SETS.length];
  const baskets = [colorById(set.a), colorById(set.b)];
  const total = 6;

  const makeQueue = () =>
    [...set.items].sort(() => Math.random() - 0.5).slice(0, total);

  const [queue, setQueue] = useState(makeQueue);
  const [flash, setFlash] = useState<'ok' | 'no' | null>(null);
  const current = queue[0];

  useEffect(() => {
    setQueue(makeQueue());
    setFlash(null);
    speak(`Sort ${baskets[0].name} and ${baskets[1].name}`);
  }, [round]);

  const sortInto = (colorId: string, name: string) => {
    if (!current || showReward) return;
    if (current.colorId === colorId) {
      setFlash('ok');
      speak(name);
      const next = queue.slice(1);
      setTimeout(() => {
        setFlash(null);
        setQueue(next);
        if (!next.length) celebrate();
      }, 280);
    } else {
      setFlash('no');
      setTimeout(() => setFlash(null), 400);
      almost(`Try the ${colorById(current.colorId).name} basket!`);
    }
  };

  return (
    <ActivityFrame
      background={BACKGROUNDS.colorWorld}
      title="Color Sort"
      round={round}
      prompt={`🧺 ${baskets[0].name} or ${baskets[1].name}?`}
      onBack={() => navigation.goBack()}
      onSpeak={() => speak(`Sort ${baskets[0].name} and ${baskets[1].name}`)}
      progressCurrent={total - queue.length}
      progressTotal={total}
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      <Text style={styles.sortHint}>
        Round colors: {baskets[0].emoji} {baskets[0].name} · {baskets[1].emoji} {baskets[1].name}
      </Text>

      <View
        style={[
          styles.sortStage,
          flash === 'ok' && styles.sortStageOk,
          flash === 'no' && styles.sortStageNo,
        ]}
      >
        {current ? (
          <LivingIcon motion="bob">
            <Text style={styles.sortHero}>{current.emoji}</Text>
          </LivingIcon>
        ) : (
          <Text style={styles.sortHero}>🎉</Text>
        )}
      </View>

      <View style={styles.basketRow}>
        {baskets.map((b) => (
          <Pressable
            key={b.id}
            onPress={() => sortInto(b.id, b.name)}
            style={({ pressed }) => [
              styles.basketCard,
              { borderColor: b.hex, backgroundColor: b.hex + '18' },
              { transform: [{ scale: pressed ? 0.95 : 1 }] },
            ]}
          >
            <Text style={styles.basketEmoji}>🧺</Text>
            <Text style={{ fontSize: 36 }}>{b.emoji}</Text>
            <View style={[styles.basketLabel, { backgroundColor: b.hex }]}>
              <Text style={styles.basketLabelText}>{b.name}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ActivityFrame>
  );
}

const MATCH_SETS: { colorId: string; emoji: string }[][] = [
  [
    { colorId: 'red', emoji: '🍎' },
    { colorId: 'green', emoji: '🌳' },
    { colorId: 'yellow', emoji: '☀️' },
  ],
  [
    { colorId: 'blue', emoji: '💧' },
    { colorId: 'orange', emoji: '🍊' },
    { colorId: 'purple', emoji: '🍇' },
  ],
  [
    { colorId: 'pink', emoji: '🌸' },
    { colorId: 'brown', emoji: '🧸' },
    { colorId: 'red', emoji: '🚗' },
  ],
];

export function MatchColorScreen({ navigation }: RootStackProps<'MatchColor'>) {
  const { showReward, celebrate, almost, playNext, streak, round, hint } = useGameSession({
    gameId: 'match_color',
    skill: 'colors',
    prompt: 'Match the colors',
  });

  const base = MATCH_SETS[round % MATCH_SETS.length];
  const pairs = useMemo(
    () =>
      shuffle(
        base.map((p) => ({
          ...p,
          color: colorById(p.colorId),
        })),
      ),
    [round],
  );
  const things = useMemo(() => shuffle([...pairs]), [pairs]);

  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrongId, setWrongId] = useState<string | null>(null);

  useEffect(() => {
    setSelected(null);
    setMatched([]);
    setWrongId(null);
  }, [round]);

  const status =
    matched.length === pairs.length
      ? '🎉 All matched!'
      : selected
        ? 'Now tap the matching thing →'
        : '① Tap a color first';

  return (
    <ActivityFrame
      background={BACKGROUNDS.learnColors}
      title="Color Match"
      round={round}
      prompt={status}
      onBack={() => navigation.goBack()}
      onSpeak={() => speak('Match the colors')}
      progressCurrent={matched.length}
      progressTotal={pairs.length}
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      {/* Colors zone */}
      <View style={[styles.matchZone, { backgroundColor: '#E8F4FF' }]}>
        <Text style={styles.matchZoneTitle}>Colors</Text>
        <View style={styles.matchRow}>
          {pairs.map((p) => {
            const isDone = matched.includes(p.color.id);
            const isSel = selected === p.color.id;
            return (
              <Pressable
                key={p.color.id}
                disabled={isDone}
                onPress={() => {
                  if (isDone) return;
                  setSelected(p.color.id);
                  speak(p.color.name);
                }}
                style={({ pressed }) => [
                  styles.matchSwatch,
                  {
                    backgroundColor: p.color.hex,
                    borderColor: isSel ? colors.darkText : '#fff',
                    opacity: isDone ? 0.4 : pressed ? 0.9 : 1,
                    transform: [{ scale: isSel ? 1.08 : 1 }],
                  },
                ]}
              >
                {isSel && !isDone ? <Text style={styles.matchPicked}>✓</Text> : null}
                {isDone ? <Text style={styles.matchDoneMark}>★</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={styles.matchLink}>↕ Match</Text>

      {/* Things zone */}
      <View style={[styles.matchZone, { backgroundColor: '#FFF4E8' }]}>
        <Text style={styles.matchZoneTitle}>Things</Text>
        <View style={styles.matchRow}>
          {things.map((p) => {
            const isDone = matched.includes(p.color.id);
            const isWrong = wrongId === p.color.id;
            return (
              <Pressable
                key={p.emoji}
                disabled={isDone}
                onPress={() => {
                  if (isDone) return;
                  if (!selected) {
                    almost('Pick a color first!');
                    return;
                  }
                  if (selected === p.color.id) {
                    speak('Match!');
                    const next = [...matched, p.color.id];
                    setMatched(next);
                    setSelected(null);
                    if (next.length === pairs.length) setTimeout(() => celebrate(), 350);
                  } else {
                    setWrongId(p.color.id);
                    setTimeout(() => setWrongId(null), 450);
                    almost('Try another one!');
                  }
                }}
                style={({ pressed }) => [
                  styles.matchThing,
                  shadows.soft,
                  isDone && styles.matchThingDone,
                  isWrong && styles.matchThingWrong,
                  { opacity: pressed && !isDone ? 0.92 : 1 },
                ]}
              >
                <Text style={styles.matchThingEmoji}>{p.emoji}</Text>
                {isDone ? (
                  <View style={styles.matchCheck}>
                    <Text style={styles.matchCheckText}>✓</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
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
    justifyContent: 'flex-start',
    gap: 10,
    paddingTop: 4,
    overflow: 'hidden',
  },
  heroStage: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 28,
    borderWidth: 2,
    gap: 12,
  },
  heroEmoji: {
    fontSize: 120,
    lineHeight: 132,
    textAlign: 'center',
  },
  colorChipLabel: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: radii.pill,
    minWidth: 140,
    alignItems: 'center',
  },
  colorChipText: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.white,
    letterSpacing: 1.2,
  },
  examplesLabel: {
    fontFamily: fonts.label,
    fontSize: 15,
    color: colors.secondaryText,
    marginTop: 4,
  },
  exampleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    paddingHorizontal: 4,
  },
  exampleTile: {
    flex: 1,
    maxWidth: 112,
    aspectRatio: 1,
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exampleEmoji: {
    fontSize: 64,
    lineHeight: 72,
    textAlign: 'center',
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
  dots: { flexDirection: 'row', gap: 8, marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  findTarget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 3,
    width: '100%',
    maxWidth: 340,
  },
  findTargetDot: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  findTargetLabel: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: 18,
  },
  findYes: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.green,
  },
  findStatus: {
    fontFamily: fonts.label,
    fontSize: 16,
    color: colors.darkText,
  },
  findGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    maxWidth: 360,
  },
  findTile: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findTileFound: {
    backgroundColor: '#E8FBE8',
    borderColor: colors.green,
  },
  findTileWrong: {
    backgroundColor: '#FFE8E8',
    borderColor: colors.primaryRed,
  },
  findTileEmoji: {
    fontSize: 52,
    lineHeight: 60,
  },
  findCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findCheckText: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: 14,
  },
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
  matchStatus: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.darkText,
    textAlign: 'center',
  },
  matchZone: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 12,
  },
  matchZoneTitle: {
    fontFamily: fonts.label,
    fontSize: 15,
    color: colors.secondaryText,
  },
  matchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
  },
  matchSwatch: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchPicked: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: 28,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  matchDoneMark: {
    color: colors.white,
    fontSize: 28,
  },
  matchLink: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.secondaryText,
  },
  matchThing: {
    width: 108,
    height: 108,
    borderRadius: 28,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchThingDone: {
    backgroundColor: '#E8FBE8',
    borderColor: colors.green,
  },
  matchThingWrong: {
    backgroundColor: '#FFE8E8',
    borderColor: colors.primaryRed,
  },
  matchThingEmoji: {
    fontSize: 64,
    lineHeight: 72,
  },
  matchCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchCheckText: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: 14,
  },
  sortHint: {
    fontFamily: fonts.label,
    fontSize: 16,
    color: colors.secondaryText,
  },
  sortStage: {
    width: '100%',
    maxWidth: 280,
    minHeight: 200,
    borderRadius: 32,
    backgroundColor: '#F7FBFF',
    borderWidth: 3,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortStageOk: {
    backgroundColor: '#E8FBE8',
    borderColor: colors.green,
  },
  sortStageNo: {
    backgroundColor: '#FFE8E8',
    borderColor: colors.primaryRed,
  },
  sortHero: {
    fontSize: 120,
    lineHeight: 132,
    textAlign: 'center',
  },
  basketRow: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
    maxWidth: 360,
    justifyContent: 'center',
  },
  basketCard: {
    flex: 1,
    maxWidth: 160,
    minHeight: 140,
    borderRadius: 28,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  basketEmoji: {
    fontSize: 64,
    lineHeight: 72,
  },
  basketLabel: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  basketLabelText: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.white,
  },
});
