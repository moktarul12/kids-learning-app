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
import { BACKGROUNDS } from '../data/colorActivities';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { fonts } from '../theme';
import type { WorldId } from '../data/catalog';

const HEADER_BANNER = require('../../assets/home/header_banner.png');
const MY_WORLD_TITLE = require('../../assets/home/my_world_title.png');

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'World'>,
  NativeStackScreenProps<RootStackParamList>
>;

const WORLDS: {
  id: WorldId;
  label: string;
  blurb: string;
  tint: string;
  art: ImageSourcePropType;
}[] = [
  {
    id: 'color',
    label: 'Color',
    blurb: 'Paint & find colors',
    tint: '#E8890C',
    art: require('../../assets/home/portal_color.png'),
  },
  {
    id: 'number',
    label: 'Number',
    blurb: 'Count & play',
    tint: '#2F7FE8',
    art: require('../../assets/home/portal_number.png'),
  },
  {
    id: 'shape',
    label: 'Shape',
    blurb: 'Build & spot shapes',
    tint: '#2FA84A',
    art: require('../../assets/home/portal_shape.png'),
  },
  {
    id: 'thinking',
    label: 'Thinking',
    blurb: 'Solve fun puzzles',
    tint: '#7B4FE8',
    art: require('../../assets/home/portal_thinking.png'),
  },
  {
    id: 'creative',
    label: 'Creative',
    blurb: 'Make something new',
    tint: '#E84A9A',
    art: require('../../assets/home/portal_creative.png'),
  },
  {
    id: 'story',
    label: 'Story',
    blurb: 'Choose your path',
    tint: '#1EAEB8',
    art: require('../../assets/home/portal_story.png'),
  },
];

/** MY WORLD — vertical portal cards matching attached UX */
export function MyWorldScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const gap = 12;
  const padH = 14;
  const tileW = (Math.min(width, 480) - padH * 2 - gap) / 2;
  const tileH = tileW * (495 / 455);

  return (
    <AppShell background={BACKGROUNDS.myWorld}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        bounces
      >
        <AppHeader title="MY WORLD" titleImage={MY_WORLD_TITLE} left="avatar" right="none" />

        <View style={{ paddingHorizontal: padH }}>
          <View style={styles.banner}>
            <Image source={HEADER_BANNER} style={styles.bannerImg} resizeMode="contain" />
            <View style={styles.bannerCopy} pointerEvents="none">
              <Text style={styles.bannerTitle}>Pick a world!</Text>
              <Text style={styles.bannerSub}>Tap a door to start learning</Text>
            </View>
          </View>

          <View style={[styles.grid, { columnGap: gap, rowGap: gap }]}>
            {WORLDS.map((w) => (
              <Pressable
                key={w.id}
                accessibilityRole="button"
                accessibilityLabel={`${w.label}. ${w.blurb}`}
                onPress={() => {
                  if (w.id === 'story') {
                    navigation.navigate('StoryPlay');
                  } else {
                    navigation.navigate('WorldHub', { worldId: w.id });
                  }
                }}
                style={({ pressed }) => [
                  styles.card,
                  {
                    width: tileW,
                    height: tileH,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <Image source={w.art} style={styles.cardArt} resizeMode="contain" />
                <View style={styles.cardCopy} pointerEvents="none">
                  <Text style={[styles.cardTitle, { color: w.tint }]}>{w.label}</Text>
                  <Text style={styles.cardBlurb}>{w.blurb}</Text>
                </View>
                <View style={styles.goArrowWrap} pointerEvents="none">
                  <View style={[styles.goGlow, { backgroundColor: w.tint }]} />
                  {/* white outline for contrast on any card */}
                  <View style={[styles.goChev, styles.goChevOutline]} />
                  <View style={[styles.goChev, { borderColor: w.tint }]} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 36,
    paddingTop: 0,
    flexGrow: 1,
  },
  banner: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    aspectRatio: 590 / 270,
    marginBottom: 12,
    position: 'relative',
  },
  bannerImg: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  bannerCopy: {
    position: 'absolute',
    left: '36%',
    right: '8%',
    top: '32%',
    height: '38%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    fontFamily: fonts.headingAlt,
    fontSize: 22,
    color: '#4A2E14',
    textAlign: 'center',
    includeFontPadding: false,
  },
  bannerSub: {
    fontFamily: fonts.bodyAlt,
    fontSize: 13,
    color: '#6B4A2E',
    textAlign: 'center',
    marginTop: 2,
    includeFontPadding: false,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 480,
  },
  card: {
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  cardArt: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  /** Text sits in the clear lower half of each portal art */
  /** Text sits in the clear lower half of each portal art */
  cardCopy: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    bottom: '10%',
    height: '34%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: fonts.headingAlt,
    fontSize: 20,
    textAlign: 'center',
    includeFontPadding: false,
  },
  cardBlurb: {
    fontFamily: fonts.bodyAlt,
    fontSize: 12,
    color: '#4A5568',
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 15,
    includeFontPadding: false,
  },
  goArrowWrap: {
    position: 'absolute',
    right: 12,
    bottom: 10,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  goGlow: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    opacity: 0.2,
  },
  goChev: {
    width: 14,
    height: 14,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    marginLeft: -3,
  },
  goChevOutline: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderTopWidth: 6,
    borderRightWidth: 6,
    borderColor: 'rgba(255,255,255,0.95)',
    transform: [{ rotate: '45deg' }],
    marginLeft: -3,
  },
});
