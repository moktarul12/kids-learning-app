import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RootStackProps } from '../../navigation/types';
import { GameShell } from '../../components/GameShell';
import { LivingIcon } from '../../components/KidAnimations';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useGameSession, shuffle } from '../../hooks/useGameSession';
import { speak } from '../../services/voice';

export function MemoryGameScreen({ navigation }: RootStackProps<'MemoryGame'>) {
  const prompt = 'Find the pairs';
  const { showReward, celebrate, playNext, streak, round } = useGameSession({
    gameId: 'memory',
    skill: 'thinking',
    prompt,
  });
  const faces = useMemo(() => shuffle(['🐶', '🐱', '🐸', '🦊', '🐶', '🐱', '🐸', '🦊']), [round]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  useEffect(() => {
    setFlipped([]);
    setMatched([]);
    speak(prompt);
  }, [round]);

  const flip = (i: number) => {
    if (flipped.length === 2 || flipped.includes(i) || matched.includes(i)) return;
    const next = [...flipped, i];
    setFlipped(next);
    if (next.length === 2) {
      const [a, b] = next;
      if (faces[a] === faces[b]) {
        speak('Match!');
        const m = [...matched, a, b];
        setMatched(m);
        setFlipped([]);
        if (m.length === faces.length) setTimeout(celebrate, 350);
      } else setTimeout(() => setFlipped([]), 650);
    }
  };

  return (
    <GameShell
      title="Memory"
      prompt={prompt}
      promptEmoji="🃏"
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Thinking World"
      backEmoji="💡"
      onHome={() => navigation.navigate('MainTabs' as never)}
      showReward={showReward}
      onNext={playNext}
      streak={streak}
    >
      <View style={styles.grid}>
        {faces.map((f, i) => (
          <Pressable key={`${round}-${i}`} style={styles.card} onPress={() => flip(i)}>
            <Text style={{ fontSize: 30 }}>{flipped.includes(i) || matched.includes(i) ? f : '❓'}</Text>
          </Pressable>
        ))}
      </View>
    </GameShell>
  );
}

export function OddOneOutScreen({ navigation }: RootStackProps<'OddOneOut'>) {
  const prompt = 'Which is different?';
  const { showReward, hint, celebrate, almost, playNext, streak, round } = useGameSession({
    gameId: 'odd_one',
    skill: 'thinking',
    prompt,
  });
  const items = useMemo(
    () =>
      shuffle([
        { emoji: '🍎', odd: false },
        { emoji: '🍎', odd: false },
        { emoji: '🍎', odd: false },
        { emoji: '🍌', odd: true },
      ]),
    [round],
  );
  useEffect(() => speak(prompt), [round]);

  return (
    <GameShell
      title="Odd One Out"
      prompt={prompt}
      promptEmoji="🍌"
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Thinking World"
      backEmoji="💡"
      onHome={() => navigation.navigate('MainTabs' as never)}
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      <View style={styles.row}>
        {items.map((it, i) => (
          <Pressable key={`${round}-${i}`} style={styles.card} onPress={() => (it.odd ? celebrate() : almost())}>
            <Text style={{ fontSize: 42 }}>{it.emoji}</Text>
          </Pressable>
        ))}
      </View>
    </GameShell>
  );
}

export function PatternGameScreen({ navigation }: RootStackProps<'PatternGame'>) {
  const prompt = 'What comes next?';
  const { showReward, hint, celebrate, almost, playNext, streak, round } = useGameSession({
    gameId: 'pattern',
    skill: 'thinking',
    dailyTaskId: 'pattern',
    prompt,
  });
  const patterns = [
    { seq: ['🔴', '🔵', '🔴', '🔵'], answer: '🔴', options: ['🔴', '🟡', '🟢'] },
    { seq: ['⭐', '🌙', '⭐', '🌙'], answer: '⭐', options: ['⭐', '☀️', '🌈'] },
    { seq: ['🐶', '🐱', '🐶', '🐱'], answer: '🐶', options: ['🐶', '🐸', '🦊'] },
  ];
  const p = patterns[round % patterns.length];
  useEffect(() => speak(prompt), [round]);

  return (
    <GameShell
      title="Patterns"
      prompt={prompt}
      promptEmoji="🔴"
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Thinking World"
      backEmoji="💡"
      onHome={() => navigation.navigate('MainTabs' as never)}
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      <Text style={styles.pattern}>{p.seq.join(' ')} ?</Text>
      <View style={styles.row}>
        {p.options.map((o) => (
          <Pressable key={`${round}-${o}`} style={styles.card} onPress={() => (o === p.answer ? celebrate() : almost())}>
            <Text style={{ fontSize: 40 }}>{o}</Text>
          </Pressable>
        ))}
      </View>
    </GameShell>
  );
}

export function SequenceGameScreen({ navigation }: RootStackProps<'SequenceGame'>) {
  const prompt = 'What comes next?';
  const { showReward, hint, celebrate, almost, playNext, streak, round } = useGameSession({
    gameId: 'sequence',
    skill: 'thinking',
    prompt,
  });
  const sets = [
    { show: '🐣 → 🐥 → ?', answer: '🐔', options: ['🐔', '🐶', '🐠'] },
    { show: '🌱 → 🌿 → ?', answer: '🌳', options: ['🌳', '🍎', '⭐'] },
    { show: '🥚 → 🐣 → ?', answer: '🐥', options: ['🐥', '🐸', '🎈'] },
  ];
  const s = sets[round % sets.length];
  useEffect(() => speak(prompt), [round]);

  return (
    <GameShell
      title="Sequence"
      prompt={prompt}
      promptEmoji="🐣"
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Thinking World"
      backEmoji="💡"
      onHome={() => navigation.navigate('MainTabs' as never)}
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      <Text style={styles.pattern}>{s.show}</Text>
      <View style={styles.row}>
        {s.options.map((o) => (
          <Pressable key={`${round}-${o}`} style={styles.card} onPress={() => (o === s.answer ? celebrate() : almost())}>
            <Text style={{ fontSize: 42 }}>{o}</Text>
          </Pressable>
        ))}
      </View>
    </GameShell>
  );
}

export function SortCategoryScreen({ navigation }: RootStackProps<'SortCategory'>) {
  const prompt = 'Fruit or vegetable?';
  const { showReward, hint, celebrate, almost, playNext, streak, round } = useGameSession({
    gameId: 'sort_category',
    skill: 'thinking',
    badge: 'thinker',
    prompt,
  });
  const makeQueue = () =>
    shuffle([
      { emoji: '🍎', cat: 'fruit' },
      { emoji: '🍌', cat: 'fruit' },
      { emoji: '🥕', cat: 'veg' },
      { emoji: '🥦', cat: 'veg' },
      { emoji: '🍇', cat: 'fruit' },
      { emoji: '🌽', cat: 'veg' },
    ]);
  const [queue, setQueue] = useState(makeQueue);
  const current = queue[0];
  useEffect(() => {
    setQueue(makeQueue());
    speak(prompt);
  }, [round]);

  return (
    <GameShell
      title="Sort It"
      prompt={prompt}
      promptEmoji="🥕"
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Thinking World"
      backEmoji="💡"
      onHome={() => navigation.navigate('MainTabs' as never)}
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      {current && (
        <LivingIcon motion="glow">
          <Text style={{ fontSize: 72 }}>{current.emoji}</Text>
        </LivingIcon>
      )}
      <View style={styles.row}>
        {[
          { id: 'fruit', label: 'Fruits', color: colors.coral },
          { id: 'veg', label: 'Veggies', color: colors.lime },
        ].map((b) => (
          <Pressable
            key={b.id}
            style={[styles.bin, { backgroundColor: b.color }]}
            onPress={() => {
              if (!current) return;
              if (current.cat === b.id) {
                speak('Yes!');
                const next = queue.slice(1);
                setQueue(next);
                if (!next.length) celebrate();
              } else almost();
            }}
          >
            <Text style={styles.binText}>{b.label}</Text>
          </Pressable>
        ))}
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', width: 300 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  card: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: '#F3F8FF',
    borderWidth: 2,
    borderColor: '#D7E6F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pattern: { fontSize: 34, marginVertical: 8 },
  bin: {
    width: 130,
    height: 96,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  binText: { ...typography.title, color: '#FFF', fontSize: 18 },
});
