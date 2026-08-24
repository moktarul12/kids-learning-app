import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { RootStackProps } from '../../navigation/types';
import { GameShell } from '../../components/GameShell';
import { LivingIcon } from '../../components/KidAnimations';
import { colors } from '../../theme/colors';
import { fonts, radii, shadows } from '../../theme';
import { useGameSession, shuffle } from '../../hooks/useGameSession';
import { speak } from '../../services/voice';

const SHAPES = [
  { id: 'circle', emoji: '⭕' },
  { id: 'square', emoji: '🟦' },
  { id: 'triangle', emoji: '🔺' },
  { id: 'star', emoji: '⭐' },
];

export function FindShapeScreen({ navigation }: RootStackProps<'FindShape'>) {
  const prompt = 'Find all triangles';
  const { showReward, hint, celebrate, almost, playNext, streak, round } = useGameSession({
    gameId: 'find_shape',
    skill: 'shapes',
    dailyTaskId: 'find_shape',
  });
  const target = SHAPES[2];
  const items = useMemo(
    () => shuffle([...Array(3).fill(target), SHAPES[0], SHAPES[1], SHAPES[3], SHAPES[0], SHAPES[1]]),
    [round],
  );
  const [found, setFound] = useState<number[]>([]);
  useEffect(() => {
    setFound([]);
    speak(prompt);
  }, [round]);

  return (
    <GameShell
      title="Find Shapes"
      prompt={prompt}
      promptEmoji="🔺"
      round={round}
      progressCurrent={found.length}
      progressTotal={3}
      onBack={() => navigation.goBack()}
      backLabel="Shape World"
      backEmoji="🔷"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      <View style={[styles.hintChip, { backgroundColor: '#FFE8E0' }]}>
        <Text style={{ fontSize: 36 }}>🔺</Text>
        <Text style={styles.hintChipText}>Tap every triangle</Text>
      </View>
      <View style={styles.grid}>
        {items.map((s, i) => {
          const isFound = found.includes(i);
          return (
            <Pressable
              key={`${round}-${i}`}
              style={({ pressed }) => [
                styles.bigTile,
                shadows.soft,
                isFound && styles.tileDone,
                { transform: [{ scale: pressed && !isFound ? 0.94 : 1 }] },
              ]}
              disabled={isFound}
              onPress={() => {
                if (s.id === target.id) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                  speak('Triangle!');
                  const next = [...found, i];
                  setFound(next);
                  if (next.length >= 3) celebrate();
                } else almost('Look for triangles!');
              }}
            >
              <Text style={styles.bigEmoji}>{s.emoji}</Text>
              {isFound ? (
                <View style={styles.check}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </GameShell>
  );
}

export function MatchShapeScreen({ navigation }: RootStackProps<'MatchShape'>) {
  const prompt = 'Match shapes';
  const { showReward, hint, celebrate, almost, playNext, streak, round } = useGameSession({
    gameId: 'match_shape',
    skill: 'shapes',
  });
  const pairs = useMemo(
    () =>
      shuffle([
        { shape: '⭕', object: '⚽', id: 'c', label: 'Circle' },
        { shape: '🔺', object: '🍕', id: 't', label: 'Triangle' },
        { shape: '🟦', object: '🪟', id: 's', label: 'Square' },
      ]),
    [round],
  );
  const objects = useMemo(() => shuffle([...pairs]), [pairs]);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [wrongId, setWrongId] = useState<string | null>(null);

  useEffect(() => {
    setSelected(null);
    setDone([]);
    setWrongId(null);
    speak(prompt);
  }, [round]);

  const status =
    done.length === pairs.length
      ? 'All matched! 🎉'
      : selected
        ? 'Now tap the matching thing →'
        : '① Tap a shape first';

  return (
    <GameShell
      title="Shape Match"
      prompt={prompt}
      promptEmoji="🧩"
      round={round}
      progressCurrent={done.length}
      progressTotal={pairs.length}
      onBack={() => navigation.goBack()}
      backLabel="Shape World"
      backEmoji="🔷"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      <Text style={styles.status}>{status}</Text>

      {/* Shapes row */}
      <View style={styles.zone}>
        <View style={[styles.zoneTag, { backgroundColor: '#D6ECFF' }]}>
          <Text style={styles.zoneTagText}>Shapes</Text>
        </View>
        <View style={styles.matchRow}>
          {pairs.map((p) => {
            const isDone = done.includes(p.id);
            const isSel = selected === p.id;
            return (
              <Pressable
                key={p.id}
                disabled={isDone}
                onPress={() => {
                  if (isDone) return;
                  Haptics.selectionAsync().catch(() => {});
                  setSelected(p.id);
                  speak(p.label);
                }}
                style={({ pressed }) => [
                  styles.matchTile,
                  shadows.soft,
                  isSel && styles.matchTileSelected,
                  isDone && styles.tileDone,
                  { opacity: pressed && !isDone ? 0.92 : 1 },
                ]}
              >
                <LivingIcon motion={isSel ? 'pulse' : 'bob'}>
                  <Text style={styles.matchEmoji}>{p.shape}</Text>
                </LivingIcon>
                {isDone ? (
                  <View style={styles.check}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                ) : null}
                {isSel && !isDone ? <Text style={styles.pickedLabel}>Picked</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <Text style={styles.linkArrow}>↕ Match</Text>

      {/* Objects row */}
      <View style={styles.zone}>
        <View style={[styles.zoneTag, { backgroundColor: '#FFE8CC' }]}>
          <Text style={styles.zoneTagText}>Things</Text>
        </View>
        <View style={styles.matchRow}>
          {objects.map((p) => {
            const isDone = done.includes(p.id);
            const isWrong = wrongId === p.id;
            return (
              <Pressable
                key={p.object}
                disabled={isDone}
                onPress={() => {
                  if (isDone) return;
                  if (!selected) {
                    almost('Pick a shape first!');
                    return;
                  }
                  if (selected === p.id) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                    speak('Match!');
                    const next = [...done, p.id];
                    setDone(next);
                    setSelected(null);
                    if (next.length === pairs.length) setTimeout(() => celebrate(), 400);
                  } else {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
                    setWrongId(p.id);
                    setTimeout(() => setWrongId(null), 450);
                    almost('Try another thing!');
                  }
                }}
                style={({ pressed }) => [
                  styles.matchTile,
                  shadows.soft,
                  isDone && styles.tileDone,
                  isWrong && styles.tileWrong,
                  { opacity: pressed && !isDone ? 0.92 : 1 },
                ]}
              >
                <Text style={styles.matchEmoji}>{p.object}</Text>
                {isDone ? (
                  <View style={styles.check}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </GameShell>
  );
}

export function ShapePuzzleScreen({ navigation }: RootStackProps<'ShapePuzzle'>) {
  const puzzles = [
    {
      id: 'roof',
      title: 'Finish the house',
      ask: 'Tap the triangle for the roof',
      hero: '🏠',
      answerId: 'triangle',
      answerEmoji: '🔺',
      answerLabel: 'Triangle',
      almost: 'The roof is a triangle!',
      options: [
        { id: 'triangle', emoji: '🔺', label: 'Triangle' },
        { id: 'circle', emoji: '⭕', label: 'Circle' },
        { id: 'star', emoji: '⭐', label: 'Star' },
      ],
    },
    {
      id: 'wheel',
      title: 'Finish the bike',
      ask: 'Tap the circle for the wheel',
      hero: '🚲',
      answerId: 'circle',
      answerEmoji: '⭕',
      answerLabel: 'Circle',
      almost: 'The wheel is a circle!',
      options: [
        { id: 'circle', emoji: '⭕', label: 'Circle' },
        { id: 'square', emoji: '🟦', label: 'Square' },
        { id: 'triangle', emoji: '🔺', label: 'Triangle' },
      ],
    },
    {
      id: 'window',
      title: 'Finish the house',
      ask: 'Tap the square for the window',
      hero: '🏡',
      answerId: 'square',
      answerEmoji: '🟦',
      answerLabel: 'Square',
      almost: 'The window is a square!',
      options: [
        { id: 'square', emoji: '🟦', label: 'Square' },
        { id: 'triangle', emoji: '🔺', label: 'Triangle' },
        { id: 'circle', emoji: '⭕', label: 'Circle' },
      ],
    },
  ] as const;

  const { showReward, hint, celebrate, almost, playNext, streak, round } = useGameSession({
    gameId: 'shape_puzzle',
    skill: 'shapes',
  });

  const puzzle = useMemo(() => puzzles[round % puzzles.length], [round]);
  const options = useMemo(() => shuffle([...puzzle.options]), [puzzle, round]);
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const locked = picked === puzzle.answerId;

  useEffect(() => {
    setPicked(null);
    setWrong(null);
    speak(puzzle.ask);
  }, [round, puzzle.ask]);

  return (
    <GameShell
      title="Shape Puzzle"
      prompt={puzzle.ask}
      promptEmoji={puzzle.hero}
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Shape World"
      backEmoji="🔷"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      <View style={styles.puzzleStage}>
        <View style={styles.puzzleBanner}>
          <LivingIcon motion="bob">
            <Text style={styles.puzzleHero}>{puzzle.hero}</Text>
          </LivingIcon>
          <View style={styles.puzzleBannerCopy}>
            <Text style={styles.puzzleBannerTitle}>{puzzle.title}</Text>
            <Text style={styles.puzzleBannerSub}>
              {locked ? 'Perfect fit!' : 'Pick the matching shape'}
            </Text>
          </View>
        </View>

        <View style={styles.puzzleScene}>
          {puzzle.id === 'roof' || puzzle.id === 'window' ? (
            <View style={styles.puzzleHouse}>
              <View style={styles.puzzleRoofWrap}>
                {locked && puzzle.id === 'roof' ? (
                  <Text style={styles.puzzleRoofOn}>{puzzle.answerEmoji}</Text>
                ) : puzzle.id === 'roof' ? (
                  <View style={styles.puzzleRoofGhost}>
                    <Text style={styles.puzzleRoofGhostEmoji}>🔺</Text>
                    <Text style={styles.puzzleGhostTag}>roof?</Text>
                  </View>
                ) : (
                  <Text style={styles.puzzleRoofOn}>🔺</Text>
                )}
              </View>
              <View style={styles.puzzleBase}>
                {puzzle.id === 'window' ? (
                  locked ? (
                    <Text style={styles.puzzleWindowOn}>{puzzle.answerEmoji}</Text>
                  ) : (
                    <View style={styles.puzzleWindowGhost}>
                      <Text style={styles.puzzleWindowGhostEmoji}>🟦</Text>
                      <Text style={styles.puzzleGhostTag}>window?</Text>
                    </View>
                  )
                ) : (
                  <Text style={styles.puzzleDoor}>🚪</Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.puzzleBike}>
              <Text style={styles.puzzleBikeBody}>🚲</Text>
              <View style={styles.puzzleWheelSlot}>
                {locked ? (
                  <Text style={styles.puzzleWheelOn}>{puzzle.answerEmoji}</Text>
                ) : (
                  <View style={styles.puzzleWheelGhost}>
                    <Text style={styles.puzzleWheelGhostEmoji}>⭕</Text>
                    <Text style={styles.puzzleGhostTag}>wheel?</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        <Text style={styles.puzzleAsk}>
          {locked ? `${puzzle.answerLabel} fits!` : puzzle.ask}
        </Text>

        <View style={styles.puzzleRow}>
          {options.map((o) => {
            const isRight = locked && o.id === puzzle.answerId;
            const isWrong = wrong === o.id;
            return (
              <Pressable
                key={`${round}-${o.id}`}
                disabled={locked}
                onPress={() => {
                  if (locked) return;
                  if (o.id === puzzle.answerId) {
                    setPicked(o.id);
                    speak(o.label);
                    setTimeout(() => celebrate(), 550);
                  } else {
                    setWrong(o.id);
                    setTimeout(() => setWrong(null), 450);
                    almost(puzzle.almost);
                  }
                }}
                style={({ pressed }) => [
                  styles.puzzleOpt,
                  isRight && styles.puzzleOptRight,
                  isWrong && styles.puzzleOptWrong,
                  { transform: [{ scale: pressed && !locked ? 0.94 : 1 }] },
                ]}
              >
                <Text style={styles.puzzleOptEmoji}>{o.emoji}</Text>
                <Text
                  style={[
                    styles.puzzleOptLabel,
                    isRight && { color: '#FFF' },
                    isWrong && { color: '#FFF' },
                  ]}
                >
                  {o.label}
                </Text>
                {isRight ? <Text style={styles.puzzleOptStar}>⭐</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </GameShell>
  );
}

const BUILD_PICTURES = [
  {
    id: 'house',
    title: 'Finish the house',
    ask: 'Which shape is the roof?',
    almost: 'The roof is a triangle!',
    doneEmoji: '🏠',
    answer: 'triangle',
    layout: [
      { kind: 'gap', shape: 'triangle' },
      { kind: 'filled', emoji: '🟧', label: 'Wall' },
      { kind: 'filled', emoji: '🚪', label: 'Door' },
    ],
    options: [
      { id: 'triangle', emoji: '🔺', label: 'Triangle' },
      { id: 'circle', emoji: '⭕', label: 'Circle' },
      { id: 'square', emoji: '🟦', label: 'Square' },
    ],
  },
  {
    id: 'sun',
    title: 'Finish the sun',
    ask: 'Which shape is the sun?',
    almost: 'The sun is a circle!',
    doneEmoji: '☀️',
    answer: 'circle',
    layout: [
      { kind: 'gap', shape: 'circle' },
      { kind: 'filled', emoji: '✨', label: 'Rays' },
      { kind: 'filled', emoji: '☁️', label: 'Cloud' },
    ],
    options: [
      { id: 'square', emoji: '🟦', label: 'Square' },
      { id: 'circle', emoji: '⭕', label: 'Circle' },
      { id: 'triangle', emoji: '🔺', label: 'Triangle' },
    ],
  },
  {
    id: 'ice',
    title: 'Finish ice cream',
    ask: 'Which shape is the cone?',
    almost: 'The cone is a triangle!',
    doneEmoji: '🍦',
    answer: 'triangle',
    layout: [
      { kind: 'filled', emoji: '🩷', label: 'Scoop' },
      { kind: 'gap', shape: 'triangle' },
      { kind: 'filled', emoji: '🍒', label: 'Cherry' },
    ],
    options: [
      { id: 'circle', emoji: '⭕', label: 'Circle' },
      { id: 'triangle', emoji: '🔺', label: 'Triangle' },
      { id: 'star', emoji: '⭐', label: 'Star' },
    ],
  },
  {
    id: 'window',
    title: 'Finish the window',
    ask: 'Which shape is the window?',
    almost: 'The window is a square!',
    doneEmoji: '🪟',
    answer: 'square',
    layout: [
      { kind: 'filled', emoji: '🏠', label: 'House' },
      { kind: 'gap', shape: 'square' },
      { kind: 'filled', emoji: '🌳', label: 'Tree' },
    ],
    options: [
      { id: 'triangle', emoji: '🔺', label: 'Triangle' },
      { id: 'square', emoji: '🟦', label: 'Square' },
      { id: 'circle', emoji: '⭕', label: 'Circle' },
    ],
  },
  {
    id: 'wheel',
    title: 'Finish the car',
    ask: 'Which shape is the wheel?',
    almost: 'Wheels are circles!',
    doneEmoji: '🚗',
    answer: 'circle',
    layout: [
      { kind: 'filled', emoji: '🟥', label: 'Body' },
      { kind: 'gap', shape: 'circle' },
      { kind: 'filled', emoji: '🪟', label: 'Window' },
    ],
    options: [
      { id: 'circle', emoji: '⭕', label: 'Circle' },
      { id: 'square', emoji: '🟦', label: 'Square' },
      { id: 'star', emoji: '⭐', label: 'Star' },
    ],
  },
  {
    id: 'rocket',
    title: 'Finish the rocket',
    ask: 'Which shape is the nose?',
    almost: 'The nose is a triangle!',
    doneEmoji: '🚀',
    answer: 'triangle',
    layout: [
      { kind: 'gap', shape: 'triangle' },
      { kind: 'filled', emoji: '🟥', label: 'Body' },
      { kind: 'filled', emoji: '🔥', label: 'Fire' },
    ],
    options: [
      { id: 'square', emoji: '🟦', label: 'Square' },
      { id: 'triangle', emoji: '🔺', label: 'Triangle' },
      { id: 'circle', emoji: '⭕', label: 'Circle' },
    ],
  },
] as const;

const FACE_PICTURES = [
  {
    id: 'smile',
    title: 'Make a happy face',
    ask: 'What makes a smile?',
    almost: 'A big smile mouth!',
    doneEmoji: '😊',
    answer: 'smile',
    layout: [
      { kind: 'filled', emoji: '👀', label: 'Eyes' },
      { kind: 'gap', shape: 'smile' },
      { kind: 'filled', emoji: '👃', label: 'Nose' },
    ],
    options: [
      { id: 'smile', emoji: '👄', label: 'Smile' },
      { id: 'frown', emoji: '☹️', label: 'Frown' },
      { id: 'star', emoji: '⭐', label: 'Star' },
    ],
  },
  {
    id: 'glasses',
    title: 'Finish the face',
    ask: 'What goes on the eyes?',
    almost: 'Cute glasses!',
    doneEmoji: '🤓',
    answer: 'glasses',
    layout: [
      { kind: 'gap', shape: 'glasses' },
      { kind: 'filled', emoji: '👃', label: 'Nose' },
      { kind: 'filled', emoji: '👄', label: 'Smile' },
    ],
    options: [
      { id: 'hat', emoji: '🎩', label: 'Hat' },
      { id: 'glasses', emoji: '👓', label: 'Glasses' },
      { id: 'bow', emoji: '🎀', label: 'Bow' },
    ],
  },
  {
    id: 'ears',
    title: 'Bunny face',
    ask: 'What does a bunny need?',
    almost: 'Long bunny ears!',
    doneEmoji: '🐰',
    answer: 'ears',
    layout: [
      { kind: 'gap', shape: 'ears' },
      { kind: 'filled', emoji: '👀', label: 'Eyes' },
      { kind: 'filled', emoji: '👄', label: 'Nose' },
    ],
    options: [
      { id: 'ears', emoji: '👂', label: 'Ears' },
      { id: 'horn', emoji: '🦄', label: 'Horn' },
      { id: 'crown', emoji: '👑', label: 'Crown' },
    ],
  },
] as const;

const FOOD_PICTURES = [
  {
    id: 'plate',
    title: 'Build lunch',
    ask: 'What healthy food goes here?',
    almost: 'Veggies are yummy!',
    doneEmoji: '🥗',
    answer: 'veggies',
    layout: [
      { kind: 'filled', emoji: '🍚', label: 'Rice' },
      { kind: 'gap', shape: 'veggies' },
      { kind: 'filled', emoji: '🥛', label: 'Milk' },
    ],
    options: [
      { id: 'candy', emoji: '🍬', label: 'Candy' },
      { id: 'veggies', emoji: '🥦', label: 'Veggies' },
      { id: 'chips', emoji: '🍟', label: 'Chips' },
    ],
  },
  {
    id: 'fruit',
    title: 'Fruit bowl',
    ask: 'Which fruit is missing?',
    almost: 'A juicy apple!',
    doneEmoji: '🍎',
    answer: 'apple',
    layout: [
      { kind: 'filled', emoji: '🍌', label: 'Banana' },
      { kind: 'gap', shape: 'apple' },
      { kind: 'filled', emoji: '🍇', label: 'Grapes' },
    ],
    options: [
      { id: 'apple', emoji: '🍎', label: 'Apple' },
      { id: 'cake', emoji: '🎂', label: 'Cake' },
      { id: 'soda', emoji: '🥤', label: 'Soda' },
    ],
  },
  {
    id: 'breakfast',
    title: 'Breakfast time',
    ask: 'What helps you grow?',
    almost: 'Eggs for energy!',
    doneEmoji: '🍳',
    answer: 'egg',
    layout: [
      { kind: 'gap', shape: 'egg' },
      { kind: 'filled', emoji: '🍞', label: 'Bread' },
      { kind: 'filled', emoji: '🥛', label: 'Milk' },
    ],
    options: [
      { id: 'candy', emoji: '🍭', label: 'Candy' },
      { id: 'egg', emoji: '🍳', label: 'Egg' },
      { id: 'cookie', emoji: '🍪', label: 'Cookie' },
    ],
  },
] as const;

type BuildPack = 'shapes' | 'faces' | 'food';

const PACKS: Record<BuildPack, readonly (typeof BUILD_PICTURES)[number][] | readonly (typeof FACE_PICTURES)[number][] | readonly (typeof FOOD_PICTURES)[number][]> = {
  shapes: BUILD_PICTURES,
  faces: FACE_PICTURES,
  food: FOOD_PICTURES,
};

const PACK_META: Record<BuildPack, { title: string; back: string; skill: 'shapes' | 'creativity'; gameId: string }> = {
  shapes: { title: 'Shape Builder', back: 'Back', skill: 'shapes', gameId: 'shape_builder' },
  faces: { title: 'Happy Face', back: 'Create', skill: 'creativity', gameId: 'create_face' },
  food: { title: 'Yummy Plate', back: 'Create', skill: 'creativity', gameId: 'create_plate' },
};

const SHAPE_EMOJI: Record<string, string> = {
  triangle: '🔺',
  circle: '⭕',
  square: '🟦',
  star: '⭐',
};

export function ShapeBuilderScreen({ navigation, route }: RootStackProps<'ShapeBuilder'>) {
  const pack: BuildPack = route.params?.pack ?? 'shapes';
  const meta = PACK_META[pack];
  const pictures = PACKS[pack];

  const { showReward, celebrate, almost, playNext, streak, round, hint } = useGameSession({
    gameId: meta.gameId,
    skill: meta.skill,
    badge: pack === 'shapes' ? 'shape_builder' : 'creative_star',
  });

  const picture = useMemo(() => pictures[round % pictures.length], [round, pictures]);
  const options = useMemo(() => shuffle([...picture.options]), [picture, round]);
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const locked = picked === picture.answer;
  const answerEmoji =
    picture.options.find((o) => o.id === picture.answer)?.emoji ??
    SHAPE_EMOJI[picture.answer] ??
    '⭐';

  useEffect(() => {
    setPicked(null);
    setWrong(null);
    speak(picture.ask);
  }, [round, picture.ask, pack]);

  return (
    <GameShell
      title={meta.title}
      prompt={picture.ask}
      promptEmoji={picture.doneEmoji}
      round={round}
      onBack={() => navigation.goBack()}
      backLabel={meta.back}
      backEmoji="🧱"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      rewardMessage="Nice build!"
      hint={hint}
    >
      <View style={[styles.buildStage, { backgroundColor: '#E8F4FF', borderColor: '#A8D4F0' }]}>
        <View style={styles.buildBanner}>
          <LivingIcon motion={locked ? 'pulse' : 'bob'}>
            <Text style={styles.buildHero}>{locked ? picture.doneEmoji : '🧱'}</Text>
          </LivingIcon>
          <View style={styles.buildBannerCopy}>
            <Text style={styles.buildBannerTitle}>{picture.title}</Text>
            <Text style={styles.buildBannerSub}>
              {locked ? 'Picture complete!' : 'Tap what is missing'}
            </Text>
          </View>
        </View>

        <View style={styles.buildPad}>
          <Text style={styles.buildPadTitle}>Your picture</Text>
          <View style={styles.buildStack}>
            {picture.layout.map((slot, i) => {
              const isGap = slot.kind === 'gap';
              const filled = isGap && locked;
              return (
                <View
                  key={`${picture.id}-${i}`}
                  style={[
                    styles.buildSlot,
                    isGap && !filled && styles.buildSlotOff,
                    (filled || !isGap) && styles.buildSlotOn,
                  ]}
                >
                  {isGap && !filled ? (
                    <LivingIcon motion="pulse">
                      <Text style={styles.buildSlotEmoji}>❓</Text>
                    </LivingIcon>
                  ) : (
                    <Text style={styles.buildSlotEmoji}>
                      {isGap ? answerEmoji : slot.emoji}
                    </Text>
                  )}
                  <Text style={styles.buildSlotLabel}>
                    {isGap ? (filled ? 'Done' : 'Missing') : slot.label}
                  </Text>
                </View>
              );
            })}
          </View>
          {locked ? (
            <LivingIcon motion="pulse">
              <Text style={styles.buildDoneRocket}>{picture.doneEmoji}</Text>
            </LivingIcon>
          ) : null}
        </View>

        <Text style={styles.buildTapHint}>{locked ? 'Great job!' : 'Pick what fits'}</Text>

        <View style={styles.buildParts}>
          {options.map((o) => {
            const isRight = locked && o.id === picture.answer;
            const isWrong = wrong === o.id;
            return (
              <Pressable
                key={`${round}-${o.id}`}
                disabled={locked}
                onPress={() => {
                  if (o.id === picture.answer) {
                    setPicked(o.id);
                    speak(o.label);
                    setTimeout(() => celebrate('Nice build!'), 450);
                  } else {
                    setWrong(o.id);
                    setTimeout(() => setWrong(null), 450);
                    almost(picture.almost);
                  }
                }}
                style={({ pressed }) => [
                  styles.buildPartBtn,
                  isRight && styles.buildPartNext,
                  isWrong && styles.buildPartDone,
                  { opacity: pressed && !locked ? 0.9 : 1 },
                ]}
              >
                <Text style={styles.buildPartEmoji}>{o.emoji}</Text>
                <Text style={styles.buildPartLabel}>{o.label}</Text>
                {isRight ? <Text style={styles.buildPartTap}>✓</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    maxWidth: 380,
  },
  bigTile: {
    width: 100,
    height: 100,
    borderRadius: 26,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#D7E6F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigEmoji: { fontSize: 56, lineHeight: 64 },
  matchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
  },
  matchTile: {
    width: 112,
    height: 112,
    borderRadius: 28,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#D7E6F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchTileSelected: {
    borderColor: colors.blue,
    borderWidth: 4,
    backgroundColor: '#E8F4FF',
    transform: [{ scale: 1.06 }],
  },
  matchEmoji: { fontSize: 64, lineHeight: 72 },
  tileDone: {
    backgroundColor: '#E8FBE8',
    borderColor: colors.green,
  },
  tileWrong: {
    backgroundColor: '#FFE8E8',
    borderColor: colors.red,
  },
  check: {
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
  checkText: { color: '#FFF', fontFamily: fonts.heading, fontSize: 14 },
  pickedLabel: {
    position: 'absolute',
    bottom: 6,
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.blue,
  },
  zone: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 10,
  },
  zoneTag: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  zoneTagText: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.ink,
  },
  linkArrow: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.inkMuted,
  },
  status: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.ink,
    textAlign: 'center',
  },
  hintChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  hintChipText: {
    fontFamily: fonts.label,
    fontSize: 16,
    color: colors.ink,
  },
  house: { alignItems: 'center', marginBottom: 8 },
  roof: {
    width: 140,
    height: 80,
    borderRadius: 12,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: colors.inkMuted,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8E1',
  },
  base: {
    width: 140,
    height: 100,
    backgroundColor: colors.brown,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  q: { fontFamily: fonts.heading, fontSize: 36, color: colors.inkMuted },
  puzzleStage: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF4E8',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#FFD59A',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  puzzleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  puzzleHero: { fontSize: 40, lineHeight: 48 },
  puzzleBannerCopy: { flex: 1 },
  puzzleBannerTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.ink,
  },
  puzzleBannerSub: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 2,
  },
  puzzleScene: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  puzzleHouse: { alignItems: 'center' },
  puzzleRoofWrap: {
    alignItems: 'center',
    marginBottom: -4,
    zIndex: 1,
  },
  puzzleRoofGhost: {
    alignItems: 'center',
    opacity: 0.45,
  },
  puzzleRoofGhostEmoji: { fontSize: 72, lineHeight: 80 },
  puzzleRoofOn: { fontSize: 72, lineHeight: 80 },
  puzzleGhostTag: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: -4,
  },
  puzzleBase: {
    width: 150,
    height: 110,
    backgroundColor: colors.brown,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#A06A30',
  },
  puzzleDoor: { fontSize: 44, lineHeight: 52 },
  puzzleWindowGhost: {
    alignItems: 'center',
    opacity: 0.45,
  },
  puzzleWindowGhostEmoji: { fontSize: 52, lineHeight: 60 },
  puzzleWindowOn: { fontSize: 52, lineHeight: 60 },
  puzzleBike: {
    alignItems: 'center',
    gap: 4,
  },
  puzzleBikeBody: { fontSize: 72, lineHeight: 80, opacity: 0.35 },
  puzzleWheelSlot: { marginTop: -28 },
  puzzleWheelGhost: { alignItems: 'center', opacity: 0.5 },
  puzzleWheelGhostEmoji: { fontSize: 64, lineHeight: 72 },
  puzzleWheelOn: { fontSize: 64, lineHeight: 72 },
  puzzleAsk: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.ink,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  puzzleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  puzzleOpt: {
    width: 104,
    height: 112,
    borderRadius: 24,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  puzzleOptRight: {
    backgroundColor: colors.green,
    borderColor: '#5ECF5A',
  },
  puzzleOptWrong: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  puzzleOptEmoji: { fontSize: 52, lineHeight: 60 },
  puzzleOptLabel: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.ink,
  },
  puzzleOptStar: {
    position: 'absolute',
    top: 4,
    right: 6,
    fontSize: 16,
  },
  pad: {
    minHeight: 200,
    width: 200,
    backgroundColor: '#F3F8FF',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#D7E6F7',
  },
  buildStage: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E8F4FF',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#A8D4F0',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  buildBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  buildHero: { fontSize: 40, lineHeight: 48 },
  buildBannerCopy: { flex: 1 },
  buildBannerTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.ink,
  },
  buildBannerSub: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 2,
  },
  buildCountBadge: {
    backgroundColor: colors.blue,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  buildCountText: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: '#FFF',
  },
  buildPad: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#D7E6F7',
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
  },
  buildPadTitle: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.inkMuted,
    textTransform: 'uppercase',
  },
  buildStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  buildSlot: {
    width: 72,
    height: 78,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  buildSlotOff: {
    backgroundColor: '#F3F6FA',
    borderColor: '#D0D8E4',
    borderStyle: 'dashed',
  },
  buildSlotOn: {
    backgroundColor: '#E8FBE8',
    borderColor: colors.green,
    borderStyle: 'solid',
  },
  buildSlotNose: {},
  buildSlotBody: {},
  buildSlotWindow: {},
  buildSlotFin: {},
  buildSlotEmoji: {
    fontSize: 34,
    lineHeight: 40,
  },
  buildSlotGhost: {
    opacity: 0.35,
  },
  buildSlotLabel: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.inkMuted,
    marginTop: 2,
  },
  buildDoneRocket: {
    fontSize: 64,
    lineHeight: 72,
  },
  buildTapHint: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.ink,
    textAlign: 'center',
  },
  buildParts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  buildPartBtn: {
    width: 88,
    height: 100,
    borderRadius: 22,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#D7E6F7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  buildPartNext: {
    borderColor: colors.orange,
    borderWidth: 4,
    backgroundColor: '#FFF8E1',
    transform: [{ scale: 1.04 }],
  },
  buildPartDone: {
    borderColor: colors.green,
    backgroundColor: '#E8FBE8',
  },
  buildPartEmoji: {
    fontSize: 42,
    lineHeight: 48,
  },
  buildPartLabel: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.ink,
    marginTop: 4,
  },
  buildPartTap: {
    position: 'absolute',
    top: 4,
    right: 6,
    fontFamily: fonts.heading,
    fontSize: 10,
    color: colors.orange,
  },
  buildPartCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buildPartCheckText: {
    color: '#FFF',
    fontFamily: fonts.heading,
    fontSize: 12,
  },
});
