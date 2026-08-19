import { useState } from 'react';
import { Link, router } from 'expo-router';
import { Image, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field } from '@/components/ui';
import { ApiError, api, fieldError, friendlyError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { colors, fonts, spacing, typography } from '@/lib/theme';

export default function LoginScreen() {
  const { saveSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function submit() {
    const nextErrors: Record<string, string> = {};
    if (!email.trim()) nextErrors.email = 'E-posta adresini yazmalısın.';
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = 'Geçerli bir e-posta adresi yazmalısın.';
    if (!password) nextErrors.password = 'Şifreni yazmalısın.';
    setLocalErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    setError(null);
    try {
      const session = await api.login(email.trim(), password);
      await saveSession(session);
      router.replace('/(tabs)');
    } catch (caught) {
      setError(caught);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Tekrar hoş geldin</Text>
          <Text style={styles.subtitle}>Randevuların ve sana özel kampanyaların tek bir yerde.</Text>
        </View>

        <Card style={styles.form}>
          <Field
            label="E-posta"
            placeholder="ornek@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            error={localErrors.email ?? fieldError(error, 'email')}
          />
          <Field
            label="Şifre"
            placeholder="Şifren"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            error={localErrors.password ?? fieldError(error, 'password')}
          />
          {error && (!(error instanceof ApiError) || !Object.keys(error.errors).length) ? (
            <Text style={styles.formError}>{friendlyError(error)}</Text>
          ) : null}
          <Button title="Giriş Yap" loading={loading} onPress={submit} />
        </Card>

        <Text style={styles.switchText}>
          İlk kez mi geliyorsun?{' '}
          <Link href="/kayit" style={styles.link}>Hesap oluştur</Link>
        </Text>

        <Text style={styles.legalText}>
          <Text style={styles.link} onPress={() => void Linking.openURL('https://striastudio.com.tr/gizlilik-politikasi')}>Gizlilik Politikası</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, paddingVertical: spacing.xxl, gap: spacing.lg },
  brand: { alignItems: 'center', gap: spacing.xs },
  // Wordmark 4.72:1 — metin "✦ STRIA STUDIO" yerine gerçek logo.
  logo: { width: 176, height: 37 },
  title: { ...typography.title, marginTop: spacing.sm, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.muted, maxWidth: 340, textAlign: 'center' },
  form: { gap: spacing.md, width: '100%', maxWidth: 460, alignSelf: 'center' },
  formError: { fontFamily: fonts.regular, color: colors.danger, textAlign: 'center' },
  switchText: { ...typography.body, color: colors.muted, textAlign: 'center' },
  legalText: { ...typography.caption, textAlign: 'center' },
  link: { fontFamily: fonts.semibold, color: colors.accentDark },
});
