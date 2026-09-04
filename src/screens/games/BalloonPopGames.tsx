import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { RootStackProps } from '../../navigation/types';
import { GameShell } from '../../components/GameShell';
import { LivingIcon } from '../../components/KidAnimations';
import {
  BalloonSkyStage,
  BALLOON_COLORS,
  CartoonBalloon,
  CartoonPopBurst,
  getBalloonColor,
} from '../../components/CartoonBalloon';
import { CartoonCollectible, CartoonSquash } from '../../components/CartoonMotion';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useGameSession, randInt, shuffle } from '../../hooks/useGameSession';
import { speak } from '../../services/voice';

type LiveBalloon = {
  id: string;
  colorId: string;
  x: number;
  y: number;
  size: number;
  phase: number;
  popping: boolean;
};

const GRID = [
  { x: 8, y: 8 },
  { x: 38, y: 5 },
  { x: 68, y: 10 },
  { x: 18, y: 38 },
  { x: 52, y: 35 },
  { x: 78, y: 42 },
  { x: 5, y: 62 },
  { x: 32, y: 58 },
  { x: 58, y: 65 },
  { x: 82, y: 55 },
];

function buildField(targetColorId: string, redCount: number, total: number): LiveBalloon[] {
  const spots = shuffle(GRID).slice(0, total);
  const others = BALLOON_COLORS.filter((c) => c.id !== targetColorId);
  const items: { colorId: string }[] = [
    ...Array(redCount).fill({ colorId: targetColorId }),
    ...Array(total - redCount).fill(null).map(() => ({ colorId: pickOther(others) })),
  ];
  return shuffle(items).map((item, i) => ({
    id: `b-${i}-${item.colorId}`,
    colorId: item.colorId,
    x: spots[i]?.x ?? randInt(5, 75),
    y: spots[i]?.y ?? randInt(5, 60),
    size: randInt(62, 78),
    phase: randInt(0, 4),
    popping: false,
  }));
}

function pickOther(list: typeof BALLOON_COLORS) {
  return list[randInt(0, list.length - 1)].id;
}

/** Pop every RED balloon — they float and drift like a cartoon party! */
export function PopRedBalloonScreen({ navigation }: RootStackProps<'PopRedBalloon'>) {
  const { showReward, celebrate, almost, playNext, streak, round, hint } = useGameSession({
    gameId: 'pop_red_balloon',
    skill: 'colors',
    badge: 'color_explorer',
  });

  const need = 5;
  const total = 10;
  const [balloons, setBalloons] = useState<LiveBalloon[]>(() => buildField('red', need, total));
  const [popped, setPopped] = useState(0);
  const [burst, setBurst] = useState<{ x: number; y: number; key: number; color: string } | null>(null);

  useEffect(() => {
    setBalloons(buildField('red', need, total));
    setPopped(0);
    setBurst(null);
    speak('Pop the red balloons!');
  }, [round]);

  const removeBalloon = useCallback((id: string) => {
    setTimeout(() => {
      setBalloons((prev) => prev.filter((b) => b.id !== id));
    }, 300);
  }, []);

  const onTap = (b: LiveBalloon) => {
    if (showReward || b.popping) return;
    if (b.colorId === 'red') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      speak('Pop!');
      setBurst({ x: b.x, y: b.y, key: Date.now(), color: colors.red });
      setBalloons((prev) => prev.map((x) => (x.id === b.id ? { ...x, popping: true } : x)));
      const next = popped + 1;
      setPopped(next);
      removeBalloon(b.id);
      if (next >= need) setTimeout(() => celebrate('Great popping!'), 400);
    } else {
      almost('Pop red balloons only!');
    }
  };

  return (
    <GameShell
      title="Pop Red!"
      prompt="Pop the red balloons!"
      promptEmoji="🎈"
      round={round}
      progressCurrent={popped}
      progressTotal={need}
      onBack={() => navigation.goBack()}
      backLabel="Color World"
      backEmoji="🌈"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
      rewardMessage="Great popping!"
      hidePrompt={false}
    >
      <View style={styles.heroRow}>
        <CartoonSquash intensity={0.5}>
          <LivingIcon motion="cartoon">
            <Text style={styles.heroEmoji}>🎯</Text>
          </LivingIcon>
        </CartoonSquash>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>Only pop RED!</Text>
          <Text style={styles.heroSub}>{popped}/{need} red balloons</Text>
        </View>
        <View style={[styles.redBadge, { backgroundColor: colors.red }]}>
          <Text style={styles.badgeText}>RED</Text>
        </View>
      </View>

      <BalloonSkyStage>
        {balloons.map((b) => (
          <View
            key={b.id}
            style={[styles.balloonSlot, { left: `${b.x}%`, top: `${b.y}%` }]}
            pointerEvents="box-none"
          >
            <CartoonBalloon
              color={getBalloonColor(b.colorId)}
              size={b.size}
              phase={b.phase}
              highlight={b.colorId === 'red'}
              popping={b.popping}
              onPress={() => onTap(b)}
            />
          </View>
        ))}
        {burst ? (
          <CartoonPopBurst x={burst.x} y={burst.y} color={burst.color} trigger={burst.key} />
        ) : null}
      </BalloonSkyStage>

      <Text style={styles.tip}>👆 Balloons move — tap the red ones!</Text>
    </GameShell>
  );
}

