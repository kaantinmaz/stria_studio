import type { TextStyle, ViewStyle } from 'react-native';

// Palet web ile aynı kaynaktan: logo wordmark'ı #4c1313 + favicon zemini #e58792.
// Web tarafındaki frontend/app/globals.css @theme bloğuyla eşleşir.
export const colors = {
  cream: '#fdf6f5',
  ink: '#4c1313',
  accent: '#a83f54',
  accentDark: '#8b2e42',
  rose: '#bb4a5f',
  blossom: '#e58792',
  pink: '#f8dfe2',
  blush: '#fbecec',
  line: '#f4e3e3',
  muted: '#8a6060',
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

// Sweet Sans Pro Light lisanslı dosyaları gelene kadar en yakın ücretsiz karşılık
// (web ile aynı seçim). Küçük punto vurgular mobilde 600'de daha okunur kaldığı
// için `semibold` korundu; Light yalnız büyük başlıklarda.
export const fonts = {
  light: 'Outfit_300Light',
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
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
  title: { fontFamily: fonts.light, fontSize: 30, lineHeight: 36, color: colors.ink },
  heading: { fontFamily: fonts.medium, fontSize: 21, lineHeight: 27, color: colors.ink },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, color: colors.ink },
  caption: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.muted },
};
