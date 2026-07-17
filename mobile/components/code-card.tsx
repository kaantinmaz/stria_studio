import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, fonts, radius, spacing } from '@/lib/theme';

export function CodeCard({ code, compact = false }: { code: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      <Text selectable style={[styles.code, compact && styles.compactCode]}>
        {code}
      </Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Müşteri kodunu kopyala" onPress={copyCode} style={styles.copyButton}>
        <Text style={styles.copyText}>{copied ? 'Kopyalandı ✓' : 'Kopyala'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accent,
  },
  compact: { paddingVertical: spacing.sm },
  code: { flex: 1, fontFamily: fonts.semibold, fontSize: 27, letterSpacing: 2, color: colors.ink },
  compactCode: { fontSize: 21 },
  copyButton: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  copyText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.accentDark },
});
