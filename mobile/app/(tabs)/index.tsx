import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CodeCard } from '@/components/code-card';
import { LoyaltyCard } from '@/components/loyalty-card';
import { Card, ErrorState, LoadingState, PageHeader } from '@/components/ui';
import { api, friendlyError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { colors, fonts, spacing, typography } from '@/lib/theme';
import type { Campaign } from '@/lib/types';

export default function HomeScreen() {
  const { user, loyalty, refreshMe } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (asRefresh = false) => {
    if (asRefresh) setRefreshing(true);
    setError(null);
    try {
      const [, campaignData] = await Promise.all([refreshMe(), api.campaigns()]);
      setCampaigns(campaignData);
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

  if (!campaigns && !error) return <LoadingState label="Güzelliklerini hazırlıyoruz…" />;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.accent} />}
    >
      <View style={styles.inner}>
        <PageHeader eyebrow="STRIA STUDIO" title={`Merhaba, ${user?.name.split(' ')[0] ?? ''} ✦`} description="Bugün kendin için güzel bir şey yap." />

        {error ? <ErrorState message={friendlyError(error)} onRetry={() => void load()} /> : null}

        {!error && user ? (
          <>
            {loyalty ? <LoyaltyCard loyalty={loyalty} /> : user.customer_linked ? (
              <Card style={styles.softCard}>
                <Text style={styles.softIcon}>✦</Text>
                <View style={styles.flex}>
                  <Text style={styles.cardTitle}>Sadakat yolculuğun burada</Text>
                  <Text style={styles.cardBody}>Aktif bir sadakat kampanyası olduğunda ilerlemeni burada göreceksin.</Text>
                </View>
              </Card>
            ) : null}

            {!user.customer_linked ? (
              <Card style={styles.noticeCard}>
                <Text style={styles.noticeEyebrow}>STÜDYO KAYDINLA EŞLEŞ</Text>
                <Text style={styles.noticeText}>
                  Müşteri kodun: {user.code} — stüdyoya ilettiğinde geçmişin ve kampanyaların burada görünecek
                </Text>
                <CodeCard code={user.code} />
              </Card>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Aktif Kampanyalar</Text>
              {campaigns?.length ? campaigns.map((campaign, index) => (
                <Card key={`${campaign.title}-${index}`} style={styles.campaignCard}>
                  <View style={styles.campaignBadge}>
                    <Text style={styles.campaignPercent}>%{campaign.discount_percent}</Text>
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>{campaign.title}</Text>
                    <Text style={styles.cardBody}>Her {campaign.nth}. işleminde sana özel indirim.</Text>
                  </View>
                </Card>
              )) : (
                <Card style={styles.emptyCampaign}>
                  <Text style={styles.cardBody}>Şu anda aktif kampanya yok. Yenilerini burada paylaşacağız.</Text>
                </Card>
              )}
            </View>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.xxl },
  inner: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: spacing.lg },
  flex: { flex: 1 },
  softCard: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', backgroundColor: colors.blush },
  softIcon: { fontFamily: fonts.regular, fontSize: 28, color: colors.accent },
  cardTitle: { ...typography.heading, fontSize: 18, lineHeight: 23 },
  cardBody: { ...typography.body, color: colors.muted, marginTop: 2 },
  noticeCard: { gap: spacing.md, backgroundColor: colors.white },
  noticeEyebrow: { fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.3, color: colors.accentDark },
  noticeText: { ...typography.body },
  section: { gap: spacing.md, marginTop: spacing.sm },
  sectionTitle: typography.heading,
  campaignCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  campaignBadge: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.pink },
  campaignPercent: { fontFamily: fonts.semibold, fontSize: 18, color: colors.accentDark },
  emptyCampaign: { backgroundColor: colors.blush },
});
