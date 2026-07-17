import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/lib/auth-context';
import { colors, fonts } from '@/lib/theme';

const icons: Record<string, string> = {
  index: '⌂',
  randevular: '◷',
  'randevu-al': '+',
  profil: '♡',
};

export default function TabLayout() {
  const { isReady, isAuthenticated } = useAuth();

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }
  if (!isAuthenticated) return <Redirect href="/giris" />;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: { backgroundColor: colors.cream },
        tabBarActiveTintColor: colors.accentDark,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>{icons[route.name]}</Text>,
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Ana Sayfa' }} />
      <Tabs.Screen name="randevular" options={{ title: 'Randevular' }} />
      <Tabs.Screen name="randevu-al" options={{ title: 'Randevu Al' }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream },
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.line,
    height: 72,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabLabel: { fontFamily: fonts.medium, fontSize: 11 },
  icon: { fontFamily: fonts.semibold, fontSize: 23, lineHeight: 25 },
});
