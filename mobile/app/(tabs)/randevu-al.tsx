import { useCallback, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, ErrorState, Field, LoadingState, PageHeader } from '@/components/ui';
import { ApiError, api, fieldError, friendlyError } from '@/lib/api';
import { formatPrice, monthName, shortDay, toDateKey } from '@/lib/format';
import { colors, fonts, radius, spacing, typography } from '@/lib/theme';
import type { Campaign, Service } from '@/lib/types';

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
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
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
    api.campaigns()
      .then((data) => {
        if (active) setCampaigns(data);
      })
      .catch(() => {
        if (active) setCampaigns([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const matchedCampaign = useMemo(() => {
    if (!campaigns || !selectedService) return null;
    const now = Date.now();
    return (
      campaigns.find((campaign) => {
        if (campaign.kind !== 'promo') return false;
        if (campaign.starts_at && new Date(campaign.starts_at).getTime() > now) return false;
        if (campaign.ends_at && new Date(campaign.ends_at).getTime() < now) return false;
        return campaign.service_slugs === null || campaign.service_slugs.includes(selectedService);
      }) ?? null
    );
  }, [campaigns, selectedService]);

  useEffect(() => {
    if (selectedCampaignId !== null && matchedCampaign?.id !== selectedCampaignId) {
      setSelectedCampaignId(null);
    }
  }, [matchedCampaign, selectedCampaignId]);

  const selectedServiceRecord = useMemo(
    () => services?.find((service) => service.slug === selectedService) ?? null,
    [services, selectedService],
  );

  // Süre hizmete göre değiştiği için saatler ancak işlem seçildikten sonra
  // istenebilir: 100 dakikalık işlemde 11:00 kapalı, 30 dakikalıkta açık.
  useEffect(() => {
    if (!selectedService) {
      setSlots(null);
      setSlotError(null);
      setSelectedTime(null);

      return;
    }

    let active = true;
    setSlots(null);
    setSlotError(null);
    setSelectedTime(null);
    api.slots(dateKey, selectedService)
      .then((data) => {
        if (active) setSlots(data.slots);
      })
      .catch((caught) => {
        if (active) setSlotError(caught);
      });

    return () => {
      active = false;
    };
  }, [dateKey, selectedService, slotReloadKey]);

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
        ...(selectedCampaignId ? { campaign_id: selectedCampaignId } : {}),
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
              setSelectedCampaignId(null);
            }}
          />
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.inner}>
        <PageHeader title="Randevu Al" description="Önce işlemi, sonra günü ve saati seç." />

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.step}>1</Text>
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
                <View style={styles.flex}>
                  <Text style={[styles.serviceName, selected && styles.serviceNameSelected]}>{service.name_tr}</Text>
                  <Text style={styles.serviceDuration}>≈ {service.duration_min} dk</Text>
                </View>
              </Pressable>
            );
          })}
          {matchedCampaign ? (
            <View style={styles.campaignCard}>
              <Text style={styles.campaignTitle}>🏷 {matchedCampaign.title}</Text>
              {matchedCampaign.new_price ? (
                <View style={styles.campaignPriceRow}>
                  {matchedCampaign.old_price ? (
                    <Text style={styles.campaignOldPrice}>{formatPrice(matchedCampaign.old_price)}</Text>
                  ) : null}
                  <Text style={styles.campaignNewPrice}>{formatPrice(matchedCampaign.new_price)}</Text>
                </View>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: selectedCampaignId === matchedCampaign.id }}
                onPress={() =>
                  setSelectedCampaignId((current) => (current === matchedCampaign.id ? null : matchedCampaign.id))
                }
                style={[styles.campaignToggle, selectedCampaignId === matchedCampaign.id && styles.campaignToggleActive]}
              >
                <Text
                  style={[
                    styles.campaignToggleText,
                    selectedCampaignId === matchedCampaign.id && styles.campaignToggleTextActive,
                  ]}
                >
                  {selectedCampaignId === matchedCampaign.id ? '✓ Kampanya uygulanıyor' : 'Kampanyadan yararlan'}
                </Text>
              </Pressable>
              <Text style={styles.campaignNote}>
                Bugün oluşturduğun için, randevu tarihi kampanya bitişinden sonra olsa bile kampanya fiyatı geçerli olur.
              </Text>
            </View>
          ) : null}
          {fieldError(submitError, 'service_slug') ? <Text style={styles.validationText}>{fieldError(submitError, 'service_slug')}</Text> : null}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.step}>2</Text>
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
            <Text style={styles.step}>3</Text>
            <View style={styles.flex}>
              <Text style={styles.sectionTitle}>Saat seç</Text>
              {selectedServiceRecord ? (
                <Text style={styles.durationHint}>
                  {selectedServiceRecord.name_tr} ≈ {selectedServiceRecord.duration_min} dk sürüyor
                </Text>
              ) : null}
            </View>
          </View>
          {!selectedService ? (
            <Card style={styles.emptySlots}>
              <Text style={styles.emptyText}>Uygun saatleri görmek için önce işlemi seç</Text>
            </Card>
          ) : null}
          {selectedService && !slots && !slotError ? <LoadingState label="Uygun saatlere bakılıyor…" /> : null}
          {slotError ? <ErrorState message={friendlyError(slotError)} onRetry={() => setSlotReloadKey((key) => key + 1)} /> : null}
          {slots?.length === 0 ? <Card style={styles.emptySlots}><Text style={styles.emptyText}>Bu gün için uygun saat yok</Text></Card> : null}
          {slots?.length ? (
            <View style={styles.chipGrid}>
              {slots.map((slot) => {
                const selected = selectedTime === slot;
                return (
                  <Pressable
                    key={slot}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setSelectedTime(slot)}
                    style={[styles.timeChip, selected && styles.choiceSelected]}
                  >
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
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  inner: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: spacing.xl },
  flex: { flex: 1 },
  section: { gap: spacing.md },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  step: { fontFamily: fonts.semibold, fontSize: 14, color: colors.white, backgroundColor: colors.accent, width: 28, height: 28, lineHeight: 28, textAlign: 'center', borderRadius: 14 },
  sectionTitle: typography.heading,
  sectionSubtitle: { ...typography.caption, textTransform: 'capitalize' },
  // sectionSubtitle ay adını büyütmek için capitalize; süre metni bozulmasın.
  durationHint: { ...typography.caption },
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
  serviceName: { fontFamily: fonts.medium, fontSize: 17, color: colors.ink },
  serviceDuration: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 1 },
  serviceNameSelected: { color: colors.accentDark },
  campaignCard: { borderWidth: 1, borderColor: colors.accent, backgroundColor: colors.blush, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  campaignTitle: { fontFamily: fonts.semibold, fontSize: 16, color: colors.accentDark },
  campaignPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  campaignOldPrice: { fontFamily: fonts.regular, fontSize: 15, color: colors.muted, textDecorationLine: 'line-through' },
  campaignNewPrice: { fontFamily: fonts.semibold, fontSize: 18, color: colors.accent },
  campaignToggle: { alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.accent, backgroundColor: colors.white },
  campaignToggleActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  campaignToggleText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.accentDark },
  campaignToggleTextActive: { color: colors.white },
  campaignNote: { ...typography.caption, fontSize: 13 },
  submitError: { backgroundColor: colors.dangerBg, shadowOpacity: 0 },
  disclaimer: { ...typography.caption, textAlign: 'center', paddingHorizontal: spacing.md },
  successScreen: { flex: 1, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  successCard: { width: '100%', maxWidth: 520, alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  successIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenBg },
  successIconText: { fontFamily: fonts.semibold, fontSize: 34, color: colors.green },
  successTitle: { ...typography.title, fontSize: 27, textAlign: 'center' },
  successText: { ...typography.body, color: colors.muted, textAlign: 'center', marginBottom: spacing.sm },
});
