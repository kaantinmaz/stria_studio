import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  useFonts,
} from '@expo-google-fonts/outfit';
import { StatusBar } from 'react-native';
import { AnimatedSplash } from '@/components/animated-splash';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { colors } from '@/lib/theme';

// Native splash'i AnimatedSplash devralıyor; otomatik kapanırsa araya bir kare
// boş ekran giriyor.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
  });

  useEffect(() => {
    if (fontError) console.warn('Outfit fontu yüklenemedi:', fontError);
  }, [fontError]);

  const fontsReady = fontsLoaded || Boolean(fontError);

  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />
      {fontsReady ? (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="giris" />
          <Stack.Screen name="kayit" />
          <Stack.Screen name="qr-kayit" />
          <Stack.Screen name="bildirimler" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      ) : null}
      <SplashGate fontsReady={fontsReady} />
    </AuthProvider>
  );
}

// Oturum kontrolü AuthProvider içinde okunabildiği için ayrı bileşen: splash
// hem fontlar hem de oturum hazır olana kadar ekranda kalır.
function SplashGate({ fontsReady }: { fontsReady: boolean }) {
  const { isReady } = useAuth();

  return <AnimatedSplash ready={fontsReady && isReady} />;
}
