import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { WorldId } from '../data/catalog';

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  WorldHub: { worldId: WorldId };
  DailyAdventure: undefined;
  RewardJourney: undefined;
  MysteryBox: undefined;
  LearnColor: undefined;
  FindColor: undefined;
  SortColor: undefined;
  MatchColor: undefined;
  CountObjects: undefined;
  CountCollect: undefined;
  BeforeAfter: undefined;
  MissingNumber: undefined;
  NumberTrain: undefined;
  MoreLess: undefined;
  FindShape: undefined;
  MatchShape: undefined;
  ShapePuzzle: undefined;
  ShapeBuilder: { pack?: 'shapes' | 'faces' | 'food' } | undefined;
  MemoryGame: undefined;
  OddOneOut: undefined;
  PatternGame: undefined;
  SequenceGame: undefined;
  SortCategory: undefined;
  Coloring: undefined;
  MyWorldCreator: undefined;
  StoryPlay: { habitId?: string } | undefined;
};

export type MainTabParamList = {
  World: undefined;
  Games: undefined;
  Create: undefined;
  Me: undefined;
};

export type RootStackProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type TabProps<T extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  T
>;
