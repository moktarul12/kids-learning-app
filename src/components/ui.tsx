import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, radii, shadows, spacing, dimensions, fonts } from '../theme';
import { LivingIcon, IconMotion, WiggleView } from './KidAnimations';

/* ───────── AppShell ───────── */
export function AppShell({
  background,
  children,
  style,
}: {
  background: ImageSourcePropType;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.shell, style]}>
      {/* Absolute fill — reliable full-bleed on native + web (ImageBackground often clips) */}
      <Image source={background} style={styles.shellBg} resizeMode="cover" />
      <View style={styles.shellContent}>{children}</View>
    </View>
  );
}

/* ───────── IconButton ───────── */
export function IconButton({
  emoji,
  onPress,
  accessibilityLabel,
  color = colors.primaryBlue,
}: {
  emoji: string;
  onPress?: () => void;
  accessibilityLabel: string;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconBtn,
        { backgroundColor: color, opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] },
      ]}
    >
      <Text style={styles.iconBtnText}>{emoji}</Text>
    </Pressable>
  );
}

/* ───────── RewardCounter (Me page body only — not in header) ───────── */
export function RewardCounter({
  stars,
  coins,
}: {
  stars: number;
  coins: number;
}) {
  return (
    <View style={styles.rewards}>
      <View style={styles.pill}>
        <Text style={styles.pillIcon}>⭐</Text>
        <Text style={styles.pillValue}>{stars}</Text>
      </View>
      <View style={styles.pill}>
        <View style={styles.coinGlyph}>
          <Text style={styles.coinGlyphText}>¢</Text>
        </View>
        <Text style={styles.pillValue}>{coins}</Text>
      </View>
    </View>
  );
}

export type HeaderLeft = 'avatar' | 'back' | 'none';
export type HeaderRight = 'speaker' | 'none';
export type HeaderBackTo = { label: string; onPress: () => void; emoji?: string };

/**
 * Single-row header:
 *   ← / avatar · Title · Round · speaker
 * Back arrow alone handles navigation (no breadcrumb trail).
 */
export function AppHeader({
  title,
  subtitle,
  titleEmoji,
  left = 'avatar',
  right = 'none',
  backTo,
  onLeftPress,
  onRightPress,
}: {
  title: string;
  subtitle?: string;
  titleEmoji?: string;
  left?: HeaderLeft;
  right?: HeaderRight;
  /** Previous place — drives the ← button only */
  backTo?: HeaderBackTo;
  onLeftPress?: () => void;
  onRightPress?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const goBack = backTo?.onPress ?? onLeftPress;
  const showBack = Boolean(goBack) && left !== 'avatar';

  const leftSlot =
    left === 'avatar' && !backTo ? (
      <View style={styles.avatar}>
        <Text style={{ fontSize: 22 }}>🧒</Text>
      </View>
    ) : showBack ? (
      <IconButton emoji="←" onPress={goBack} accessibilityLabel="Back" />
    ) : (
      <View style={styles.headerSide} />
    );

  const rightSlot =
    right === 'speaker' ? (
      <IconButton emoji="🔊" onPress={onRightPress} accessibilityLabel="Sound" />
    ) : (
      <View style={styles.headerSide} />
    );

  return (
    <View style={[styles.appHeaderWrap, { paddingTop: Math.max(insets.top, 8) + 4 }]}>
      <View style={styles.appHeaderRow}>
        {leftSlot}
        <View style={styles.appHeaderMid}>
          <View style={styles.titleRow}>
            {titleEmoji ? <Text style={styles.titleEmoji}>{titleEmoji}</Text> : null}
            <Text style={styles.appHeaderTitle} numberOfLines={1}>
              {title}
            </Text>
          </View>
          {subtitle ? <Text style={styles.appHeaderSub}>{subtitle}</Text> : null}
        </View>
        {rightSlot}
      </View>
    </View>
  );
}

/** Tab / hub pages */
export function HubScreenHeader({ title }: { title: string; showAvatar?: boolean }) {
  return <AppHeader title={title} left="avatar" right="none" />;
}

/** Activity pages — ← · title · speaker */
export function ActivityHeader({
  title,
  round,
  onSpeak,
  backTo,
}: {
  title: string;
  round?: number;
  onSpeak?: () => void;
  backTo: HeaderBackTo;
}) {
  return (
    <AppHeader
      title={title}
      subtitle={typeof round === 'number' ? `Round ${round + 1}` : undefined}
      left="back"
      right="speaker"
      backTo={backTo}
      onRightPress={onSpeak}
    />
  );
}

/* ───────── WorldCard ───────── */
export function WorldCard({
  label,
  icon,
  motion = 'bob',
  width,
  height,
  onPress,
}: {
  label: string;
  icon: ImageSourcePropType;
  motion?: IconMotion;
  width: number;
  height: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.worldCard,
        shadows.card,
        { width, height, transform: [{ scale: pressed ? 0.96 : 1 }] },
      ]}
    >
      <LivingIcon motion={motion} style={styles.worldIconWrap}>
        <Image source={icon} style={styles.worldIcon} resizeMode="contain" />
      </LivingIcon>
      <Text style={styles.worldLabel} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ───────── ActivityCard ───────── */
export function ActivityCard({
  title,
  emoji,
  tint,
  width,
  done,
  onPress,
}: {
  title: string;
  emoji: string;
  tint: string;
  width: number;
  done?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.activityCard,
        shadows.soft,
        { width, transform: [{ scale: pressed ? 0.96 : 1 }] },
      ]}
    >
      <View style={[styles.activityBubble, { backgroundColor: tint + '22' }]}>
        <LivingIcon motion="pulse">
          <Text style={{ fontSize: 42 }}>{emoji}</Text>
        </LivingIcon>
        {done ? (
          <View style={styles.doneBadge}>
            <Text style={styles.doneText}>✓</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.activityLabel} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
  );
}

