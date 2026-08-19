import type {
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
} from 'expo-router/js-top-tabs';
import { createMaterialTopTabNavigator } from 'expo-router/js-top-tabs';
import type { ParamListBase, TabNavigationState } from 'expo-router/react-navigation';
import { Redirect, router, withLayoutContext } from 'expo-router';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View, type ColorValue } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatWidget } from '@/components/chat-widget';
import { useAuth } from '@/lib/auth-context';
import { colors, fonts } from '@/lib/theme';
import { useUpcomingCount } from '@/lib/upcoming-store';
import { useUnreadNotifications } from '@/lib/notification-store';

// Material Top Tabs (pager tabanlı) — sayfalar arası swipe için; bar altta durur.
const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

const icons: Record<string, string> = {
  randevular: '◷',
  'randevu-al': '+',
  profil: '♀',
};

function UpcomingBadge() {
  const count = useUpcomingCount();
  if (count <= 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count}</Text>
    </View>
  );
}

function NotificationBell() {
  const unread = useUnreadNotifications();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={unread > 0 ? `Bildirimler, ${unread} yeni` : 'Bildirimler'}
      hitSlop={12}
      onPress={() => router.push('/bildirimler')}
      style={({ pressed }) => [styles.bell, pressed && styles.bellPressed]}
    >
      <SymbolView
        name={unread > 0 ? 'bell.badge.fill' : 'bell'}
        tintColor={colors.ink}
        size={22}
        fallback={<Text style={styles.bellFallback}>🔔</Text>}
      />
      {unread > 0 ? (
        <View style={styles.bellBadge}>
          <Text style={styles.bellBadgeText}>{unread > 9 ? '9+' : unread}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function TabLayout() {
  const { isReady, isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }
  if (!isAuthenticated) return <Redirect href="/giris" />;

  return (
    <View style={styles.flex}>
      {/* Marka çubuğu navigator'ın dışında: dört sekmede de aynı yerde durur,
          sekme geçişlerinde kaymaz. */}
      <View style={[styles.brandBar, { paddingTop: insets.top + 8 }]}>
        <Image source={require('../../assets/logo.png')} style={styles.brandLogo} resizeMode="contain" />
        <NotificationBell />
      </View>
      <MaterialTopTabs
        tabBarPosition="bottom"
        screenOptions={({ route }: { route: { name: string } }): MaterialTopTabNavigationOptions => ({
          sceneStyle: { backgroundColor: colors.cream },
          swipeEnabled: true,
          tabBarActiveTintColor: colors.accentDark,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: [styles.tabBar, { paddingBottom: insets.bottom }],
          tabBarItemStyle: styles.tabItem,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIndicatorStyle: styles.indicator,
          tabBarShowIcon: true,
          tabBarIcon: ({ color }: { focused: boolean; color: ColorValue }) =>
            route.name === 'index' ? (
              <Image
                source={require('../../assets/logo.png')}
                style={[styles.logo, { tintColor: color }]}
                resizeMode="contain"
              />
            ) : (
              <Text style={[styles.icon, { color }]}>{icons[route.name]}</Text>
            ),
        })}
      >
        <MaterialTopTabs.Screen name="index" options={{ title: 'Ana Sayfa' }} />
        <MaterialTopTabs.Screen
          name="randevular"
          options={{ title: 'Randevular', tabBarBadge: () => <UpcomingBadge /> }}
        />
        <MaterialTopTabs.Screen name="randevu-al" options={{ title: 'Randevu Al' }} />
        <MaterialTopTabs.Screen name="profil" options={{ title: 'Profil' }} />
      </MaterialTopTabs>
      <ChatWidget />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  brandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cream,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  bell: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  bellPressed: { backgroundColor: colors.blush },
  bellFallback: { fontSize: 20, lineHeight: 24 },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: { fontFamily: fonts.semibold, fontSize: 10, lineHeight: 12, color: colors.white },
  // Wordmark 1024x217 → 4.72:1; 124 genişlikte 26 yükseklik.
  brandLogo: { width: 124, height: 26 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream },
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabItem: { height: 64, paddingTop: 8, paddingBottom: 8 },
  tabLabel: { fontFamily: fonts.medium, fontSize: 11, textTransform: 'none', marginTop: 2 },
  indicator: { top: 0, height: 2, backgroundColor: colors.accentDark },
  icon: { fontFamily: fonts.semibold, fontSize: 23, lineHeight: 25 },
  // Yeni wordmark 4.72:1 — eski 52×24 kutusu (2.17:1) logoyu sıkıştırıyordu.
  logo: { width: 58, height: 13 },
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    top: -2,
    right: -10,
  },
  badgeText: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 13, color: colors.white },
});
