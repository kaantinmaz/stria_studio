import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Alert, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CodeCard } from '@/components/code-card';
import { Button, Card, ErrorState, LoadingState, PageHeader } from '@/components/ui';
import { api, friendlyError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { colors, fonts, radius, spacing, typography } from '@/lib/theme';

const LEGAL_LINKS = [
  { label: 'Gizlilik Politikası', url: 'https://striastudio.com.tr/gizlilik-politikasi' },
  { label: 'KVKK Aydınlatma Metni', url: 'https://striastudio.com.tr/kvkk' },
  { label: 'Çerez Politikası', url: 'https://striastudio.com.tr/cerez-politikasi' },
  { label: 'İletişim', url: 'https://striastudio.com.tr/iletisim' },
];

export default function ProfileScreen() {
  const { user, refreshMe, signOut } = useAuth();
  const [error, setError] = useState<unknown>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  function confirmDelete() {
    Alert.alert(
      'Hesabını sil',
      'Hesabın kalıcı olarak silinecek. Randevu geçmişin stüdyo kayıtlarında anonim olarak saklanır. Devam edilsin mi?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Devam', onPress: confirmDeleteFinal },
      ],
    );
  }

  function confirmDeleteFinal() {
    Alert.alert(
      'Emin misin?',
      'Bu işlem GERİ ALINAMAZ. Hesabını silmek istediğine emin misin?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Hesabımı Sil', style: 'destructive', onPress: () => void deleteAccount() },
      ],
    );
  }

  async function deleteAccount() {
    setDeleting(true);
    try {
      await api.deleteAccount();
    } catch (caught) {
      Alert.alert('Bir sorun oluştu', friendlyError(caught));
      setDeleting(false);
      return;
    }
    // Hesap ve token'lar sunucuda silindi; oturum temizliğinde logout 401'i yut.
    try {
      await signOut();
    } catch {
      // yok sayılır
    }
    router.replace('/giris');
    setDeleting(false);
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

        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Yasal</Text>
          {LEGAL_LINKS.map((item, index) => (
            <View key={item.url}>
              {index > 0 ? <View style={styles.line} /> : null}
              <LegalRow label={item.label} url={item.url} />
            </View>
          ))}
        </Card>

        <Button title="Çıkış Yap" variant="secondary" loading={loggingOut} onPress={logout} />
        <Button
          title="Hesabımı Sil"
          variant="danger"
          loading={deleting}
          disabled={deleting}
          onPress={confirmDelete}
        />
        <Text style={styles.version}>v1.0.0</Text>
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

function LegalRow({ label, url }: { label: string; url: string }) {
  return (
    <Pressable style={styles.legalRow} onPress={() => void Linking.openURL(url)}>
      <Text style={styles.legalLabel}>{label}</Text>
      <Text style={styles.legalArrow}>↗</Text>
    </Pressable>
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
  sectionTitle: { fontFamily: fonts.semibold, fontSize: 17, color: colors.ink, marginBottom: spacing.xs },
  legalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xs },
  legalLabel: { fontFamily: fonts.medium, fontSize: 16, color: colors.ink },
  legalArrow: { fontFamily: fonts.medium, fontSize: 16, color: colors.accent },
  version: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, textAlign: 'center', marginTop: spacing.xs },
  linkCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, shadowOpacity: 0 },
  linkedCard: { backgroundColor: colors.greenBg, borderColor: '#c9e2d3' },
  unlinkedCard: { backgroundColor: colors.blush },
  statusDot: { width: 12, height: 12, borderRadius: radius.pill, marginTop: 6 },
  linkedDot: { backgroundColor: colors.green },
  unlinkedDot: { backgroundColor: colors.accent },
  statusTitle: { fontFamily: fonts.semibold, fontSize: 17, color: colors.ink },
  statusDescription: { ...typography.body, color: colors.muted, marginTop: 2 },
});
