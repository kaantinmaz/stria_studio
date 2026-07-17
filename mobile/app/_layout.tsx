import { useEffect } from 'react';
import { Stack } from 'expo-router';
import {
  Jost_400Regular,
  Jost_500Medium,
  Jost_600SemiBold,
  useFonts,
} from '@expo-google-fonts/jost';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { AuthProvider } from '@/lib/auth-context';
import { colors } from '@/lib/theme';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Jost_400Regular, Jost_500Medium, Jost_600SemiBold });

  useEffect(() => {
    if (fontError) console.warn('Jost fontu yüklenemedi:', fontError);
  }, [fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loading}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cream} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="giris" />
        <Stack.Screen name="kayit" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream },
});
