import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppShell, AppHeader, ContentStage } from '../components/ui';
import { BACKGROUNDS } from '../data/colorActivities';
import { colors, fonts, radii, shadows } from '../theme';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { speak } from '../services/voice';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Create'>,
  NativeStackScreenProps<RootStackParamList>
>;

const OPTIONS = [
  { title: 'Coloring', emoji: '🎨', route: 'Coloring' as const, color: '#FF7AB8', blurb: 'Paint fun pictures' },
  { title: 'Shape Builder', emoji: '🏠', route: 'ShapeBuilder' as const, color: '#4DA3FF', blurb: 'Finish the picture' },
  { title: 'My World', emoji: '🌎', route: 'MyWorldCreator' as const, color: '#7ED957', blurb: 'Stamp a scene' },
];

export function CreateScreen({ navigation }: Props) {
  return (
    <AppShell background={BACKGROUNDS.myWorld}>
      <AppHeader title="CREATE" left="avatar" right="none" />
      <View style={styles.body}>
        <ContentStage>
          <View style={styles.list}>
            {OPTIONS.map((o) => (
              <Pressable
                key={o.route}
                style={[styles.card, shadows.soft]}
                onPress={() => {
                  speak(o.title);
                  navigation.navigate(o.route);
                }}
              >
                <View style={[styles.icon, { backgroundColor: o.color }]}>
                  <Text style={{ fontSize: 34 }}>{o.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{o.title}</Text>
                  <Text style={styles.blurb}>{o.blurb}</Text>
                </View>
                <View style={[styles.go, { backgroundColor: o.color }]}>
                  <Text style={styles.goText}>›</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ContentStage>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 14, paddingBottom: 8 },
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