/** Each round: pop all balloons of the target color (moving cartoon field) */
export function BalloonColorPopScreen({ navigation }: RootStackProps<'BalloonColorPop'>) {
  const { showReward, celebrate, almost, playNext, streak, round, hint } = useGameSession({
    gameId: 'balloon_color_pop',
    skill: 'colors',
  });

  const targetId = useMemo(() => {
    const order = shuffle(['red', 'blue', 'yellow', 'green', 'purple']);
    return order[round % order.length];
  }, [round]);
  const target = getBalloonColor(targetId);

  const need = 4;
  const total = 9;
  const [balloons, setBalloons] = useState<LiveBalloon[]>(() => buildField(targetId, need, total));
  const [popped, setPopped] = useState(0);

  useEffect(() => {
    setBalloons(buildField(targetId, need, total));
    setPopped(0);
    speak(`Pop the ${target.name} balloons!`);
  }, [round, targetId, target.name]);

  const onTap = (b: LiveBalloon) => {
    if (showReward || b.popping) return;
    if (b.colorId === targetId) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      speak('Pop!');
      setBalloons((prev) => prev.map((x) => (x.id === b.id ? { ...x, popping: true } : x)));
      setTimeout(() => setBalloons((prev) => prev.filter((x) => x.id !== b.id)), 300);
      const next = popped + 1;
      setPopped(next);
      if (next >= need) setTimeout(() => celebrate('Awesome!'), 400);
    } else {
      almost(`Pop ${target.name} only!`);
    }
  };

  return (
    <GameShell
      title="Balloon Party"
      prompt={`Pop ${target.name}!`}
      promptEmoji="🎈"
      round={round}
      progressCurrent={popped}
      progressTotal={need}
      onBack={() => navigation.goBack()}
      backLabel="Color World"
      backEmoji="🌈"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
      rewardMessage="Awesome!"
    >
      <View style={[styles.colorBanner, { backgroundColor: target.light }]}>
        <LivingIcon motion="pulse">
          <Text style={styles.bannerEmoji}>🎈</Text>
        </LivingIcon>
        <Text style={[styles.bannerText, { color: target.dark }]}>
          Pop every {target.name} balloon!
        </Text>
      </View>

      <BalloonSkyStage>
        {balloons.map((b) => (
          <View
            key={b.id}
            style={[styles.balloonSlot, { left: `${b.x}%`, top: `${b.y}%` }]}
            pointerEvents="box-none"
          >
            <CartoonBalloon
              color={getBalloonColor(b.colorId)}
              size={b.size}
              phase={b.phase}
              highlight={b.colorId === targetId}
              popping={b.popping}
              onPress={() => onTap(b)}
            />
          </View>
        ))}
      </BalloonSkyStage>
    </GameShell>
  );
}

