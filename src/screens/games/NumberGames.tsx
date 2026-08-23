import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
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

type FeedState = {
  need: number;
  given: number;
  eaten: Record<number, boolean>;
};

function feedReducer(
  state: FeedState,
  action: { type: 'reset'; need: number } | { type: 'feed'; index: number },
): FeedState {
  if (action.type === 'reset') {
    return { need: action.need, given: 0, eaten: {} };
  }
  if (state.eaten[action.index] || state.given >= state.need) {
    return state;
  }
  return {
    ...state,
    given: state.given + 1,
    eaten: { ...state.eaten, [action.index]: true },
  };
}

export function CountCollectScreen({ navigation }: RootStackProps<'CountCollect'>) {
  const { showReward, celebrate, playNext, streak, round } = useGameSession({
    gameId: 'count_collect',
    skill: 'numbers',
    prompt: 'Feed the monster',
  });

  const [state, dispatch] = useReducer(feedReducer, { need: 3, given: 0, eaten: {} });
  const { need, given, eaten } = state;
  const traySize = need + 2;
  const prompt = `Give ${need} apples`;
  const full = given >= need;
  const monsterFace = full ? '🤤' : given > 0 ? '😋' : '👾';
  const prevGiven = useRef(0);

  useEffect(() => {
    const n = randInt(3, 6);
    prevGiven.current = 0;
    dispatch({ type: 'reset', need: n });
    speak(`Give ${n} apples`);
  }, [round]);

  useEffect(() => {
    if (given <= 0 || given <= prevGiven.current) {
      prevGiven.current = given;
      return;
    }
    prevGiven.current = given;
    speak(String(given));
    if (given >= need) {
      const t = setTimeout(() => celebrate('Yum!'), 280);
      return () => clearTimeout(t);
    }
  }, [given, need]); // celebrate is stable enough for timeout; omit to avoid canceling win

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
      <View style={styles.feedCave}>
        <View style={styles.feedTop}>
          <LivingIcon motion={full ? 'pulse' : 'sway'}>
            <Text style={styles.feedMonster}>{monsterFace}</Text>
          </LivingIcon>
          <View style={styles.feedCountBadge}>
            <Text style={styles.feedCountText}>
              {given}/{need}
            </Text>
          </View>
        </View>

        <View style={styles.feedPlate}>
          {Array.from({ length: need }).map((_, i) => (
            <View key={`slot-${i}`} style={[styles.feedSlot, i < given && styles.feedSlotFilled]}>
              <Text style={styles.feedSlotEmoji}>{i < given ? '🍎' : ''}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.feedTrayHint}>{full ? 'All full!' : 'Tap an apple!'}</Text>
        <View style={styles.feedTray}>
          {Array.from({ length: traySize }).map((_, i) => {
            const used = !!eaten[i];
            return (
              <Pressable
                key={`apple-${round}-${i}`}
                onPress={() => dispatch({ type: 'feed', index: i })}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.feedAppleBtn,
                  used && styles.feedAppleUsed,
                  { opacity: pressed && !used ? 0.85 : 1 },
                ]}
              >
                <Text style={styles.feedAppleEmoji}>{used ? '✨' : '🍎'}</Text>
              </Pressable>
            );
          })}
        </View>
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
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const locked = picked === answer;

  useEffect(() => {
    setPicked(null);
    setWrong(null);
    speak(prompt);
  }, [round, prompt]);

  const left = mode === 'before' ? (locked ? String(answer) : '?') : String(n);
  const right = mode === 'before' ? String(n) : locked ? String(answer) : '?';
  const leftMystery = mode === 'before' && !locked;
  const rightMystery = mode === 'after' && !locked;

  return (
    <GameShell
      title={mode === 'before' ? 'Before' : 'After'}
      prompt={prompt}
      promptEmoji={mode === 'before' ? '👈' : '👉'}
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Number World"
      backEmoji="🔢"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      <View style={[styles.beforeStage, mode === 'after' && styles.beforeStageAfter]}>
        <View style={styles.beforeBanner}>
          <LivingIcon motion="bob">
            <Text style={styles.beforeHero}>{mode === 'before' ? '🦊' : '🐰'}</Text>
          </LivingIcon>
          <View style={styles.beforeBannerCopy}>
            <Text style={styles.beforeBannerTitle}>
              {mode === 'before' ? 'What comes before?' : 'What comes after?'}
            </Text>
            <Text style={styles.beforeBannerSub}>
              {locked ? 'You found it!' : 'Tap a number below'}
            </Text>
          </View>
        </View>

        {/* Number path — mystery door + known number */}
        <View style={styles.beforePath}>
          <View style={styles.beforePathLine} />
          <View style={styles.beforeTrack}>
            <View
              style={[
                styles.beforeNode,
                leftMystery && styles.beforeNodeMystery,
                locked && mode === 'before' && styles.beforeNodeWin,
              ]}
            >
              {leftMystery ? (
                <LivingIcon motion="pulse">
                  <Text style={styles.beforeMysteryIcon}>❓</Text>
                </LivingIcon>
              ) : (
                <Text style={[styles.beforeNum, locked && mode === 'before' && styles.beforeNumWin]}>
                  {left}
                </Text>
              )}
              <Text style={styles.beforeNodeTag}>{mode === 'before' ? 'before' : 'here'}</Text>
            </View>

            <View style={styles.beforeArrowPill}>
              <Text style={styles.beforeArrow}>{mode === 'before' ? '←' : '→'}</Text>
            </View>

            <View
              style={[
                styles.beforeNode,
                rightMystery && styles.beforeNodeMystery,
                locked && mode === 'after' && styles.beforeNodeWin,
                !rightMystery && !(locked && mode === 'after') && styles.beforeNodeKnown,
              ]}
            >
              {rightMystery ? (
                <LivingIcon motion="pulse">
                  <Text style={styles.beforeMysteryIcon}>❓</Text>
                </LivingIcon>
              ) : (
                <Text style={[styles.beforeNum, locked && mode === 'after' && styles.beforeNumWin]}>
                  {right}
                </Text>
              )}
              <Text style={styles.beforeNodeTag}>{mode === 'after' ? 'after' : 'here'}</Text>
            </View>
          </View>
          <View style={styles.beforeDots}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.beforeDot} />
            ))}
          </View>
        </View>

        <View style={styles.beforePickLabel}>
          <Text style={styles.beforePickEmoji}>👇</Text>
          <Text style={styles.beforeHint}>{locked ? 'Amazing!' : 'Choose the missing number'}</Text>
        </View>

        <View style={styles.beforeRow}>
          {options.map((o) => {
            const isRight = locked && o === answer;
            const isWrong = wrong === o;
            return (
              <Pressable
                key={`${round}-${o}`}
                disabled={locked}
                onPress={() => {
                  if (locked) return;
                  if (o === answer) {
                    setPicked(o);
                    speak(String(o));
                    setTimeout(() => celebrate(), 600);
                  } else {
                    setWrong(o);
                    setTimeout(() => setWrong(null), 450);
                    almost();
                  }
                }}
                style={({ pressed }) => [
                  styles.beforeOpt,
                  isRight && styles.beforeOptRight,
                  isWrong && styles.beforeOptWrong,
                  { transform: [{ scale: pressed && !locked ? 0.94 : 1 }] },
                ]}
              >
                <Text
                  style={[
                    styles.beforeOptText,
                    isRight && { color: '#FFF' },
                    isWrong && { color: '#FFF' },
                  ]}
                >
                  {o}
                </Text>
                {isRight ? <Text style={styles.beforeOptStar}>⭐</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </GameShell>
  );
}

export function MissingNumberScreen({ navigation }: RootStackProps<'MissingNumber'>) {
  const { showReward, hint, celebrate, almost, playNext, streak, round } = useGameSession({
    gameId: 'missing_number',
    skill: 'numbers',
  });

  const puzzle = useMemo(() => {
    const threeOpts = (answer: number) => {
      const pool = [answer - 1, answer + 1, answer + 2, answer - 2, answer + 3].filter(
        (x) => x >= 1 && x <= 12 && x !== answer,
      );
      return shuffle([answer, pool[0], pool[1]]);
    };

    const kindRoll = Math.random();
    // ~30% both ends: fill BEFORE then AFTER
    if (kindRoll < 0.3) {
      const mid = randInt(3, 8);
      return {
        type: 'both' as const,
        mid,
        before: mid - 1,
        after: mid + 1,
        seq: [null, mid, null] as (number | null)[],
      };
    }

    const gap = kindRoll < 0.55 ? 0 : kindRoll < 0.8 ? 1 : 2;
    const start = randInt(1, 7);
    const full = [start, start + 1, start + 2];
    const answer = full[gap];
    return {
      type: 'single' as const,
      seq: full.map((v, i) => (i === gap ? null : v)) as (number | null)[],
      answer,
      ask: (gap === 0 ? 'before' : gap === 2 ? 'after' : 'middle') as 'before' | 'after' | 'middle',
      options: threeOpts(answer),
      prompt: gap === 0 ? 'What comes before?' : gap === 2 ? 'What comes after?' : 'What is missing?',
    };
  }, [round]);

  const [phase, setPhase] = useState<'before' | 'after'>('before');
  const [filledBefore, setFilledBefore] = useState<number | null>(null);
  const [filledAfter, setFilledAfter] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);

  const bothDone =
    puzzle.type === 'both' && filledBefore != null && filledAfter != null;
  const singleLocked = puzzle.type === 'single' && picked === puzzle.answer;

  const bothTarget =
    puzzle.type === 'both' ? (phase === 'before' ? puzzle.before : puzzle.after) : null;

  const options = useMemo(() => {
    if (puzzle.type === 'both' && bothTarget != null) {
      const pool = [bothTarget - 1, bothTarget + 1, bothTarget + 2, bothTarget - 2]
        .filter((x) => x >= 1 && x <= 12 && x !== bothTarget);
      return shuffle([bothTarget, pool[0], pool[1]]);
    }
    if (puzzle.type === 'single') return puzzle.options;
    return [];
  }, [puzzle, bothTarget, phase, round]);

  const prompt =
    puzzle.type === 'both'
      ? phase === 'before'
        ? `What comes before ${puzzle.mid}?`
        : `What comes after ${puzzle.mid}?`
      : puzzle.prompt;

  useEffect(() => {
    setPhase('before');
    setFilledBefore(null);
    setFilledAfter(null);
    setPicked(null);
    setWrong(null);
    speak(
      puzzle.type === 'both'
        ? `Fill both sides. What comes before ${puzzle.mid}?`
        : puzzle.prompt,
    );
  }, [round]);

  useEffect(() => {
    if (puzzle.type !== 'both') return;
    if (phase === 'after' && filledBefore != null && filledAfter == null) {
      speak(`Now what comes after ${puzzle.mid}?`);
    }
  }, [phase, puzzle, filledBefore, filledAfter]);

  const displayAt = (i: number): string | null => {
    if (puzzle.type === 'both') {
      if (i === 1) return String(puzzle.mid);
      if (i === 0) return filledBefore != null ? String(filledBefore) : null;
      if (i === 2) return filledAfter != null ? String(filledAfter) : null;
    }
    const v = puzzle.seq[i];
    if (v != null) return String(v);
    if (singleLocked) return String(puzzle.answer);
    return null;
  };

  const onPick = (o: number) => {
    if (showReward) return;
    if (puzzle.type === 'both') {
      if (bothDone) return;
      const need = phase === 'before' ? puzzle.before : puzzle.after;
      if (o === need) {
        speak(String(o));
        if (phase === 'before') {
          setFilledBefore(o);
          setPhase('after');
        } else {
          setFilledAfter(o);
          setTimeout(() => celebrate(), 500);
        }
      } else {
        setWrong(o);
        setTimeout(() => setWrong(null), 450);
        almost(phase === 'before' ? 'Try the number before!' : 'Try the number after!');
      }
      return;
    }

    if (singleLocked) return;
    if (o === puzzle.answer) {
      setPicked(o);
      speak(String(o));
      setTimeout(() => celebrate(), 500);
    } else {
      setWrong(o);
      setTimeout(() => setWrong(null), 450);
      almost();
    }
  };

  const hero =
    puzzle.type === 'both' ? '🌟' : puzzle.ask === 'before' ? '🦊' : puzzle.ask === 'after' ? '🐰' : '🦉';
  const title =
    puzzle.type === 'both'
      ? phase === 'before'
        ? 'Fill before & after'
        : 'Now the after!'
      : puzzle.ask === 'before'
        ? 'What comes before?'
        : puzzle.ask === 'after'
          ? 'What comes after?'
          : 'Find the gap!';

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
      rewardMessage="Nice!"
    >
      <View
        style={[
          styles.missingStage,
          puzzle.type === 'single' && puzzle.ask === 'before' && styles.missingStageBefore,
          puzzle.type === 'single' && puzzle.ask === 'after' && styles.missingStageAfter,
          puzzle.type === 'both' && styles.missingStageBoth,
        ]}
      >
        <View style={styles.missingBanner}>
          <LivingIcon motion="bob">
            <Text style={styles.missingHero}>{hero}</Text>
          </LivingIcon>
          <View style={styles.missingBannerCopy}>
            <Text style={styles.missingBannerTitle}>{title}</Text>
            <Text style={styles.missingBannerSub}>
              {bothDone || singleLocked
                ? 'Sequence complete!'
                : puzzle.type === 'both'
                  ? `Step ${phase === 'before' ? '1' : '2'} of 2 — tap the ${phase} number`
                  : 'Which number belongs here?'}
            </Text>
          </View>
        </View>

        <View style={styles.missingPath}>
          <View style={styles.missingPathLine} />
          <View style={styles.missingTrack}>
            {[0, 1, 2].map((i) => {
              const val = displayAt(i);
              const mystery = val == null;
              const activeBoth =
                puzzle.type === 'both' &&
                ((phase === 'before' && i === 0 && filledBefore == null) ||
                  (phase === 'after' && i === 2 && filledAfter == null));
              const filled =
                (puzzle.type === 'both' && ((i === 0 && filledBefore != null) || (i === 2 && filledAfter != null))) ||
                (puzzle.type === 'single' && singleLocked && puzzle.seq[i] == null);
              const label = i === 0 ? 'before' : i === 2 ? 'after' : 'middle';
              return (
                <React.Fragment key={`slot-${i}`}>
                  {i > 0 ? <Text style={styles.missingArrow}>→</Text> : null}
                  <View
                    style={[
                      styles.missingNode,
                      !mystery && !filled && styles.missingNodeKnown,
                      mystery && styles.missingNodeMystery,
                      activeBoth && styles.missingNodeActive,
                      filled && styles.missingNodeWin,
                    ]}
                  >
                    {mystery ? (
                      <LivingIcon motion="pulse">
                        <Text style={styles.missingMystery}>❓</Text>
                      </LivingIcon>
                    ) : (
                      <Text style={[styles.missingNum, filled && styles.missingNumWin]}>{val}</Text>
                    )}
                    <Text style={styles.missingTag}>{filled ? 'done!' : label}</Text>
                  </View>
                </React.Fragment>
              );
            })}
          </View>
        </View>

        <View style={styles.missingPickLabel}>
          <Text style={styles.missingPickEmoji}>👇</Text>
          <Text style={styles.missingHint}>
            {bothDone || singleLocked
              ? 'Perfect!'
              : puzzle.type === 'both'
                ? `Tap the number that comes ${phase} ${puzzle.mid}`
                : 'Tap the missing number'}
          </Text>
        </View>

        <View style={styles.missingRow}>
          {options.map((o) => {
            const isRight =
              (puzzle.type === 'single' && singleLocked && o === puzzle.answer) ||
              (puzzle.type === 'both' &&
                ((filledBefore === o && phase !== 'before') ||
                  (filledAfter === o && bothDone) ||
                  (phase === 'before' && filledBefore === o) ||
                  (phase === 'after' && filledAfter === o)));
            const isWrong = wrong === o;
            return (
              <Pressable
                key={`${round}-${phase}-${o}`}
                disabled={bothDone || singleLocked}
                onPress={() => onPick(o)}
                style={({ pressed }) => [
                  styles.missingOpt,
                  isRight && styles.missingOptRight,
                  isWrong && styles.missingOptWrong,
                  { transform: [{ scale: pressed && !(bothDone || singleLocked) ? 0.94 : 1 }] },
                ]}
              >
                <Text
                  style={[
                    styles.missingOptText,
                    isRight && { color: '#FFF' },
                    isWrong && { color: '#FFF' },
                  ]}
                >
                  {o}
                </Text>
                {isRight ? <Text style={styles.missingOptStar}>⭐</Text> : null}
              </Pressable>
            );
          })}
        </View>
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

  const roundData = useMemo(() => {
    const askMore = Math.random() > 0.35;
    let left = randInt(2, 6);
    let right = randInt(2, 6);
    while (right === left) right = randInt(2, 6);
    const pairs = [
      { leftEmoji: '🍎', rightEmoji: '🍇', leftLabel: 'Apples', rightLabel: 'Grapes' },
      { leftEmoji: '⭐', rightEmoji: '🔵', leftLabel: 'Stars', rightLabel: 'Dots' },
      { leftEmoji: '🐠', rightEmoji: '🐥', leftLabel: 'Fish', rightLabel: 'Chicks' },
      { leftEmoji: '🍪', rightEmoji: '🍩', leftLabel: 'Cookies', rightLabel: 'Donuts' },
    ] as const;
    const pair = pairs[randInt(0, pairs.length - 1)];
    const winner: 'left' | 'right' = askMore
      ? left > right
        ? 'left'
        : 'right'
      : left < right
        ? 'left'
        : 'right';
    return {
      askMore,
      left,
      right,
      winner,
      ...pair,
      prompt: askMore ? 'Which has more?' : 'Which has less?',
    };
  }, [round]);

  const [picked, setPicked] = useState<'left' | 'right' | null>(null);
  const [wrong, setWrong] = useState<'left' | 'right' | null>(null);
  const locked = picked === roundData.winner;

  useEffect(() => {
    setPicked(null);
    setWrong(null);
    speak(roundData.prompt);
  }, [round, roundData.prompt]);

  const choose = (side: 'left' | 'right') => {
    if (locked) return;
    if (side === roundData.winner) {
      setPicked(side);
      speak(side === 'left' ? roundData.leftLabel : roundData.rightLabel);
      setTimeout(() => celebrate(), 550);
    } else {
      setWrong(side);
      setTimeout(() => setWrong(null), 450);
      almost(roundData.askMore ? 'Look for more!' : 'Look for less!');
    }
  };

  const renderPile = (side: 'left' | 'right') => {
    const count = side === 'left' ? roundData.left : roundData.right;
    const emoji = side === 'left' ? roundData.leftEmoji : roundData.rightEmoji;
    const label = side === 'left' ? roundData.leftLabel : roundData.rightLabel;
    const isWin = locked && picked === side;
    const isLose = wrong === side;

    return (
      <Pressable
        key={`${round}-${side}`}
        disabled={locked}
        onPress={() => choose(side)}
        style={({ pressed }) => [
          styles.moreCard,
          isWin && styles.moreCardWin,
          isLose && styles.moreCardWrong,
          { transform: [{ scale: pressed && !locked ? 0.96 : 1 }] },
        ]}
      >
        <Text style={styles.moreCardLabel}>{label}</Text>
        <View style={styles.moreGrid}>
          {Array.from({ length: count }).map((_, i) => (
            <LivingIcon key={`${side}-${i}`} motion={i % 2 === 0 ? 'bob' : 'pulse'}>
              <Text style={styles.moreEmoji}>{emoji}</Text>
            </LivingIcon>
          ))}
        </View>
        <View style={[styles.moreCountBadge, isWin && styles.moreCountBadgeWin]}>
          <Text style={[styles.moreCountText, isWin && { color: '#FFF' }]}>{count}</Text>
        </View>
        {isWin ? <Text style={styles.moreWinStar}>⭐</Text> : null}
      </Pressable>
    );
  };

  return (
    <GameShell
      title="More or Less"
      prompt={roundData.prompt}
      promptEmoji={roundData.askMore ? '📈' : '📉'}
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Number World"
      backEmoji="🔢"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
    >
      <View style={styles.moreStage}>
        <View style={styles.moreBanner}>
          <LivingIcon motion="sway">
            <Text style={styles.moreHero}>{roundData.askMore ? '🐘' : '🐭'}</Text>
          </LivingIcon>
          <View style={styles.moreBannerCopy}>
            <Text style={styles.moreBannerTitle}>
              {roundData.askMore ? 'Find the bigger pile!' : 'Find the smaller pile!'}
            </Text>
            <Text style={styles.moreBannerSub}>
              {locked ? 'You got it!' : 'Tap the side that wins'}
            </Text>
          </View>
        </View>

        <View style={styles.moreRow}>
          {renderPile('left')}
          <View style={styles.moreVs}>
            <Text style={styles.moreVsText}>VS</Text>
          </View>
          {renderPile('right')}
        </View>
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  mega: { ...typography.mega, color: colors.blue },
  stars: { fontSize: 28, letterSpacing: 4 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  beforeStage: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFF4E0',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#FFD59A',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  beforeStageAfter: {
    backgroundColor: '#E8F8FF',
    borderColor: '#A8D8F8',
  },
  beforeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  beforeHero: { fontSize: 48, lineHeight: 56 },
  beforeBannerCopy: { flex: 1 },
  beforeBannerTitle: {
    ...typography.title,
    fontSize: 18,
    color: colors.ink,
  },
  beforeBannerSub: {
    ...typography.kidLabel,
    fontSize: 14,
    color: colors.inkMuted,
    marginTop: 2,
  },
  beforePath: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  beforePathLine: {
    position: 'absolute',
    top: '42%',
    left: '18%',
    right: '18%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD93D',
    opacity: 0.55,
  },
  beforeTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    zIndex: 1,
  },
  beforeNode: {
    width: 108,
    height: 118,
    borderRadius: 28,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 6,
  },
  beforeNodeKnown: {
    backgroundColor: '#E8F4FF',
  },
  beforeNodeMystery: {
    backgroundColor: '#FFF8E1',
    borderColor: colors.orange,
    borderStyle: 'dashed',
  },
  beforeNodeWin: {
    backgroundColor: colors.lime,
    borderColor: '#5ECF5A',
    borderStyle: 'solid',
  },
  beforeMysteryIcon: {
    fontSize: 52,
    lineHeight: 60,
  },
  beforeNum: {
    ...typography.title,
    fontSize: 56,
    color: colors.blue,
    lineHeight: 64,
  },
  beforeNumWin: {
    color: '#FFF',
  },
  beforeNodeTag: {
    ...typography.kidLabel,
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  beforeArrowPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beforeArrow: {
    ...typography.title,
    fontSize: 24,
    color: '#FFF',
    lineHeight: 28,
  },
  beforeDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  beforeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFB020',
    opacity: 0.7,
  },
  beforePickLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  beforePickEmoji: { fontSize: 20 },
  beforeHint: {
    ...typography.kidLabel,
    fontSize: 16,
    color: colors.inkMuted,
  },
  beforeRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  beforeOpt: {
    width: 92,
    height: 92,
    borderRadius: 26,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beforeOptRight: {
    backgroundColor: colors.lime,
    borderColor: '#5ECF5A',
  },
  beforeOptWrong: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  beforeOptText: {
    ...typography.title,
    fontSize: 40,
    color: colors.blue,
  },
  beforeOptStar: {
    position: 'absolute',
    top: 4,
    right: 6,
    fontSize: 16,
  },
  missingStage: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#EEF8FF',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#A8D4F0',
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
  missingStageBefore: {
    backgroundColor: '#FFF4E0',
    borderColor: '#FFD59A',
  },
  missingStageAfter: {
    backgroundColor: '#E8FFF4',
    borderColor: '#A8E8C8',
  },
  missingStageBoth: {
    backgroundColor: '#F3E8FF',
    borderColor: '#D4B8F8',
  },
  missingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  missingHero: { fontSize: 48, lineHeight: 56 },
  missingBannerCopy: { flex: 1 },
  missingBannerTitle: {
    ...typography.title,
    fontSize: 18,
    color: colors.ink,
  },
  missingBannerSub: {
    ...typography.kidLabel,
    fontSize: 14,
    color: colors.inkMuted,
    marginTop: 2,
  },
  missingPath: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 6,
  },
  missingPathLine: {
    position: 'absolute',
    top: '48%',
    left: '8%',
    right: '8%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4DA3FF',
    opacity: 0.25,
  },
  missingTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    zIndex: 1,
  },
  missingNode: {
    width: 82,
    height: 104,
    borderRadius: 24,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
  },
  missingNodeKnown: {
    backgroundColor: '#E8F4FF',
  },
  missingNodeMystery: {
    backgroundColor: '#FFF8E1',
    borderColor: colors.orange,
    borderStyle: 'dashed',
    width: 88,
    height: 110,
  },
  missingNodeActive: {
    borderColor: colors.orange,
    borderWidth: 4,
    backgroundColor: '#FFF3D6',
    transform: [{ scale: 1.05 }],
  },
  missingNodeWin: {
    backgroundColor: colors.lime,
    borderColor: '#5ECF5A',
    borderStyle: 'solid',
    width: 88,
    height: 110,
  },
  missingNum: {
    ...typography.title,
    fontSize: 42,
    color: colors.blue,
    lineHeight: 50,
  },
  missingNumWin: {
    color: '#FFF',
  },
  missingMystery: {
    fontSize: 42,
    lineHeight: 50,
  },
  missingTag: {
    ...typography.kidLabel,
    fontSize: 11,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  missingArrow: {
    ...typography.title,
    fontSize: 20,
    color: colors.inkMuted,
  },
  missingPickLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  missingPickEmoji: { fontSize: 20 },
  missingHint: {
    ...typography.kidLabel,
    fontSize: 15,
    color: colors.inkMuted,
    flexShrink: 1,
    textAlign: 'center',
  },
  missingRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  missingOpt: {
    width: 92,
    height: 92,
    borderRadius: 26,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingOptRight: {
    backgroundColor: colors.lime,
    borderColor: '#5ECF5A',
  },
  missingOptWrong: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  missingOptText: {
    ...typography.title,
    fontSize: 40,
    color: colors.blue,
  },
  missingOptStar: {
    position: 'absolute',
    top: 4,
    right: 6,
    fontSize: 16,
  },
  feedCave: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#F3E8FF',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#D4B8F8',
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 8,
  },
  feedTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  feedMonster: {
    fontSize: 92,
    lineHeight: 100,
    textAlign: 'center',
  },
  feedPlate: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  feedSlot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#D4B8F8',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedSlotFilled: {
    borderStyle: 'solid',
    borderColor: '#FF8A8A',
    backgroundColor: '#FFF',
  },
  feedSlotEmoji: {
    fontSize: 22,
    lineHeight: 26,
  },
  feedCountBadge: {
    backgroundColor: colors.purple,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 72,
    alignItems: 'center',
  },
  feedCountText: {
    ...typography.title,
    fontSize: 24,
    color: '#FFF',
  },
  feedTrayHint: {
    ...typography.kidLabel,
    fontSize: 15,
    color: colors.inkMuted,
  },
  feedTray: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  feedAppleBtn: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#FFB4B4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedAppleUsed: {
    backgroundColor: '#F0EAF8',
    borderColor: '#D4B8F8',
  },
  feedAppleEmoji: {
    fontSize: 40,
    lineHeight: 46,
  },
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
  moreStage: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#E8F8F0',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#A8E0C0',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  moreBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  moreHero: { fontSize: 48, lineHeight: 56 },
  moreBannerCopy: { flex: 1 },
  moreBannerTitle: {
    ...typography.title,
    fontSize: 18,
    color: colors.ink,
  },
  moreBannerSub: {
    ...typography.kidLabel,
    fontSize: 14,
    color: colors.inkMuted,
    marginTop: 2,
  },
  moreRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  moreVs: {
    alignSelf: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreVsText: {
    ...typography.title,
    fontSize: 14,
    color: '#FFF',
  },
  moreCard: {
    flex: 1,
    minHeight: 220,
    backgroundColor: '#FFF',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: colors.blue,
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moreCardWin: {
    backgroundColor: '#E8FBE8',
    borderColor: colors.lime,
  },
  moreCardWrong: {
    backgroundColor: '#FFE8E8',
    borderColor: colors.red,
  },
  moreCardLabel: {
    ...typography.kidLabel,
    fontSize: 14,
    color: colors.inkMuted,
    textTransform: 'uppercase',
  },
  moreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    minHeight: 120,
    paddingVertical: 8,
  },
  moreEmoji: {
    fontSize: 48,
    lineHeight: 56,
  },
  moreCountBadge: {
    minWidth: 48,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E8F4FF',
    borderWidth: 2,
    borderColor: colors.blue,
    alignItems: 'center',
  },
  moreCountBadgeWin: {
    backgroundColor: colors.lime,
    borderColor: '#5ECF5A',
  },
  moreCountText: {
    ...typography.title,
    fontSize: 22,
    color: colors.blue,
  },
  moreWinStar: {
    position: 'absolute',
    top: 8,
    right: 10,
    fontSize: 22,
  },
});
