import { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, Easing } from "react-native";

export default function Welcome({ onDone }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    // Fade the logo in.
    Animated.timing(opacity, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();

    // Gentle, continuous breathing — grows and shrinks from the centre.
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.08,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.92,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    breathe.start();

    // After a few breaths, fade out and hand off to the app.
    const timer = setTimeout(() => {
      breathe.stop();
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onDone();
      });
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("./assets/logo.png")}
        style={[styles.logo, { opacity, transform: [{ scale }] }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  logo: { width: 160, height: 160 },
});