import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type SceneProps = {
  children: React.ReactNode;
  /** soft = design default; day = light hills; night = splash; plain = cream */
  mood?: 'soft' | 'day' | 'night' | 'plain';
};

/**
 * Soft sky → grass backdrop matching designkids.png.
 * Keeps decoration quiet so white stages / cards stay the focus.
 */
export function WorldScene({ children, mood = 'soft' }: SceneProps) {
  if (mood === 'night') {
    return (
      <View style={styles.root}>
        <LinearGradient colors={['#1B2A6B', '#2E3F8F', '#4A5FB5']} style={StyleSheet.absoluteFill} />
        <View style={styles.moon} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Text key={i} style={[styles.star, { top: 40 + i * 36, left: 24 + (i % 3) * 110 }]}>
            ✦
          </Text>
        ))}
        {children}
      </View>
    );
  }

  if (mood === 'plain') {
    return (
      <View style={styles.root}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFF8EE' }]} />
        {children}
      </View>
    );
  }

  // soft (default) + day: quiet sky/grass — no big rainbow/tree composition
  const colorsGrad: [string, string, string] =
    mood === 'day'
      ? [colors.skyDeep, colors.sky, '#B8E5A8']
      : ['#B7DDF0', '#D5EED9', '#A9D58C'];

  return (
    <View style={styles.root}>
      <LinearGradient colors={colorsGrad} locations={[0, 0.42, 1]} style={StyleSheet.absoluteFill} />
      {mood === 'day' ? (
        <>
          <View style={styles.sunSmall} />
          <View style={[styles.hillSoft, styles.hillL]} />
          <View style={[styles.hillSoft, styles.hillR]} />
        </>
      ) : null}
      {children}
    </View>
  );
}

/** White rounded play stage — core pattern from the UX board */
export function WhiteStage({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return <View style={[styles.stage, style]}>{children}</View>;
}

export function CurrencyPill({ emoji, value }: { emoji: string; value: number }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillEmoji}>{emoji}</Text>
      <Text style={styles.pillValue}>{value}</Text>
    </View>
  );
}

export const SkyBackground = ({
  children,
}: {
  children: React.ReactNode;
  variant?: string;
  showDecor?: boolean;
}) => <WorldScene mood="soft">{children}</WorldScene>;

export const CurrencyChip = CurrencyPill;
export const PlayBoard = WhiteStage;

/** Instruction strip inside activity stage (design: bold prompt) */
export function PromptBanner({ text, emoji }: { text: string; emoji?: string }) {
  return (
    <View style={styles.prompt}>
      {emoji ? <Text style={{ fontSize: 22 }}>{emoji}</Text> : null}
      <Text style={styles.promptText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  moon: {
    position: 'absolute',
    top: 56,
    right: 36,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F0C8',
  },
  star: { position: 'absolute', color: '#FFE566', fontSize: 16 },
  sunSmall: {
    position: 'absolute',
    top: 56,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.sun,
    opacity: 0.85,
  },
  hillSoft: {
    position: 'absolute',
    bottom: -90,
    width: 280,
    height: 160,
    borderRadius: 140,
    opacity: 0.35,
  },
  hillL: { left: -80, backgroundColor: colors.grassFar },
  hillR: { right: -60, backgroundColor: colors.grassNear, bottom: -70 },

  stage: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 28,
    padding: 16,
    width: '100%',
    flex: 1,
    shadowColor: '#1B4B7A',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 4,
    borderWidth: 1.5,
    borderColor: '#C9E4F8',
  },
  pillEmoji: { fontSize: 14 },
  pillValue: { ...typography.caption, color: colors.ink, fontSize: 13 },
  prompt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginBottom: 10,
    paddingVertical: 4,
  },
  promptText: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 22,
    color: colors.headerBlue,
    textAlign: 'center',
  },
});
