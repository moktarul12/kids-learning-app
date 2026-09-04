import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { RootStackProps } from '../../navigation/types';
import { GameShell } from '../../components/GameShell';
import { ConfettiBurst, LivingIcon } from '../../components/KidAnimations';
import {
  CartoonCollectible,
  CartoonCrashStars,
  CartoonParallaxTree,
  CartoonRunner,
  CartoonSpeedLines,
  CartoonSquash,
  CartoonWheel,
  CARTOON_SPRING,
} from '../../components/CartoonMotion';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useGameSession, randInt } from '../../hooks/useGameSession';
import { speak } from '../../services/voice';

const LANES = [0, 1, 2] as const;
const FINISH = 100;
const GOAL_STARS = 8;

type LaneItem = {
  id: string;
  lane: number;
  y: number;
  kind: 'star' | 'rock' | 'boost';
};

const RACERS = [
  { id: 'bunny', emoji: '🐰', color: '#FF7AB8', name: 'Bunny' },
  { id: 'bear', emoji: '🐻', color: '#FF9A3C', name: 'Bear' },
  { id: 'fox', emoji: '🦊', color: '#FF5252', name: 'Fox' },
  { id: 'robot', emoji: '🤖', color: '#4BA3FF', name: 'Robot' },
] as const;