/* ───────── AnswerCard ───────── */
export function AnswerCard({
  emoji,
  selected,
  correctHighlight,
  shakeKey,
  onPress,
  size = 88,
}: {
  emoji: string;
  selected?: boolean;
  correctHighlight?: boolean;
  shakeKey?: number;
  onPress: () => void;
  size?: number;
}) {
  const content = (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.answerCard,
        shadows.soft,
        {
          width: size,
          height: size,
          borderColor: correctHighlight ? colors.green : selected ? colors.primaryBlue : colors.line,
          backgroundColor: correctHighlight ? '#E8FBE8' : colors.white,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
      ]}
    >
      <Text style={{ fontSize: size * 0.62 }}>{emoji}</Text>
    </Pressable>
  );
  if (shakeKey) {
    return <WiggleView trigger={shakeKey}>{content}</WiggleView>;
  }
  return content;
}

/* ───────── PrimaryButton ───────── */
export function PrimaryButton({
  label,
  onPress,
  color = colors.primaryRed,
  textColor = colors.white,
  style,
}: {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 40 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }).start()}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          onPress();
        }}
        style={[styles.primaryBtn, { backgroundColor: color }]}
      >
        <Text style={[styles.primaryBtnText, { color: textColor }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

/* ───────── ProgressIndicator ───────── */
export function ProgressIndicator({
  current,
  total = 10,
}: {
  current: number;
  total?: number;
}) {
  const safeTotal = Math.max(1, total);
  const clamped = Math.max(0, Math.min(current, safeTotal));
  const pct = clamped / safeTotal;
  const fill = useRef(new Animated.Value(pct)).current;

  React.useEffect(() => {
    Animated.timing(fill, { toValue: pct, duration: 350, useNativeDriver: false }).start();
  }, [pct, fill]);

  const width = fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.progressWrap} accessibilityLabel={`Progress ${clamped} of ${safeTotal}`}>
      <Text style={{ fontSize: 16 }}>⭐</Text>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width }]} />
      </View>
      <Text style={styles.progressFrac}>
        {clamped}/{safeTotal}
      </Text>
    </View>
  );
}

/* ───────── ContentStage ───────── */
export function ContentStage({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.stage, shadows.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.lightBlue, overflow: 'hidden' },
  shellBg: {
    ...StyleSheet.absoluteFill,
    width: '100%' as const,
    height: '100%' as const,
  },
  shellContent: { flex: 1 },

  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  iconBtnText: { fontSize: 22, color: colors.white },

  rewards: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    paddingLeft: 7,
    paddingRight: 9,
    paddingVertical: 5,
    gap: 3,
    ...shadows.soft,
  },
  pillIcon: { fontSize: 13 },
  coinGlyph: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F5C518',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0A800',
  },
  coinGlyphText: {
    fontFamily: fonts.heading,
    fontSize: 10,
    color: '#7A5A00',
    lineHeight: 12,
  },
  pillValue: { fontFamily: fonts.heading, fontSize: 13, color: colors.darkText },

  appHeaderWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: 8,
  },
  appHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  // legacy alias kept for any leftover refs
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    minHeight: dimensions.headerHeight,
    backgroundColor: 'transparent',
  },
  headerSide: {
    width: 48,
    height: 48,
  },
  headerSideWide: {
    width: 132,
    height: 48,
    justifyContent: 'center',
  },
  rightAlign: {
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: colors.primaryBlue,
    ...shadows.soft,
  },
  appHeaderMid: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    maxWidth: '100%',
  },
  titleEmoji: { fontSize: 20 },
  appHeaderTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.darkText,
    letterSpacing: 0.2,
    textAlign: 'center',
    flexShrink: 1,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  subDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primaryBlue,
    opacity: 0.45,
  },
  appHeaderSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 1,
    textAlign: 'center',
  },

  hubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    minHeight: dimensions.headerHeight,
  },
  hubTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.darkText,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  activityMid: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  activityTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.darkText,
  },
  roundLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 1,
  },

  worldCard: {
    backgroundColor: colors.white,
    borderRadius: radii.card,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  worldIconWrap: {
    width: '108%',
    flex: 1.15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  worldIcon: { width: '100%', height: '100%', transform: [{ scale: 1.08 }] },
  worldLabel: {
    fontFamily: fonts.label,
    fontSize: 13,
    lineHeight: 16,
    color: colors.darkText,
    textAlign: 'center',
    marginTop: 2,
  },

  activityCard: {
    backgroundColor: colors.white,
    borderRadius: 22,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    minHeight: 124,
  },
  activityBubble: {
    width: 70,
    height: 70,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  doneBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  doneText: { color: colors.white, fontSize: 12, fontFamily: fonts.heading },
  activityLabel: {
    fontFamily: fonts.label,
    fontSize: 12,
    color: colors.darkText,
    textAlign: 'center',
    lineHeight: 15,
  },

  answerCard: {
    borderRadius: radii.cardSmall,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryBtn: {
    minHeight: 56,
    borderRadius: radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  primaryBtnText: { fontFamily: fonts.label, fontSize: 18 },

  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    marginTop: spacing.sm,
    paddingHorizontal: 4,
  },
  progressTrack: {
    flex: 1,
    height: 14,
    borderRadius: radii.pill,
    backgroundColor: '#E8F5E9',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.green,
  },
  progressFrac: {
    fontFamily: fonts.heading,
    fontSize: 13,
    color: colors.darkText,
    minWidth: 36,
    textAlign: 'right',
  },

  stage: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: radii.card,
    padding: spacing.lg,
    width: '100%',
    flex: 1,
  },
});
