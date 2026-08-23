import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RootStackProps } from '../../navigation/types';
import { GameShell } from '../../components/GameShell';
import { GameHeader } from '../../components/GameHeader';
import { WorldScene, WhiteStage } from '../../components/SkyBackground';
import { BigButton } from '../../components/BigButton';
import { BounceView, LivingIcon } from '../../components/KidAnimations';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useGameSession } from '../../hooks/useGameSession';
import { useProgress } from '../../state/ProgressContext';
import { speak } from '../../services/voice';

const COLOR_SUBJECTS = [
  {
    id: 'elephant',
    title: 'elephant',
    emoji: '🐘',
    parts: [
      { id: 'body', label: 'Body', emoji: '🐘' },
      { id: 'ear', label: 'Ear', emoji: '👂' },
      { id: 'trunk', label: 'Trunk', emoji: '🌀' },
    ],
  },
  {
    id: 'fish',
    title: 'fish',
    emoji: '🐠',
    parts: [
      { id: 'body', label: 'Body', emoji: '🐠' },
      { id: 'fin', label: 'Fin', emoji: '🔺' },
      { id: 'tail', label: 'Tail', emoji: '🎏' },
    ],
  },
  {
    id: 'house',
    title: 'house',
    emoji: '🏠',
    parts: [
      { id: 'roof', label: 'Roof', emoji: '🔺' },
      { id: 'wall', label: 'Wall', emoji: '🟧' },
      { id: 'door', label: 'Door', emoji: '🚪' },
    ],
  },
  {
    id: 'flower',
    title: 'flower',
    emoji: '🌸',
    parts: [
      { id: 'petal', label: 'Petal', emoji: '🌸' },
      { id: 'center', label: 'Center', emoji: '🟡' },
      { id: 'stem', label: 'Stem', emoji: '🌿' },
    ],
  },
  {
    id: 'car',
    title: 'car',
    emoji: '🚗',
    parts: [
      { id: 'body', label: 'Body', emoji: '🚗' },
      { id: 'window', label: 'Window', emoji: '🟦' },
      { id: 'wheel', label: 'Wheel', emoji: '⚫' },
    ],
  },
  {
    id: 'cat',
    title: 'cat',
    emoji: '🐱',
    parts: [
      { id: 'face', label: 'Face', emoji: '🐱' },
      { id: 'ear', label: 'Ear', emoji: '👂' },
      { id: 'tail', label: 'Tail', emoji: '➰' },
    ],
  },
] as const;

const PALETTE = ['#FF5A5A', '#4BA3FF', '#FFD93D', '#5ECF5A', '#FF7AB8', '#9B7BFF', '#FFFFFF', '#2D2D2D'];

export function ColoringScreen({ navigation }: RootStackProps<'Coloring'>) {
  const [fills, setFills] = useState<Record<string, string>>({});
  const [brush, setBrush] = useState(PALETTE[0]);
  const { showReward, celebrate, playNext, streak, round } = useGameSession({
    gameId: 'coloring',
    skill: 'creativity',
    badge: 'creative_star',
    dailyTaskId: 'create',
  });
  const subject = COLOR_SUBJECTS[round % COLOR_SUBJECTS.length];
  const prompt = `Color the ${subject.title}`;

  useEffect(() => {
    setFills({});
    setBrush(PALETTE[0]);
    speak(prompt);
  }, [round, prompt]);

  return (
    <GameShell
      title="Coloring"
      prompt={prompt}
      promptEmoji={subject.emoji}
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Creative World"
      backEmoji="🖌️"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      rewardMessage="Beautiful!"
    >
      <View style={styles.colorHero}>
        <LivingIcon motion="bob">
          <Text style={styles.colorHeroEmoji}>{subject.emoji}</Text>
        </LivingIcon>
        <Text style={styles.colorHeroHint}>Tap each part to paint</Text>
      </View>

      <View style={styles.colorParts}>
        {subject.parts.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => {
              setFills((f) => ({ ...f, [p.id]: brush }));
              speak(p.label);
            }}
            style={[
              styles.colorPart,
              { backgroundColor: fills[p.id] || '#E8E8E8', borderColor: fills[p.id] ? fills[p.id] : '#D0D0D0' },
            ]}
          >
            <Text style={styles.colorPartEmoji}>{p.emoji}</Text>
            <Text style={styles.colorPartLabel}>{p.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.palette}>
        {PALETTE.map((c) => (
          <Pressable
            key={c}
            style={[
              styles.swatch,
              { backgroundColor: c },
              brush === c && styles.swatchOn,
              c === '#FFFFFF' && { borderWidth: 1, borderColor: '#CCC' },
            ]}
            onPress={() => setBrush(c)}
          />
        ))}
      </View>
      <BigButton
        label="Done!"
        onPress={() => celebrate('Beautiful!')}
        color={colors.pink}
        textColor="#FFF"
        disabled={Object.keys(fills).length < 2}
      />
    </GameShell>
  );
}

