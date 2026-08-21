import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RootStackProps } from '../../navigation/types';
import { GameShell } from '../../components/GameShell';
import { BigButton } from '../../components/BigButton';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
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
  const [found, setFound] = useState(0);
  useEffect(() => {
    setFound(0);
    speak(prompt);
  }, [round]);

  return (
    <GameShell
      title="Find Shapes"
      prompt={prompt}
      promptEmoji="🔺"
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Shape World"
      backEmoji="🔷"
      onHome={() => navigation.navigate('MainTabs' as never)}
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      <View style={styles.grid}>
        {items.map((s, i) => (
          <Pressable
            key={`${round}-${i}`}
            style={styles.tile}
            onPress={() => {
              if (s.id === target.id) {
                speak('Triangle!');
                const n = found + 1;
                setFound(n);
                if (n >= 3) celebrate();
              } else almost();
            }}
          >
            <Text style={{ fontSize: 40 }}>{s.emoji}</Text>
          </Pressable>
        ))}
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
        { shape: '⭕', object: '⚽', id: 'c' },
        { shape: '🔺', object: '🍕', id: 't' },
        { shape: '🟦', object: '🪟', id: 's' },
      ]),
    [round],
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => {
    setSelected(null);
    setDone([]);
    speak(prompt);
  }, [round]);

  return (
    <GameShell
      title="Shape Match"
      prompt={prompt}
      promptEmoji="🧩"
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Shape World"
      backEmoji="🔷"
      onHome={() => navigation.navigate('MainTabs' as never)}
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      <View style={styles.row}>
        {pairs.map((p) => (
          <Pressable
            key={p.id}
            style={[styles.tile, selected === p.id && styles.selected]}
            onPress={() => !done.includes(p.id) && setSelected(p.id)}
          >
            <Text style={{ fontSize: 40 }}>{p.shape}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.row}>
        {[...pairs].reverse().map((p) => (
          <Pressable
            key={p.object}
            style={[styles.tile, done.includes(p.id) && { opacity: 0.4 }]}
            onPress={() => {
              if (!selected) return;
              if (selected === p.id) {
                speak('Match!');
                const next = [...done, p.id];
                setDone(next);
                setSelected(null);
                if (next.length === pairs.length) celebrate();
              } else almost();
            }}
          >
            <Text style={{ fontSize: 40 }}>{p.object}</Text>
          </Pressable>
        ))}
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
      onHome={() => navigation.navigate('MainTabs' as never)}
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
          <Text style={{ fontSize: 28 }}>🚪</Text>
        </View>
      </View>
      <View style={styles.row}>
        {options.map((o) => (
          <Pressable
            key={`${round}-${o.id}`}
            style={styles.tile}
            onPress={() => (o.id === 'triangle' ? celebrate() : almost())}
          >
            <Text style={{ fontSize: 40 }}>{o.emoji}</Text>
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
      onBack={() => navigation.goBack()}
      backLabel="Shape World"
      backEmoji="🔷"
      onHome={() => navigation.navigate('MainTabs' as never)}
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      rewardMessage="Blast off!"
    >
      <View style={styles.pad}>
        {placed.includes('nose') && <Text style={{ fontSize: 40 }}>🔺</Text>}
        {placed.includes('body') && <Text style={{ fontSize: 48 }}>🟥</Text>}
        {placed.includes('window') && <Text style={{ fontSize: 28, marginTop: -40 }}>⭕</Text>}
        {placed.includes('fin') && <Text style={{ fontSize: 28 }}>🟦🟦</Text>}
        {!placed.length && <Text style={styles.q}>🚀</Text>}
      </View>
      <View style={styles.row}>
        {parts.map((p) => (
          <Pressable
            key={p.id}
            style={[styles.tile, placed.includes(p.id) && { opacity: 0.3 }]}
            onPress={() => {
              if (placed.includes(p.id)) return;
              speak('Nice!');
              const next = [...placed, p.id];
              setPlaced(next);
              if (next.length === parts.length) setTimeout(() => celebrate('Blast off!'), 350);
            }}
          >
            <Text style={{ fontSize: 36 }}>{p.emoji}</Text>
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  tile: {
    width: 74,
    height: 74,
    borderRadius: 20,
    backgroundColor: '#F3F8FF',
    borderWidth: 2,
    borderColor: '#D7E6F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { borderColor: colors.blue, borderWidth: 3 },
  house: { alignItems: 'center' },
  roof: {
    width: 120,
    height: 70,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.inkMuted,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8E1',
  },
  base: {
    width: 120,
    height: 90,
    backgroundColor: colors.brown,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  q: { ...typography.title, fontSize: 32, color: colors.inkMuted },
  pad: {
    minHeight: 170,
    width: 170,
    backgroundColor: '#F3F8FF',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
