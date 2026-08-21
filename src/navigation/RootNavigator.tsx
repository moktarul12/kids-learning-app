import React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from './types';

import { SplashScreen } from '../screens/SplashScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { MyWorldScreen } from '../screens/MyWorldScreen';
import { GamesScreen } from '../screens/GamesScreen';
import { CreateScreen } from '../screens/CreateScreen';
import { MeScreen } from '../screens/MeScreen';
import { WorldHubScreen } from '../screens/WorldHubScreen';
import {
  LearnColorScreen,
  FindColorScreen,
  SortColorScreen,
  MatchColorScreen,
} from '../screens/games/ColorGames';
import {
  NumberIntroScreen,
  CountObjectsScreen,
  CountCollectScreen,
  BeforeAfterScreen,
  MissingNumberScreen,
  NumberTrainScreen,
  MoreLessScreen,
} from '../screens/games/NumberGames';
import {
  FindShapeScreen,
  MatchShapeScreen,
  ShapePuzzleScreen,
  ShapeBuilderScreen,
} from '../screens/games/ShapeGames';
import {
  MemoryGameScreen,
  OddOneOutScreen,
  PatternGameScreen,
  SequenceGameScreen,
  SortCategoryScreen,
} from '../screens/games/ThinkingGames';
import {
  ColoringScreen,
  MyWorldCreatorScreen,
  StoryPlayScreen,
  DailyAdventureScreen,
  MysteryBoxScreen,
} from '../screens/games/CreativeGames';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const map: Record<string, string> = {
    World: '🌐',
    Games: '🎮',
    Create: '🖌️',
    Me: '🏆',
  };
  return (
    <View
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? '#E8F4FF' : 'transparent',
      }}
    >
      <Text style={{ fontSize: focused ? 18 : 16, opacity: focused ? 1 : 0.5 }}>{map[label]}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4DA3FF',
        tabBarInactiveTintColor: '#A0ADC0',
        tabBarStyle: {
          height: 62,
          paddingBottom: 8,
          paddingTop: 4,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarLabelStyle: { fontFamily: 'Fredoka_700Bold', fontSize: 10, marginTop: 0 },
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="World" component={MyWorldScreen} />
      <Tab.Screen name="Games" component={GamesScreen} />
      <Tab.Screen name="Create" component={CreateScreen} />
      <Tab.Screen name="Me" component={MeScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          primary: '#4DA3FF',
          background: '#E8F4FF',
          card: '#E8F4FF',
          text: '#1E2A3A',
          border: 'transparent',
          notification: '#FF5252',
        },
        fonts: {
          regular: { fontFamily: 'Poppins_500Medium', fontWeight: '500' },
          medium: { fontFamily: 'Poppins_500Medium', fontWeight: '500' },
          bold: { fontFamily: 'Poppins_700Bold', fontWeight: '700' },
          heavy: { fontFamily: 'Poppins_700Bold', fontWeight: '700' },
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="WorldHub" component={WorldHubScreen} />
        <Stack.Screen name="DailyAdventure" component={DailyAdventureScreen} />
        <Stack.Screen name="MysteryBox" component={MysteryBoxScreen} />
        <Stack.Screen name="LearnColor" component={LearnColorScreen} />
        <Stack.Screen name="FindColor" component={FindColorScreen} />
        <Stack.Screen name="SortColor" component={SortColorScreen} />
        <Stack.Screen name="MatchColor" component={MatchColorScreen} />
        <Stack.Screen name="NumberIntro" component={NumberIntroScreen} />
        <Stack.Screen name="CountObjects" component={CountObjectsScreen} />
        <Stack.Screen name="CountCollect" component={CountCollectScreen} />
        <Stack.Screen name="BeforeAfter" component={BeforeAfterScreen} />
        <Stack.Screen name="MissingNumber" component={MissingNumberScreen} />
        <Stack.Screen name="NumberTrain" component={NumberTrainScreen} />
        <Stack.Screen name="MoreLess" component={MoreLessScreen} />
        <Stack.Screen name="FindShape" component={FindShapeScreen} />
        <Stack.Screen name="MatchShape" component={MatchShapeScreen} />
        <Stack.Screen name="ShapePuzzle" component={ShapePuzzleScreen} />
        <Stack.Screen name="ShapeBuilder" component={ShapeBuilderScreen} />
        <Stack.Screen name="MemoryGame" component={MemoryGameScreen} />
        <Stack.Screen name="OddOneOut" component={OddOneOutScreen} />
        <Stack.Screen name="PatternGame" component={PatternGameScreen} />
        <Stack.Screen name="SequenceGame" component={SequenceGameScreen} />
        <Stack.Screen name="SortCategory" component={SortCategoryScreen} />
        <Stack.Screen name="Coloring" component={ColoringScreen} />
        <Stack.Screen name="MyWorldCreator" component={MyWorldCreatorScreen} />
        <Stack.Screen name="StoryPlay" component={StoryPlayScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
