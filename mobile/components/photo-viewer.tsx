import { useState } from 'react';
import { Dimensions, FlatList, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/lib/theme';

export function PhotoViewer({ photos, index, onClose }: { photos: string[]; index: number | null; onClose: () => void }) {
  const [page, setPage] = useState(index ?? 0);
  const width = Dimensions.get('window').width;

  if (index === null) return null;

  return (
    <Modal visible transparent={false} animationType="fade" onShow={() => setPage(index)} onRequestClose={onClose}>
      <View style={styles.viewer}>
        <FlatList
          data={photos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={index}
          keyExtractor={(item, i) => `${item}-${i}`}
          getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
          onMomentumScrollEnd={(event) => setPage(Math.round(event.nativeEvent.contentOffset.x / width))}
          renderItem={({ item }) => (
            <View style={[styles.viewerPage, { width }]}>
              <Image source={{ uri: item }} style={styles.viewerImage} resizeMode="contain" />
            </View>
          )}
        />
        <View style={styles.viewerCounter}>
          <Text style={styles.viewerCounterText}>{page + 1}/{photos.length}</Text>
        </View>
        <Pressable style={styles.viewerClose} accessibilityLabel="Kapat" onPress={onClose}>
          <Text style={styles.viewerCloseText}>✕</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  viewer: { flex: 1, backgroundColor: '#000000' },
  viewerPage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  viewerImage: { width: '100%', height: '100%' },
  viewerCounter: { position: 'absolute', bottom: spacing.xl, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: radius.pill, paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  viewerCounterText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.white },
  viewerClose: { position: 'absolute', top: 56, right: spacing.lg, width: 40, height: 40, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  viewerCloseText: { fontFamily: fonts.semibold, fontSize: 20, color: colors.white },
});
