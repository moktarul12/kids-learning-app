import React, { useMemo, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppShell, AppHeader, ContentStage, RewardCounter } from '../components/ui';
import { BACKGROUNDS } from '../data/colorActivities';
import { useProgress, BadgeId } from '../state/ProgressContext';
import { colors, fonts, shadows } from '../theme';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { greetKid, speak } from '../services/voice';

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

const ANDROID_PACKAGE = 'com.dromominds.kiddoo';
const PLAY_STORE_WEB = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
const PLAY_STORE_HINT =
  `Hey! Try Kiddo with me — Learn · Explore · Grow!\n${PLAY_STORE_WEB}`;

export function MeScreen({ navigation }: Props) {
  const {
    stars,
    coins,
    gems,
    skillStars,
    badges,
    kidName,
    kidDob,
    kidAge,
    setKidProfile,
  } = useProgress();
  const [editOpen, setEditOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(kidName);
  const [year, setYear] = useState(kidDob ? kidDob.slice(0, 4) : '2020');
  const [month, setMonth] = useState(kidDob ? kidDob.slice(5, 7) : '01');
  const [day, setDay] = useState(kidDob ? kidDob.slice(8, 10) : '01');

  const displayName = kidName || 'Your kid';
  const ageLabel = useMemo(() => {
    if (kidAge == null) return 'Add age';
    return kidAge === 1 ? '1 year old' : `${kidAge} years old`;
  }, [kidAge]);

  const openEdit = () => {
    setNameDraft(kidName);
    setYear(kidDob ? kidDob.slice(0, 4) : '2020');
    setMonth(kidDob ? kidDob.slice(5, 7) : '01');
    setDay(kidDob ? kidDob.slice(8, 10) : '01');
    setEditOpen(true);
    speak(kidName ? `Edit ${kidName}'s profile` : 'Add your name');
  };

  const saveProfile = () => {
    const y = year.padStart(4, '0');
    const m = month.padStart(2, '0').slice(0, 2);
    const d = day.padStart(2, '0').slice(0, 2);
    const dob = `${y}-${m}-${d}`;
    setKidProfile(nameDraft, dob);
    setEditOpen(false);
    const n = nameDraft.trim() || 'friend';
    speak(`Nice to meet you, ${n}!`);
  };

  const shareApp = async () => {
    try {
      speak(kidName ? `${kidName}, let's share Kiddo with a friend!` : 'Share Kiddo with a friend!');
      await Share.share({
        message: PLAY_STORE_HINT,
        title: 'Share Kiddo',
      });
    } catch {
      /* cancelled */
    }
  };

  const rateApp = () => {
    speak('Rate Kiddo on Play Store');
    const market = `market://details?id=${ANDROID_PACKAGE}`;
    Linking.openURL(market).catch(() => {
      Linking.openURL(PLAY_STORE_WEB).catch(() => {});
    });
  };

  const openAbout = () => {
    speak('About us');
    Linking.openURL('https://dromominds.in').catch(() => {});
  };

  return (
    <AppShell background={BACKGROUNDS.myWorld}>
      <AppHeader title="ME" left="avatar" right="none" />
      <View style={styles.body}>
        <ContentStage contentStyle={styles.inner}>
            <View style={styles.mascot}>
              <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
              <Text style={styles.appName}>Kiddo</Text>
            </View>

            {/* Kid profile card */}
            <Pressable style={[styles.profileCard, shadows.soft]} onPress={openEdit}>
              <Text style={styles.profileEmoji}>🧒</Text>
              <View style={styles.profileCopy}>
                <Text style={styles.profileName}>{displayName}</Text>
                <Text style={styles.profileAge}>{ageLabel}</Text>
                <Text style={styles.profileHint}>Tap to edit name & birthday</Text>
              </View>
              <Text style={styles.profileEdit}>✏️</Text>
            </Pressable>

            {/* Highlighted share */}
            <Pressable style={[styles.shareHero, shadows.soft]} onPress={shareApp}>
              <View style={styles.shareHeroBadge}>
                <Text style={styles.shareHeroBadgeText}>FRIENDS</Text>
              </View>
              <Text style={styles.shareHeroEmoji}>🎁📤</Text>
              <Text style={styles.shareHeroTitle}>Share Kiddo with a friend!</Text>
              <Text style={styles.shareHeroSub}>Send the app link — learn together</Text>
              <View style={styles.shareHeroBtn}>
                <Text style={styles.shareHeroBtnText}>Share now →</Text>
              </View>
            </Pressable>

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

            <Pressable style={[styles.rate, shadows.soft]} onPress={rateApp}>
              <Text style={{ fontSize: 24 }}>⭐</Text>
              <View style={styles.aboutCopy}>
                <Text style={styles.rateText}>Rate this app</Text>
                <Text style={styles.rateSub}>Open Play Store</Text>
              </View>
              <Text style={styles.rateGo}>›</Text>
            </Pressable>

            <Pressable style={[styles.about, shadows.soft]} onPress={openAbout}>
              <Text style={{ fontSize: 24 }}>ℹ️</Text>
              <View style={styles.aboutCopy}>
                <Text style={styles.aboutText}>About Us</Text>
                <Text style={styles.aboutUrl}>dromominds.in</Text>
              </View>
            </Pressable>

            <Pressable
              style={styles.sayHi}
              onPress={() => greetKid()}
            >
              <Text style={styles.sayHiText}>🔊 Say hi to me</Text>
            </Pressable>
        </ContentStage>
      </View>

      <Modal visible={editOpen} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Kid profile</Text>
            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder="e.g. Muhib"
              placeholderTextColor="#A0ADC0"
              style={styles.input}
              maxLength={24}
              autoCapitalize="words"
            />
            <Text style={styles.modalLabel}>Birthday</Text>
            <View style={styles.dobRow}>
              <TextInput
                value={year}
                onChangeText={setYear}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="YYYY"
                style={[styles.input, styles.dobInput]}
              />
              <TextInput
                value={month}
                onChangeText={setMonth}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="MM"
                style={[styles.input, styles.dobInput]}
              />
              <TextInput
                value={day}
                onChangeText={setDay}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="DD"
                style={[styles.input, styles.dobInput]}
              />
            </View>
            <Text style={styles.modalHint}>Year · Month · Day</Text>
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setEditOpen(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSave} onPress={saveProfile}>
                <Text style={styles.modalSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 14, paddingBottom: 8 },
  inner: { gap: 8, paddingBottom: 16 },
  mascot: { alignItems: 'center', marginBottom: 2, gap: 2 },
  logo: { width: 72, height: 72 },
  appName: { fontFamily: fonts.heading, fontSize: 20, color: colors.darkText },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8EE',
    borderRadius: 20,
    padding: 14,
    gap: 10,
    borderWidth: 3,
    borderColor: '#FFE08A',
  },
  profileEmoji: { fontSize: 40 },
  profileCopy: { flex: 1 },
  profileName: { fontFamily: fonts.heading, fontSize: 20, color: colors.darkText },
  profileAge: { fontFamily: fonts.label, fontSize: 14, color: colors.primaryBlue, marginTop: 2 },
  profileHint: { fontFamily: fonts.label, fontSize: 11, color: colors.secondaryText, marginTop: 2 },
  profileEdit: { fontSize: 22 },
  shareHero: {
    backgroundColor: '#FF6B4A',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    gap: 6,
    borderWidth: 4,
    borderColor: '#FFD93D',
    marginTop: 4,
  },
  shareHeroBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#FFD93D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  shareHeroBadgeText: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: '#1E2A3A',
  },
  shareHeroEmoji: { fontSize: 36 },
  shareHeroTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: '#FFF',
    textAlign: 'center',
  },
  shareHeroSub: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  shareHeroBtn: {
    marginTop: 8,
    backgroundColor: '#FFD93D',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
  },
  shareHeroBtnText: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: '#1E2A3A',
  },
  currency: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
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
  rate: {
    backgroundColor: '#FFF4C4',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 3,
    borderColor: '#FFD93D',
  },
  rateText: { fontFamily: fonts.heading, color: colors.darkText, fontSize: 18 },
  rateSub: { fontFamily: fonts.label, color: colors.secondaryText, fontSize: 13, marginTop: 2 },
  rateGo: { fontFamily: fonts.heading, fontSize: 28, color: '#E6A800', lineHeight: 30 },
  about: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: '#D7E6F7',
  },
  aboutCopy: { flex: 1 },
  aboutText: { fontFamily: fonts.heading, color: colors.darkText, fontSize: 18 },
  aboutUrl: { fontFamily: fonts.label, color: colors.primaryBlue, fontSize: 13, marginTop: 2 },
  sayHi: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  sayHiText: { fontFamily: fonts.label, color: colors.primaryBlue, fontSize: 14 },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(20,30,50,0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    gap: 8,
  },
  modalTitle: { fontFamily: fonts.heading, fontSize: 22, color: colors.darkText, marginBottom: 4 },
  modalLabel: { fontFamily: fonts.label, fontSize: 13, color: colors.secondaryText, marginTop: 6 },
  input: {
    borderWidth: 2,
    borderColor: '#D7E6F7',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.label,
    fontSize: 16,
    color: colors.darkText,
    backgroundColor: '#F7FBFF',
  },
  dobRow: { flexDirection: 'row', gap: 8 },
  dobInput: { flex: 1, textAlign: 'center' },
  modalHint: { fontFamily: fonts.label, fontSize: 11, color: colors.secondaryText },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#EEF3F8',
    alignItems: 'center',
  },
  modalCancelText: { fontFamily: fonts.heading, fontSize: 16, color: colors.darkText },
  modalSave: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: colors.primaryBlue,
    alignItems: 'center',
  },
  modalSaveText: { fontFamily: fonts.heading, fontSize: 16, color: '#FFF' },
});
