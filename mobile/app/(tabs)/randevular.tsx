import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Alert, FlatList, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/ui';
import { PhotoViewer } from '@/components/photo-viewer';
import { api, friendlyError } from '@/lib/api';
import { appointmentDate, formatPrice } from '@/lib/format';
import { colors, fonts, radius, spacing, typography } from '@/lib/theme';
import { countUpcoming, setUpcomingCount } from '@/lib/upcoming-store';
import type { Appointment, AppointmentStatus } from '@/lib/types';

const statusLabels: Record<AppointmentStatus, string> = {
  requested: 'Talep Edildi',
  confirmed: 'Onaylandı',
  cancelled: 'İptal',
  no_show: 'Gelmedi',
};

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (asRefresh = false) => {
    if (asRefresh) setRefreshing(true);
    setError(null);
    try {
      const data = await api.appointments();
      setAppointments(data);
      setUpcomingCount(countUpcoming(data));
    } catch (caught) {
      setError(caught);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (!appointments && !error) return <LoadingState label="Randevuların yükleniyor…" />;
  if (error) {
    return (
      <View style={styles.errorScreen}>
        <PageHeader title="Randevular" description="Tüm randevu ve taleplerin." />
        <ErrorState message={friendlyError(error)} onRetry={() => void load()} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={appointments}
      keyExtractor={(item: Appointment) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.accent} />}
      ListHeaderComponent={<PageHeader title="Randevular" description="Tüm randevu ve taleplerin." />}
      ListEmptyComponent={
        <EmptyState
          title="Henüz randevun yok"
          description="Sana uygun günü ve saati birlikte seçelim."
          action={<Button title="Randevu Al" onPress={() => router.push('/(tabs)/randevu-al')} />}
        />
      }
      renderItem={({ item }: { item: Appointment }) => <AppointmentCard appointment={item} onCancelled={() => void load()} />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

function AppointmentCard({ appointment, onCancelled }: { appointment: Appointment; onCancelled: () => void }) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const hasPhotos = appointment.photos.length > 0;
  const canCancel =
    (appointment.status === 'requested' || appointment.status === 'confirmed') &&
    new Date(appointment.starts_at).getTime() - Date.now() > 12 * 3600 * 1000;

  const confirmCancel = () => {
    Alert.alert('Randevu iptal edilecek. Emin misin?', undefined, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'İptal',
        style: 'destructive',
        onPress: () => {
          setCancelling(true);
          api
            .cancelAppointment(appointment.id)
            .then(() => onCancelled())
            .catch((caught) => Alert.alert('Hata', friendlyError(caught)))
            .finally(() => setCancelling(false));
        },
      },
    ]);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.flex}>
          <Text style={styles.service}>{appointment.service_name ?? 'Hizmet seçimi'}</Text>
          <Text style={styles.date}>{appointmentDate(appointment.starts_at)}</Text>
        </View>
        <View style={[styles.pill, styles[`${appointment.status}Pill`]]}>
          <Text style={[styles.pillText, styles[`${appointment.status}Text`]]}>{statusLabels[appointment.status]}</Text>
        </View>
      </View>
      <Text style={styles.duration}>{appointment.duration_min} dakika</Text>
      {hasPhotos ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbStrip}>
          {appointment.photos.map((photo, index) => (
            <Pressable
              key={`${photo}-${index}`}
              accessibilityLabel="Randevu fotoğrafı"
              onPress={() => setViewerIndex(index)}
            >
              <Image source={{ uri: photo }} style={styles.thumb} resizeMode="cover" />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      {hasPhotos ? (
        <PhotoViewer
          photos={appointment.photos}
          index={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      ) : null}
      {canCancel ? (
        <Pressable onPress={confirmCancel} disabled={cancelling} accessibilityRole="button" style={styles.cancelButton}>
          <Text style={styles.cancelText}>{cancelling ? 'İptal ediliyor…' : 'Gelemeyeceğim'}</Text>
        </Pressable>
      ) : null}
      {appointment.campaign ? (
        <Text style={styles.campaignRow}>
          🏷 {appointment.campaign.title}
          {appointment.campaign.new_price ? ` — ${formatPrice(appointment.campaign.new_price)}` : ''}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  errorScreen: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, backgroundColor: colors.cream },
  content: { flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  separator: { height: spacing.md },
  card: { gap: spacing.sm },
  cardTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  flex: { flex: 1 },
  service: typography.heading,
  date: { ...typography.body, color: colors.muted, marginTop: 4, textTransform: 'capitalize' },
  duration: { ...typography.caption },
  pill: { borderRadius: radius.pill, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  pillText: { fontFamily: fonts.semibold, fontSize: 12 },
  requestedPill: { backgroundColor: colors.amberBg },
  requestedText: { color: colors.amber },
  confirmedPill: { backgroundColor: colors.greenBg },
  confirmedText: { color: colors.green },
  cancelledPill: { backgroundColor: colors.grayBg },
  cancelledText: { color: colors.gray },
  no_showPill: { backgroundColor: colors.dangerBg },
  no_showText: { color: colors.danger },
  thumbStrip: { gap: spacing.sm, paddingTop: spacing.xs },
  thumb: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: colors.line },
  cancelButton: { alignSelf: 'flex-start', paddingVertical: spacing.xs },
  campaignRow: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.accent },
  cancelText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.danger },
});
