// src/screens/welcome/WelcomeScreen.tsx
import React from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";

export default function OrderScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Text style={styles.title}>Welcome, Admin 🎉</Text>
      <Text style={styles.subtitle}>You have successfully logged in.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#aaa",
  },
});
