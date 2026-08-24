import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppShell, AppHeader, ContentStage } from '../components/ui';
import { CreateBuilderList } from '../components/CreateBuilderList';
import { BACKGROUNDS } from '../data/colorActivities';
import { MainTabParamList, RootStackParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Create'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function CreateScreen({ navigation }: Props) {
  return (
    <AppShell background={BACKGROUNDS.myWorld}>
      <AppHeader title="CREATE" left="avatar" right="none" />
      <View style={styles.body}>
        <ContentStage>
          <CreateBuilderList navigation={navigation} />
        </ContentStage>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 14, paddingBottom: 8 },
});
