import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { colors } from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 12,
  md: 18,
  cardSmall: 20,
  card: 24,
  button: 28,
  icon: 20,
  pill: 999,
} as const;

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  } satisfies ViewStyle,
  card: {
    shadowColor: '#1B4B7A',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  } satisfies ViewStyle,
};

export const dimensions = {
  minTouch: 48,
  iconButton: 44,
  headerHeight: 52,
  tabBarHeight: 62,
} as const;

/** Plan prefers Poppins; Fredoka kept as secondary */
export const fonts = {
  heading: 'Poppins_700Bold',
  body: 'Poppins_500Medium',
  label: 'Poppins_700Bold',
  headingAlt: 'Fredoka_700Bold',
  bodyAlt: 'Fredoka_500Medium',
} as const;

export const typography = StyleSheet.create({
  brand: {
    fontFamily: fonts.heading,
    fontSize: 42,
    color: colors.darkText,
    letterSpacing: 1,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.darkText,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.secondaryText,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.darkText,
  },
  button: {
    fontFamily: fonts.label,
    fontSize: 18,
    color: colors.white,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.secondaryText,
  },
  mega: {
    fontFamily: fonts.heading,
    fontSize: 64,
    color: colors.darkText,
  },
  hubTitle: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.primaryBlue,
    letterSpacing: 0.6,
  } as TextStyle,
  kidLabel: {
    fontFamily: fonts.label,
    fontSize: 13,
    color: colors.darkText,
    textAlign: 'center',
  } as TextStyle,
});
