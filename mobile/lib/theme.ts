import type { TextStyle, ViewStyle } from 'react-native';

export const colors = {
  cream: '#fbf4f1',
  ink: '#42302e',
  accent: '#c57c69',
  accentDark: '#b0654f',
  rose: '#d89a8a',
  pink: '#f3ded7',
  blush: '#f5e6e0',
  line: '#f1e2dc',
  muted: '#8a6f6a',
  white: '#ffffff',
  amber: '#b7791f',
  amberBg: '#fff1cf',
  green: '#39745a',
  greenBg: '#dceee4',
  gray: '#746b69',
  grayBg: '#eee9e7',
  danger: '#a4483f',
  dangerBg: '#f8ded9',
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  xxl: 40,
} as const;

export const radius = {
  sm: 14,
  md: 20,
  lg: 24,
  xl: 28,
  pill: 999,
} as const;

export const fonts = {
  regular: 'Jost_400Regular',
  medium: 'Jost_500Medium',
  semibold: 'Jost_600SemiBold',
} as const;

export const shadows: Record<'soft', ViewStyle> = {
  soft: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 3,
  },
};

export const typography: Record<'title' | 'heading' | 'body' | 'caption', TextStyle> = {
  title: { fontFamily: fonts.semibold, fontSize: 30, lineHeight: 36, color: colors.ink },
  heading: { fontFamily: fonts.semibold, fontSize: 21, lineHeight: 27, color: colors.ink },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, color: colors.ink },
  caption: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.muted },
};
