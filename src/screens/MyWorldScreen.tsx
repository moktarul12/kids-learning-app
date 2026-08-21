import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppShell, AppHeader, WorldCard } from '../components/ui';
import { IconMotion } from '../components/KidAnimations';
import { BACKGROUNDS } from '../data/colorActivities';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { speak } from '../services/voice';
import type { WorldId } from '../data/catalog';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'World'>,
  NativeStackScreenProps<RootStackParamList>
>;

const WORLDS: {
  id: WorldId;
  label: string;
  icon: number;
  motion: IconMotion;
}[] = [
  { id: 'color', label: 'Color World', icon: require('../../assets/home/icon-color-world.png'), motion: 'bob' },
  { id: 'number', label: 'Number World', icon: require('../../assets/home/icon-number-world.png'), motion: 'tilt' },
  { id: 'shape', label: 'Shape World', icon: require('../../assets/home/icon-shape-world.png'), motion: 'pulse' },
  { id: 'thinking', label: 'Thinking World', icon: require('../../assets/home/icon-thinking-world.png'), motion: 'glow' },
  { id: 'creative', label: 'Creative World', icon: require('../../assets/home/icon-creative-world.png'), motion: 'sway' },
  { id: 'story', label: 'Story World', icon: require('../../assets/home/icon-story-world.png'), motion: 'bob' },
];

/** MY WORLD — taller icon cards + shared hub header (uxdesign.png) */
export function MyWorldScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const gap = 16;
  const padH = 16;
  const tabBar = 64;
  const headerH = 58;
  // Cards take most of the mid screen — hills/rainbow peek below
  const gridBudget = height - insets.top - headerH - tabBar - insets.bottom - 12;
  const tileW = (Math.min(width, 430) - padH * 2 - gap * 2) / 3;
  // Prefer tall cards (icon section height ↑) like the UX board
  const tileH = Math.max(tileW * 1.35, Math.min(tileW * 1.55, (gridBudget - gap) / 2));

  return (
    <AppShell background={BACKGROUNDS.myWorld}>
      <AppHeader title="MY WORLD" left="avatar" right="none" />
      <View style={styles.body}>
        <View style={[styles.grid, { paddingHorizontal: padH, columnGap: gap, rowGap: gap }]}>
          {WORLDS.map((w) => (
            <WorldCard
              key={w.id}
              label={w.label}
              icon={w.icon}
              motion={w.motion}
              width={tileW}
              height={tileH}
              onPress={() => {
                speak(w.label);
                navigation.navigate('WorldHub', { worldId: w.id });
              }}
            />
          ))}
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 430,
  },
});
