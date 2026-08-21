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

type SceneSticker = { emoji: string; x: number; y: number; id: string };

export function MyWorldCreatorScreen({ navigation }: RootStackProps<'MyWorldCreator'>) {
  const [scene, setScene] = useState<SceneSticker[]>([]);
  const [selected, setSelected] = useState<string | null>(STICKERS[0]);
  const [playing, setPlaying] = useState(false);
  const [canvasW, setCanvasW] = useState(300);
  const [canvasH, setCanvasH] = useState(200);
  const prompt = selected ? `Tap the sky to place ${selected}` : 'Pick a sticker, then tap the sky';

  const { showReward, celebrate, playNext, streak, round } = useGameSession({
    gameId: 'my_world',
    skill: 'creativity',
    prompt: 'Build your world',
  });

  useEffect(() => {
    setScene([]);
    setPlaying(false);
    setSelected(STICKERS[0]);
    speak('Pick a sticker, then tap the sky');
  }, [round]);

  const placeAt = (x: number, y: number) => {
    if (!selected) {
      speak('Pick a sticker first');
      return;
    }
    const size = 44;
    const px = Math.max(4, Math.min(x - size / 2, canvasW - size));
    const py = Math.max(4, Math.min(y - size / 2, canvasH - size));
    setScene((sc) => [
      ...sc,
      { emoji: selected, x: px, y: py, id: `${Date.now()}-${Math.random()}` },
    ]);
    speak('Added!');
  };

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
      <View style={styles.worldStage}>
        <View style={styles.worldBanner}>
          <LivingIcon motion="bob">
            <Text style={styles.worldHero}>🌍</Text>
          </LivingIcon>
          <View style={styles.worldBannerCopy}>
            <Text style={styles.worldBannerTitle}>Build your world</Text>
            <Text style={styles.worldBannerSub}>
              {selected ? `1) ${selected} selected  ·  2) Tap the sky` : 'Tap a sticker below first'}
            </Text>
          </View>
          <View style={styles.worldCount}>
            <Text style={styles.worldCountText}>{scene.length}</Text>
          </View>
        </View>

        {/* Tap canvas to place — no drag needed */}
        <Pressable
          onLayout={(e) => {
            setCanvasW(e.nativeEvent.layout.width);
            setCanvasH(e.nativeEvent.layout.height);
          }}
          onPress={(e) => {
            const { locationX, locationY } = e.nativeEvent;
            placeAt(locationX, locationY);
          }}
          style={[styles.worldCanvas, playing && styles.worldCanvasPlay]}
        >
          {scene.map((s, idx) => (
            <Pressable
              key={s.id}
              onPress={(ev) => {
                ev.stopPropagation?.();
                // Tap sticker to remove
                setScene((sc) => sc.filter((x) => x.id !== s.id));
                speak('Removed');
              }}
              style={[
                styles.worldSticker,
                {
                  left: s.x,
                  top: playing ? s.y - (idx % 3) * 6 : s.y,
                },
              ]}
              hitSlop={6}
            >
              <Text style={styles.worldStickerEmoji}>{s.emoji}</Text>
            </Pressable>
          ))}
          {!scene.length ? (
            <View style={styles.worldEmpty} pointerEvents="none">
              <Text style={styles.worldEmptyEmoji}>{selected ?? '👆'}</Text>
              <Text style={styles.worldEmptyText}>Tap here to place</Text>
            </View>
          ) : null}
        </Pressable>

        <Text style={styles.worldTrayHint}>
          {selected ? `Selected ${selected} — tap sky to add · tap sticker to delete` : 'Choose a sticker'}
        </Text>

        <View style={styles.worldTray}>
          {STICKERS.map((emoji) => {
            const on = selected === emoji;
            return (
              <Pressable
                key={emoji}
                onPress={() => {
                  setSelected(emoji);
                  speak(emoji);
                }}
                style={[styles.worldTrayItem, on && styles.worldTrayItemOn]}
              >
                <Text style={styles.worldTrayEmoji}>{emoji}</Text>
                {on ? <Text style={styles.worldTrayTap}>✓</Text> : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.worldActions}>
          <Pressable
            onPress={() => setPlaying((p) => !p)}
            style={[styles.worldBtn, { backgroundColor: colors.teal }]}
          >
            <Text style={styles.worldBtnText}>{playing ? 'Pause' : 'Play'}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setScene([]);
              speak('Cleared');
            }}
            style={[styles.worldBtn, styles.worldBtnGhost]}
          >
            <Text style={[styles.worldBtnText, { color: colors.ink }]}>Clear</Text>
          </Pressable>
          <Pressable
            disabled={!scene.length}
            onPress={() => celebrate('World saved!')}
            style={[
              styles.worldBtn,
              { backgroundColor: colors.yellow, opacity: scene.length ? 1 : 0.45 },
            ]}
          >
            <Text style={[styles.worldBtnText, { color: colors.ink }]}>Save</Text>
          </Pressable>
        </View>
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
  worldStage: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E8F8FF',
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#A8D8F8',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  worldBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  worldHero: { fontSize: 36, lineHeight: 44 },
  worldBannerCopy: { flex: 1 },
  worldBannerTitle: { ...typography.title, fontSize: 17, color: colors.ink },
  worldBannerSub: { ...typography.kidLabel, fontSize: 13, color: colors.inkMuted, marginTop: 2 },
  worldCount: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  worldCountText: { ...typography.title, fontSize: 16, color: '#FFF' },
  worldCanvas: {
    width: '100%',
    height: 180,
    backgroundColor: '#C8EAF8',
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 3,
    borderColor: '#7EC8F5',
  },
  worldCanvasPlay: {
    borderColor: colors.teal,
  },
  worldSticker: {
    position: 'absolute',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  worldStickerEmoji: { fontSize: 40, lineHeight: 48 },
  worldEmpty: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  worldEmptyEmoji: { fontSize: 48, lineHeight: 56, opacity: 0.5 },
  worldEmptyText: { ...typography.kidLabel, fontSize: 15, color: colors.inkMuted, marginTop: 6 },
  worldTrayHint: {
    ...typography.kidLabel,
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  worldTray: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  worldTrayItem: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: '#D7E6F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  worldTrayItemOn: {
    borderColor: colors.orange,
    backgroundColor: '#FFF8E1',
    transform: [{ scale: 1.06 }],
  },
  worldTrayEmoji: { fontSize: 30, lineHeight: 36 },
  worldTrayTap: {
    position: 'absolute',
    top: 2,
    right: 4,
    fontSize: 12,
    color: colors.orange,
  },
  worldActions: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  worldBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  worldBtnGhost: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#D7E6F7',
  },
  worldBtnText: {
    ...typography.title,
    fontSize: 16,
    color: '#FFF',
  },
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
