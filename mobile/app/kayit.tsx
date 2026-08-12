import { useState } from 'react';
import { Link, router } from 'expo-router';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Field } from '@/components/ui';
import { ApiError, api, fieldError, friendlyError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { colors, fonts, spacing, typography } from '@/lib/theme';

export default function RegisterScreen() {
  const { saveSession } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function submit() {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Adını ve soyadını yazmalısın.';
    else if (name.trim().length > 120) nextErrors.name = 'Ad soyad en fazla 120 karakter olabilir.';
    if (!email.trim()) nextErrors.email = 'E-posta adresini yazmalısın.';
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = 'Geçerli bir e-posta adresi yazmalısın.';
    else if (email.trim().length > 160) nextErrors.email = 'E-posta en fazla 160 karakter olabilir.';
    if (password.length < 8) nextErrors.password = 'Şifren en az 8 karakter olmalı.';
    if (phone.trim().length > 40) nextErrors.phone = 'Telefon en fazla 40 karakter olabilir.';
    setLocalErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    setError(null);
    try {
      const session = await api.register({
        name: name.trim(),
        email: email.trim(),
        password,
        ...(phone.trim() ? { phone: phone.trim() } : {}),
      });
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
          <Text style={styles.title}>Aramıza hoş geldin</Text>
          <Text style={styles.subtitle}>Birkaç bilgiyle hesabını oluşturalım.</Text>
        </View>

        <Card style={styles.form}>
          <Field
            label="Ad Soyad"
            placeholder="Ayşe Yılmaz"
            value={name}
            onChangeText={setName}
            maxLength={120}
            autoCapitalize="words"
            autoComplete="name"
            error={localErrors.name ?? fieldError(error, 'name')}
          />
          <Field
            label="E-posta"
            placeholder="ornek@email.com"
            value={email}
            onChangeText={setEmail}
            maxLength={160}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            error={localErrors.email ?? fieldError(error, 'email')}
          />
          <Field
            label="Şifre"
            placeholder="En az 8 karakter"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            error={localErrors.password ?? fieldError(error, 'password')}
          />
          <Field
            label="Telefon (opsiyonel)"
            placeholder="05xx xxx xx xx"
            value={phone}
            onChangeText={setPhone}
            maxLength={40}
            keyboardType="phone-pad"
            autoComplete="tel"
            error={localErrors.phone ?? fieldError(error, 'phone')}
          />
          {error && (!(error instanceof ApiError) || !Object.keys(error.errors).length) ? (
            <Text style={styles.formError}>{friendlyError(error)}</Text>
          ) : null}
          <Button title="Hesap Oluştur" loading={loading} onPress={submit} />
        </Card>

        <Text style={styles.switchText}>
          Zaten hesabın var mı? <Link href="/giris" style={styles.link}>Giriş yap</Link>
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
  subtitle: { ...typography.body, color: colors.muted, textAlign: 'center' },
  form: { gap: spacing.md, width: '100%', maxWidth: 460, alignSelf: 'center' },
  formError: { fontFamily: fonts.regular, color: colors.danger, textAlign: 'center' },
  switchText: { ...typography.body, color: colors.muted, textAlign: 'center' },
  link: { fontFamily: fonts.semibold, color: colors.accentDark },
});
