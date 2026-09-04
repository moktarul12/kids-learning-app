import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppShell, AppHeader } from '../../components/ui';
import { RootStackParamList } from '../../navigation/types';
import { colors, fonts, shadows } from '../../theme';
import { speak } from '../../services/voice';
import { useProgress } from '../../state/ProgressContext';

type Props = NativeStackScreenProps<RootStackParamList, 'TalkingMomo'>;
type Room = 'living' | 'kitchen' | 'bath' | 'bed';
type HitZone = 'head' | 'belly' | 'leftLeg' | 'rightLeg' | 'tail' | 'ear' | 'nose';

type Food = { id: string; emoji: string; label: string; hunger: number; effect?: 'chili' | 'sweet' | 'yuck' };

const FOODS: Food[] = [
  { id: 'apple', emoji: '🍎', label: 'Apple', hunger: 18 },
  { id: 'milk', emoji: '🥛', label: 'Milk', hunger: 14 },
  { id: 'cake', emoji: '🍰', label: 'Cake', hunger: 22, effect: 'sweet' },
  { id: 'chili', emoji: '🌶️', label: 'Chili', hunger: 8, effect: 'chili' },
  { id: 'fish', emoji: '🐟', label: 'Fish', hunger: 20 },
  { id: 'broccoli', emoji: '🥦', label: 'Broccoli', hunger: 12, effect: 'yuck' },
];

const ROOM_BG: Record<Room, string> = {
  living: '#B8E4FF',
  kitchen: '#FFE0C2',
  bath: '#C5F0FF',
  bed: '#2D3F66',
};

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function momoSay(text: string) {
  speak(text, { pitch: 1.75, rate: 1.05 });
}

