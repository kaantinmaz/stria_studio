import { useCallback, useEffect, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Alert, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CodeCard } from '@/components/code-card';
import { Button, Card, ErrorState, Field, LoadingState, PageHeader } from '@/components/ui';
import { ApiError, api, fieldError, friendlyError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { clearChatConsent, getChatConsent } from '@/lib/storage';
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
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileError, setProfileError] = useState<unknown>(null);
  const [profileLocalErrors, setProfileLocalErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [credError, setCredError] = useState<unknown>(null);
  const [credLocalErrors, setCredLocalErrors] = useState<Record<string, string>>({});
  const [savingCreds, setSavingCreds] = useState(false);
  const [credSaved, setCredSaved] = useState(false);
  const hasPassword = user?.has_password ?? false;
  const [chatConsent, setChatConsent] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    void getChatConsent().then((granted) => {
      if (active) setChatConsent(granted);
    });
    return () => {
      active = false;
    };
  }, []);

  async function revokeChatConsent() {
    await clearChatConsent();
    setChatConsent(false);
  }

  // Sadece oturum değiştiğinde doldur: her refreshMe'de yazmak kullanıcının
  // o an düzenlediği alanı ezerdi.
  const userId = user?.id;
  useEffect(() => {
    setName(user?.name ?? '');
    setPhone(user?.phone ?? '');
    setEmail(user?.email ?? '');
    setPassword('');
    setCurrentPassword('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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

  async function saveProfile() {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Adını ve soyadını yazmalısın.';
    else if (name.trim().length > 120) nextErrors.name = 'Ad soyad en fazla 120 karakter olabilir.';
    if (phone.trim().length > 40) nextErrors.phone = 'Telefon en fazla 40 karakter olabilir.';
    setProfileLocalErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSavingProfile(true);
    setProfileError(null);
    try {
      await api.updateProfile({ name: name.trim(), phone: phone.trim() });
      await refreshMe();
      setProfileSaved(true);
    } catch (caught) {
      setProfileError(caught);
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveCredentials() {
    const nextErrors: Record<string, string> = {};
    if (!email.trim()) nextErrors.email = 'E-posta adresini yazmalısın.';
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = 'Geçerli bir e-posta adresi yazmalısın.';
    else if (email.trim().length > 160) nextErrors.email = 'E-posta en fazla 160 karakter olabilir.';
    if (!hasPassword && password.length < 8) nextErrors.password = 'Şifren en az 8 karakter olmalı.';
    if (hasPassword && password.length > 0 && password.length < 8) {
      nextErrors.password = 'Şifren en az 8 karakter olmalı.';
    }
    if (hasPassword && !currentPassword) nextErrors.current_password = 'Mevcut şifreni yazmalısın.';
    setCredLocalErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSavingCreds(true);
    setCredError(null);
    try {
      await api.setCredentials({
        email: email.trim(),
        password: password || undefined,
        currentPassword: currentPassword || undefined,
      });
      await refreshMe();
      setPassword('');
      setCurrentPassword('');
      setCredSaved(true);
    } catch (caught) {
      setCredError(caught);
    } finally {
      setSavingCreds(false);
    }
  }

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
          <Text style={styles.sectionTitle}>Bilgilerim</Text>
          <Field
            label="Ad Soyad"
            placeholder="Ayşe Yılmaz"
            value={name}
            onChangeText={(value) => {
              setName(value);
              setProfileSaved(false);
            }}
            maxLength={120}
            autoCapitalize="words"
            autoComplete="name"
            error={profileLocalErrors.name ?? fieldError(profileError, 'name')}
          />
          <Field
            label="Telefon"
            placeholder="05xx xxx xx xx"
            value={phone}
            onChangeText={(value) => {
              setPhone(value);
              setProfileSaved(false);
            }}
            maxLength={40}
            keyboardType="phone-pad"
            autoComplete="tel"
            error={profileLocalErrors.phone ?? fieldError(profileError, 'phone')}
          />
          {profileError && (!(profileError instanceof ApiError) || !Object.keys(profileError.errors).length) ? (
            <Text style={styles.credFormError}>{friendlyError(profileError)}</Text>
          ) : null}
          {profileSaved ? <Text style={styles.savedText}>Bilgilerin güncellendi ✓</Text> : null}
          <Button title="Bilgilerimi kaydet" loading={savingProfile} onPress={saveProfile} />
        </Card>

        <Card style={styles.credCard}>
          <Text style={styles.sectionTitle}>{hasPassword ? 'E-posta ve şifre' : 'Hesabını güvene al'}</Text>
          <Text style={styles.credDescription}>
            {hasPassword
              ? 'E-postanı değiştirebilir ya da yeni bir şifre belirleyebilirsin. Güvenlik için mevcut şifren gerekiyor.'
              : 'E-posta ve şifre belirlersen telefonunu değiştirsen bile hesabına girebilirsin.'}
          </Text>
          <Field
            label="E-posta"
            placeholder="ornek@email.com"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setCredSaved(false);
            }}
            maxLength={160}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            error={credLocalErrors.email ?? fieldError(credError, 'email')}
          />
          <Field
            label={hasPassword ? 'Yeni şifre (değiştirmek istemiyorsan boş bırak)' : 'Şifre'}
            placeholder="En az 8 karakter"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setCredSaved(false);
            }}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            error={credLocalErrors.password ?? fieldError(credError, 'password')}
          />
          {hasPassword ? (
            <Field
              label="Mevcut şifren"
              placeholder="Şu anki şifren"
              value={currentPassword}
              onChangeText={(value) => {
                setCurrentPassword(value);
                setCredSaved(false);
              }}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              error={credLocalErrors.current_password ?? fieldError(credError, 'current_password')}
            />
          ) : null}
          {credError && (!(credError instanceof ApiError) || !Object.keys(credError.errors).length) ? (
            <Text style={styles.credFormError}>{friendlyError(credError)}</Text>
          ) : null}
          {credSaved ? <Text style={styles.savedText}>Kaydedildi ✓</Text> : null}
          <Button title="Kaydet" loading={savingCreds} onPress={saveCredentials} />
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
          <Text style={styles.sectionTitle}>Yapay zekâ sohbeti</Text>
          <Text style={styles.statusDescription}>
            Sohbeti açtığında adın, müşteri kodun, son randevuların ve sadakat özetin yanıt üretmek için yapay zekâ
            servisine gönderilir.
          </Text>
          {chatConsent ? (
            <Button title="Sohbet onayını geri çek" variant="secondary" onPress={() => void revokeChatConsent()} />
          ) : chatConsent === false ? (
            <Text style={styles.chatConsentNote}>Onay verilmedi. Sohbeti ilk açtığında tekrar sorulacak.</Text>
          ) : null}
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
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  inner: { width: '100%', maxWidth: 720, alignSelf: 'center', gap: spacing.lg },
  flex: { flex: 1 },
  codeCard: { gap: spacing.sm, backgroundColor: colors.pink },
  codeEyebrow: { fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.4, color: colors.accentDark },
  codeDescription: { ...typography.body, color: colors.muted, marginBottom: spacing.xs },
  detailsCard: { gap: spacing.md },
  credCard: { gap: spacing.md, backgroundColor: colors.blush },
  credDescription: { ...typography.body, color: colors.muted, marginTop: -spacing.xs },
  credFormError: { fontFamily: fonts.regular, color: colors.danger, textAlign: 'center' },
  savedText: { fontFamily: fonts.medium, fontSize: 14, color: colors.green, textAlign: 'center' },
  line: { height: 1, backgroundColor: colors.line },
  sectionTitle: { fontFamily: fonts.semibold, fontSize: 17, color: colors.ink, marginBottom: spacing.xs },
  chatConsentNote: { ...typography.caption },
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
