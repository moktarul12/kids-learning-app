import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

/** Bottom progress pill from new UX: ⭐ · green bar · 3/10 */
export function ProgressBar({
  current,
  total = 10,
}: {
  current: number;
  total?: number;
}) {
  const safeTotal = Math.max(1, total);
  const clamped = Math.max(0, Math.min(current, safeTotal));
  const pct = clamped / safeTotal;

  return (
    <View style={styles.wrap} accessibilityLabel={`Progress ${clamped} of ${safeTotal}`}>
      <Text style={styles.star}>⭐</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={styles.frac}>
        {clamped}/{safeTotal}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    paddingHorizontal: 4,
    marginTop: 8,
  },
  star: { fontSize: 16 },
  track: {
    flex: 1,
    height: 14,
    borderRadius: 999,
    backgroundColor: '#E8F5E9',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#7CD992',
  },
  frac: {
    fontFamily: 'Fredoka_700Bold',
    fontSize: 13,
    color: colors.ink,
    minWidth: 36,
    textAlign: 'right',
  },
});
