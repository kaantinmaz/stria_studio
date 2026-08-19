import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '@/components/ui';
import { api, fieldError, friendlyError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { colors, fonts, radius, spacing, typography } from '@/lib/theme';

export default function QrRegisterScreen() {
  const { saveSession } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  // Aynı kare peş peşe onlarca kez tetiklenir; ilk okumadan sonra kilitleriz.
  const lockRef = useRef(false);

  async function handleScanned(token: string) {
    if (lockRef.current) return;
    lockRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const session = await api.pair(token);
      await saveSession(session);
      router.replace('/(tabs)');
    } catch (caught) {
      setError(caught);
      setLoading(false);
    }
  }

  function retry() {
    setError(null);
    lockRef.current = false;
  }

  const tokenError = fieldError(error, 'token');

  // İzin durumu henüz belli değil.
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // İzin hiç istenmemiş.
  if (!permission.granted) {
    const denied = !permission.canAskAgain;
    return (
      <View style={styles.gate}>
        <Card style={styles.gateCard}>
          <Text style={styles.gateTitle}>Kamera izni gerekli</Text>
          <Text style={styles.gateText}>
            {denied
              ? 'Kamera izni kapalı. QR kodunu okutabilmek için ayarlardan kamera erişimine izin ver.'
              : 'QR kodunu okutup hesabını açabilmemiz için kameranı kullanmamıza izin ver.'}
          </Text>
          <Button
            title={denied ? 'Ayarları aç' : 'Kamerayı aç'}
            onPress={() => (denied ? void Linking.openSettings() : void requestPermission())}
          />
          <Button title="Vazgeç" variant="ghost" onPress={() => router.back()} />
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={loading ? undefined : ({ data }) => void handleScanned(data)}
      />

      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <Text style={styles.hint}>Stüdyodaki ekranda açılan kareyi telefonuna göster.</Text>
        </View>

        <View style={styles.frameWrap}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        </View>

        <View style={styles.bottomBar}>
          {loading ? (
            <View style={styles.status}>
              <ActivityIndicator color={colors.white} />
              <Text style={styles.statusText}>Hesabın hazırlanıyor…</Text>
            </View>
          ) : error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{tokenError ?? friendlyError(error)}</Text>
              <Button title="Tekrar dene" onPress={retry} />
            </View>
          ) : null}
          <Button title="Vazgeç" variant="ghost" onPress={() => router.back()} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.ink },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream },
  gate: { flex: 1, justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.cream },
  gateCard: { gap: spacing.md, width: '100%', maxWidth: 460, alignSelf: 'center' },
  gateTitle: { ...typography.heading, textAlign: 'center' },
  gateText: { ...typography.body, color: colors.muted, textAlign: 'center' },
  overlay: { flex: 1, justifyContent: 'space-between', paddingVertical: spacing.xxl },
  topBar: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  hint: {
    ...typography.body,
    color: colors.white,
    textAlign: 'center',
    backgroundColor: 'rgba(76,19,19,0.55)',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
  },
  frameWrap: { alignItems: 'center', justifyContent: 'center' },
  frame: { width: 250, height: 250 },
  corner: { position: 'absolute', width: 44, height: 44, borderColor: colors.white },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: radius.md },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: radius.md },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: radius.md },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: radius.md },
  bottomBar: { paddingHorizontal: spacing.lg, gap: spacing.md },
  status: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  statusText: { fontFamily: fonts.medium, fontSize: 16, color: colors.white },
  errorBox: {
    gap: spacing.sm,
    backgroundColor: 'rgba(253,246,245,0.96)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: { fontFamily: fonts.regular, fontSize: 15, color: colors.danger, textAlign: 'center' },
});
