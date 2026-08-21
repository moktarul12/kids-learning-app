import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { RootStackProps } from '../navigation/types';
import { AppShell, AppHeader, ActivityCard } from '../components/ui';
import { WORLDS, gamesByKind, GameDef, GameKind } from '../data/catalog';
import { BACKGROUNDS } from '../data/colorActivities';
import { colors, fonts, shadows } from '../theme';
import { speak } from '../services/voice';
import { useProgress } from '../state/ProgressContext';

/** Shared Learning / Quiz layout for every world hub */
const SECTION: Record<
  GameKind,
  { title: string; hint: string; emoji: string; wash: string }
> = {
  learn: {
    title: 'Learning',
    hint: 'Explore & discover',
    emoji: '🌱',
    wash: '#C8F0DC',
  },
  quiz: {
    title: 'Quiz',
    hint: 'Play & practice',
    emoji: '⭐',
    wash: '#F5DCC4',
  },
};

export function WorldHubScreen({ navigation, route }: RootStackProps<'WorldHub'>) {
  const world = WORLDS.find((w) => w.id === route.params.worldId)!;
  const learn = gamesByKind(world.id, 'learn');
  const quiz = gamesByKind(world.id, 'quiz');
  const { completedGames } = useProgress();
  const { width } = useWindowDimensions();

  const gap = 10;
  const padH = 16;
  const zonePad = 12;
  const bg = world.id === 'color' ? BACKGROUNDS.colorWorld : BACKGROUNDS.myWorld;

  const openGame = (g: GameDef) => {
    speak(g.title);
    navigation.navigate(g.route as never);
  };

  const tileW = (count: number) => {
    const cols = count <= 1 ? 1 : count === 2 ? 2 : 3;
    const inner = width - padH * 2 - zonePad * 2;
    return (inner - gap * (cols - 1)) / cols;
  };

  return (
    <AppShell background={bg}>
      <AppHeader
        title={`${world.title} World`}
        titleEmoji={world.emoji}
        left="back"
        backTo={{
          label: 'Back',
          onPress: () => navigation.goBack(),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: padH }]}
      >
        {learn.length > 0 ? (
          <Zone
            kind="learn"
            games={learn}
            completedGames={completedGames}
            tileW={tileW(learn.length)}
            gap={gap}
            onOpen={openGame}
          />
        ) : null}

        {quiz.length > 0 ? (
          <Zone
            kind="quiz"
            games={quiz}
            completedGames={completedGames}
            tileW={tileW(quiz.length)}
            gap={gap}
            onOpen={openGame}
          />
        ) : null}
      </ScrollView>
    </AppShell>
  );
}

function Zone({
  kind,
  games,
  completedGames,
  tileW,
  gap,
  onOpen,
}: {
  kind: GameKind;
  games: GameDef[];
  completedGames: string[];
  tileW: number;
  gap: number;
  onOpen: (g: GameDef) => void;
}) {
  const meta = SECTION[kind];
  const done = games.filter((g) => completedGames.includes(g.id)).length;

  return (
    <View style={[styles.zone, { backgroundColor: meta.wash }, shadows.soft]}>
      <View style={styles.zoneHead}>
        <Text style={styles.zoneEmoji}>{meta.emoji}</Text>
        <View style={styles.zoneHeadCopy}>
          <Text style={styles.zoneTitle}>{meta.title}</Text>
          <Text style={styles.zoneHint}>{meta.hint}</Text>
        </View>
        <View style={styles.progressCircle}>
          <Text style={styles.progressText}>
            {done}/{games.length}
          </Text>
        </View>
      </View>

      <View style={[styles.grid, { columnGap: gap, rowGap: gap }]}>
        {games.map((g) => (
          <ActivityCard
            key={g.id}
            title={g.title}
            emoji={g.emoji}
            tint={kind === 'learn' ? '#7ED957' : '#FF9A3C'}
            width={tileW}
            done={completedGames.includes(g.id)}
            onPress={() => onOpen(g)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 36, gap: 14 },
  zone: {
    borderRadius: 28,
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 12,
  },
  zoneHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  zoneEmoji: { fontSize: 28 },
  zoneHeadCopy: { flex: 1 },
  zoneTitle: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.darkText,
  },
  zoneHint: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 2,
  },
  progressCircle: {
    minWidth: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    ...shadows.soft,
  },
  progressText: {
    fontFamily: fonts.label,
    fontSize: 15,
    color: colors.darkText,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
