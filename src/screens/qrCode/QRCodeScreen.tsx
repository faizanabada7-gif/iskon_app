import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import LinearGradient from "react-native-linear-gradient";

// ✅ Import your QR image
import CleanedQR from "../../assets/images/cleaned_qr.png";

export default function QRCodeScreen() {
  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Royal QR</Text>
      <Text style={styles.subtitle}>Scan to Pay Securely</Text>

      {/* QR Display Card */}
      <LinearGradient
        colors={["#d9a515", "#8c6d1f", "#000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.qrOuterFrame}
      >
        <View style={styles.qrInnerCard}>
          <Image source={CleanedQR} style={styles.qrImage} />
        </View>
      </LinearGradient>

      {/* Hint */}
      <Text style={styles.hintText}>Present this code at checkout</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 36,
    color: "#d9a515",
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#999",
    marginBottom: 50,
    letterSpacing: 0.5,
  },

  qrOuterFrame: {
    padding: 4,
    borderRadius: 28,
    shadowColor: "#d9a515",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    marginBottom: 30,
  },

  qrInnerCard: {
    backgroundColor: "rgba(15,15,15,0.9)",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(217,165,21,0.4)",
  },

  qrImage: {
    width: 240,
    height: 240,
    resizeMode: "contain",
  },

  hintText: {
    marginTop: 12,
    color: "#d9a515",
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.9,
    letterSpacing: 0.3,
  },
});
