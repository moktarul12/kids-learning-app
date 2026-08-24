import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { cheerKid, greetKid, kidFirst, speak } from '../../services/voice';
import { GoodHabitList } from '../../components/GoodHabitList';
import { GOOD_HABITS } from '../../data/goodHabits';

/** ─── Paint Party: pick a friend, stamp colorful blobs ─── */
const PAINT_FRIENDS = [
  { id: 'dino', emoji: '🦕', name: 'Dino' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn' },
  { id: 'robot', emoji: '🤖', name: 'Robot' },
  { id: 'bunny', emoji: '🐰', name: 'Bunny' },
  { id: 'dragon', emoji: '🐲', name: 'Dragon' },
  { id: 'owl', emoji: '🦉', name: 'Owl' },
] as const;

const CRAYONS = [
  { id: 'red', hex: '#FF5A5A', label: 'Red' },
  { id: 'blue', hex: '#4BA3FF', label: 'Blue' },
  { id: 'yellow', hex: '#FFD93D', label: 'Yellow' },
  { id: 'green', hex: '#5ECF5A', label: 'Green' },
  { id: 'pink', hex: '#FF7AB8', label: 'Pink' },
  { id: 'purple', hex: '#9B7BFF', label: 'Purple' },
  { id: 'orange', hex: '#FF9A3C', label: 'Orange' },
] as const;

const STICKER_PACK = ['⭐', '💖', '✨', '🌈', '🎀', '🎵'];

export function ColoringScreen({ navigation }: RootStackProps<'Coloring'>) {
  const { showReward, celebrate, playNext, streak, round } = useGameSession({
    gameId: 'coloring',
    skill: 'creativity',
    badge: 'creative_star',
    dailyTaskId: 'create',
  });
  const [friendIdx, setFriendIdx] = useState(0);
  const [brush, setBrush] = useState<string>(CRAYONS[0].hex);
  const [blobs, setBlobs] = useState<(string | null)[]>(Array(8).fill(null));
  const [stickers, setStickers] = useState<string[]>([]);
  const [phase, setPhase] = useState<'pick' | 'paint'>('pick');

  const friend = PAINT_FRIENDS[(friendIdx + round) % PAINT_FRIENDS.length];
  const painted = blobs.filter(Boolean).length;

  useEffect(() => {
    setPhase('pick');
    setBlobs(Array(8).fill(null));
    setStickers([]);
    setBrush(CRAYONS[0].hex);
    setFriendIdx(round % PAINT_FRIENDS.length);
    greetKid('paint party');
  }, [round]);

  const startPaint = (idx: number) => {
    setFriendIdx(idx);
    setPhase('paint');
    setBlobs(Array(8).fill(null));
    setStickers([]);
    const f = PAINT_FRIENDS[idx];
    speak(`Yay! Let's paint ${f.name}!`);
  };

  const stampBlob = (i: number) => {
    setBlobs((prev) => {
      const next = [...prev];
      next[i] = brush;
      return next;
    });
    speak('Splash!');
  };

  const addSticker = (s: string) => {
    if (stickers.length >= 6) return;
    setStickers((x) => [...x, s]);
    speak('Cute!');
  };

  if (phase === 'pick') {
    return (
      <GameShell
        title="Paint Party"
        prompt="Pick a friend to paint!"
        promptEmoji="🎨"
        round={round}
        onBack={() => navigation.goBack()}
        backLabel="Create"
        showReward={showReward}
        onNext={playNext}
        streak={streak}
      >
        <Text style={styles.pickHint}>Who do you want to color?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.friendRow}>
          {PAINT_FRIENDS.map((f, i) => (
            <Pressable key={f.id} onPress={() => startPaint(i)} style={styles.friendCard}>
              <Text style={styles.friendEmoji}>{f.emoji}</Text>
              <Text style={styles.friendName}>{f.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </GameShell>
    );
  }

  return (
    <GameShell
      title="Paint Party"
      prompt={`Paint ${friend.name}!`}
      promptEmoji={friend.emoji}
      round={round}
      progressCurrent={painted}
      progressTotal={8}
      onBack={() => setPhase('pick')}
      backLabel="Friends"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      rewardMessage="Beautiful!"
    >
      <View style={styles.paintStage}>
        <View style={styles.blobRing}>
          {blobs.map((c, i) => {
            const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
            const r = 78;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            return (
              <Pressable
                key={i}
                onPress={() => stampBlob(i)}
                style={[
                  styles.blob,
                  {
                    transform: [{ translateX: x }, { translateY: y }],
                    backgroundColor: c || '#E8E8E8',
                    borderColor: c || '#CFCFCF',
                  },
                ]}
              >
                {!c ? <Text style={styles.blobPlus}>＋</Text> : null}
              </Pressable>
            );
          })}
          <LivingIcon motion="bob">
            <Text style={styles.paintHero}>{friend.emoji}</Text>
          </LivingIcon>
          {stickers.map((s, i) => (
            <Text
              key={`${s}-${i}`}
              style={[
                styles.floatSticker,
                {
                  left: 20 + (i % 3) * 50,
                  top: 10 + Math.floor(i / 3) * 40,
                },
              ]}
            >
              {s}
            </Text>
          ))}
        </View>
      </View>

      <Text style={styles.crayonLabel}>Crayons — tap a blob to stamp</Text>
      <View style={styles.crayonRow}>
        {CRAYONS.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => {
              setBrush(c.hex);
              speak(c.label);
            }}
            style={[
              styles.crayon,
              { backgroundColor: c.hex },
              brush === c.hex && styles.crayonOn,
            ]}
          />
        ))}
      </View>

      <Text style={styles.crayonLabel}>Stickers</Text>
      <View style={styles.stickerRow}>
        {STICKER_PACK.map((s) => (
          <Pressable key={s} onPress={() => addSticker(s)} style={styles.stickerBtn}>
            <Text style={{ fontSize: 26 }}>{s}</Text>
          </Pressable>
        ))}
      </View>

      <BigButton
        label={painted >= 5 ? 'Done! ✨' : `Paint ${5 - painted} more`}
        onPress={() => {
          if (painted >= 5) {
            cheerKid();
            celebrate('Beautiful!');
          } else {
            speak('Paint a few more blobs!');
          }
        }}
        color={colors.pink}
        textColor="#FFF"
        disabled={painted < 5}
      />
    </GameShell>
  );
}

/** ─── My Day: choose place → friend → weather → activity → story card ─── */
const PLACES = [
  { id: 'park', emoji: '🏞️', name: 'Park', vibe: '#E8FFF0' },
  { id: 'beach', emoji: '🏖️', name: 'Beach', vibe: '#E8F8FF' },
  { id: 'home', emoji: '🏠', name: 'Home', vibe: '#FFF8EE' },
  { id: 'space', emoji: '🚀', name: 'Space', vibe: '#F0E8FF' },
] as const;

const BUDDIES = [
  { id: 'dog', emoji: '🐶', name: 'Dog' },
  { id: 'cat', emoji: '🐱', name: 'Cat' },
  { id: 'fox', emoji: '🦊', name: 'Fox' },
  { id: 'bear', emoji: '🐻', name: 'Bear' },
  { id: 'bird', emoji: '🐦', name: 'Bird' },
  { id: 'fish', emoji: '🐠', name: 'Fish' },
] as const;

const WEATHERS = [
  { id: 'sun', emoji: '☀️', name: 'Sunny' },
  { id: 'rain', emoji: '🌧️', name: 'Rainy' },
  { id: 'cloud', emoji: '⛅', name: 'Cloudy' },
  { id: 'star', emoji: '🌟', name: 'Starry' },
] as const;

const ACTIVITIES = [
  { id: 'play', emoji: '⚽', name: 'play' },
  { id: 'eat', emoji: '🍦', name: 'eat ice cream' },
  { id: 'dance', emoji: '💃', name: 'dance' },
  { id: 'read', emoji: '📖', name: 'read a book' },
  { id: 'nap', emoji: '😴', name: 'take a nap' },
  { id: 'sing', emoji: '🎤', name: 'sing' },
] as const;

type DayStep = 'place' | 'buddy' | 'weather' | 'activity' | 'show';

export function MyWorldCreatorScreen({ navigation }: RootStackProps<'MyWorldCreator'>) {
  const { showReward, celebrate, playNext, streak, round } = useGameSession({
    gameId: 'my_world',
    skill: 'creativity',
  });
  const [step, setStep] = useState<DayStep>('place');
  const [place, setPlace] = useState<(typeof PLACES)[number] | null>(null);
  const [buddy, setBuddy] = useState<(typeof BUDDIES)[number] | null>(null);
  const [weather, setWeather] = useState<(typeof WEATHERS)[number] | null>(null);
  const [activity, setActivity] = useState<(typeof ACTIVITIES)[number] | null>(null);

  useEffect(() => {
    setStep('place');
    setPlace(null);
    setBuddy(null);
    setWeather(null);
    setActivity(null);
    greetKid('building your day');
    const t = setTimeout(() => speak('Where do you want to go?'), 800);
    return () => clearTimeout(t);
  }, [round]);

  const storyLine = useMemo(() => {
    if (!place || !buddy || !weather || !activity) return '';
    const who = kidFirst();
    return `${who} is at the ${place.name.toLowerCase()} with a ${buddy.name.toLowerCase()}. It is ${weather.name.toLowerCase()}. They ${activity.name}!`;
  }, [place, buddy, weather, activity]);

  const prompt =
    step === 'place'
      ? 'Where do you go?'
      : step === 'buddy'
        ? 'Who comes with you?'
        : step === 'weather'
          ? 'How is the sky?'
          : step === 'activity'
            ? 'What do you do?'
            : 'Your day is ready!';

  return (
    <GameShell
      title="My Day"
      prompt={prompt}
      promptEmoji="🌎"
      round={round}
      progressCurrent={step === 'place' ? 1 : step === 'buddy' ? 2 : step === 'weather' ? 3 : step === 'activity' ? 4 : 5}
      progressTotal={5}
      onBack={() => navigation.goBack()}
      backLabel="Create"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      rewardMessage="What a day!"
    >
      {step === 'place' ? (
        <View style={styles.choiceGrid}>
          {PLACES.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => {
                setPlace(p);
                setStep('buddy');
                speak(`${p.name}! Who comes with you?`);
              }}
              style={[styles.choiceCard, { backgroundColor: p.vibe }]}
            >
              <Text style={styles.choiceEmoji}>{p.emoji}</Text>
              <Text style={styles.choiceName}>{p.name}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {step === 'buddy' ? (
        <View style={styles.choiceGrid}>
          {BUDDIES.map((b) => (
            <Pressable
              key={b.id}
              onPress={() => {
                setBuddy(b);
                setStep('weather');
                speak(`${b.name}! How is the sky?`);
              }}
              style={styles.choiceCard}
            >
              <Text style={styles.choiceEmoji}>{b.emoji}</Text>
              <Text style={styles.choiceName}>{b.name}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {step === 'weather' ? (
        <View style={styles.choiceGrid}>
          {WEATHERS.map((w) => (
            <Pressable
              key={w.id}
              onPress={() => {
                setWeather(w);
                setStep('activity');
                speak(`${w.name}! What do you do?`);
              }}
              style={styles.choiceCard}
            >
              <Text style={styles.choiceEmoji}>{w.emoji}</Text>
              <Text style={styles.choiceName}>{w.name}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {step === 'activity' ? (
        <View style={styles.choiceGrid}>
          {ACTIVITIES.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => {
                setActivity(a);
                setStep('show');
                speak(`They ${a.name}!`);
              }}
              style={styles.choiceCard}
            >
              <Text style={styles.choiceEmoji}>{a.emoji}</Text>
              <Text style={styles.choiceName}>{a.name}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {step === 'show' && place && buddy && weather && activity ? (
        <View style={[styles.storyCard, { backgroundColor: place.vibe }]}>
          <View style={styles.storyEmojis}>
            <Text style={styles.storyBig}>{place.emoji}</Text>
            <Text style={styles.storyBig}>{buddy.emoji}</Text>
            <Text style={styles.storyBig}>{weather.emoji}</Text>
            <Text style={styles.storyBig}>{activity.emoji}</Text>
          </View>
          <Text style={styles.storyText}>{storyLine}</Text>
          <Pressable
            onPress={() => speak(storyLine)}
            style={styles.hearBtn}
          >
            <Text style={styles.hearBtnText}>🔊 Hear my day</Text>
          </Pressable>
          <BigButton
            label="Save my day!"
            onPress={() => {
              cheerKid();
              celebrate('What a day!');
            }}
            color={colors.yellow}
          />
          <Pressable
            onPress={() => {
              setStep('place');
              setPlace(null);
              setBuddy(null);
              setWeather(null);
              setActivity(null);
              speak('Where do you want to go?');
            }}
            style={styles.redo}
          >
            <Text style={styles.redoText}>Make another day</Text>
          </Pressable>
        </View>
      ) : null}
    </GameShell>
  );
}

/** ─── Good Habits: interactive morning, sleep, kindness stories ─── */

export function StoryPlayScreen({ navigation, route }: RootStackProps<'StoryPlay'>) {
  const habitFromRoute = route.params?.habitId ?? null;
  const { showReward, celebrate, playNext, almost, hint, streak, round } = useGameSession({
    gameId: 'story_habits',
    skill: 'stories',
  });
  const [storyId, setStoryId] = useState<string | null>(habitFromRoute);
  const [page, setPage] = useState(0);

  const story = GOOD_HABITS.find((s) => s.id === storyId) ?? null;
  const scene = story?.pages[page];

  useEffect(() => {
    setStoryId(habitFromRoute);
    setPage(0);
    if (habitFromRoute) return;
    greetKid('good habits');
    const t = setTimeout(() => speak('Pick a good habit!'), 700);
    return () => clearTimeout(t);
  }, [round, habitFromRoute]);

  useEffect(() => {
    if (scene) speak(scene.text);
  }, [page, storyId, scene]);

  if (!story || !scene) {
    return (
      <GameShell
        title="Good Habits"
        prompt="Pick a good habit!"
        promptEmoji="🌟"
        round={round}
        onBack={() => navigation.goBack()}
        backLabel="My World"
        showReward={showReward}
        onNext={playNext}
        streak={streak}
      >
        <GoodHabitList
          onPick={(id) => {
            setStoryId(id);
            setPage(0);
          }}
        />
      </GameShell>
    );
  }

  return (
    <GameShell
      title={story.title}
      prompt={scene.text}
      promptEmoji="📖"
      round={round}
      progressCurrent={page + 1}
      progressTotal={story.pages.length}
      onBack={() => {
        setStoryId(null);
        setPage(0);
        speak('Pick a good habit!');
      }}
      backLabel="Good Habits"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      hint={hint}
      rewardMessage="Great habit!"
    >
      <LivingIcon motion="bob">
        <Text style={styles.storySceneEmoji}>{scene.emoji}</Text>
      </LivingIcon>
      <Text style={styles.storySceneText}>{scene.text}</Text>
      <View style={styles.storyChoices}>
        {scene.choices.map((c) => (
          <Pressable
            key={c.label}
            onPress={() => {
              if (c.next === 'retry') {
                almost('Try again!');
                return;
              }
              if (c.next === 'win') {
                cheerKid();
                celebrate('Great habit!');
                return;
              }
              setPage(c.next);
            }}
            style={styles.storyChoiceBtn}
          >
            <Text style={styles.storyChoiceEmoji}>{c.emoji}</Text>
            <Text style={styles.storyChoiceLabel}>{c.label}</Text>
          </Pressable>
        ))}
      </View>
    </GameShell>
  );
}

export function DailyAdventureScreen({ navigation }: RootStackProps<'DailyAdventure'>) {
  const { dailyTasks, addReward } = useProgress();
  const allDone = dailyTasks.every((t) => t.done);

  return (
    <WorldScene mood="soft">
      <GameHeader title="Daily Adventure" onBack={() => navigation.goBack()} prompt="Daily adventure" backLabel="Me" />
      <View style={styles.page}>
        <WhiteStage>
          <Text style={styles.heading}>Today&apos;s missions</Text>
          {dailyTasks.map((t) => (
            <Pressable
              key={t.id}
              style={[styles.mission, t.done && styles.missionDone]}
              onPress={() => {
                if (t.done || !t.route) return;
                navigation.navigate(t.route as never);
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
      <GameHeader title="Mystery Box" onBack={() => navigation.goBack()} prompt="Tap to open" backLabel="Me" />
      <View style={styles.page}>
        <WhiteStage>
          <Pressable
            onPress={() => {
              if (opened) return;
              setOpened(true);
              cheerKid();
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
  pickHint: { ...typography.title, fontSize: 18, textAlign: 'center', marginBottom: 8 },
  friendRow: { gap: 12, paddingHorizontal: 8, paddingVertical: 8 },
  friendCard: {
    width: 110,
    height: 130,
    borderRadius: 24,
    backgroundColor: '#FFF8EE',
    borderWidth: 3,
    borderColor: '#FFE08A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  friendEmoji: { fontSize: 52 },
  friendName: { fontFamily: 'Fredoka_700Bold', fontSize: 14, color: colors.ink },
  paintStage: { alignItems: 'center', marginVertical: 8 },
  blobRing: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blobPlus: { fontSize: 18, color: '#999' },
  paintHero: { fontSize: 72, lineHeight: 84 },
  floatSticker: { position: 'absolute', fontSize: 22 },
  crayonLabel: {
    ...typography.kidLabel,
    fontSize: 13,
    color: colors.inkMuted,
    alignSelf: 'flex-start',
  },
  crayonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  crayon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  crayonOn: { borderColor: colors.ink, transform: [{ scale: 1.12 }] },
  stickerRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  stickerBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D7E6F7',
  },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  choiceCard: {
    width: '45%',
    minWidth: 140,
    aspectRatio: 1.1,
    maxWidth: 160,
    borderRadius: 22,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#D7E6F7',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  choiceEmoji: { fontSize: 48 },
  choiceName: { fontFamily: 'Fredoka_700Bold', fontSize: 15, color: colors.ink, textAlign: 'center', textTransform: 'capitalize' },
  storyCard: {
    width: '100%',
    borderRadius: 24,
    padding: 16,
    borderWidth: 3,
    borderColor: '#FFE08A',
    gap: 12,
    alignItems: 'center',
  },
  storyEmojis: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  storyBig: { fontSize: 42 },
  storyText: {
    ...typography.body,
    fontSize: 17,
    textAlign: 'center',
    color: colors.ink,
    lineHeight: 24,
  },
  hearBtn: {
    backgroundColor: colors.blue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  hearBtnText: { fontFamily: 'Fredoka_700Bold', color: '#FFF', fontSize: 14 },
  redo: { paddingVertical: 8 },
  redoText: { fontFamily: 'Fredoka_700Bold', color: colors.inkMuted, fontSize: 14 },
  storySceneEmoji: { fontSize: 64, textAlign: 'center' },
  storySceneText: {
    ...typography.body,
    fontSize: 16,
    textAlign: 'center',
    color: colors.ink,
    marginVertical: 8,
  },
  storyChoices: { width: '100%', gap: 10 },
  storyChoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 3,
    borderColor: '#D7E6F7',
  },
  storyChoiceEmoji: { fontSize: 32 },
  storyChoiceLabel: { fontFamily: 'Fredoka_700Bold', fontSize: 17, color: colors.ink, flex: 1 },
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
