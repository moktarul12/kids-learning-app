import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppShell, AppHeader, ContentStage, RewardCounter } from '../components/ui';
import { FoxMascot } from '../components/FoxMascot';
import { BACKGROUNDS } from '../data/colorActivities';
import { useProgress, BadgeId } from '../state/ProgressContext';
import { colors, fonts, radii, shadows } from '../theme';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { speak } from '../services/voice';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Me'>,
  NativeStackScreenProps<RootStackParamList>
>;

const BADGES: Record<BadgeId, { label: string; emoji: string }> = {
  star_learner: { label: 'Star Learner', emoji: '⭐' },
  number_master: { label: 'Number Master', emoji: '🔢' },
  shape_builder: { label: 'Shape Builder', emoji: '🔷' },
  creative_star: { label: 'Creative Star', emoji: '🎨' },
  color_explorer: { label: 'Color Explorer', emoji: '🌈' },
  thinker: { label: 'Thinker', emoji: '🧠' },
};

const SKILLS = [
  { id: 'colors' as const, label: 'Colors', emoji: '🌈' },
  { id: 'numbers' as const, label: 'Numbers', emoji: '🔢' },
  { id: 'shapes' as const, label: 'Shapes', emoji: '🔷' },
  { id: 'thinking' as const, label: 'Thinking', emoji: '🧠' },
  { id: 'creativity' as const, label: 'Creativity', emoji: '🎨' },
];

export function MeScreen({ navigation }: Props) {
  const { stars, coins, gems, skillStars, badges } = useProgress();

  return (
    <AppShell background={BACKGROUNDS.myWorld}>
      <AppHeader title="ME" left="avatar" right="none" />
      <View style={styles.body}>
        <ContentStage>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.inner}>
            <View style={styles.mascot}>
              <FoxMascot mood="proud" size={72} />
            </View>
            <View style={styles.currency}>
              <RewardCounter stars={stars} coins={coins} />
              <View style={[styles.gemPill, shadows.soft]}>
                <Text style={{ fontSize: 13 }}>💎</Text>
                <Text style={styles.gemText}>{gems}</Text>
              </View>
            </View>

            <Text style={styles.section}>Learning Journey</Text>
            {SKILLS.map((s) => (
              <View key={s.id} style={styles.skill}>
                <Text style={styles.skillEmoji}>{s.emoji}</Text>
                <Text style={styles.skillLabel}>{s.label}</Text>
                <View style={styles.starRow}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Text key={i} style={{ fontSize: 14, opacity: i < skillStars[s.id] ? 1 : 0.25 }}>
                      ⭐
                    </Text>
                  ))}
                </View>
              </View>
            ))}

            <Text style={styles.section}>Badges</Text>
            <View style={styles.badges}>
              {(Object.keys(BADGES) as BadgeId[]).map((id) => {
                const unlocked = badges.includes(id);
                return (
                  <View key={id} style={[styles.badge, !unlocked && { opacity: 0.35 }]}>
                    <Text style={{ fontSize: 24 }}>{unlocked ? BADGES[id].emoji : '🔒'}</Text>
                    <Text style={styles.badgeLabel}>{BADGES[id].label}</Text>
                  </View>
                );
              })}
            </View>

            <Pressable
              style={[styles.mystery, shadows.soft]}
              onPress={() => {
                speak('Mystery box');
                navigation.navigate('MysteryBox');
              }}
            >
              <Text style={{ fontSize: 28 }}>🎁</Text>
              <Text style={styles.mysteryText}>Mystery Box</Text>
            </Pressable>

            <Pressable
              style={[styles.daily, shadows.soft]}
              onPress={() => {
                speak('Daily adventure');
                navigation.navigate('DailyAdventure');
              }}
            >
              <Text style={{ fontSize: 24 }}>🗺️</Text>
              <Text style={styles.dailyText}>Daily Adventure</Text>
            </Pressable>
          </ScrollView>
        </ContentStage>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 14, paddingBottom: 8 },
  inner: { gap: 8, paddingBottom: 12 },
  mascot: { alignItems: 'center', marginBottom: 4 },
  currency: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  gemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    gap: 3,
  },
  gemText: { fontFamily: fonts.heading, fontSize: 13, color: colors.darkText },
  section: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.darkText,
    marginTop: 8,
    marginBottom: 4,
  },
  skill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.stageSoft,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  skillEmoji: { fontSize: 20 },
  skillLabel: { fontFamily: fonts.label, fontSize: 14, color: colors.darkText, flex: 1 },
  starRow: { flexDirection: 'row', gap: 2 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    width: '30%',
    backgroundColor: '#FFF8EE',
    borderRadius: 14,
    padding: 8,
    alignItems: 'center',
    gap: 2,
    borderWidth: 2,
    borderColor: '#FFE08A',
  },
  badgeLabel: {
    fontFamily: fonts.label,
    fontSize: 10,
    textAlign: 'center',
    color: colors.darkText,
  },
  mystery: {
    marginTop: 8,
    backgroundColor: colors.orange,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mysteryText: { fontFamily: fonts.heading, color: colors.white, fontSize: 18 },
  daily: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dailyText: { fontFamily: fonts.heading, color: colors.white, fontSize: 18 },
});