/** Balloons float up from the bottom — pop red before they fly away! */
export function BalloonRiseScreen({ navigation }: RootStackProps<'BalloonRise'>) {
  const { showReward, celebrate, almost, playNext, streak, round, hint } = useGameSession({
    gameId: 'balloon_rise',
    skill: 'colors',
  });

  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const need = 6;
  const maxMiss = 3;

  type Rising = LiveBalloon & { lane: number };
  const [rising, setRising] = useState<Rising[]>([]);

  useEffect(() => {
    setScore(0);
    setMissed(0);
    setRising([]);
    speak('Pop red balloons before they fly away!');
  }, [round]);

  useEffect(() => {
    if (showReward) return;
    const spawn = setInterval(() => {
      setRising((prev) => {
        if (prev.length >= 8) return prev;
        const colorId = Math.random() < 0.45 ? 'red' : pickOther(BALLOON_COLORS.filter((c) => c.id !== 'red'));
        const lane = randInt(0, 3);
        const nb: Rising = {
          id: `r-${Date.now()}-${Math.random()}`,
          colorId,
          x: 8 + lane * 24,
          y: 88,
          size: randInt(58, 70),
          phase: randInt(0, 3),
          popping: false,
          lane,
        };
        return [...prev, nb];
      });
    }, 1400);
    return () => clearInterval(spawn);
  }, [round, showReward]);

  useEffect(() => {
    if (showReward) return;
    const tick = setInterval(() => {
      setRising((prev) => {
        const next = prev
          .map((b) => ({ ...b, y: b.y - 4 }))
          .filter((b) => {
            if (b.y < -5 && b.colorId === 'red' && !b.popping) {
              setMissed((m) => m + 1);
              return false;
            }
            return b.y > -10 && !b.popping;
          });
        return next;
      });
    }, 120);
    return () => clearInterval(tick);
  }, [round, showReward]);

  useEffect(() => {
    if (showReward) return;
    if (score >= need) {
      celebrate('Super reflexes!');
      return;
    }
    if (missed >= maxMiss) almost('Catch the red ones!');
  }, [score, missed, need, celebrate, almost, showReward]);

  const onTap = (b: Rising) => {
    if (showReward || b.popping) return;
    if (b.colorId === 'red') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      speak('Pop!');
      setRising((prev) => prev.map((x) => (x.id === b.id ? { ...x, popping: true } : x)));
      setTimeout(() => setRising((prev) => prev.filter((x) => x.id !== b.id)), 280);
      setScore((s) => s + 1);
    } else {
      almost('Only red!');
      setMissed((m) => m + 1);
    }
  };

  return (
    <GameShell
      title="Balloon Rise"
      prompt="Pop red before they fly!"
      promptEmoji="🚀"
      round={round}
      progressCurrent={score}
      progressTotal={need}
      onBack={() => navigation.goBack()}
      backLabel="Color World"
      backEmoji="🌈"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
      rewardMessage="Super reflexes!"
    >
      <View style={styles.riseHud}>
        <Text style={styles.riseScore}>⭐ {score}/{need}</Text>
        <Text style={styles.riseMiss}>💨 Miss: {missed}/{maxMiss}</Text>
      </View>
      <BalloonSkyStage>
        {rising.map((b) => (
          <View
            key={b.id}
            style={[styles.balloonSlot, { left: `${b.x}%`, top: `${b.y}%` }]}
            pointerEvents="box-none"
          >
            <CartoonBalloon
              color={getBalloonColor(b.colorId)}
              size={b.size}
              phase={b.phase}
              highlight={b.colorId === 'red'}
              popping={b.popping}
              onPress={() => onTap(b)}
            />
          </View>
        ))}
      </BalloonSkyStage>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    width: '100%',
    maxWidth: 380,
  },
  heroEmoji: { fontSize: 40 },
  heroCopy: { flex: 1 },
  heroTitle: { ...typography.title, fontSize: 18, color: colors.ink },
  heroSub: { ...typography.kidLabel, color: colors.inkMuted, marginTop: 2 },
  redBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  badgeText: {
    fontFamily: typography.title.fontFamily,
    fontSize: 13,
    color: '#FFF',
    fontWeight: '700',
  },
  balloonSlot: { position: 'absolute' },
  tip: { ...typography.kidLabel, textAlign: 'center', color: colors.inkMuted, marginTop: 10 },
  colorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
    width: '100%',
    maxWidth: 380,
  },
  bannerEmoji: { fontSize: 32 },
  bannerText: { ...typography.title, fontSize: 16, flex: 1 },
  riseHud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 380,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  riseScore: { ...typography.title, fontSize: 16, color: colors.ink },
  riseMiss: { ...typography.kidLabel, color: colors.inkMuted },
});
