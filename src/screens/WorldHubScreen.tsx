import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { RootStackProps } from '../navigation/types';
import {
  AppShell,
  AppHeader,
  ActivityCard,
} from '../components/ui';
import { LivingIcon } from '../components/KidAnimations';
import { WORLDS, gamesForWorld } from '../data/catalog';
import { BACKGROUNDS } from '../data/colorActivities';
import { colors, fonts, radii, shadows, spacing } from '../theme';
import { speak } from '../services/voice';
import { useProgress } from '../state/ProgressContext';

/** World hub — ← My World pill · place title (no duplicate crumbs) */
export function WorldHubScreen({ navigation, route }: RootStackProps<'WorldHub'>) {
  const world = WORLDS.find((w) => w.id === route.params.worldId)!;
  const games = gamesForWorld(world.id);
  const { completedGames } = useProgress();
  const { width } = useWindowDimensions();

  const gap = 12;
  const padH = spacing.lg;
  const cols = 3;
  const tileW = (width - padH * 2 - gap * (cols - 1)) / cols;
  const firstGame = games[0];
  const bg = world.id === 'color' ? BACKGROUNDS.colorWorld : BACKGROUNDS.myWorld;

  const openGame = (routeName: string, title: string) => {
    speak(title);
    navigation.navigate(routeName as never);
  };

  return (
    <AppShell background={bg}>
      <AppHeader
        title={`${world.title} World`}
        titleEmoji={world.emoji}
        left="back"
        backTo={{
          label: 'My World',
          emoji: '🌐',
          onPress: () => navigation.goBack(),
        }}
        trail={[
          {
            label: 'My World',
            emoji: '🌐',
            onPress: () => navigation.goBack(),
          },
        ]}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: padH }]}
      >
        <Pressable
          style={[styles.featured, shadows.card]}
          onPress={() => firstGame && openGame(firstGame.route, firstGame.title)}
        >
          <View style={[styles.featuredIcon, { backgroundColor: world.color + '28' }]}>
            <LivingIcon motion="bob">
              <Text style={{ fontSize: 48 }}>{world.emoji}</Text>
            </LivingIcon>
          </View>
          <View style={styles.featuredCopy}>
            <Text style={styles.featuredTitle}>{world.subtitle}</Text>
            <Text style={styles.featuredSub}>Learn {world.title.toLowerCase()} in a fun way!</Text>
          </View>
          <View style={[styles.playBtn, { backgroundColor: world.color }]}>
            <Text style={styles.playArrow}>›</Text>
          </View>
        </Pressable>

        <View style={[styles.grid, { columnGap: gap, rowGap: gap }]}>
          {games.map((g) => (
            <ActivityCard
              key={g.id}
              title={g.title}
              emoji={g.emoji}
              tint={world.color}
              width={tileW}
              done={completedGames.includes(g.id)}
              onPress={() => openGame(g.route, g.title)}
            />
          ))}
        </View>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 28 },
  featured: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.card,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 12,
  },
  featuredIcon: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredCopy: { flex: 1 },
  featuredTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.darkText,
  },
  featuredSub: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 2,
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playArrow: {
    color: colors.white,
    fontSize: 28,
    fontFamily: fonts.heading,
    lineHeight: 30,
    marginLeft: 2,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
