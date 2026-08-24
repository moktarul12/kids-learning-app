import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GOOD_HABITS, GOOD_HABITS_INTRO } from '../data/goodHabits';
import { colors, fonts, radii, shadows } from '../theme';
import { speak } from '../services/voice';

export function GoodHabitList({
  onPick,
  intro = GOOD_HABITS_INTRO,
}: {
  onPick: (habitId: string) => void;
  intro?: string;
}) {
  return (
    <>
      {intro ? <Text style={styles.intro}>{intro}</Text> : null}
      <View style={styles.list}>
        {GOOD_HABITS.map((h) => (
          <Pressable
            key={h.id}
            style={[styles.card, shadows.soft]}
            onPress={() => {
              speak(h.title);
              onPick(h.id);
            }}
          >
            <View style={[styles.icon, { backgroundColor: h.color }]}>
              <Text style={styles.iconEmoji}>{h.cover}</Text>
            </View>
            <View style={styles.copy}>
              <Text style={styles.name}>{h.title}</Text>
              <Text style={styles.blurb}>{h.blurb}</Text>
            </View>
            <View style={[styles.go, { backgroundColor: h.color }]}>
              <Text style={styles.goText}>›</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontFamily: fonts.label,
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 12,
  },
  list: { gap: 12, width: '100%' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.stageSoft,
    borderRadius: radii.card,
    padding: 12,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: radii.cardSmall,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: { fontSize: 34 },
  copy: { flex: 1 },
  name: { fontFamily: fonts.heading, fontSize: 18, color: colors.darkText },
  blurb: { fontFamily: fonts.body, fontSize: 13, color: colors.secondaryText, marginTop: 2 },
  go: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goText: { color: colors.white, fontSize: 22, fontFamily: fonts.heading, lineHeight: 24 },
});
