import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type Props = {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  size?: 'md' | 'lg';
  disabled?: boolean;
};

/** Chubby 3D kids CTA — yellow Start by default */
export function BigButton({
  label,
  onPress,
  color = colors.yellow,
  textColor = colors.ink,
  style,
  textStyle,
  size = 'lg',
  disabled,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        disabled={disabled}
        onPressIn={() =>
          Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 40 }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }).start()
        }
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          onPress();
        }}
        style={[
          styles.btn,
          size === 'lg' ? styles.lg : styles.md,
          {
            backgroundColor: color,
            opacity: disabled ? 0.45 : 1,
            borderBottomColor: shade(color),
          },
        ]}
      >
        <Text style={[typography.button, { color: textColor, fontSize: size === 'lg' ? 24 : 18 }, textStyle]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function shade(hex: string) {
  if (!hex.startsWith('#') || hex.length < 7) return 'rgba(0,0,0,0.15)';
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((n >> 16) & 255) - 40);
  const g = Math.max(0, ((n >> 8) & 255) - 40);
  const b = Math.max(0, (n & 255) - 40);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 6,
  },
  lg: { minHeight: 68, paddingHorizontal: 40, paddingVertical: 14 },
  md: { minHeight: 52, paddingHorizontal: 28, paddingVertical: 10 },
});
