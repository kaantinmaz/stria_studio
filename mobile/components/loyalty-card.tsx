import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/lib/theme';
import type { Loyalty } from '@/lib/types';

export function LoyaltyCard({ loyalty }: { loyalty: Loyalty }) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.eyebrow}>STRIA SADAKAT KARTI</Text>
          <Text style={styles.title}>{loyalty.campaign_title}</Text>
        </View>
        <Text style={styles.star}>✦</Text>
      </View>

      <View style={styles.stamps}>
        {Array.from({ length: loyalty.nth }, (_, index) => {
          const filled = index < loyalty.progress;
          return (
            <View key={index} style={[styles.stamp, filled && styles.stampFilled]}>
              <Text style={[styles.stampText, filled && styles.stampTextFilled]}>{filled ? '✦' : index + 1}</Text>
            </View>
          );
        })}
      </View>

      {loyalty.reward_next ? (
        <View style={styles.rewardBanner}>
          <Text style={styles.rewardText}>Bir sonraki işlemin %{loyalty.discount_percent} indirimli! 🎉</Text>
        </View>
      ) : (
        <Text style={styles.remaining}>
          {loyalty.remaining} işlem kaldı <Text style={styles.arrow}>→</Text> %{loyalty.discount_percent} indirim
        </Text>
      )}
      <Text style={styles.completed}>{loyalty.completed_count} işlemin tamamlandı</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.pink,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.rose,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: colors.accentDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 4,
  },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  titleWrap: { flex: 1, gap: 3 },
  eyebrow: { fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.6, color: colors.accentDark },
  title: { fontFamily: fonts.semibold, fontSize: 23, color: colors.ink },
  star: { fontFamily: fonts.regular, fontSize: 30, color: colors.accentDark },
  stamps: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stamp: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.rose,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampFilled: { backgroundColor: colors.rose, borderStyle: 'solid' },
  stampText: { fontFamily: fonts.medium, color: colors.accentDark, fontSize: 14 },
  stampTextFilled: { color: colors.white, fontSize: 23 },
  remaining: { fontFamily: fonts.semibold, fontSize: 17, color: colors.ink },
  arrow: { color: colors.accentDark },
  rewardBanner: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md },
  rewardText: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 24, color: colors.accentDark },
  completed: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
});
