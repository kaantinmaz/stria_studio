import type { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type PressableStateCallbackType,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors, fonts, radius, shadows, spacing, typography } from '@/lib/theme';

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle | ViewStyle[] }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ButtonProps = PressableProps & {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  fullWidth?: boolean;
};

export function Button({ title, loading, variant = 'primary', fullWidth = true, disabled, style, ...props }: ButtonProps) {
  const buttonVariants = {
    primary: styles.primaryButton,
    secondary: styles.secondaryButton,
    ghost: styles.ghostButton,
    danger: styles.dangerButton,
  };
  const textVariants = {
    primary: styles.primaryButtonText,
    secondary: styles.secondaryButtonText,
    ghost: styles.ghostButtonText,
    danger: styles.dangerButtonText,
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={(state: PressableStateCallbackType) => [
        styles.button,
        buttonVariants[variant],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.accentDark} />
      ) : (
        <Text style={[styles.buttonText, textVariants[variant]]}>{title}</Text>
      )}
    </Pressable>
  );
}

type FieldProps = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
};

export function Field({ label, error, hint, style, ...props }: FieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        selectionColor={colors.accent}
        style={[styles.input, props.multiline && styles.multiline, error && styles.inputError, style]}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <View style={styles.header}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

export function LoadingState({ label = 'Yükleniyor…' }: { label?: string }) {
  return (
    <View style={styles.state}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.stateText}>{label}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card style={styles.errorCard}>
      <Text style={styles.errorTitle}>Bir şeyler ters gitti</Text>
      <Text style={styles.stateText}>{message}</Text>
      <Button title="Tekrar Dene" variant="secondary" onPress={onRetry} />
    </Card>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <Card style={styles.emptyCard}>
      <Text style={styles.emptyIcon}>✦</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description ? <Text style={styles.stateText}>{description}</Text> : null}
      {action}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    ...shadows.soft,
  },
  button: {
    minHeight: 52,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: { alignSelf: 'stretch' },
  primaryButton: { backgroundColor: colors.rose },
  secondaryButton: { backgroundColor: colors.blush, borderWidth: 1, borderColor: colors.pink },
  ghostButton: { backgroundColor: 'transparent' },
  buttonText: { fontFamily: fonts.semibold, fontSize: 16 },
  primaryButtonText: { color: colors.white },
  secondaryButtonText: { color: colors.accentDark },
  ghostButtonText: { color: colors.accentDark },
  dangerButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.danger },
  dangerButtonText: { color: colors.danger },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.48 },
  fieldWrap: { gap: spacing.xs },
  label: { fontFamily: fonts.medium, fontSize: 15, color: colors.ink, marginLeft: spacing.xs },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    color: colors.ink,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  multiline: { minHeight: 112, paddingTop: spacing.md, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger },
  errorText: { fontFamily: fonts.regular, fontSize: 13, color: colors.danger, marginLeft: spacing.xs },
  hint: { ...typography.caption, marginLeft: spacing.xs },
  header: { gap: spacing.xs, marginBottom: spacing.md },
  eyebrow: { fontFamily: fonts.semibold, color: colors.accentDark, fontSize: 13, letterSpacing: 1.4, textTransform: 'uppercase' },
  title: typography.title,
  description: { ...typography.body, color: colors.muted },
  state: { flex: 1, minHeight: 280, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  stateText: { ...typography.body, color: colors.muted, textAlign: 'center' },
  errorCard: { gap: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  errorTitle: { ...typography.heading, color: colors.danger },
  emptyCard: { gap: spacing.sm, alignItems: 'center', marginTop: spacing.md },
  emptyIcon: { fontFamily: fonts.regular, fontSize: 30, color: colors.accent },
  emptyTitle: typography.heading,
});
