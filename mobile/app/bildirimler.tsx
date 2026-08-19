import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { api, friendlyError } from '@/lib/api';
import { setUnreadNotifications } from '@/lib/notification-store';
import { colors, fonts, radius, spacing, typography } from '@/lib/theme';
import type { AppNotification } from '@/lib/types';

const KIND_LABEL: Record<AppNotification['kind'], string> = {
  announcement: 'Duyuru',
  campaign: 'Kampanya',
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (asRefresh = false) => {
    if (asRefresh) setRefreshing(true);
    setError(null);
    try {
      const feed = await api.notifications();
      setItems(feed.items);
      // Liste görüldü: rozeti hemen düşür, sunucuya da işaretle.
      setUnreadNotifications(0);
      await api.markNotificationsSeen();
    } catch (caught) {
      setError(caught);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Geri"
          hitSlop={12}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
        >
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text style={styles.topTitle}>Bildirimler</Text>
        <View style={styles.back} />
      </View>

      {!items && !error ? <LoadingState label="Bildirimlerin yükleniyor…" /> : null}
      {error ? <ErrorState message={friendlyError(error)} onRetry={() => void load()} /> : null}

      {items ? (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.accent} />
          }
          ListEmptyComponent={
            <EmptyState
              title="Henüz bildirim yok"
              description="Yeni kampanya ve duyurular burada görünecek."
            />
          }
          renderItem={({ item }) => (
            <Card style={item.is_new ? [styles.item, styles.itemNew] : styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.kind}>{KIND_LABEL[item.kind]}</Text>
                {item.is_new ? <View style={styles.newDot} /> : null}
                <Text style={styles.date}>{formatDate(item.created_at)}</Text>
              </View>
              {item.image ? <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" /> : null}
              <Text style={styles.title}>{item.title}</Text>
              {item.body ? <Text style={styles.body}>{item.body}</Text> : null}
            </Card>
          )}
        />
      ) : null}
    </View>
  );
}

function formatDate(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  backPressed: { backgroundColor: colors.blush },
  backIcon: { fontFamily: fonts.medium, fontSize: 32, lineHeight: 34, color: colors.ink, marginTop: -4 },
  topTitle: { ...typography.heading, color: colors.ink },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  item: { gap: spacing.sm },
  itemNew: { borderColor: colors.blossom, borderWidth: 1 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  kind: { fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.2, color: colors.accentDark },
  newDot: { width: 7, height: 7, borderRadius: radius.pill, backgroundColor: colors.accent },
  date: { ...typography.caption, marginLeft: 'auto' },
  image: { width: '100%', height: 150, borderRadius: radius.sm, backgroundColor: colors.blush },
  title: { fontFamily: fonts.semibold, fontSize: 18, color: colors.ink },
  body: { ...typography.body, color: colors.muted },
});
