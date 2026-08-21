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
  const prompt = 'Tap two cards. Find a match!';
  const { showReward, celebrate, playNext, streak, round } = useGameSession({
    gameId: 'memory',
    skill: 'thinking',
    prompt,
  });

  const faces = useMemo(
    () => shuffle(['🐶', '🐱', '🐸', '🦊', '🐶', '🐱', '🐸', '🦊']),
    [round],
  );
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [peeking, setPeeking] = useState(true);
  const [busy, setBusy] = useState(false);

  const pairsFound = matched.length / 2;
  const allDone = matched.length === faces.length;

  useEffect(() => {
    setFlipped([]);
    setMatched([]);
    setBusy(false);
    setPeeking(true);
    speak('Look at the pictures. Then find the pairs!');
    const t = setTimeout(() => {
      setPeeking(false);
      speak('Tap two cards to match!');
    }, 2200);
    return () => clearTimeout(t);
  }, [round]);

  const flip = (i: number) => {
    if (peeking || busy || allDone) return;
    if (flipped.length === 2 || flipped.includes(i) || matched.includes(i)) return;

    const next = [...flipped, i];
    setFlipped(next);

    if (next.length === 2) {
      setBusy(true);
      const [a, b] = next;
      if (faces[a] === faces[b]) {
        speak('Match!');
        const m = [...matched, a, b];
        setTimeout(() => {
          setMatched(m);
          setFlipped([]);
          setBusy(false);
          if (m.length === faces.length) setTimeout(() => celebrate(), 350);
        }, 400);
      } else {
        speak('Try again');
        setTimeout(() => {
          setFlipped([]);
          setBusy(false);
        }, 700);
      }
    }
  };

  const foundFaces = useMemo(() => {
    const set = new Set<string>();
    matched.forEach((i) => set.add(faces[i]));
    return [...set];
  }, [matched, faces]);

  return (
    <GameShell
      title="Memory"
      prompt={peeking ? 'Remember the pictures!' : prompt}
      promptEmoji="🃏"
      round={round}
      progressCurrent={pairsFound}
      progressTotal={4}
      onBack={() => navigation.goBack()}
      backLabel="Thinking World"
      backEmoji="💡"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
    >
      <View style={styles.memStage}>
        <View style={styles.memBanner}>
          <LivingIcon motion={peeking ? 'pulse' : 'bob'}>
            <Text style={styles.memHero}>{peeking ? '👀' : '🧠'}</Text>
          </LivingIcon>
          <View style={styles.memBannerCopy}>
            <Text style={styles.memBannerTitle}>
              {peeking ? 'Remember these!' : allDone ? 'You found all pairs!' : 'Find matching pairs'}
            </Text>
            <Text style={styles.memBannerSub}>
              {peeking
                ? 'Pictures hide in a moment…'
                : allDone
                  ? 'Amazing memory!'
                  : '① Tap one card  ② Tap another  ③ Match!'}
            </Text>
          </View>
        </View>

        {/* Found pairs tray — shows what “matching” means */}
        <View style={styles.memFoundRow}>
          <Text style={styles.memFoundLabel}>Pairs:</Text>
          {[0, 1, 2, 3].map((slot) => (
            <View key={slot} style={[styles.memFoundSlot, foundFaces[slot] && styles.memFoundSlotOn]}>
              <Text style={styles.memFoundEmoji}>{foundFaces[slot] ?? '⬜'}</Text>
            </View>
          ))}
          <Text style={styles.memFoundCount}>{pairsFound}/4</Text>
        </View>

        <View style={styles.memGrid}>
          {faces.map((f, i) => {
            const open = peeking || flipped.includes(i) || matched.includes(i);
            const isMatch = matched.includes(i);
            const isFlippedNow = flipped.includes(i);
            return (
              <Pressable
                key={`${round}-${i}`}
                disabled={peeking || busy || isMatch}
                onPress={() => flip(i)}
                style={({ pressed }) => [
                  styles.memCard,
                  open && styles.memCardOpen,
                  isMatch && styles.memCardMatch,
                  isFlippedNow && !isMatch && styles.memCardPicked,
                  { transform: [{ scale: pressed && !open ? 0.94 : 1 }] },
                ]}
              >
                <Text style={styles.memCardEmoji}>{open ? f : '?'}</Text>
                {isMatch ? (
                  <View style={styles.memCheck}>
                    <Text style={styles.memCheckText}>✓</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {!peeking && !allDone ? (
          <Text style={styles.memTip}>
            {flipped.length === 0
              ? '👆 Tap any card to flip it'
              : flipped.length === 1
                ? '👆 Now tap one more card'
                : '…'}
          </Text>
        ) : null}
      </View>
    </GameShell>
  );
}

export function OddOneOutScreen({ navigation }: RootStackProps<'OddOneOut'>) {
  const { showReward, hint, celebrate, almost, playNext, streak, round } = useGameSession({
    gameId: 'odd_one',
    skill: 'thinking',
    prompt: 'Which is different?',
  });

  const puzzle = useMemo(() => {
    const banks = [
      { same: '🍎', odd: '🍌', label: 'Fruit', tip: 'Three apples — one banana!' },
      { same: '🐶', odd: '🚗', label: 'Animals', tip: 'Three dogs — one car!' },
      { same: '⭐', odd: '🔵', label: 'Sky', tip: 'Three stars — one circle!' },
      { same: '🐟', odd: '🐦', label: 'Animals', tip: 'Three fish — one bird!' },
      { same: '🟥', odd: '🔺', label: 'Shapes', tip: 'Three squares — one triangle!' },
      { same: '🌸', odd: '🌵', label: 'Plants', tip: 'Three flowers — one cactus!' },
      { same: '🍪', odd: '🥦', label: 'Food', tip: 'Three cookies — one broccoli!' },
      { same: '⚽', odd: '🎸', label: 'Toys', tip: 'Three balls — one guitar!' },
    ];
    const bank = banks[round % banks.length];
    const items = shuffle([
      { emoji: bank.same, odd: false },
      { emoji: bank.same, odd: false },
      { emoji: bank.same, odd: false },
      { emoji: bank.odd, odd: true },
    ]);
    return { items, label: bank.label, odd: bank.odd, tip: bank.tip, same: bank.same };
  }, [round]);

  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const locked = picked != null && puzzle.items[picked]?.odd;

  useEffect(() => {
    setPicked(null);
    setWrong(null);
    speak('Which one is different? Tap it!');
  }, [round]);

  return (
    <GameShell
      title="Odd One Out"
      prompt="Which is different?"
      promptEmoji="🔍"
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Thinking World"
      backEmoji="💡"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      <View style={styles.oddStage}>
        <View style={styles.oddBanner}>
          <LivingIcon motion="sway">
            <Text style={styles.oddHero}>🔍</Text>
          </LivingIcon>
          <View style={styles.oddBannerCopy}>
            <Text style={styles.oddBannerTitle}>
              {locked ? 'You spotted it!' : 'Spot the odd one!'}
            </Text>
            <Text style={styles.oddBannerSub}>
              {locked ? `${puzzle.odd} is different` : `Look for the one that does not match`}
            </Text>
          </View>
        </View>

        <View style={styles.oddHow}>
          <Text style={styles.oddHowEmoji}>{puzzle.same}</Text>
          <Text style={styles.oddHowEmoji}>{puzzle.same}</Text>
          <Text style={styles.oddHowEmoji}>{puzzle.same}</Text>
          <Text style={styles.oddHowVs}>≠</Text>
          <Text style={[styles.oddHowEmoji, styles.oddHowMystery]}>?</Text>
          <Text style={styles.oddHowText}>3 same · 1 different</Text>
        </View>

        <View style={styles.oddGrid}>
          {puzzle.items.map((it, i) => {
            const isRight = locked && it.odd;
            const isWrong = wrong === i;
            const dim = locked && !it.odd;
            return (
              <Pressable
                key={`${round}-${i}`}
                disabled={locked}
                onPress={() => {
                  if (locked) return;
                  if (it.odd) {
                    setPicked(i);
                    speak('Yes! Different!');
                    setTimeout(() => celebrate(), 550);
                  } else {
                    setWrong(i);
                    setTimeout(() => setWrong(null), 450);
                    almost(puzzle.tip);
                  }
                }}
                style={({ pressed }) => [
                  styles.oddCard,
                  isRight && styles.oddCardWin,
                  isWrong && styles.oddCardWrong,
                  dim && styles.oddCardDim,
                  { transform: [{ scale: pressed && !locked ? 0.95 : 1 }] },
                ]}
              >
                <Text style={styles.oddEmoji}>{it.emoji}</Text>
                {isRight ? (
                  <View style={styles.oddBadge}>
                    <Text style={styles.oddBadgeText}>ODD ONE!</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.oddTip}>
          {locked ? '⭐ Great eyes!' : '👆 Tap the picture that is different'}
        </Text>
      </View>
    </GameShell>
  );
}

export function PatternGameScreen({ navigation }: RootStackProps<'PatternGame'>) {
  const { showReward, hint, celebrate, almost, playNext, streak, round } = useGameSession({
    gameId: 'pattern',
    skill: 'thinking',
    dailyTaskId: 'pattern',
    prompt: 'What comes next?',
  });

  const puzzle = useMemo(() => {
    const banks = [
      { full: ['🔴', '🔵', '🔴', '🔵', '🔴'], options: ['🔴', '🟡', '🟢'], label: 'Colors' },
      { full: ['⭐', '🌙', '⭐', '🌙', '⭐'], options: ['⭐', '☀️', '🌈'], label: 'Sky' },
      { full: ['🐶', '🐱', '🐶', '🐱', '🐶'], options: ['🐶', '🐸', '🦊'], label: 'Pets' },
      { full: ['🍎', '🍌', '🍎', '🍌', '🍎'], options: ['🍎', '🍇', '🥕'], label: 'Fruit' },
      { full: ['🔺', '🟦', '🔺', '🟦', '🔺'], options: ['🔺', '⭕', '⭐'], label: 'Shapes' },
      { full: ['1️⃣', '2️⃣', '1️⃣', '2️⃣', '1️⃣'], options: ['1️⃣', '3️⃣', '4️⃣'], label: 'Numbers' },
      { full: ['❤️', '💛', '💙', '❤️', '💛'], options: ['💙', '💚', '🖤'], label: 'Hearts' },
      { full: ['🚗', '🚗', '🚌', '🚗', '🚗'], options: ['🚌', '🚕', '🚲'], label: 'Vehicles' },
    ];
    const bank = banks[round % banks.length];
    const gapRoll = Math.random();
    const gap =
      gapRoll < 0.55 ? bank.full.length - 1 : gapRoll < 0.8 ? Math.floor(bank.full.length / 2) : 1;
    const answer = bank.full[gap];
    const shown = bank.full.map((item, i) => (i === gap ? null : item));
    const prompt =
      gap === bank.full.length - 1
        ? 'What comes next?'
        : gap <= 1
          ? 'What belongs in the gap?'
          : 'What is missing?';
    return {
      shown,
      answer,
      options: shuffle([...new Set([answer, ...bank.options])]).slice(0, 3),
      label: bank.label,
      prompt,
    };
  }, [round]);

  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const locked = picked === puzzle.answer;

  useEffect(() => {
    setPicked(null);
    setWrong(null);
    speak(puzzle.prompt);
  }, [round, puzzle.prompt]);

  const displayAt = (i: number) => {
    if (puzzle.shown[i] != null) return puzzle.shown[i];
    if (locked) return puzzle.answer;
    return null;
  };

  return (
    <GameShell
      title="Patterns"
      prompt={puzzle.prompt}
      promptEmoji="🧩"
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Thinking World"
      backEmoji="💡"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      <View style={styles.patStage}>
        <View style={styles.patBanner}>
          <LivingIcon motion="bob">
            <Text style={styles.patHero}>🧩</Text>
          </LivingIcon>
          <View style={styles.patBannerCopy}>
            <Text style={styles.patBannerTitle}>{puzzle.label} pattern</Text>
            <Text style={styles.patBannerSub}>
              {locked ? 'You cracked it!' : 'Find the missing piece'}
            </Text>
          </View>
        </View>

        <View style={styles.patTrack}>
          <View style={styles.patTrackLine} />
          <View style={styles.patBeads}>
            {puzzle.shown.map((_, i) => {
              const val = displayAt(i);
              const mystery = val == null;
              const justFilled = locked && puzzle.shown[i] == null;
              return (
                <View
                  key={`bead-${round}-${i}`}
                  style={[
                    styles.patBead,
                    mystery && styles.patBeadMystery,
                    justFilled && styles.patBeadWin,
                  ]}
                >
                  {mystery ? (
                    <LivingIcon motion="pulse">
                      <Text style={styles.patBeadQ}>?</Text>
                    </LivingIcon>
                  ) : (
                    <Text style={styles.patBeadEmoji}>{val}</Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        <Text style={styles.patAsk}>{locked ? 'Perfect!' : puzzle.prompt}</Text>
        <Text style={styles.patHint}>👇 Tap the matching icon</Text>

        <View style={styles.patRow}>
          {puzzle.options.map((o) => {
            const isRight = locked && o === puzzle.answer;
            const isWrong = wrong === o;
            return (
              <Pressable
                key={`${round}-${o}`}
                disabled={locked}
                onPress={() => {
                  if (locked) return;
                  if (o === puzzle.answer) {
                    setPicked(o);
                    speak('Yes!');
                    setTimeout(() => celebrate(), 550);
                  } else {
                    setWrong(o);
                    setTimeout(() => setWrong(null), 450);
                    almost('Look at the pattern!');
                  }
                }}
                style={({ pressed }) => [
                  styles.patOpt,
                  isRight && styles.patOptRight,
                  isWrong && styles.patOptWrong,
                  { transform: [{ scale: pressed && !locked ? 0.94 : 1 }] },
                ]}
              >
                <Text style={styles.patOptEmoji}>{o}</Text>
                {isRight ? <Text style={styles.patOptStar}>⭐</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </GameShell>
  );
}

export function SequenceGameScreen({ navigation }: RootStackProps<'SequenceGame'>) {
  const { showReward, hint, celebrate, almost, playNext, streak, round } = useGameSession({
    gameId: 'sequence',
    skill: 'thinking',
    prompt: 'What comes next?',
  });

  const puzzle = useMemo(() => {
    const sets = [
      {
        title: 'Growing up',
        steps: ['🥚', '🐣', '🐥'],
        answer: '🐔',
        options: ['🐔', '🐶', '🐠'],
        almost: 'It grows into a chicken!',
      },
      {
        title: 'Plant life',
        steps: ['🌱', '🌿'],
        answer: '🌳',
        options: ['🌳', '🍎', '⭐'],
        almost: 'It becomes a tree!',
      },
      {
        title: 'Day cycle',
        steps: ['🌅', '☀️'],
        answer: '🌙',
        options: ['🌙', '🌈', '❄️'],
        almost: 'Night comes next!',
      },
      {
        title: 'Build snowman',
        steps: ['⚪', '⚪'],
        answer: '⛄',
        options: ['⛄', '🔥', '🎈'],
        almost: 'Make a snowman!',
      },
      {
        title: 'Caterpillar',
        steps: ['🥚', '🐛'],
        answer: '🦋',
        options: ['🦋', '🐝', '🐞'],
        almost: 'It becomes a butterfly!',
      },
      {
        title: 'Baking',
        steps: ['🥣', '🔥'],
        answer: '🍪',
        options: ['🍪', '🥕', '🧸'],
        almost: 'Cookies come out!',
      },
    ];
    return sets[round % sets.length];
  }, [round]);

  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const locked = picked === puzzle.answer;

  useEffect(() => {
    setPicked(null);
    setWrong(null);
    speak('What comes next?');
  }, [round]);

  return (
    <GameShell
      title="Sequence"
      prompt="What comes next?"
      promptEmoji="➡️"
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Thinking World"
      backEmoji="💡"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      <View style={styles.seqStage}>
        <View style={styles.seqBanner}>
          <LivingIcon motion="bob">
            <Text style={styles.seqHero}>📖</Text>
          </LivingIcon>
          <View style={styles.seqBannerCopy}>
            <Text style={styles.seqBannerTitle}>{puzzle.title}</Text>
            <Text style={styles.seqBannerSub}>
              {locked ? 'Story complete!' : 'What happens next?'}
            </Text>
          </View>
        </View>

        <View style={styles.seqTrack}>
          {puzzle.steps.map((step, i) => (
            <React.Fragment key={`${round}-s-${i}`}>
              {i > 0 ? <Text style={styles.seqArrow}>→</Text> : null}
              <View style={styles.seqNode}>
                <Text style={styles.seqNodeEmoji}>{step}</Text>
              </View>
            </React.Fragment>
          ))}
          <Text style={styles.seqArrow}>→</Text>
          <View style={[styles.seqNode, styles.seqNodeMystery, locked && styles.seqNodeWin]}>
            {locked ? (
              <Text style={styles.seqNodeEmoji}>{puzzle.answer}</Text>
            ) : (
              <LivingIcon motion="pulse">
                <Text style={styles.seqQ}>?</Text>
              </LivingIcon>
            )}
          </View>
        </View>

        <Text style={styles.seqHint}>👇 Tap what comes next</Text>

        <View style={styles.seqRow}>
          {puzzle.options.map((o) => {
            const isRight = locked && o === puzzle.answer;
            const isWrong = wrong === o;
            return (
              <Pressable
                key={`${round}-${o}`}
                disabled={locked}
                onPress={() => {
                  if (locked) return;
                  if (o === puzzle.answer) {
                    setPicked(o);
                    speak('Yes!');
                    setTimeout(() => celebrate(), 550);
                  } else {
                    setWrong(o);
                    setTimeout(() => setWrong(null), 450);
                    almost(puzzle.almost);
                  }
                }}
                style={({ pressed }) => [
                  styles.seqOpt,
                  isRight && styles.seqOptRight,
                  isWrong && styles.seqOptWrong,
                  { transform: [{ scale: pressed && !locked ? 0.94 : 1 }] },
                ]}
              >
                <Text style={styles.seqOptEmoji}>{o}</Text>
                {isRight ? <Text style={styles.seqOptStar}>⭐</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </GameShell>
  );
}

export function SortCategoryScreen({ navigation }: RootStackProps<'SortCategory'>) {
  const themes = [
    {
      prompt: 'Fruit or vegetable?',
      bins: [
        { id: 'fruit', label: 'Fruits', emoji: '🍎', color: colors.coral },
        { id: 'veg', label: 'Veggies', emoji: '🥕', color: colors.lime },
      ],
      items: [
        { emoji: '🍎', cat: 'fruit' },
        { emoji: '🍌', cat: 'fruit' },
        { emoji: '🥕', cat: 'veg' },
        { emoji: '🥦', cat: 'veg' },
        { emoji: '🍇', cat: 'fruit' },
        { emoji: '🌽', cat: 'veg' },
      ],
    },
    {
      prompt: 'Animal or vehicle?',
      bins: [
        { id: 'animal', label: 'Animals', emoji: '🐶', color: colors.orange },
        { id: 'vehicle', label: 'Vehicles', emoji: '🚗', color: colors.blue },
      ],
      items: [
        { emoji: '🐶', cat: 'animal' },
        { emoji: '🐱', cat: 'animal' },
        { emoji: '🚗', cat: 'vehicle' },
        { emoji: '🚌', cat: 'vehicle' },
        { emoji: '🦊', cat: 'animal' },
        { emoji: '✈️', cat: 'vehicle' },
      ],
    },
    {
      prompt: 'Hot or cold?',
      bins: [
        { id: 'hot', label: 'Hot', emoji: '🔥', color: colors.coral },
        { id: 'cold', label: 'Cold', emoji: '❄️', color: colors.blue },
      ],
      items: [
        { emoji: '☀️', cat: 'hot' },
        { emoji: '🔥', cat: 'hot' },
        { emoji: '❄️', cat: 'cold' },
        { emoji: '🍦', cat: 'cold' },
        { emoji: '🌶️', cat: 'hot' },
        { emoji: '🧊', cat: 'cold' },
      ],
    },
  ] as const;

  const { showReward, hint, celebrate, almost, playNext, streak, round } = useGameSession({
    gameId: 'sort_category',
    skill: 'thinking',
    badge: 'thinker',
    prompt: 'Sort it out',
  });

  const theme = themes[round % themes.length];
  const [queue, setQueue] = useState<{ emoji: string; cat: string }[]>(() =>
    shuffle(themes[0].items.map((x) => ({ ...x }))),
  );
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);
  const current = queue[0];
  const total = theme.items.length;
  const doneCount = total - queue.length;

  useEffect(() => {
    const t = themes[round % themes.length];
    setQueue(shuffle(t.items.map((x) => ({ ...x }))));
    setFlash(null);
    speak(t.prompt);
  }, [round]);

  return (
    <GameShell
      title="Sort It"
      prompt={theme.prompt}
      promptEmoji={theme.bins[0].emoji}
      round={round}
      progressCurrent={doneCount}
      progressTotal={total}
      onBack={() => navigation.goBack()}
      backLabel="Thinking World"
      backEmoji="💡"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      <View style={styles.sortStage}>
        <View style={styles.sortBanner}>
          <LivingIcon motion="bob">
            <Text style={styles.sortHero}>🧺</Text>
          </LivingIcon>
          <View style={styles.sortBannerCopy}>
            <Text style={styles.sortBannerTitle}>Sort it out!</Text>
            <Text style={styles.sortBannerSub}>
              {queue.length ? `${doneCount}/${total} sorted` : 'All done!'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.sortItemPad,
            flash === 'ok' && styles.sortItemOk,
            flash === 'bad' && styles.sortItemBad,
          ]}
        >
          {current ? (
            <LivingIcon motion="glow">
              <Text style={styles.sortItemEmoji}>{current.emoji}</Text>
            </LivingIcon>
          ) : (
            <Text style={styles.sortItemEmoji}>🎉</Text>
          )}
          <Text style={styles.sortItemHint}>
            {current ? 'Where does this go?' : 'Great sorting!'}
          </Text>
        </View>

        <View style={styles.sortBins}>
          {theme.bins.map((b) => (
            <Pressable
              key={b.id}
              disabled={!current}
              onPress={() => {
                if (!current) return;
                if (current.cat === b.id) {
                  speak('Yes!');
                  setFlash('ok');
                  setTimeout(() => setFlash(null), 280);
                  const next = queue.slice(1);
                  setQueue(next);
                  if (!next.length) setTimeout(() => celebrate(), 400);
                } else {
                  setFlash('bad');
                  setTimeout(() => setFlash(null), 400);
                  almost(`Try ${b.label === theme.bins[0].label ? theme.bins[1].label : theme.bins[0].label}!`);
                }
              }}
              style={({ pressed }) => [
                styles.sortBin,
                { backgroundColor: b.color },
                { transform: [{ scale: pressed ? 0.96 : 1 }] },
              ]}
            >
              <Text style={styles.sortBinEmoji}>{b.emoji}</Text>
              <Text style={styles.sortBinText}>{b.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  // Memory
  memStage: {
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
  memBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  memHero: { fontSize: 40, lineHeight: 48 },
  memBannerCopy: { flex: 1 },
  memBannerTitle: { ...typography.title, fontSize: 17, color: colors.ink },
  memBannerSub: { ...typography.kidLabel, fontSize: 13, color: colors.inkMuted, marginTop: 2 },
  memFoundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  memFoundLabel: {
    ...typography.kidLabel,
    fontSize: 13,
    color: colors.inkMuted,
  },
  memFoundSlot: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0F4F8',
    borderWidth: 2,
    borderColor: '#D0D8E4',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memFoundSlotOn: {
    backgroundColor: '#E8FBE8',
    borderColor: colors.lime,
    borderStyle: 'solid',
  },
  memFoundEmoji: { fontSize: 20, lineHeight: 24 },
  memFoundCount: {
    marginLeft: 'auto',
    ...typography.title,
    fontSize: 15,
    color: colors.blue,
  },
  memGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },
  memCard: {
    width: '22%',
    minWidth: 72,
    aspectRatio: 1,
    maxWidth: 86,
    borderRadius: 20,
    backgroundColor: colors.blue,
    borderWidth: 3,
    borderColor: '#3A8DE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memCardOpen: {
    backgroundColor: '#FFF',
    borderColor: '#D7E6F7',
  },
  memCardPicked: {
    borderColor: colors.orange,
    borderWidth: 4,
  },
  memCardMatch: {
    backgroundColor: '#E8FBE8',
    borderColor: colors.lime,
  },
  memCardEmoji: { fontSize: 36, lineHeight: 44 },
  memCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memCheckText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  memTip: {
    ...typography.kidLabel,
    fontSize: 15,
    color: colors.ink,
    textAlign: 'center',
  },

  // Odd one out
  oddStage: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF4E0',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#FFD59A',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  oddBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  oddHero: { fontSize: 42, lineHeight: 50 },
  oddBannerCopy: { flex: 1 },
  oddBannerTitle: { ...typography.title, fontSize: 18, color: colors.ink },
  oddBannerSub: { ...typography.kidLabel, fontSize: 14, color: colors.inkMuted, marginTop: 2 },
  oddHow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '100%',
  },
  oddHowEmoji: { fontSize: 22, lineHeight: 28 },
  oddHowMystery: { opacity: 0.45 },
  oddHowVs: {
    ...typography.title,
    fontSize: 18,
    color: colors.orange,
    marginHorizontal: 4,
  },
  oddHowText: {
    width: '100%',
    textAlign: 'center',
    ...typography.kidLabel,
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 2,
  },
  oddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  oddCard: {
    width: '46%',
    aspectRatio: 1,
    maxWidth: 160,
    borderRadius: 28,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oddCardWin: {
    backgroundColor: '#E8FBE8',
    borderColor: colors.lime,
    borderWidth: 5,
  },
  oddCardWrong: {
    backgroundColor: '#FFE8E8',
    borderColor: colors.red,
  },
  oddCardDim: {
    opacity: 0.4,
  },
  oddEmoji: { fontSize: 72, lineHeight: 84 },
  oddBadge: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: colors.orange,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  oddBadgeText: {
    ...typography.kidLabel,
    fontSize: 12,
    color: '#FFF',
  },
  oddTip: {
    ...typography.kidLabel,
    fontSize: 16,
    color: colors.ink,
    textAlign: 'center',
  },

  // Patterns
  patStage: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F3E8FF',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#D4B8F8',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  patBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  patHero: { fontSize: 40, lineHeight: 48 },
  patBannerCopy: { flex: 1 },
  patBannerTitle: { ...typography.title, fontSize: 18, color: colors.ink },
  patBannerSub: { ...typography.kidLabel, fontSize: 14, color: colors.inkMuted, marginTop: 2 },
  patTrack: { width: '100%', alignItems: 'center', paddingVertical: 8 },
  patTrackLine: {
    position: 'absolute',
    top: '48%',
    left: '4%',
    right: '4%',
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFD93D',
    opacity: 0.5,
  },
  patBeads: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    zIndex: 1,
  },
  patBead: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patBeadMystery: {
    backgroundColor: '#FFF8E1',
    borderColor: colors.orange,
    borderStyle: 'dashed',
    width: 74,
    height: 74,
  },
  patBeadWin: {
    backgroundColor: colors.lime,
    borderColor: '#5ECF5A',
    borderStyle: 'solid',
  },
  patBeadEmoji: { fontSize: 40, lineHeight: 48 },
  patBeadQ: { ...typography.title, fontSize: 36, color: colors.orange },
  patAsk: { ...typography.title, fontSize: 18, color: colors.ink, textAlign: 'center' },
  patHint: { ...typography.kidLabel, fontSize: 15, color: colors.inkMuted },
  patRow: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  patOpt: {
    width: 100,
    height: 100,
    borderRadius: 26,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patOptRight: { backgroundColor: colors.lime, borderColor: '#5ECF5A' },
  patOptWrong: { backgroundColor: colors.red, borderColor: colors.red },
  patOptEmoji: { fontSize: 52, lineHeight: 60 },
  patOptStar: { position: 'absolute', top: 4, right: 6, fontSize: 16 },

  // Sequence
  seqStage: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#E8FFF4',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#A8E8C8',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  seqBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  seqHero: { fontSize: 40, lineHeight: 48 },
  seqBannerCopy: { flex: 1 },
  seqBannerTitle: { ...typography.title, fontSize: 18, color: colors.ink },
  seqBannerSub: { ...typography.kidLabel, fontSize: 14, color: colors.inkMuted, marginTop: 2 },
  seqTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  seqNode: {
    width: 78,
    height: 78,
    borderRadius: 22,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seqNodeMystery: {
    backgroundColor: '#FFF8E1',
    borderColor: colors.orange,
    borderStyle: 'dashed',
  },
  seqNodeWin: {
    backgroundColor: colors.lime,
    borderColor: '#5ECF5A',
    borderStyle: 'solid',
  },
  seqNodeEmoji: { fontSize: 44, lineHeight: 52 },
  seqQ: { ...typography.title, fontSize: 36, color: colors.orange },
  seqArrow: { ...typography.title, fontSize: 24, color: colors.inkMuted },
  seqHint: { ...typography.kidLabel, fontSize: 15, color: colors.inkMuted },
  seqRow: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  seqOpt: {
    width: 100,
    height: 100,
    borderRadius: 26,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seqOptRight: { backgroundColor: colors.lime, borderColor: '#5ECF5A' },
  seqOptWrong: { backgroundColor: colors.red, borderColor: colors.red },
  seqOptEmoji: { fontSize: 52, lineHeight: 60 },
  seqOptStar: { position: 'absolute', top: 4, right: 6, fontSize: 16 },

  // Sort
  sortStage: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF0F5',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#FFB0C8',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  sortBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  sortHero: { fontSize: 40, lineHeight: 48 },
  sortBannerCopy: { flex: 1 },
  sortBannerTitle: { ...typography.title, fontSize: 18, color: colors.ink },
  sortBannerSub: { ...typography.kidLabel, fontSize: 14, color: colors.inkMuted, marginTop: 2 },
  sortItemPad: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#F0D0E0',
    paddingVertical: 16,
    gap: 8,
  },
  sortItemOk: { borderColor: colors.lime, backgroundColor: '#E8FBE8' },
  sortItemBad: { borderColor: colors.red, backgroundColor: '#FFE8E8' },
  sortItemEmoji: { fontSize: 88, lineHeight: 100 },
  sortItemHint: { ...typography.kidLabel, fontSize: 16, color: colors.inkMuted },
  sortBins: { flexDirection: 'row', gap: 12, width: '100%' },
  sortBin: {
    flex: 1,
    minHeight: 110,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  sortBinEmoji: { fontSize: 40, lineHeight: 48 },
  sortBinText: { ...typography.title, color: '#FFF', fontSize: 18 },
});