export function TalkingMomoScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const { addReward } = useProgress();
  const [room, setRoom] = useState<Room>('living');
  const [hunger, setHunger] = useState(72);
  const [hygiene, setHygiene] = useState(78);
  const [energy, setEnergy] = useState(80);
  const [happy, setHappy] = useState(88);
  const [bladder, setBladder] = useState(55);
  const [coins, setCoins] = useState(40);
  const [mood, setMood] = useState('🙂');
  const [bubble, setBubble] = useState('Hi! I am Momo!');
  const [lightsOff, setLightsOff] = useState(false);
  const [sleeping, setSleeping] = useState(false);
  const [talkDraft, setTalkDraft] = useState('');
  const [effect, setEffect] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const spin = useRef(new Animated.Value(0)).current;
  const squash = useRef(new Animated.Value(1)).current;
  const pokeCount = useRef(0);

  const size = Math.min(width - 48, 320);

  useEffect(() => {
    momoSay('Hi! I am Momo! Poke me!');
    addReward({ stars: 1, skill: 'creativity', gameId: 'talking_momo', badge: 'creative_star' });
  }, [addReward]);

  useEffect(() => {
    const id = setInterval(() => {
      if (sleeping) {
        setEnergy((e) => clamp(e + 2));
        return;
      }
      setHunger((h) => clamp(h - 0.6));
      setHygiene((h) => clamp(h - 0.35));
      setEnergy((e) => clamp(e - 0.4));
      setHappy((h) => clamp(h - 0.3));
      setBladder((b) => clamp(b + 0.5));
    }, 12000);
    return () => clearInterval(id);
  }, [sleeping]);

  const showBubble = (text: string, voice = true) => {
    setBubble(text);
    if (voice) momoSay(text);
  };

  const bounce = () => {
    Animated.sequence([
      Animated.timing(squash, { toValue: 0.88, duration: 90, useNativeDriver: true }),
      Animated.spring(squash, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const onHit = (zone: HitZone) => {
    if (sleeping) {
      showBubble('Zzz… five more minutes');
      return;
    }
    bounce();
    pokeCount.current += 1;
    setHappy((h) => clamp(h + 2));
    setCoins((c) => c + 1);

    const lines: Record<HitZone, string[]> = {
      head: ['Ow my head!', 'Hey! My ears!', 'Boop on the head!'],
      belly: ['Hehe that tickles!', 'Rub my tummy!', 'Hahaha belly!'],
      leftLeg: ['My left leg!', 'Stop kicking!', 'Ouch foot!'],
      rightLeg: ['Right foot! Hey!', 'Tickle toes!', 'Leg poke!'],
      tail: ['Not the tail!', 'My tail!', 'Yank! Hehe!'],
      ear: ['Ear flick!', 'That tickles my ear!', 'Nyah!'],
      nose: ['Boop nose!', 'Achoo!', 'Nose poke!'],
    };
    const line = lines[zone][Math.floor(Math.random() * lines[zone].length)];
    setMood(zone === 'belly' ? '😆' : zone.includes('Leg') ? '😮' : '😜');
    showBubble(line);

    if (pokeCount.current % 10 === 0) {
      setTimeout(() => {
        setMood('💨');
        setEffect('💨');
        showBubble('Oops… Momo farted!');
        setTimeout(() => setEffect(null), 1200);
      }, 400);
    }
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !sleeping,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) + Math.abs(g.dy) > 8,
        onPanResponderMove: (_, g) => {
          spin.setValue(g.dx / 40);
        },
        onPanResponderRelease: (_, g) => {
          const spun = Math.abs(g.dx) > 80 || Math.abs(g.vy) > 1.2;
          Animated.spring(spin, { toValue: 0, friction: 5, useNativeDriver: true }).start();
          if (spun) {
            setHappy((h) => clamp(h + 8));
            setEnergy((e) => clamp(e - 4));
            setMood('😵');
            showBubble(Math.abs(g.vy) > 1.5 ? 'Whoa you dropped me!' : 'Wheee spin me!');
          }
        },
      }),
    [sleeping, spin],
  );

  const goRoom = (r: Room) => {
    setRoom(r);
    setLightsOff(false);
    if (sleeping && r !== 'bed') {
      setSleeping(false);
      showBubble('I woke up!');
    }
    const intros: Record<Room, string> = {
      living: 'Living room! Poke me!',
      kitchen: 'Yum kitchen! Feed me!',
      bath: 'Bath time! Toilet or splash!',
      bed: 'Bedroom… tap the lamp to sleep',
    };
    showBubble(intros[r]);
  };

  const feed = (food: Food) => {
    if (room !== 'kitchen') goRoom('kitchen');
    setSelectedFood(null);
    setHunger((h) => clamp(h + food.hunger));
    setHappy((h) => clamp(h + 4));
    setCoins((c) => c + 2);
    bounce();
    if (food.effect === 'chili') {
      setMood('🥵');
      setEffect('🔥');
      showBubble('Hot chili! Fire tummy!');
      setTimeout(() => setEffect(null), 1400);
    } else if (food.effect === 'yuck') {
      setMood('🤢');
      showBubble('Yuck broccoli!');
    } else if (food.effect === 'sweet') {
      setMood('😍');
      showBubble('Sweet cake! Yum!');
    } else {
      setMood('😋');
      showBubble(`Yum ${food.label}!`);
    }
    addReward({ stars: 1, skill: 'creativity' });
  };

  const doToilet = () => {
    goRoom('bath');
    setBladder(5);
    setHygiene((h) => clamp(h + 8));
    setHappy((h) => clamp(h + 6));
    setMood('😌');
    showBubble('Ahh much better!');
    addReward({ stars: 1, coins: 2, skill: 'creativity' });
  };

  const doBath = () => {
    goRoom('bath');
    setHygiene(100);
    setHappy((h) => clamp(h + 8));
    setMood('🧼');
    setEffect('💧');
    showBubble('Splash splash clean!');
    setTimeout(() => setEffect(null), 1200);
    addReward({ stars: 1, coins: 2, skill: 'creativity' });
  };

  const toggleSleep = () => {
    goRoom('bed');
    if (!lightsOff) {
      setLightsOff(true);
      setSleeping(true);
      setMood('😴');
      showBubble('Good night… zzz');
      addReward({ stars: 1, skill: 'creativity' });
    } else {
      setLightsOff(false);
      setSleeping(false);
      setEnergy((e) => clamp(e + 25));
      setMood('😊');
      showBubble('Good morning!');
    }
  };

  const talkBack = () => {
    const t = talkDraft.trim();
    if (!t) {
      showBubble('Say something to me!');
      return;
    }
    setTalkDraft('');
    setHappy((h) => clamp(h + 5));
    setMood('🗣️');
    const reply = `${t}! Hehehe!`;
    setBubble(reply);
    momoSay(reply);
    addReward({ stars: 1, coins: 1, skill: 'creativity' });
  };

  const dark = room === 'bed' && lightsOff;

  return (
    <AppShell background={dark ? '#0f172a' : ROOM_BG[room]}>
      <AppHeader
        title="Talking Momo"
        titleEmoji="🐱"
        left="back"
        backTo={{ label: 'Back', onPress: () => navigation.goBack() }}
        right="none"
      />

      <View style={styles.meters}>
        <Meter label="🍎" value={hunger} />
        <Meter label="🧼" value={hygiene} />
        <Meter label="💤" value={energy} />
        <Meter label="😊" value={happy} />
        <Meter label="🚽" value={100 - bladder} />
        <Text style={styles.coins}>🪙 {coins}</Text>
      </View>

      <View style={[styles.stage, dark && { opacity: 0.55 }]}>
        {!!bubble && (
          <View style={[styles.bubble, shadows.soft]}>
            <Text style={styles.bubbleText}>{bubble}</Text>
          </View>
        )}
        {effect && <Text style={styles.effect}>{effect}</Text>}

        <Animated.View
          style={{
            transform: [
              { scale: squash },
              {
                rotate: spin.interpolate({
                  inputRange: [-4, 4],
                  outputRange: ['-28deg', '28deg'],
                }),
              },
            ],
          }}
          {...pan.panHandlers}
        >
          <View style={[styles.momo, { width: size, height: size * 1.15 }]}>
            <Text style={styles.moodFace}>{mood}</Text>
            {/* body parts as hit targets */}
            <Pressable style={[styles.zone, styles.earL]} onPress={() => onHit('ear')} />
            <Pressable style={[styles.zone, styles.earR]} onPress={() => onHit('ear')} />
            <Pressable style={[styles.zone, styles.head]} onPress={() => onHit('head')} />
            <Pressable style={[styles.zone, styles.nose]} onPress={() => onHit('nose')} />
            <Pressable style={[styles.zone, styles.belly]} onPress={() => onHit('belly')} />
            <Pressable style={[styles.zone, styles.tail]} onPress={() => onHit('tail')} />
            <Pressable style={[styles.zone, styles.legL]} onPress={() => onHit('leftLeg')} />
            <Pressable style={[styles.zone, styles.legR]} onPress={() => onHit('rightLeg')} />

            <View style={styles.earShapeL} />
            <View style={styles.earShapeR} />
            <View style={styles.headShape}>
              <View style={styles.eyeL} />
              <View style={styles.eyeR} />
              <View style={styles.noseDot} />
              <View style={styles.mouth} />
            </View>
            <View style={styles.bodyShape}>
              <View style={styles.bellyPatch} />
            </View>
            <View style={styles.armL} />
            <View style={styles.armR} />
            <View style={styles.footL} />
            <View style={styles.footR} />
            <View style={styles.tailShape} />
          </View>
        </Animated.View>
        <Text style={[styles.hint, dark && { color: '#cbd5e1' }]}>
          Tap head · belly · legs · tail · drag to spin
        </Text>
      </View>

      <View style={styles.rooms}>
        {(
          [
            ['living', '🏠'],
            ['kitchen', '🍽️'],
            ['bath', '🛁'],
            ['bed', '🛏️'],
          ] as const
        ).map(([id, emoji]) => (
          <Pressable
            key={id}
            style={[styles.roomBtn, room === id && styles.roomActive]}
            onPress={() => goRoom(id)}
          >
            <Text style={styles.roomEmoji}>{emoji}</Text>
          </Pressable>
        ))}
      </View>

      {room === 'kitchen' && (
        <View style={styles.foodRow}>
          {FOODS.map((f) => (
            <Pressable
              key={f.id}
              style={[styles.food, selectedFood?.id === f.id && styles.foodOn]}
              onPress={() => feed(f)}
            >
              <Text style={{ fontSize: 26 }}>{f.emoji}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {room === 'bath' && (
        <View style={styles.careRow}>
          <Pressable style={styles.careBtn} onPress={doToilet}>
            <Text style={styles.careText}>🚽 Toilet</Text>
          </Pressable>
          <Pressable style={styles.careBtn} onPress={doBath}>
            <Text style={styles.careText}>🧼 Bath</Text>
          </Pressable>
        </View>
      )}

      {room === 'bed' && (
        <Pressable style={[styles.careBtn, styles.lamp]} onPress={toggleSleep}>
          <Text style={styles.careText}>{lightsOff ? '☀️ Wake up' : '💡 Turn off lamp'}</Text>
        </Pressable>
      )}

      <View style={styles.talkRow}>
        <TextInput
          value={talkDraft}
          onChangeText={setTalkDraft}
          placeholder="Type words — Momo talks back!"
          placeholderTextColor="#9AA8B8"
          style={styles.talkInput}
          onSubmitEditing={talkBack}
          returnKeyType="send"
        />
        <Pressable style={styles.micBtn} onPress={talkBack}>
          <Text style={styles.micText}>🗣️</Text>
        </Pressable>
      </View>
    </AppShell>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.meter}>
      <Text style={styles.meterLabel}>{label}</Text>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: `${clamp(value)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  meters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  meter: { width: '28%', gap: 2 },
  meterLabel: { fontSize: 12 },
  meterTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  meterFill: { height: '100%', backgroundColor: '#2EC4B6', borderRadius: 99 },
  coins: { fontFamily: fonts.heading, fontSize: 14, color: colors.darkText, marginLeft: 'auto' },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 4 },
  bubble: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '86%',
  },
  bubbleText: { fontFamily: fonts.heading, fontSize: 16, color: colors.darkText, textAlign: 'center' },
  effect: { position: 'absolute', top: 40, fontSize: 48, zIndex: 5 },
  moodFace: { position: 'absolute', top: -8, right: 18, fontSize: 28, zIndex: 6 },
  momo: { position: 'relative' },
  zone: { position: 'absolute', zIndex: 10, backgroundColor: 'transparent' },
  earL: { left: '8%', top: '2%', width: '18%', height: '16%' },
  earR: { right: '8%', top: '2%', width: '18%', height: '16%' },
  head: { left: '22%', top: '10%', width: '56%', height: '28%' },
  nose: { left: '42%', top: '30%', width: '16%', height: '8%' },
  belly: { left: '28%', top: '42%', width: '44%', height: '28%' },
  tail: { right: '0%', top: '48%', width: '16%', height: '22%' },
  legL: { left: '22%', bottom: '2%', width: '24%', height: '18%' },
  legR: { right: '22%', bottom: '2%', width: '24%', height: '18%' },
  earShapeL: {
    position: 'absolute',
    left: '12%',
    top: '4%',
    width: 36,
    height: 48,
    borderRadius: 20,
    backgroundColor: '#F5A623',
  },
  earShapeR: {
    position: 'absolute',
    right: '12%',
    top: '4%',
    width: 36,
    height: 48,
    borderRadius: 20,
    backgroundColor: '#F5A623',
  },
  headShape: {
    position: 'absolute',
    left: '18%',
    top: '12%',
    width: '64%',
    height: '34%',
    borderRadius: 80,
    backgroundColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeL: {
    position: 'absolute',
    left: '28%',
    top: '38%',
    width: 14,
    height: 18,
    borderRadius: 8,
    backgroundColor: '#1E2A3A',
  },
  eyeR: {
    position: 'absolute',
    right: '28%',
    top: '38%',
    width: 14,
    height: 18,
    borderRadius: 8,
    backgroundColor: '#1E2A3A',
  },
  noseDot: {
    position: 'absolute',
    top: '58%',
    width: 14,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#3D2B1F',
  },
  mouth: {
    position: 'absolute',
    top: '72%',
    width: 28,
    height: 10,
    borderRadius: 8,
    backgroundColor: '#3D2B1F',
  },
  bodyShape: {
    position: 'absolute',
    left: '16%',
    top: '40%',
    width: '68%',
    height: '42%',
    borderRadius: 70,
    backgroundColor: '#E07912',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellyPatch: {
    width: '55%',
    height: '55%',
    borderRadius: 50,
    backgroundColor: '#FFE0A8',
  },
  armL: {
    position: 'absolute',
    left: '4%',
    top: '48%',
    width: 34,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#F5A623',
    transform: [{ rotate: '-18deg' }],
  },
  armR: {
    position: 'absolute',
    right: '4%',
    top: '48%',
    width: 34,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#F5A623',
    transform: [{ rotate: '18deg' }],
  },
  footL: {
    position: 'absolute',
    left: '24%',
    bottom: '2%',
    width: 48,
    height: 28,
    borderRadius: 16,
    backgroundColor: '#C96A0E',
  },
  footR: {
    position: 'absolute',
    right: '24%',
    bottom: '2%',
    width: 48,
    height: 28,
    borderRadius: 16,
    backgroundColor: '#C96A0E',
  },
  tailShape: {
    position: 'absolute',
    right: '2%',
    top: '52%',
    width: 28,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F5A623',
    transform: [{ rotate: '22deg' }],
  },
  hint: {
    marginTop: 6,
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  rooms: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  roomBtn: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  roomActive: { backgroundColor: '#FFD93D' },
  roomEmoji: { fontSize: 22 },
  foodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  food: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    ...shadows.soft,
  },
  foodOn: { borderWidth: 2, borderColor: colors.primaryBlue },
  careRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 6 },
  careBtn: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'center',
    marginBottom: 6,
    ...shadows.soft,
  },
  lamp: { backgroundColor: '#FFD93D' },
  careText: { fontFamily: fonts.heading, fontSize: 16, color: colors.darkText },
  talkRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
    alignItems: 'center',
  },
  talkInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.label,
    fontSize: 15,
    color: colors.darkText,
  },
  micBtn: {
    backgroundColor: '#FF6B4A',
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micText: { fontSize: 24 },
});
