// SplashScreen.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import LinearGradient from "react-native-linear-gradient";

type SplashProps = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: SplashProps) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Logo scale animation
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish, scaleAnim]);

  return (
    <LinearGradient
      colors={["#1C1C1C", "#000000"]}
      style={styles.container}
    >
      <Animated.View style={[styles.logoCircle, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.logoText}>👑</Text>
      </Animated.View>
      <Text style={styles.title}>ROYAL ISKON</Text>
      <Text style={styles.subtitle}>A Taste of Elegance</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 15,
  },
  logoText: {
    fontSize: 50,
    textShadowColor: "#fff",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFD700",
    letterSpacing: 3,
    textShadowColor: "rgba(255, 215, 0, 0.6)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#E0E0E0",
    fontStyle: "italic",
    letterSpacing: 1,
  },
});
