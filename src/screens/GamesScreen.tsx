import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppShell, AppHeader, ContentStage } from '../components/ui';
import { BACKGROUNDS } from '../data/colorActivities';
import { GAMES } from '../data/catalog';
import { colors, fonts, radii, shadows } from '../theme';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { speak } from '../services/voice';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Games'>,
  NativeStackScreenProps<RootStackParamList>
>;

const GROUPS = [
  { world: 'color' as const, label: 'Colors', color: '#FF5252' },
  { world: 'number' as const, label: 'Numbers', color: '#4DA3FF' },
  { world: 'shape' as const, label: 'Shapes', color: '#7ED957' },
  { world: 'thinking' as const, label: 'Thinking', color: '#9B7BFF' },
];

export function GamesScreen({ navigation }: Props) {
  return (
    <AppShell background={BACKGROUNDS.myWorld}>
      <AppHeader title="GAMES" left="avatar" right="none" />
      <View style={styles.body}>
        <ContentStage contentStyle={styles.scroll}>
            {GROUPS.map((group) => (
              <View key={group.world} style={styles.groupBlock}>
                <Text style={[styles.group, { color: group.color }]}>{group.label}</Text>
                <View style={styles.row}>
                  {GAMES.filter((g) => g.world === group.world).map((g) => (
                    <Pressable
                      key={g.id}
                      style={styles.tile}
                      onPress={() => {
                        speak(g.title);
                        navigation.navigate(g.route as never);
                      }}
                    >
                      <View style={[styles.bubble, { backgroundColor: group.color }, shadows.soft]}>
                        <Text style={{ fontSize: 26 }}>{g.emoji}</Text>
                      </View>
                      <Text style={styles.name} numberOfLines={2}>
                        {g.title}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
        </ContentStage>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 14, paddingBottom: 8 },
  scroll: { gap: 14, paddingBottom: 12 },
  groupBlock: { marginBottom: 4 },
  group: { fontFamily: fonts.heading, fontSize: 16, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { width: '31%', alignItems: 'center', marginBottom: 6 },
  bubble: {
    width: 58,
    height: 58,
    borderRadius: radii.cardSmall,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  name: {
    fontFamily: fonts.label,
    fontSize: 11,
    textAlign: 'center',
    color: colors.darkText,
    lineHeight: 13,
  },
});
