import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppShell, AppHeader } from '../components/ui';
import { LivingIcon, IconMotion } from '../components/KidAnimations';
import { BACKGROUNDS } from '../data/colorActivities';
import { WORLDS as WORLD_META } from '../data/catalog';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors, fonts, radii, shadows } from '../theme';
import type { WorldId } from '../data/catalog';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'World'>,
  NativeStackScreenProps<RootStackParamList>
>;

const WORLDS: {
  id: WorldId;
  label: string;
  blurb: string;
  icon: ImageSourcePropType;
  motion: IconMotion;
  tint: string;
}[] = [
  {
    id: 'color',
    label: 'Color World',
    blurb: 'Paint & find',
    icon: require('../../assets/home/icon-color-world.png'),
    motion: 'bob',
    tint: '#FF5A5A',
  },
  {
    id: 'number',
    label: 'Number World',
    blurb: 'Count & play',
    icon: require('../../assets/home/icon-number-world.png'),
    motion: 'tilt',
    tint: '#4BA3FF',
  },
  {
    id: 'shape',
    label: 'Shape World',
    blurb: 'Build & spot',
    icon: require('../../assets/home/icon-shape-world.png'),
    motion: 'pulse',
    tint: '#5ECF5A',
  },
  {
    id: 'thinking',
    label: 'Thinking World',
    blurb: 'Fun puzzles',
    icon: require('../../assets/home/icon-thinking-world.png'),
    motion: 'glow',
    tint: '#FFD93D',
  },
  {
    id: 'creative',
    label: 'Creative World',
    blurb: 'Make art',
    icon: require('../../assets/home/icon-creative-world.png'),
    motion: 'sway',
    tint: '#FF9A3C',
  },
  {
    id: 'story',
    label: 'Good Habits',
    blurb: 'Brush, sleep & more',
    icon: require('../../assets/home/icon-story-world.png'),
    motion: 'bob',
    tint: '#9B7BFF',
  },
];

/** MY WORLD — big portal cards */
export function MyWorldScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const gap = 14;
  const padH = 16;
  const cols = 2;
  const tileW = (Math.min(width, 480) - padH * 2 - gap * (cols - 1)) / cols;
  const tileH = Math.max(tileW * 1.22, 168);

  return (
    <AppShell background={BACKGROUNDS.myWorld}>
      <AppHeader title="MY WORLD" left="avatar" right="none" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: padH }]}
      >
        <View style={styles.welcome}>
          <Text style={styles.welcomeEmoji}>🌈</Text>
          <View style={styles.welcomeCopy}>
            <Text style={styles.welcomeTitle}>Pick a world!</Text>
            <Text style={styles.welcomeSub}>Tap a door to start learning</Text>
          </View>
        </View>

        <View style={[styles.grid, { columnGap: gap, rowGap: gap }]}>
          {WORLDS.map((w) => {
            const meta = WORLD_META.find((m) => m.id === w.id);
            return (
              <Pressable
                key={w.id}
                onPress={() => {
                  if (w.id === 'story') {
                    navigation.navigate('StoryPlay');
                  } else {
                    navigation.navigate('WorldHub', { worldId: w.id });
                  }
                }}
                style={({ pressed }) => [
                  styles.portal,
                  shadows.card,
                  {
                    width: tileW,
                    height: tileH,
                    borderColor: w.tint + '55',
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                ]}
              >
                <View style={[styles.portalGlow, { backgroundColor: w.tint + '22' }]}>
                  <LivingIcon motion={w.motion} style={styles.portalIconWrap}>
                    <Image source={w.icon} style={styles.portalIcon} resizeMode="contain" />
                  </LivingIcon>
                </View>
                <Text style={styles.portalLabel} numberOfLines={1}>
                  {w.label.replace(' World', '')}
                </Text>
                <Text style={styles.portalBlurb} numberOfLines={1}>
                  {meta?.subtitle ?? w.blurb}
                </Text>
                <View style={[styles.portalGo, { backgroundColor: w.tint }]}>
                  <Text style={styles.portalGoText}>›</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 28,
    paddingTop: 4,
  },
  welcome: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: radii.card,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    ...shadows.soft,
  },
  welcomeEmoji: { fontSize: 32 },
  welcomeCopy: { flex: 1 },
  welcomeTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.darkText,
  },
  welcomeSub: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 480,
  },
  portal: {
    backgroundColor: colors.white,
    borderRadius: 28,
    borderWidth: 3,
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    overflow: 'hidden',
  },
  portalGlow: {
    width: '92%',
    flex: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  portalIconWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalIcon: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.18 }],
  },
  portalLabel: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.darkText,
    textAlign: 'center',
  },
  portalBlurb: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  portalGo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalGoText: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: 26,
    lineHeight: 28,
    marginLeft: 2,
  },
});
