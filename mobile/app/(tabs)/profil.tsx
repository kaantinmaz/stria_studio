import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CodeCard } from '@/components/code-card';
import { Button, Card, ErrorState, LoadingState, PageHeader } from '@/components/ui';
import { friendlyError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { colors, fonts, radius, spacing, typography } from '@/lib/theme';

export default function ProfileScreen() {
  const { user, refreshMe, signOut } = useAuth();
  const [error, setError] = useState<unknown>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const load = useCallback(async (asRefresh = false) => {
    if (asRefresh) setRefreshing(true);
    setError(null);
    try {
      await refreshMe();
    } catch (caught) {
      setError(caught);
    } finally {
      setRefreshing(false);
    }
  }, [refreshMe]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function logout() {
    setLoggingOut(true);
    try {
      await signOut();
      router.replace('/giris');
    } finally {
      setLoggingOut(false);
    }
  }

  if (!user) return <LoadingState label="Profilin yükleniyor…" />;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.accent} />}
    >
      <View style={styles.inner}>
        <PageHeader title="Profil" description="Bilgilerin ve Stria müşteri kodun." />
        {error ? <ErrorState message={friendlyError(error)} onRetry={() => void load()} /> : null}

        <Card style={styles.codeCard}>
          <Text style={styles.codeEyebrow}>MÜŞTERİ KODUN</Text>
          <Text style={styles.codeDescription}>Stüdyoda bu kodla seni kolayca bulabiliriz.</Text>
          <CodeCard code={user.code} />
        </Card>

        <Card style={styles.detailsCard}>
          <ProfileRow label="Ad Soyad" value={user.name} />
          <View style={styles.line} />
          <ProfileRow label="E-posta" value={user.email} />
          <View style={styles.line} />
          <ProfileRow label="Telefon" value={user.phone || 'Belirtilmedi'} />
        </Card>

        <Card style={[styles.linkCard, user.customer_linked ? styles.linkedCard : styles.unlinkedCard]}>
          <View style={[styles.statusDot, user.customer_linked ? styles.linkedDot : styles.unlinkedDot]} />
          <View style={styles.flex}>
            <Text style={styles.statusTitle}>{user.customer_linked ? 'Stüdyo kaydına bağlı ✓' : 'Henüz bağlanmadı'}</Text>
            <Text style={styles.statusDescription}>
              {user.customer_linked
                ? 'Geçmiş işlemlerin ve sadakat ilerlemen hesabında görünüyor.'
                : 'Müşteri kodunu stüdyoya ilettiğinde geçmişin hesabınla eşleşecek.'}
            </Text>
          </View>
        </Card>

        <Button title="Çıkış Yap" variant="secondary" loading={loggingOut} onPress={logout} />
      </View>
    </ScrollView>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text selectable style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.xxl },
  inner: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: spacing.lg },
  flex: { flex: 1 },
  codeCard: { gap: spacing.sm, backgroundColor: colors.pink },
  codeEyebrow: { fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.4, color: colors.accentDark },
  codeDescription: { ...typography.body, color: colors.muted, marginBottom: spacing.xs },
  detailsCard: { gap: spacing.md },
  row: { gap: 3 },
  rowLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  rowValue: { fontFamily: fonts.medium, fontSize: 17, color: colors.ink },
  line: { height: 1, backgroundColor: colors.line },
  linkCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, shadowOpacity: 0 },
  linkedCard: { backgroundColor: colors.greenBg, borderColor: '#c9e2d3' },
  unlinkedCard: { backgroundColor: colors.blush },
  statusDot: { width: 12, height: 12, borderRadius: radius.pill, marginTop: 6 },
  linkedDot: { backgroundColor: colors.green },
  unlinkedDot: { backgroundColor: colors.accent },
  statusTitle: { fontFamily: fonts.semibold, fontSize: 17, color: colors.ink },
  statusDescription: { ...typography.body, color: colors.muted, marginTop: 2 },
});
