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

const PALETTE = ['#FF5A5A', '#4BA3FF', '#FFD93D', '#5ECF5A', '#FF7AB8', '#9B7BFF', '#FFFFFF', '#2D2D2D'];

export function ColoringScreen({ navigation }: RootStackProps<'Coloring'>) {
  const [fills, setFills] = useState<Record<string, string>>({});
  const [brush, setBrush] = useState(PALETTE[0]);
  const prompt = 'Color the elephant';
  const { showReward, celebrate, playNext, streak, round } = useGameSession({
    gameId: 'coloring',
    skill: 'creativity',
    badge: 'creative_star',
    dailyTaskId: 'create',
    prompt,
  });
  useEffect(() => setFills({}), [round]);

  return (
    <GameShell
      title="Coloring"
      prompt={prompt}
      promptEmoji="🐘"
      round={round}
      onBack={() => navigation.goBack()}
      backLabel="Creative World"
      backEmoji="🖌️"
      showReward={showReward}
      onNext={playNext}
      streak={streak}
      rewardMessage="Beautiful!"
    >
      <View style={styles.canvas}>
        <Pressable
          style={[styles.ear, styles.earL, { backgroundColor: fills.earL || '#E8E8E8' }]}
          onPress={() => setFills((f) => ({ ...f, earL: brush }))}
        />
        <Pressable
          style={[styles.ear, styles.earR, { backgroundColor: fills.earR || '#E8E8E8' }]}
          onPress={() => setFills((f) => ({ ...f, earR: brush }))}
        />
        <Pressable
          style={[styles.body, { backgroundColor: fills.body || '#E8E8E8' }]}
          onPress={() => setFills((f) => ({ ...f, body: brush }))}
        >
          <Pressable
            style={[styles.face, { backgroundColor: fills.face || '#F5F5F5' }]}
            onPress={() => setFills((f) => ({ ...f, face: brush }))}
          >
            <Text style={{ fontSize: 26 }}>👀</Text>
          </Pressable>
        </Pressable>
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

const STICKERS = ['🌳', '🏠', '🐶', '🚗', '☁️', '🌈', '☀️', '🌸', '🦊', '🏰'];

export function MyWorldCreatorScreen({ navigation }: RootStackProps<'MyWorldCreator'>) {
  const [scene, setScene] = useState<{ emoji: string; x: number; y: number; id: number }[]>([]);
  const [playing, setPlaying] = useState(false);
  const prompt = 'Build your world';
  const { showReward, celebrate, playNext, streak, round } = useGameSession({
    gameId: 'my_world',
    skill: 'creativity',
    prompt,
  });
  useEffect(() => {
    setScene([]);
    setPlaying(false);
  }, [round]);

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
      <View style={styles.scene}>
        {scene.map((s, idx) => (
          <Text
            key={s.id}
            style={[styles.sticker, { left: s.x, top: playing ? s.y - (idx % 3) * 8 : s.y }]}
          >
            {s.emoji}
          </Text>
        ))}
        {!scene.length && <Text style={styles.empty}>Tap stickers below</Text>}
      </View>
      <View style={styles.tray}>
        {STICKERS.map((emoji) => (
          <Pressable
            key={emoji}
            style={styles.trayItem}
            onPress={() => {
              speak('Added!');
              setScene((sc) => [
                ...sc,
                {
                  emoji,
                  x: 16 + Math.random() * 200,
                  y: 24 + Math.random() * 140,
                  id: Date.now() + Math.random(),
                },
              ]);
            }}
          >
            <Text style={{ fontSize: 26 }}>{emoji}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.actions}>
        <BigButton
          label={playing ? 'Pause' : 'Play'}
          onPress={() => setPlaying((p) => !p)}
          color={colors.teal}
          textColor="#FFF"
          size="md"
        />
        <BigButton
          label="Save"
          onPress={() => celebrate('World saved!')}
          color={colors.yellow}
          size="md"
          disabled={!scene.length}
        />
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
  canvas: { width: 240, height: 220, alignItems: 'center', justifyContent: 'center' },
  body: {
    width: 150,
    height: 130,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  face: {
    width: 76,
    height: 66,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ear: { position: 'absolute', width: 48, height: 66, borderRadius: 24, top: 18 },
  earL: { left: 36 },
  earR: { right: 36 },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  swatch: { width: 38, height: 38, borderRadius: 19 },
  swatchOn: { borderWidth: 3, borderColor: colors.ink },
  scene: {
    width: '100%',
    height: 220,
    backgroundColor: '#EAF7FF',
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#D7E6F7',
  },
  sticker: { position: 'absolute', fontSize: 34 },
  empty: { ...typography.subtitle, textAlign: 'center', marginTop: 90 },
  tray: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  trayItem: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3F8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { flexDirection: 'row', gap: 10 },
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