const SCENE_SETS = [
  {
    id: 'park',
    title: 'Park day',
    stickers: ['🌳', '🐶', '🌸', '☀️', '🦋', '🧺'],
    cells: 6,
  },
  {
    id: 'farm',
    title: 'Farm friends',
    stickers: ['🐄', '🐷', '🐔', '🌾', '🚜', '🌻'],
    cells: 6,
  },
  {
    id: 'space',
    title: 'Space trip',
    stickers: ['🚀', '🌟', '🌙', '🪐', '👽', '☄️'],
    cells: 6,
  },
  {
    id: 'ocean',
    title: 'Ocean fun',
    stickers: ['🐠', '🐙', '🐚', '🌊', '⭐', '🫧'],
    cells: 6,
  },
] as const;

type GardenCell = { emoji: string | null };

export function MyWorldCreatorScreen({ navigation }: RootStackProps<'MyWorldCreator'>) {
  const { showReward, celebrate, playNext, streak, round } = useGameSession({
    gameId: 'my_world',
    skill: 'creativity',
  });
  const scene = SCENE_SETS[round % SCENE_SETS.length];
  const [selected, setSelected] = useState<string>(scene.stickers[0]);
  const [cells, setCells] = useState<GardenCell[]>(() =>
    Array.from({ length: 6 }, () => ({ emoji: null })),
  );

  useEffect(() => {
    const s = SCENE_SETS[round % SCENE_SETS.length];
    setSelected(s.stickers[0]);
    setCells(Array.from({ length: 6 }, () => ({ emoji: null })));
    speak(`Make a ${s.title}. Pick a sticker, then tap a box.`);
  }, [round]);

  const filled = cells.filter((c) => c.emoji).length;
  const prompt = selected
    ? `Tap a box to place ${selected}`
    : 'Pick a sticker, then tap a box';

  const plant = (index: number) => {
    if (!selected) {
      speak('Pick a sticker first');
      return;
    }
    setCells((prev) => {
      const next = [...prev];
      if (next[index].emoji === selected) {
        next[index] = { emoji: null };
        speak('Removed');
      } else {
        next[index] = { emoji: selected };
        speak('Yes!');
      }
      return next;
    });
  };

  return (
    <GameShell
      title="My World"
      prompt={prompt}
      promptEmoji="🌎"
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Creative World"
      backEmoji="🖌️"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      rewardMessage="World saved!"
    >
      <View style={styles.gardenStage}>
        <View style={styles.gardenBanner}>
          <Text style={styles.gardenTitle}>{scene.title}</Text>
          <Text style={styles.gardenSub}>
            1) Pick a sticker  ·  2) Tap a box  ·  Tap again to remove
          </Text>
          <Text style={styles.gardenCount}>{filled}/6</Text>
        </View>

        <View style={styles.gardenGrid}>
          {cells.map((cell, i) => (
            <Pressable
              key={`${round}-cell-${i}`}
              onPress={() => plant(i)}
              style={({ pressed }) => [
                styles.gardenCell,
                cell.emoji && styles.gardenCellFilled,
                { transform: [{ scale: pressed ? 0.96 : 1 }] },
              ]}
            >
              {cell.emoji ? (
                <Text style={styles.gardenCellEmoji}>{cell.emoji}</Text>
              ) : (
                <Text style={styles.gardenCellHint}>{selected ?? '＋'}</Text>
              )}
            </Pressable>
          ))}
        </View>

        <Text style={styles.gardenTrayLabel}>Stickers</Text>
        <View style={styles.gardenTray}>
          {scene.stickers.map((emoji) => {
            const on = selected === emoji;
            return (
              <Pressable
                key={emoji}
                onPress={() => {
                  setSelected(emoji);
                  speak('Got it');
                }}
                style={[styles.gardenTrayItem, on && styles.gardenTrayItemOn]}
              >
                <Text style={styles.gardenTrayEmoji}>{emoji}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.gardenActions}>
          <Pressable
            onPress={() => {
              setCells(Array.from({ length: 6 }, () => ({ emoji: null })));
              speak('Cleared');
            }}
            style={[styles.gardenBtn, styles.gardenBtnGhost]}
          >
            <Text style={[styles.gardenBtnText, { color: colors.ink }]}>Clear</Text>
          </Pressable>
          <Pressable
            disabled={filled < 2}
            onPress={() => celebrate('World saved!')}
            style={[
              styles.gardenBtn,
              { backgroundColor: colors.yellow, opacity: filled >= 2 ? 1 : 0.45 },
            ]}
          >
            <Text style={[styles.gardenBtnText, { color: colors.ink }]}>Save</Text>
          </Pressable>
        </View>
      </View>
    </GameShell>
  );
}

export function StoryPlayScreen({ navigation }: RootStackProps<'StoryPlay'>) {
  const [step, setStep] = useState(0);
  const { showReward, celebrate, playNext, almost, hint, streak, round } = useGameSession({
    gameId: 'story_bunny',
    skill: 'stories',
    prompt: 'Bunny story',
  });
  const scenes = [
    {
      text: 'Bunny found a door.',
      emoji: '🐰🚪',
      choices: [
        { label: 'Open the door', next: 1 },
        { label: 'Go around', next: 2 },
      ],
    },
    {
      text: 'Bunny finds 3 apples! How many?',
      emoji: '🍎🍎🍎',
      choices: [
        { label: '2', next: -1 },
        { label: '3', next: 3 },
        { label: '5', next: -1 },
      ],
    },
    {
      text: 'Bunny finds a rainbow!',
      emoji: '🌈🐰',
      choices: [{ label: 'Celebrate!', next: 3 }],
    },
    {
      text: 'What a wonderful adventure!',
      emoji: '🎉🐰',
      choices: [{ label: 'Finish', next: 99 }],
    },
  ];
  const scene = scenes[Math.min(step, scenes.length - 1)];
  useEffect(() => setStep(0), [round]);
  useEffect(() => speak(scene.text), [step, round, scene.text]);

  return (
    <GameShell
      title="Bunny Story"
      prompt={scene.text}
      promptEmoji="📖"
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Story World"
      backEmoji="📖"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
      rewardMessage="Great story!"
    >
      <LivingIcon motion="bob">
        <Text style={{ fontSize: 64 }}>{scene.emoji}</Text>
      </LivingIcon>
      {scene.choices.map((c) => (
        <BigButton
          key={c.label}
          label={c.label}
          size="md"
          color={colors.pink}
          textColor="#FFF"
          style={{ width: '100%' }}
          onPress={() => {
            if (c.next === -1) almost('Try again!');
            else if (c.next === 99) celebrate('Great story!');
            else setStep(c.next);
          }}
        />
      ))}
    </GameShell>
  );
}

export function DailyAdventureScreen({ navigation }: RootStackProps<'DailyAdventure'>) {
  const { dailyTasks, addReward } = useProgress();
  const allDone = dailyTasks.every((t) => t.done);

  return (
    <WorldScene mood="soft">
      <GameHeader title="Daily Adventure" onBack={() => navigation.goBack()} prompt="Daily adventure" backLabel="Creative World" backEmoji="🖌️" />
      <View style={styles.page}>
        <WhiteStage>
          <Text style={styles.heading}>Today&apos;s missions</Text>
          {dailyTasks.map((t) => (
            <Pressable
              key={t.id}
              style={[styles.mission, t.done && styles.missionDone]}
              onPress={() => {
                if (t.done || !t.route) return;
                navigation.navigate(t.route as any);
              }}
            >
              <Text style={styles.missionText}>
                {t.done ? '✅' : '○'}  {t.label}
              </Text>
            </Pressable>
          ))}
          {allDone && (
            <BigButton
              label="Open Mystery Reward"
              onPress={() => {
                addReward({ gems: 1, coins: 25, stars: 5 });
                navigation.navigate('MysteryBox');
              }}
              color={colors.orange}
              textColor="#FFF"
            />
          )}
        </WhiteStage>
      </View>
    </WorldScene>
  );
}

export function MysteryBoxScreen({ navigation }: RootStackProps<'MysteryBox'>) {
  const [opened, setOpened] = useState(false);
  const prizes = ['🎩', '🦄', '🚀', '🌟', '🎈', '🧸'];
  const prize = prizes[Math.floor(Math.random() * prizes.length)];
  const { addReward } = useProgress();

  return (
    <WorldScene mood="soft">
      <GameHeader title="Mystery Box" onBack={() => navigation.goBack()} prompt="Tap to open" backLabel="Creative World" backEmoji="🖌️" />
      <View style={styles.page}>
        <WhiteStage>
          <Pressable
            onPress={() => {
              if (opened) return;
              setOpened(true);
              speak('Yay!');
              addReward({ coins: 15, stars: 2, gems: 1 });
            }}
          >
            <BounceView amount={10} loop={!opened}>
              <Text style={{ fontSize: 100 }}>{opened ? prize : '🎁'}</Text>
            </BounceView>
          </Pressable>
          <Text style={styles.heading}>{opened ? 'You got a surprise!' : 'Tap to open!'}</Text>
          {opened && <BigButton label="Yay!" onPress={() => navigation.goBack()} color={colors.yellow} />}
        </WhiteStage>
      </View>
    </WorldScene>
  );
}

const styles = StyleSheet.create({
  colorHero: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  colorHeroEmoji: { fontSize: 64, lineHeight: 72 },
  colorHeroHint: {
    ...typography.caption,
    color: colors.inkMuted,
  },
  colorParts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginVertical: 8,
  },
  colorPart: {
    width: 96,
    height: 96,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  colorPartEmoji: { fontSize: 36 },
  colorPartLabel: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 12,
    color: colors.ink,
  },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  swatch: { width: 38, height: 38, borderRadius: 19 },
  swatchOn: { borderWidth: 3, borderColor: colors.ink },
  gardenStage: { width: '100%', gap: 10 },
  gardenBanner: {
    backgroundColor: '#E8F8FF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 2,
    borderColor: '#A8D8F8',
    gap: 2,
  },
  gardenTitle: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 18,
    color: colors.ink,
  },
  gardenSub: {
    ...typography.caption,
    color: colors.inkMuted,
  },
  gardenCount: {
    position: 'absolute',
    right: 12,
    top: 12,
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    color: colors.blue,
  },
  gardenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  gardenCell: {
    width: '30%',
    aspectRatio: 1,
    minWidth: 88,
    maxWidth: 110,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    borderWidth: 3,
    borderColor: '#C5D9F0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gardenCellFilled: {
    backgroundColor: '#FFF8EE',
    borderColor: '#FFD59A',
    borderStyle: 'solid',
  },
  gardenCellEmoji: { fontSize: 42 },
  gardenCellHint: { fontSize: 28, opacity: 0.35 },
  gardenTrayLabel: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 14,
    color: colors.ink,
    marginTop: 4,
  },
  gardenTray: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  gardenTrayItem: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#D7E6F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gardenTrayItemOn: {
    borderColor: colors.blue,
    borderWidth: 3,
    backgroundColor: '#E8F4FF',
  },
  gardenTrayEmoji: { fontSize: 28 },
  gardenActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginTop: 4,
  },
  gardenBtn: {
    flex: 1,
    maxWidth: 140,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  gardenBtnGhost: {
    backgroundColor: '#EEF3F8',
    borderWidth: 2,
    borderColor: '#D7E6F7',
  },
  gardenBtnText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 16,
    color: '#FFF',
  },
  page: { flex: 1, padding: 12 },
  heading: { ...typography.title, fontSize: 22, textAlign: 'center', marginBottom: 8 },
  mission: {
    width: '100%',
    backgroundColor: '#F3F8FF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#D7E6F7',
  },
  missionDone: { opacity: 0.55 },
  missionText: { ...typography.body, fontSize: 16 },
});

