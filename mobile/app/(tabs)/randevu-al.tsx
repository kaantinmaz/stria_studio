import { useCallback, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, ErrorState, Field, LoadingState, PageHeader } from '@/components/ui';
import { ApiError, api, fieldError, friendlyError } from '@/lib/api';
import { monthName, shortDay, toDateKey } from '@/lib/format';
import { colors, fonts, radius, spacing, typography } from '@/lib/theme';
import type { Service } from '@/lib/types';

const nextThirtyDays = Array.from({ length: 30 }, (_, index) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + index);
  return date;
});

export default function BookingScreen() {
  const [selectedDate, setSelectedDate] = useState(nextThirtyDays[0]);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [services, setServices] = useState<Service[] | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [slotError, setSlotError] = useState<unknown>(null);
  const [slotReloadKey, setSlotReloadKey] = useState(0);
  const [serviceError, setServiceError] = useState<unknown>(null);
  const [submitError, setSubmitError] = useState<unknown>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const dateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);

  const loadServices = useCallback(async () => {
    setServiceError(null);
    try {
      setServices(await api.services());
    } catch (caught) {
      setServiceError(caught);
    }
  }, []);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  useEffect(() => {
    let active = true;
    setSlots(null);
    setSlotError(null);
    setSelectedTime(null);
    api.slots(dateKey)
      .then((data) => {
        if (active) setSlots(data.slots);
      })
      .catch((caught) => {
        if (active) setSlotError(caught);
      });
    return () => {
      active = false;
    };
  }, [dateKey, slotReloadKey]);

  async function submit() {
    if (!selectedTime || !selectedService) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.createAppointment({
        service_slug: selectedService,
        date: dateKey,
        time: selectedTime,
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      setSuccess(true);
    } catch (caught) {
      setSubmitError(caught);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <View style={styles.successScreen}>
        <Card style={styles.successCard}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Randevu talebin alındı</Text>
          <Text style={styles.successText}>Talebin alındı, onaylanınca burada Onaylandı görünecek</Text>
          <Button title="Randevulara Git" onPress={() => router.replace('/(tabs)/randevular')} />
          <Button
            title="Yeni Talep Oluştur"
            variant="ghost"
            onPress={() => {
              setSuccess(false);
              setSelectedTime(null);
              setSelectedService(null);
              setNote('');
            }}
          />
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.inner}>
        <PageHeader title="Randevu Al" description="Sana uygun günü, saati ve işlemi seç." />

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.step}>1</Text>
            <View style={styles.flex}>
              <Text style={styles.sectionTitle}>Gün seç</Text>
              <Text style={styles.sectionSubtitle}>{monthName(selectedDate)}</Text>
            </View>
          </View>
          <FlatList
            horizontal
            data={nextThirtyDays}
            keyExtractor={toDateKey}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayList}
            renderItem={({ item, index }: { item: Date; index: number }) => {
              const selected = toDateKey(item) === dateKey;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => setSelectedDate(item)}
                  style={[styles.dayChip, selected && styles.dayChipSelected]}
                >
                  <Text style={[styles.dayName, selected && styles.dayTextSelected]}>{index === 0 ? 'Bugün' : shortDay(item)}</Text>
                  <Text style={[styles.dayNumber, selected && styles.dayTextSelected]}>{item.getDate()}</Text>
                </Pressable>
              );
            }}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.step}>2</Text>
            <Text style={styles.sectionTitle}>Saat seç</Text>
          </View>
          {!slots && !slotError ? <LoadingState label="Uygun saatlere bakılıyor…" /> : null}
          {slotError ? <ErrorState message={friendlyError(slotError)} onRetry={() => setSlotReloadKey((key) => key + 1)} /> : null}
          {slots?.length === 0 ? <Card style={styles.emptySlots}><Text style={styles.emptyText}>Bu gün için uygun saat yok</Text></Card> : null}
          {slots?.length ? (
            <View style={styles.chipGrid}>
              {slots.map((slot) => {
                const selected = selectedTime === slot;
                return (
                  <Pressable key={slot} onPress={() => setSelectedTime(slot)} style={[styles.timeChip, selected && styles.choiceSelected]}>
                    <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{slot}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          {fieldError(submitError, 'time') || fieldError(submitError, 'date') ? (
            <Text style={styles.validationText}>{fieldError(submitError, 'time') ?? fieldError(submitError, 'date')}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.step}>3</Text>
            <Text style={styles.sectionTitle}>İşlem seç</Text>
          </View>
          {!services && !serviceError ? <LoadingState label="Hizmetler yükleniyor…" /> : null}
          {serviceError ? <ErrorState message={friendlyError(serviceError)} onRetry={() => void loadServices()} /> : null}
          {services?.map((service) => {
            const selected = selectedService === service.slug;
            return (
              <Pressable
                key={service.slug}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setSelectedService(service.slug)}
                style={[styles.serviceCard, selected && styles.serviceCardSelected]}
              >
                <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>
                <Text style={[styles.serviceName, selected && styles.serviceNameSelected]}>{service.name_tr}</Text>
              </Pressable>
            );
          })}
          {fieldError(submitError, 'service_slug') ? <Text style={styles.validationText}>{fieldError(submitError, 'service_slug')}</Text> : null}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.step}>4</Text>
            <Text style={styles.sectionTitle}>Notun var mı?</Text>
          </View>
          <Field
            label="Not (opsiyonel)"
            placeholder="Bizim bilmemizi istediğin bir şey…"
            value={note}
            onChangeText={setNote}
            maxLength={500}
            multiline
            hint={`${note.length}/500`}
            error={fieldError(submitError, 'note')}
          />
        </View>

        {submitError && (!(submitError instanceof ApiError) || !Object.keys(submitError.errors).length) ? (
          <Card style={styles.submitError}><Text style={styles.validationText}>{friendlyError(submitError)}</Text></Card>
        ) : null}

        <Button
          title="Randevu Talebi Gönder"
          loading={submitting}
          disabled={!selectedTime || !selectedService || note.length > 500}
          onPress={submit}
        />
        <Text style={styles.disclaimer}>Randevun stüdyo tarafından onaylandığında durumunu Randevular bölümünde görebilirsin.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.xxl },
  inner: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: spacing.xl },
  flex: { flex: 1 },
  section: { gap: spacing.md },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  step: { fontFamily: fonts.semibold, fontSize: 14, color: colors.white, backgroundColor: colors.accent, width: 28, height: 28, lineHeight: 28, textAlign: 'center', borderRadius: 14 },
  sectionTitle: typography.heading,
  sectionSubtitle: { ...typography.caption, textTransform: 'capitalize' },
  dayList: { gap: spacing.sm, paddingRight: spacing.lg },
  dayChip: { width: 72, height: 84, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  dayChipSelected: { backgroundColor: colors.rose, borderColor: colors.rose },
  dayName: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted, textTransform: 'capitalize' },
  dayNumber: { fontFamily: fonts.semibold, fontSize: 24, color: colors.ink },
  dayTextSelected: { color: colors.white },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  timeChip: { minWidth: 76, paddingHorizontal: spacing.md, paddingVertical: 12, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center' },
  choiceSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  choiceText: { fontFamily: fonts.medium, fontSize: 15, color: colors.ink },
  choiceTextSelected: { color: colors.white },
  emptySlots: { backgroundColor: colors.blush, shadowOpacity: 0 },
  emptyText: { ...typography.body, color: colors.muted, textAlign: 'center' },
  validationText: { fontFamily: fonts.regular, fontSize: 14, color: colors.danger },
  serviceCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 62, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: spacing.md, backgroundColor: colors.white },
  serviceCardSelected: { borderColor: colors.accent, backgroundColor: colors.blush },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.rose, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.accentDark },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.accentDark },
  serviceName: { flex: 1, fontFamily: fonts.medium, fontSize: 17, color: colors.ink },
  serviceNameSelected: { color: colors.accentDark },
  submitError: { backgroundColor: colors.dangerBg, shadowOpacity: 0 },
  disclaimer: { ...typography.caption, textAlign: 'center', paddingHorizontal: spacing.md },
  successScreen: { flex: 1, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  successCard: { width: '100%', maxWidth: 520, alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  successIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenBg },
  successIconText: { fontFamily: fonts.semibold, fontSize: 34, color: colors.green },
  successTitle: { ...typography.title, fontSize: 27, textAlign: 'center' },
  successText: { ...typography.body, color: colors.muted, textAlign: 'center', marginBottom: spacing.sm },
});
