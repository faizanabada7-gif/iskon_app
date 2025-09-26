// UltraLuxuryLoginScreen.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Animated,
  Dimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const PARTICLE_COUNT = 20;

export default function UltraLuxuryLoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const logoAnim = useRef(new Animated.Value(0)).current;

  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }).map(() => ({
      translateX: new Animated.Value(Math.random() * width),
      translateY: new Animated.Value(Math.random() * height),
      opacity: new Animated.Value(Math.random() * 0.7 + 0.3),
      scale: new Animated.Value(Math.random() * 0.7 + 0.3),
    }))
  ).current;

  useEffect(() => {
    // Logo floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnim, { toValue: -6, duration: 3000, useNativeDriver: true }),
        Animated.timing(logoAnim, { toValue: 6, duration: 3000, useNativeDriver: true }),
      ])
    ).start();

    // Animate particles
    particles.forEach((p) => animateParticle(p));
  }, []);

  const animateParticle = (p: any) => {
    p.translateY.setValue(-10);
    p.translateX.setValue(Math.random() * width);
    p.opacity.setValue(Math.random() * 0.7 + 0.3);
    p.scale.setValue(Math.random() * 0.6 + 0.4);

    Animated.loop(
      Animated.parallel([
        Animated.timing(p.translateY, {
          toValue: height + 10,
          duration: 8000 + Math.random() * 4000,
          useNativeDriver: true,
        }),
        Animated.timing(p.translateX, {
          toValue: Math.random() * width,
          duration: 8000 + Math.random() * 4000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(p.opacity, { toValue: 0.8, duration: 4000, useNativeDriver: true }),
          Animated.timing(p.opacity, { toValue: 0.2, duration: 4000, useNativeDriver: true }),
        ]),
      ])
    ).start();
  };

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);
    if (!username || !password) {
      setError("Please enter both username and password");
      setIsLoading(false);
      return;
    }
    try {
      if (username === "admin" && password === "admin@123") {
        console.log("Login success: navigating to Dashboard");
        navigation.navigate("order");

      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
      {/* Background Gradient */}
      <LinearGradient colors={["#0A0A0A", "#1C1C1C"]} style={StyleSheet.absoluteFill} />
      {/* Particles */}
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            { opacity: p.opacity, transform: [{ translateX: p.translateX }, { translateY: p.translateY }, { scale: p.scale }] },
          ]}
        />
      ))}

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoWrapper}>
          <Animated.View style={[styles.logoCircle, { transform: [{ translateY: logoAnim }] }]}>
            <Text style={styles.crown}>👑</Text>
          </Animated.View>
          <Text style={styles.brandTitle}>ROYAL ISKON</Text>
          <Text style={styles.subtitle}>A Taste of Elegance</Text>
        </View>

        {/* Luxury Layered Card */}
        <View style={styles.cardContainer}>
          {/* Bottom shadow layer */}
          <View style={styles.bottomLayer} />
          {/* Middle textured layer */}
          <LinearGradient colors={["#111", "#1a1a1a"]} style={styles.middleLayer} />
          {/* Top layer: form */}
          <View style={styles.topLayer}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardDesc}>Sign in to access your exclusive dashboard</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {/* Inputs */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#FFD700aa"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#FFD700aa"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                <Text style={{ color: "#FFD700" }}>{showPassword ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>

            {/* Button */}
            <LinearGradient colors={["#FFD700", "#FFB800"]} style={styles.buttonGradient}>
              <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Sign In</Text>}
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        <Text style={styles.footer}>© {new Date().getFullYear()} Royal Iskon. All rights reserved.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 25, paddingVertical: 50 },
  particle: { position: "absolute", width: 4, height: 4, borderRadius: 2, backgroundColor: "#FFD700" },
  logoWrapper: { alignItems: "center", marginBottom: 60 },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,215,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.85,
    shadowRadius: 25,
    elevation: 20,
  },
  crown: { fontSize: 64, textShadowColor: "#fff", textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 20 },
  brandTitle: {
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: 5,
    color: "#FFD700",
    textAlign: "center",
    textShadowColor: "#FFA500",
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 18,
    marginBottom: 6,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  subtitle: { fontSize: 19, color: "#ccc", fontStyle: "italic", letterSpacing: 1.5 },
  cardContainer: { width: "100%", marginBottom: 40, alignItems: "center" },
  bottomLayer: { position: "absolute", width: "90%", height: 400, borderRadius: 30, backgroundColor: "#000", opacity: 0.3, top: 10, shadowColor: "#FFD700", shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.4, shadowRadius: 25 },
  middleLayer: { position: "absolute", width: "90%", height: 400, borderRadius: 30, top: 0 },
  topLayer: { width: "90%", backgroundColor: "rgba(30,30,30,0.85)", borderRadius: 30, padding: 35, zIndex: 10 },
  cardTitle: { fontSize: 30, fontWeight: "700", color: "#fff", textAlign: "center", marginBottom: 8, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif" },
  cardDesc: { textAlign: "center", color: "#bbb", marginBottom: 20, fontSize: 16, lineHeight: 22 },
  error: { color: "#ff5555", textAlign: "center", marginBottom: 15, fontWeight: "600" },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,215,0,0.05)", borderRadius: 28, marginBottom: 20, paddingHorizontal: 18, height: 55, borderWidth: 1, borderColor: "rgba(255,215,0,0.3)", shadowColor: "#FFD700", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  input: { flex: 1, color: "#fff", fontSize: 17 },
  eyeBtn: { padding: 6 },
  buttonGradient: { borderRadius: 28, overflow: "hidden", marginTop: 10, shadowColor: "#FFD700", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.7, shadowRadius: 15, elevation: 12 },
  button: { paddingVertical: 16, alignItems: "center" },
  buttonText: { color: "#000", fontWeight: "bold", fontSize: 19, letterSpacing: 1 },
  footer: { color: "#555", marginTop: 30, fontSize: 13, textAlign: "center" },
});
