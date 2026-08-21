import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { RootStackProps } from '../../navigation/types';
import { GameShell } from '../../components/GameShell';
import { BigButton } from '../../components/BigButton';
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
    prompt,
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
    prompt,
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
  const prompt = 'Finish the house';
  const { showReward, hint, celebrate, almost, playNext, streak, round } = useGameSession({
    gameId: 'shape_puzzle',
    skill: 'shapes',
    prompt,
  });
  const options = useMemo(
    () =>
      shuffle([
        { id: 'triangle', emoji: '🔺' },
        { id: 'circle', emoji: '⭕' },
        { id: 'star', emoji: '⭐' },
      ]),
    [round],
  );
  useEffect(() => speak(prompt), [round]);

  return (
    <GameShell
      title="Shape Puzzle"
      prompt={prompt}
      promptEmoji="🏠"
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Shape World"
      backEmoji="🔷"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      <View style={styles.house}>
        <View style={styles.roof}>
          <Text style={styles.q}>?</Text>
        </View>
        <View style={styles.base}>
          <Text style={{ fontSize: 36 }}>🚪</Text>
        </View>
      </View>
      <Text style={styles.status}>Which shape is the roof?</Text>
      <View style={styles.matchRow}>
        {options.map((o) => (
          <Pressable
            key={`${round}-${o.id}`}
            style={({ pressed }) => [
              styles.matchTile,
              shadows.soft,
              { transform: [{ scale: pressed ? 0.94 : 1 }] },
            ]}
            onPress={() => (o.id === 'triangle' ? celebrate() : almost('Try the triangle!'))}
          >
            <Text style={styles.matchEmoji}>{o.emoji}</Text>
          </Pressable>
        ))}
      </View>
    </GameShell>
  );
}

export function ShapeBuilderScreen({ navigation }: RootStackProps<'ShapeBuilder'>) {
  const prompt = 'Build a rocket';
  const { showReward, celebrate, playNext, streak, round } = useGameSession({
    gameId: 'shape_builder',
    skill: 'shapes',
    badge: 'shape_builder',
    prompt,
  });
  const parts = [
    { id: 'nose', emoji: '🔺' },
    { id: 'body', emoji: '🟥' },
    { id: 'window', emoji: '⭕' },
    { id: 'fin', emoji: '🟦' },
  ];
  const [placed, setPlaced] = useState<string[]>([]);
  useEffect(() => {
    setPlaced([]);
    speak(prompt);
  }, [round]);

  return (
    <GameShell
      title="Shape Builder"
      prompt={prompt}
      promptEmoji="🚀"
      round={round}
      progressCurrent={placed.length}
      progressTotal={parts.length}
      onBack={() => navigation.goBack()}
      backLabel="Shape World"
      backEmoji="🔷"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      rewardMessage="Blast off!"
    >
      <View style={styles.pad}>
        {placed.includes('nose') && <Text style={{ fontSize: 56 }}>🔺</Text>}
        {placed.includes('body') && <Text style={{ fontSize: 64 }}>🟥</Text>}
        {placed.includes('window') && <Text style={{ fontSize: 36, marginTop: -48 }}>⭕</Text>}
        {placed.includes('fin') && <Text style={{ fontSize: 36 }}>🟦🟦</Text>}
        {!placed.length && <Text style={{ fontSize: 64 }}>🚀</Text>}
      </View>
      <Text style={styles.status}>Tap parts to build · {placed.length}/{parts.length}</Text>
      <View style={styles.matchRow}>
        {parts.map((p) => (
          <Pressable
            key={p.id}
            style={({ pressed }) => [
              styles.matchTile,
              shadows.soft,
              placed.includes(p.id) && styles.tileDone,
              { opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={() => {
              if (placed.includes(p.id)) return;
              speak('Nice!');
              const next = [...placed, p.id];
              setPlaced(next);
              if (next.length === parts.length) setTimeout(() => celebrate('Blast off!'), 350);
            }}
          >
            <Text style={styles.matchEmoji}>{p.emoji}</Text>
          </Pressable>
        ))}
      </View>
      {placed.length === parts.length && (
        <BigButton label="Launch!" onPress={() => celebrate('Blast off!')} color={colors.orange} textColor="#FFF" />
      )}
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
});