function CartoonCar({
  emoji,
  bodyColor,
  size = 56,
  boost = false,
  crashed = false,
}: {
  emoji: string;
  bodyColor: string;
  size?: number;
  boost?: boolean;
  crashed?: boolean;
}) {
  const wobble = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!crashed) {
      wobble.setValue(0);
      return;
    }
    Animated.sequence([
      Animated.timing(wobble, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(wobble, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(wobble, { toValue: 0.6, duration: 50, useNativeDriver: true }),
      Animated.timing(wobble, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [crashed, wobble]);

  const wheelSpeed = boost ? 2.8 : 1;

  return (
    <Animated.View
      style={{
        transform: [
          { translateX: wobble.interpolate({ inputRange: [-1, 1], outputRange: [-10, 10] }) },
          { rotate: wobble.interpolate({ inputRange: [-1, 1], outputRange: ['-8deg', '8deg'] }) },
        ],
      }}
    >
      <CartoonSpeedLines active={boost} />
      <CartoonCrashStars active={crashed} />
      <CartoonSquash phase={boost ? 1 : 0} intensity={boost ? 1.2 : 0.6}>
        <LinearGradient
          colors={[bodyColor, shade(bodyColor, -20)]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={[styles.carBody, { width: size * 1.5, height: size, borderRadius: size * 0.35 }]}
        >
          <View style={[styles.carWindow, { width: size * 0.55, height: size * 0.38 }]} />
          <Text style={[styles.carEmoji, { fontSize: size * 0.42 }]}>{emoji}</Text>
          <View style={{ position: 'absolute', bottom: -6, left: size * 0.12 }}>
            <CartoonWheel size={16} speed={wheelSpeed} />
          </View>
          <View style={{ position: 'absolute', bottom: -6, right: size * 0.12 }}>
            <CartoonWheel size={16} speed={wheelSpeed} />
          </View>
        </LinearGradient>
      </CartoonSquash>
      {boost ? <Text style={styles.exhaust}>💨💨💨</Text> : null}
    </Animated.View>
  );
}

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 0xff) + amount));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function RacingTrack({
  scroll,
  children,
  distance,
}: {
  scroll: Animated.Value;
  children: React.ReactNode;
  distance: number;
}) {
  return (
    <View style={styles.track}>
      <LinearGradient colors={['#5BB8FF', '#87CEEB', '#C5E8FF']} style={styles.skyBand} />
      <CartoonParallaxTree side="left" scroll={scroll} emoji="🌳" top={12} />
      <CartoonParallaxTree side="right" scroll={scroll} emoji="🌲" top={18} />
      <CartoonParallaxTree side="left" scroll={scroll} emoji="🏠" top={28} />
      <CartoonParallaxTree side="right" scroll={scroll} emoji="🌻" top={32} />

      <View style={styles.road}>
        <LinearGradient colors={['#6B7280', '#4B5563', '#374151']} style={StyleSheet.absoluteFill} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.roadDash,
              {
                top: i * 44,
                transform: [
                  {
                    translateY: scroll.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 44],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
        {LANES.map((lane) => (
          <View
            key={lane}
            style={[styles.laneLine, { left: `${33.3 * (lane + 1)}%` }]}
          />
        ))}
        {children}
      </View>

      <View style={styles.finishZone}>
        <Text style={styles.finishFlag}>🏁</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(distance, FINISH)}%` }]} />
        </View>
      </View>
    </View>
  );
}

/** 3-lane cartoon race — dodge rocks, grab stars, cross the finish! */
export function CartoonRaceScreen({ navigation }: RootStackProps<'CartoonRace'>) {
  const { showReward, celebrate, almost, playNext, streak, round, hint } = useGameSession({
    gameId: 'cartoon_race',
    skill: 'thinking',
  });

  const racer = RACERS[round % RACERS.length];
  const [lane, setLane] = useState(1);
  const [distance, setDistance] = useState(0);
  const [stars, setStars] = useState(0);
  const [items, setItems] = useState<LaneItem[]>([]);
  const [boosting, setBoosting] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const laneAnim = useRef(new Animated.Value(1)).current;
  const roadScroll = useRef(new Animated.Value(0)).current;
  const idRef = useRef(0);

  useEffect(() => {
    setLane(1);
    laneAnim.setValue(1);
    setDistance(0);
    setStars(0);
    setItems([]);
    setBoosting(false);
    setCrashed(false);
    setConfetti(false);
    speak(`Race with ${racer.name}! Tap arrows to move!`);
  }, [round, racer.name, laneAnim]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(roadScroll, {
        toValue: 1,
        duration: boosting ? 350 : 650,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [roadScroll, boosting]);

  useEffect(() => {
    Animated.spring(laneAnim, {
      ...CARTOON_SPRING,
      toValue: lane,
    }).start();
  }, [lane, laneAnim]);

  const spawnItem = useCallback(() => {
    const kindRoll = Math.random();
    const kind: LaneItem['kind'] =
      kindRoll < 0.5 ? 'star' : kindRoll < 0.78 ? 'rock' : 'boost';
    const item: LaneItem = {
      id: `it-${idRef.current++}`,
      lane: randInt(0, 2),
      y: -10,
      kind,
    };
    setItems((prev) => [...prev.slice(-12), item]);
  }, []);

  useEffect(() => {
    if (showReward || crashed) return;
    const spawn = setInterval(spawnItem, boosting ? 700 : 1100);
    return () => clearInterval(spawn);
  }, [showReward, crashed, boosting, spawnItem]);

  useEffect(() => {
    if (showReward || crashed) return;
    const tick = setInterval(() => {
      setDistance((d) => Math.min(FINISH, d + (boosting ? 2.2 : 1.2)));
      setItems((prev) =>
        prev
          .map((it) => ({ ...it, y: it.y + (boosting ? 9 : 6) }))
          .filter((it) => it.y < 105),
      );
    }, 80);
    return () => clearInterval(tick);
  }, [showReward, crashed, boosting]);

  useEffect(() => {
    if (showReward || crashed) return;
    items.forEach((it) => {
      if (it.y >= 78 && it.y <= 92 && it.lane === lane) {
        if (it.kind === 'star') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          speak('Star!');
          setStars((s) => s + 1);
          setItems((prev) => prev.filter((x) => x.id !== it.id));
        } else if (it.kind === 'rock') {
          setCrashed(true);
          almost('Oops! Dodge the rocks!');
          speak('Crash!');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          setTimeout(() => {
            setCrashed(false);
            setItems((prev) => prev.filter((x) => x.id !== it.id));
          }, 900);
        } else if (it.kind === 'boost') {
          speak('Boost!');
          setBoosting(true);
          setItems((prev) => prev.filter((x) => x.id !== it.id));
          setTimeout(() => setBoosting(false), 1800);
        }
      }
    });
  }, [items, lane, showReward, crashed, almost]);

  useEffect(() => {
    if (showReward) return;
    if (stars >= GOAL_STARS) {
      setConfetti(true);
      setTimeout(() => celebrate('You win!'), 300);
    }
  }, [stars, celebrate, showReward]);

  const move = (dir: -1 | 1) => {
    if (showReward || crashed) return;
    setLane((l) => Math.max(0, Math.min(2, l + dir)));
  };

  const laneLeft = laneAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['12%', '38%', '64%'],
  });

  return (
    <GameShell
      title="Cartoon Race"
      prompt={`Collect ${GOAL_STARS} stars to win!`}
      promptEmoji="🏎️"
      round={round}
      progressCurrent={stars}
      progressTotal={GOAL_STARS}
      onBack={() => navigation.goBack()}
      backLabel="Thinking World"
      backEmoji="🧠"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
      rewardMessage="You win!"
    >
      <View style={styles.hud}>
        <Text style={styles.hudStars}>⭐ {stars}/{GOAL_STARS}</Text>
        <Text style={styles.hudDist}>🏁 {Math.round(distance)}%</Text>
        {boosting ? <Text style={styles.hudBoost}>💨 BOOST!</Text> : null}
      </View>

      <RacingTrack scroll={roadScroll} distance={distance}>
        {items.map((it, idx) => (
          <View
            key={it.id}
            style={[
              styles.item,
              { left: `${12 + it.lane * 26}%`, top: `${it.y}%` },
            ]}
          >
            <CartoonCollectible
              emoji={it.kind === 'star' ? '⭐' : it.kind === 'rock' ? '🪨' : '⚡'}
              phase={idx}
              size={34}
            />
          </View>
        ))}

        <Animated.View style={[styles.playerWrap, { left: laneLeft }]}>
          <LivingIcon motion={boosting ? 'cartoon' : 'bob'}>
            <CartoonCar
              emoji={racer.emoji}
              bodyColor={racer.color}
              boost={boosting}
              crashed={crashed}
            />
          </LivingIcon>
        </Animated.View>
      </RacingTrack>

      <ConfettiBurst active={confetti && !showReward} />

      <View style={styles.controls}>
        <Pressable onPress={() => move(-1)} style={styles.steerBtn}>
          <Text style={styles.steerIcon}>◀️</Text>
          <Text style={styles.steerLabel}>Left</Text>
        </Pressable>
        <View style={styles.racerBadge}>
          <Text style={styles.racerEmoji}>{racer.emoji}</Text>
          <Text style={styles.racerName}>{racer.name}</Text>
        </View>
        <Pressable onPress={() => move(1)} style={styles.steerBtn}>
          <Text style={styles.steerIcon}>▶️</Text>
          <Text style={styles.steerLabel}>Right</Text>
        </Pressable>
      </View>
      <Text style={styles.tip}>⭐ Grab stars · 🪨 Dodge rocks · ⚡ Boost pads!</Text>
    </GameShell>
  );
}

/** Tap-tap sprint — mash GO to race your animal to the flag! */
export function TapSprintScreen({ navigation }: RootStackProps<'TapSprint'>) {
  const { showReward, celebrate, almost, playNext, streak, round, hint } = useGameSession({
    gameId: 'tap_sprint',
    skill: 'thinking',
  });

  const racer = RACERS[(round + 1) % RACERS.length];
  const [pos, setPos] = useState(0);
  const [rivalPos, setRivalPos] = useState(0);
  const [taps, setTaps] = useState(0);
  const [running, setRunning] = useState(false);
  const roadScroll = useRef(new Animated.Value(0)).current;
  const GOAL = 100;

  useEffect(() => {
    setPos(0);
    setRivalPos(0);
    setTaps(0);
    speak(`Tap GO to sprint, ${racer.name}!`);
  }, [round, racer.name]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(roadScroll, {
        toValue: 1,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [roadScroll]);

  useEffect(() => {
    if (showReward) return;
    const rival = setInterval(() => {
      setRivalPos((p) => Math.min(GOAL, p + 0.8));
    }, 120);
    return () => clearInterval(rival);
  }, [showReward]);

  useEffect(() => {
    if (showReward) return;
    if (pos >= GOAL) celebrate('Champion!');
    else if (rivalPos >= GOAL) almost('Try again!');
  }, [pos, rivalPos, celebrate, almost, showReward]);

  const tapGo = () => {
    if (showReward) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    speak('Go!');
    setTaps((t) => t + 1);
    setRunning(true);
    setPos((p) => Math.min(GOAL, p + 4 + randInt(0, 2)));
    setTimeout(() => setRunning(false), 200);
  };

  return (
    <GameShell
      title="Tap Sprint"
      prompt="Tap GO fast!"
      promptEmoji="🏃"
      round={round}
      progressCurrent={Math.round(pos)}
      progressTotal={GOAL}
      onBack={() => navigation.goBack()}
      backLabel="Thinking World"
      backEmoji="🧠"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
      rewardMessage="Champion!"
    >
      <View style={styles.sprintHud}>
        <Text style={styles.sprintYou}>You {Math.round(pos)}%</Text>
        <Text style={styles.sprintRival}>🐢 {Math.round(rivalPos)}%</Text>
      </View>

      <View style={styles.sprintTrack}>
        <LinearGradient colors={['#87CEEB', '#C5E8FF']} style={StyleSheet.absoluteFill} />
        <View style={styles.sprintLane}>
          <Animated.View style={[styles.sprintRunner, { left: `${Math.min(pos, 92)}%` }]}>
            <CartoonRunner emoji={racer.emoji} running={running || pos > 0} size={48} />
          </Animated.View>
          <View style={[styles.sprintRunner, { left: `${Math.min(rivalPos, 88)}%`, top: 60 }]}>
            <CartoonSquash phase={2} intensity={0.5}>
              <Text style={[styles.sprintEmoji, { opacity: 0.9 }]}>🐢</Text>
            </CartoonSquash>
          </View>
          <Text style={styles.sprintFlag}>🏁</Text>
        </View>
      </View>

      <Pressable onPress={tapGo} style={styles.goBtn}>
        <LinearGradient colors={['#FFD93D', '#FF9A3C']} style={styles.goBtnGrad}>
          <Text style={styles.goBtnText}>GO! 🚀</Text>
          <Text style={styles.goBtnSub}>Taps: {taps}</Text>
        </LinearGradient>
      </Pressable>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  carBody: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  carWindow: {
    position: 'absolute',
    top: 6,
    backgroundColor: 'rgba(200,230,255,0.85)',
    borderRadius: 8,
  },
  carEmoji: { zIndex: 2 },
  exhaust: { position: 'absolute', left: -34, top: 12, fontSize: 14 },
  track: {
    width: '100%',
    maxWidth: 380,
    height: 340,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#4B5563',
    marginBottom: 10,
  },
  skyBand: { height: 56 },
  road: {
    flex: 1,
    marginHorizontal: 24,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  roadDash: {
    position: 'absolute',
    left: '48%',
    width: 6,
    height: 28,
    backgroundColor: '#FFD93D',
    borderRadius: 3,
    marginLeft: -3,
  },
  laneLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  finishZone: {
    height: 44,
    backgroundColor: '#E8F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  finishFlag: { fontSize: 22, position: 'absolute', top: 4, right: 16 },
  progressBar: {
    width: '88%',
    height: 10,
    backgroundColor: '#D0E8FF',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#7ED957', borderRadius: 5 },
  hud: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    width: '100%',
    maxWidth: 380,
    flexWrap: 'wrap',
  },
  hudStars: { ...typography.title, fontSize: 16, color: colors.ink },
  hudDist: { ...typography.title, fontSize: 16, color: colors.ink },
  hudBoost: { ...typography.kidLabel, color: colors.orange, fontWeight: '700' },
  item: { position: 'absolute', width: 44, alignItems: 'center' },
  playerWrap: { position: 'absolute', bottom: 8, width: 90, zIndex: 10 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 380,
    gap: 8,
  },
  steerBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4BA3FF',
  },
  steerIcon: { fontSize: 28 },
  steerLabel: { ...typography.kidLabel, color: colors.inkMuted, marginTop: 2 },
  racerBadge: { alignItems: 'center', paddingHorizontal: 8 },
  racerEmoji: { fontSize: 36 },
  racerName: { ...typography.kidLabel, color: colors.inkMuted },
  tip: { ...typography.kidLabel, textAlign: 'center', color: colors.inkMuted, marginTop: 8 },
  sprintHud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 380,
    marginBottom: 8,
  },
  sprintYou: { ...typography.title, fontSize: 16 },
  sprintRival: { ...typography.kidLabel, color: colors.inkMuted },
  sprintTrack: {
    width: '100%',
    maxWidth: 380,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#7EC8F5',
    marginBottom: 16,
  },
  sprintLane: { flex: 1, justifyContent: 'center', paddingHorizontal: 8 },
  sprintRunner: { position: 'absolute', top: 20 },
  sprintEmoji: { fontSize: 44 },
  sprintFlag: { position: 'absolute', right: 8, top: '40%', fontSize: 36 },
  goBtn: { width: '100%', maxWidth: 380, borderRadius: 24, overflow: 'hidden' },
  goBtnGrad: { paddingVertical: 22, alignItems: 'center' },
  goBtnText: { fontFamily: typography.title.fontFamily, fontSize: 28, color: '#FFF' },
  goBtnSub: { ...typography.kidLabel, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
});
