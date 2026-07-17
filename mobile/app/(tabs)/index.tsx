import { useCallback, useEffect, useRef, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { CodeCard } from '@/components/code-card';
import { appointmentDate, formatPrice } from '@/lib/format';
import { LoyaltyCard } from '@/components/loyalty-card';
import { Card, ErrorState, LoadingState, PageHeader } from '@/components/ui';
import { PhotoViewer } from '@/components/photo-viewer';
import { api, friendlyError } from '@/lib/api';
import { countUpcoming, setUpcomingCount } from '@/lib/upcoming-store';
import { useAuth } from '@/lib/auth-context';
import { colors, fonts, radius, shadows, spacing, typography } from '@/lib/theme';
import type { Announcement, Appointment, Campaign, GalleryImage } from '@/lib/types';

const TR_MONTHS_SHORT = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const SLIDE_HEIGHT = 180;
const SLIDE_INTERVAL = 5000;

function pad(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function fmtShort(iso: string): string {
  const [, month, day] = iso.split('-');
  const monthLabel = TR_MONTHS_SHORT[Number(month) - 1] ?? month;
  return `${Number(day)} ${monthLabel}`;
}

function validityLabel(item: { starts_at: string | null; ends_at: string | null }): string | null {
  const today = todayIso();
  const { starts_at, ends_at } = item;
  if (starts_at && ends_at && starts_at === today && ends_at === today) return 'Bugüne özel';
  if (ends_at === today) return 'Son gün';
  if (starts_at && ends_at) return `${fmtShort(starts_at)} – ${fmtShort(ends_at)} arası`;
  if (ends_at) return `${fmtShort(ends_at)}'a kadar`;
  return null;
}

function findUpcoming(appointments: Appointment[]): Appointment | null {
  const now = Date.now();
  return appointments
    .filter(
      (appointment) =>
        (appointment.status === 'requested' || appointment.status === 'confirmed') &&
        new Date(appointment.starts_at).getTime() > now,
    )
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())[0] ?? null;
}

export default function HomeScreen() {
  const { user, loyalty, refreshMe } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [detail, setDetail] = useState<Campaign | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [upcoming, setUpcoming] = useState<Appointment | null>(null);

  const sliderRef = useRef<FlatList<Campaign>>(null);
  const activeSlideRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  const cardWidth = Math.min(Dimensions.get('window').width - spacing.lg * 2, 720 - spacing.lg * 2);

  const allCampaigns = campaigns ?? [];
  const sliderPromos = allCampaigns.filter((campaign) => campaign.kind === 'promo' && !!campaign.image);
  const listCampaigns = allCampaigns.filter(
    (campaign) => campaign.kind === 'loyalty' || (campaign.kind === 'promo' && !campaign.image),
  );

  const loadExtras = useCallback(() => {
    api
      .appointments()
      .then((data) => {
        setUpcoming(findUpcoming(data));
        setUpcomingCount(countUpcoming(data));
      })
      .catch(() => {});
    api
      .announcements()
      .then(setAnnouncements)
      .catch(() => {});
  }, []);

  const load = useCallback(async (asRefresh = false) => {
    if (asRefresh) setRefreshing(true);
    setError(null);
    loadExtras();
    try {
      const [, campaignData] = await Promise.all([refreshMe(), api.campaigns()]);
      setCampaigns(campaignData);
    } catch (caught) {
      setError(caught);
    } finally {
      setRefreshing(false);
    }
  }, [refreshMe, loadExtras]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  useEffect(() => {
    let active = true;
    api
      .gallery()
      .then((images) => {
        if (!active) return;
        setGallery(
          images
            .filter((image) => image.image !== null)
            .sort((a, b) => b.id - a.id)
            .slice(0, 10),
        );
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const slideCount = sliderPromos.length;

  const startAutoScroll = useCallback(() => {
    clearInterval(intervalRef.current ?? undefined);
    if (slideCount < 2) return;
    intervalRef.current = setInterval(() => {
      const next = (activeSlideRef.current + 1) % slideCount;
      sliderRef.current?.scrollToIndex({ index: next, animated: true });
    }, SLIDE_INTERVAL);
  }, [slideCount]);

  useEffect(() => {
    startAutoScroll();
    return () => {
      clearInterval(intervalRef.current ?? undefined);
    };
  }, [startAutoScroll]);

  const onSlideMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
    activeSlideRef.current = index;
    setActiveSlide(index);
  };

  if (!campaigns && !error) return <LoadingState label="Güzelliklerini hazırlıyoruz…" />;

  const galleryPhotos = gallery
    .map((image) => image.image)
    .filter((uri): uri is string => uri !== null);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.accent} />}
    >
      <View style={styles.inner}>
        {upcoming ? (
          <Pressable
            style={styles.upcomingCard}
            accessibilityLabel="Yaklaşan randevun"
            onPress={() => router.push('/randevular')}
          >
            <View style={styles.upcomingBar} />
            <Text style={styles.upcomingIcon}>◷</Text>
            <View style={styles.flex}>
              <Text style={styles.upcomingLabel}>Yaklaşan randevun</Text>
              <Text style={styles.upcomingDate}>{appointmentDate(upcoming.starts_at)}</Text>
              {upcoming.service_name ? (
                <Text style={styles.upcomingService}>{upcoming.service_name}</Text>
              ) : null}
            </View>
            <View style={upcoming.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending}>
              <Text style={upcoming.status === 'confirmed' ? styles.statusConfirmedText : styles.statusPendingText}>
                {upcoming.status === 'confirmed' ? 'Onaylandı' : 'Onay bekliyor'}
              </Text>
            </View>
          </Pressable>
        ) : null}

        {sliderPromos.length ? (
          <View style={styles.slider}>
            <FlatList
              ref={sliderRef}
              data={sliderPromos}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => `slide-${item.id}`}
              getItemLayout={(_, index) => ({ length: cardWidth, offset: cardWidth * index, index })}
              onScrollBeginDrag={startAutoScroll}
              onMomentumScrollEnd={onSlideMomentumEnd}
              onScrollToIndexFailed={() => {}}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.slide, { width: cardWidth }]}
                  accessibilityLabel={item.title}
                  onPress={() => setDetail(item)}
                >
                  <Image source={{ uri: item.image ?? undefined }} style={styles.slideImage} resizeMode="cover" />
                  <View style={styles.slideOverlay}>
                    <Text style={styles.slideTitle} numberOfLines={2}>{item.title}</Text>
                    {item.new_price ? (
                      <View style={styles.slidePriceRow}>
                        {item.old_price ? <Text style={styles.slideOldPrice}>{formatPrice(item.old_price)}</Text> : null}
                        <Text style={styles.slideNewPrice}>{formatPrice(item.new_price)}</Text>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              )}
            />
            {sliderPromos.length > 1 ? (
              <View style={styles.dots}>
                {sliderPromos.map((item, index) => (
                  <View key={`dot-${item.id}`} style={[styles.dot, index === activeSlide && styles.dotActive]} />
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

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

            {announcements.length ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Duyurular</Text>
                {announcements.map((announcement) => {
                  const validity = validityLabel(announcement);
                  return (
                    <Card key={`announcement-${announcement.id}`} style={styles.announcementCard}>
                      <Text style={styles.cardTitle}>{announcement.title}</Text>
                      <Text style={styles.cardBody}>{announcement.body}</Text>
                      {validity ? <Text style={styles.validity}>{validity}</Text> : null}
                    </Card>
                  );
                })}
              </View>
            ) : null}

            {listCampaigns.length ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Aktif Kampanyalar</Text>
                {listCampaigns.map((campaign) => {
                  const validity = validityLabel(campaign);
                  return (
                    <Card key={`campaign-${campaign.id}`} style={styles.campaignCard}>
                      {campaign.kind === 'promo' ? (
                        campaign.new_price ? (
                          <View style={styles.priceBadge}>
                            {campaign.old_price ? <Text style={styles.cardOldPrice}>{formatPrice(campaign.old_price)}</Text> : null}
                            <Text style={styles.cardNewPrice}>{formatPrice(campaign.new_price)}</Text>
                          </View>
                        ) : (
                          <View style={styles.campaignBadge}>
                            <Text style={styles.dealBadgeText}>Fırsat</Text>
                          </View>
                        )
                      ) : (
                        <View style={styles.campaignBadge}>
                          <Text style={styles.campaignPercent}>%{campaign.discount_percent ?? 0}</Text>
                        </View>
                      )}
                      <View style={styles.flex}>
                        <Text style={styles.cardTitle}>{campaign.title}</Text>
                        <Text style={styles.cardBody}>
                          {campaign.kind === 'promo'
                            ? campaign.description ?? 'Sana özel fırsat.'
                            : campaign.nth
                              ? `Her ${campaign.nth}. işleminde sana özel indirim.`
                              : 'Sana özel sadakat kampanyası.'}
                        </Text>
                        {validity ? <Text style={styles.validity}>{validity}</Text> : null}
                      </View>
                    </Card>
                  );
                })}
              </View>
            ) : !allCampaigns.length ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Aktif Kampanyalar</Text>
                <Card style={styles.emptyCampaign}>
                  <Text style={styles.cardBody}>Şu anda aktif kampanya yok. Yenilerini burada paylaşacağız.</Text>
                </Card>
              </View>
            ) : null}

            {galleryPhotos.length ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Son Çalışmalar</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryStrip}>
                  {galleryPhotos.map((uri, index) => (
                    <Pressable key={`${uri}-${index}`} accessibilityLabel="Galeri fotoğrafı" onPress={() => setViewerIndex(index)}>
                      <Image source={{ uri }} style={styles.galleryThumb} resizeMode="cover" />
                    </Pressable>
                  ))}
                </ScrollView>
                <PhotoViewer photos={galleryPhotos} index={viewerIndex} onClose={() => setViewerIndex(null)} />
              </View>
            ) : null}
          </>
        ) : null}
      </View>

      <Modal visible={detail !== null} transparent animationType="fade" onRequestClose={() => setDetail(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {detail?.image ? <Image source={{ uri: detail.image }} style={styles.modalImage} resizeMode="cover" /> : null}
            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>{detail?.title}</Text>
              {detail?.description ? <Text style={styles.modalDesc}>{detail.description}</Text> : null}
              {detail?.new_price ? (
                <View style={styles.modalPriceRow}>
                  {detail.old_price ? <Text style={styles.modalOldPrice}>{formatPrice(detail.old_price)}</Text> : null}
                  <Text style={styles.modalNewPrice}>{formatPrice(detail.new_price)}</Text>
                </View>
              ) : null}
              {detail && validityLabel(detail) ? <Text style={styles.modalValidity}>{validityLabel(detail)}</Text> : null}
              <Pressable style={styles.modalClose} accessibilityLabel="Kapat" onPress={() => setDetail(null)}>
                <Text style={styles.modalCloseText}>Kapat</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.xxl },
  inner: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: spacing.lg },
  flex: { flex: 1 },
  slider: { gap: spacing.sm },
  slide: { height: SLIDE_HEIGHT, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.line },
  slideImage: { width: '100%', height: '100%' },
  slideOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.md, paddingVertical: spacing.md, backgroundColor: 'rgba(0,0,0,0.42)', gap: spacing.xs },
  slideTitle: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 23, color: colors.white },
  slidePriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  slideOldPrice: { fontFamily: fonts.regular, fontSize: 14, color: 'rgba(255,255,255,0.75)', textDecorationLine: 'line-through' },
  slideNewPrice: { fontFamily: fonts.semibold, fontSize: 18, color: colors.white },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
  dot: { width: 7, height: 7, borderRadius: radius.pill, backgroundColor: colors.line },
  dotActive: { backgroundColor: colors.accent },
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
  dealBadgeText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.accentDark },
  priceBadge: { minWidth: 64, paddingHorizontal: spacing.sm, alignItems: 'center', justifyContent: 'center' },
  cardOldPrice: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, textDecorationLine: 'line-through' },
  cardNewPrice: { fontFamily: fonts.semibold, fontSize: 20, color: colors.accentDark },
  validity: { ...typography.caption, marginTop: spacing.xs, color: colors.accentDark },
  emptyCampaign: { backgroundColor: colors.blush },
  upcomingCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.white, borderRadius: radius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.md, overflow: 'hidden', ...shadows.soft },
  upcomingBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: colors.accent },
  upcomingIcon: { fontFamily: fonts.regular, fontSize: 26, color: colors.accent, marginLeft: spacing.xs },
  upcomingLabel: { fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.1, color: colors.accentDark },
  upcomingDate: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink, marginTop: 2 },
  upcomingService: { ...typography.caption, marginTop: 2 },
  statusPending: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.pill, backgroundColor: colors.amberBg },
  statusPendingText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.amber },
  statusConfirmed: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.pill, backgroundColor: colors.greenBg },
  statusConfirmedText: { fontFamily: fonts.semibold, fontSize: 12, color: colors.green },
  announcementCard: { gap: spacing.xs, backgroundColor: colors.blush },
  galleryStrip: { gap: spacing.sm, paddingTop: spacing.xs },
  galleryThumb: { width: 140, height: 140, borderRadius: radius.md, backgroundColor: colors.line },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', paddingHorizontal: spacing.lg },
  modalCard: { backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden', maxWidth: 480, width: '100%', alignSelf: 'center' },
  modalImage: { width: '100%', height: 200, backgroundColor: colors.line },
  modalBody: { padding: spacing.lg, gap: spacing.sm },
  modalTitle: { ...typography.heading },
  modalDesc: { ...typography.body, color: colors.muted },
  modalPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.md, marginTop: spacing.xs },
  modalOldPrice: { fontFamily: fonts.regular, fontSize: 16, color: colors.muted, textDecorationLine: 'line-through' },
  modalNewPrice: { fontFamily: fonts.semibold, fontSize: 26, color: colors.accentDark },
  modalValidity: { ...typography.caption, color: colors.accentDark },
  modalClose: { marginTop: spacing.sm, alignSelf: 'flex-end', paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: radius.pill, backgroundColor: colors.blush },
  modalCloseText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.accentDark },
});
