import { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { colors, fonts, radius, spacing, typography } from '@/lib/theme';
import type { ChatMessage } from '@/lib/types';

const GREETING =
  'Merhaba! Randevuların, kampanyalar ve hizmetlerimiz hakkında bana sorabilirsin. ✨ Yanıtlar yapay zekâ tarafından oluşturulur.';
const ERROR_REPLY = 'Şu an yanıt veremiyorum, birazdan tekrar dener misin?';

type Bubble = ChatMessage | { role: 'typing'; content: '' };

export function ChatWidget() {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Bubble>>(null);

  function scrollToEnd() {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    const next = [...messages, { role: 'user', content: text } as ChatMessage];
    setMessages(next);
    setInput('');
    setSending(true);
    scrollToEnd();

    try {
      const reply = await api.chat(next.slice(-12));
      setMessages((current) => [...current, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((current) => [...current, { role: 'assistant', content: ERROR_REPLY }]);
    } finally {
      setSending(false);
      scrollToEnd();
    }
  }

  // İlk balon her zaman kalıcı karşılama; ardından geçmiş ve varsa yazıyor göstergesi.
  const bubbles: Bubble[] = [
    { role: 'assistant', content: GREETING },
    ...messages,
    ...(sending ? [{ role: 'typing', content: '' } as Bubble] : []),
  ];

  return (
    <>
      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 64 + spacing.md }]}
        onPress={() => setVisible(true)}
        accessibilityLabel="Sohbeti aç"
      >
        <Text style={styles.fabIcon}>✉</Text>
      </Pressable>

      <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}>
        {/* Modal içinde SafeAreaView inset almayabiliyor (RN Modal gotcha'sı) — insets'i dışarıdan uygula. */}
        <View style={[styles.screen, { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Sohbet</Text>
            <Pressable
              style={styles.closeButton}
              onPress={() => setVisible(false)}
              hitSlop={12}
              accessibilityLabel="Sohbeti kapat"
            >
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <FlatList
              ref={listRef}
              data={bubbles}
              keyExtractor={(_, index) => String(index)}
              contentContainerStyle={styles.content}
              renderItem={({ item }) => <MessageBubble bubble={item} />}
              onContentSizeChange={scrollToEnd}
              keyboardShouldPersistTaps="handled"
            />
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Bir mesaj yaz…"
                placeholderTextColor={colors.muted}
                multiline
                editable={!sending}
              />
              <Pressable
                style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]}
                onPress={send}
                disabled={!input.trim() || sending}
              >
                <Text style={styles.sendIcon}>↑</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

function MessageBubble({ bubble }: { bubble: Bubble }) {
  if (bubble.role === 'typing') {
    return (
      <View style={[styles.bubble, styles.assistantBubble]}>
        <Text style={styles.assistantText}>…</Text>
      </View>
    );
  }
  const isUser = bubble.role === 'user';
  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
      <Text style={isUser ? styles.userText : styles.assistantText}>{bubble.content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  fabIcon: { fontFamily: fonts.semibold, fontSize: 24, color: colors.white, lineHeight: 26 },
  screen: { flex: 1, backgroundColor: colors.cream },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomColor: colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { ...typography.heading },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  closeIcon: { fontFamily: fonts.semibold, fontSize: 18, color: colors.ink, lineHeight: 20 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg, gap: spacing.sm },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.accent, borderBottomRightRadius: radius.sm },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: colors.white, borderBottomLeftRadius: radius.sm },
  userText: { ...typography.body, color: colors.white },
  assistantText: { ...typography.body, color: colors.ink },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.cream,
    borderTopColor: colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderWidth: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.4 },
  sendIcon: { fontFamily: fonts.semibold, fontSize: 22, color: colors.white, lineHeight: 24 },
});
