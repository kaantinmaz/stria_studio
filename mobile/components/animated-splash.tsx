import { useEffect, useRef, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { AccessibilityInfo, Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { colors } from '@/lib/theme';

// Native launch storyboard (ios/StriaStudio/SplashScreen.storyboard) splash.png'i
// 220x220 kutuda scaleAspectFit ile ortalar; 1024x217 wordmark ekranda 220 x 46.6
// olarak çıkar. Bu katman native splash'i devraldığı için aynı ölçüyü ve aynı
// zemini kullanmak zorunda — yoksa el değiştirme anında logo zıplar.
const LOGO_WIDTH = 220;
const LOGO_HEIGHT = (LOGO_WIDTH * 217) / 1024;
const RULE_WIDTH = 120;
const ENTER_MS = 560;
const HOLD_MS = 240;
// Kısa tutuldu: geçiş sırasında altta duran ekranın logosu da göründüğü için
// uzun bir crossfade iki logoyu üst üste hayalet gibi gösteriyor.
const EXIT_MS = 280;

/**
 * Açılış animasyonu: native splash'ten devralınan wordmark hafifçe yukarı
 * yerleşir, altında ince bir çizgi ortadan dışa doğru açılır, sonra katman
 * uygulamanın üstünden silinir. `ready` false olduğu sürece katman ekranda
 * bekler; böylece font yüklemesi ve oturum kontrolü kullanıcıya spinner
 * olarak sızmaz.
 */
export function AnimatedSplash({ ready }: { ready: boolean }) {
  const lift = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);
  const [entered, setEntered] = useState(false);
  const [done, setDone] = useState(false);

  // Katman ilk kareyi çizdikten sonra native splash'i indir: aradaki boşlukta
  // beyaz bir kare görünmesin.
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) setReduceMotion(enabled);
      })
      .catch(() => {
        if (active) setReduceMotion(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion === null) return;
    const enter = Animated.timing(lift, {
      toValue: 1,
      duration: reduceMotion ? 0 : ENTER_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    enter.start(({ finished }) => {
      if (finished) setEntered(true);
    });

    return () => enter.stop();
  }, [lift, reduceMotion]);

  useEffect(() => {
    if (!entered || !ready) return;
    const exit = Animated.sequence([
      Animated.delay(reduceMotion ? 0 : HOLD_MS),
      Animated.timing(fade, {
        toValue: 0,
        duration: reduceMotion ? 250 : EXIT_MS,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]);
    exit.start(({ finished }) => {
      if (finished) setDone(true);
    });

    return () => exit.stop();
  }, [entered, fade, ready, reduceMotion]);

  if (done) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fade }]}>
      <Animated.View
        style={[
          styles.brand,
          {
            transform: [
              { translateY: lift.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
              { scale: lift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) },
            ],
          },
        ]}
      >
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <View style={styles.ruleTrack}>
          <Animated.View style={[styles.rule, { opacity: lift, transform: [{ scaleX: lift }] }]} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream,
    zIndex: 10,
  },
  brand: { alignItems: 'center' },
  logo: { width: LOGO_WIDTH, height: LOGO_HEIGHT },
  // Track absolute: akışa girmesin, yoksa logo dikey ortadan kayar ve native
  // splash ile hizası bozulur. left/right 0 + alignItems ile ortalanır;
  // left:'50%' yüzdesi burada logo kutusuna göre çözülmediği için çizgiyi
  // sağa kaydırıyordu.
  ruleTrack: { position: 'absolute', left: 0, right: 0, bottom: -18, alignItems: 'center' },
  rule: {
    width: RULE_WIDTH,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: colors.blossom,
  },
});
