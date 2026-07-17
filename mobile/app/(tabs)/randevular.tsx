import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Button, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '@/components/ui';
import { api, friendlyError } from '@/lib/api';
import { appointmentDate } from '@/lib/format';
import { colors, fonts, radius, spacing, typography } from '@/lib/theme';
import type { Appointment, AppointmentStatus } from '@/lib/types';

const statusLabels: Record<AppointmentStatus, string> = {
  requested: 'Talep Edildi',
  confirmed: 'Onaylandı',
  cancelled: 'İptal',
};

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (asRefresh = false) => {
    if (asRefresh) setRefreshing(true);
    setError(null);
    try {
      setAppointments(await api.appointments());
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
      renderItem={({ item }: { item: Appointment }) => <AppointmentCard appointment={item} />}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
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
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  errorScreen: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: 56, backgroundColor: colors.cream },
  content: { flexGrow: 1, width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.xxl },
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
});
