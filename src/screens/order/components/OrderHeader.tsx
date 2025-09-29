// src/screens/orders/components/OrderHeader.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

interface OrderHeaderProps {
  order: {
    id: string;
    orderNumber: string;
    status: "Preparing" | "Ready" | "Completed" | "Cancelled";
  };
  userRole: "waiter" | "cook" | "admin";
  updateOrderStatus: (orderId: string, status: string) => void;
  setShowPaymentConfirm: (show: boolean) => void;
  setShowQR: (show: boolean) => void;
}


export function OrderHeader({ order }: OrderHeaderProps) {
  // Animation for badge
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (order.status === "Ready") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(animValue, { toValue: 0, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else if (order.status === "Preparing") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(animValue, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [order.status]);

  const statusColor = getStatusColor(order.status);
  const statusIcon = getStatusIcon(order.status);

  const animatedStyle =
    order.status === "Ready" || order.status === "Preparing"
      ? { shadowOpacity: animValue.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] }) }
      : {};

  return (
    <View style={styles.headerContainer}>
      {/* Order Number */}
      <View style={styles.orderNumberContainer}>
        <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
      </View>

      {/* Status Badge */}
      <Animated.View style={[styles.statusBadge, { backgroundColor: statusColor }, animatedStyle]}>
        <Ionicons name={statusIcon} size={18} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.statusText}>{order.status}</Text>
      </Animated.View>
    </View>
  );
}

// --- STATUS ICONS ---
const getStatusIcon = (status: "Preparing" | "Ready" | "Completed" | "Cancelled") => {
  switch (status) {
    case "Preparing":
      return "flame-outline"; // animated flame effect
    case "Ready":
      return "star-outline"; // sparkling icon
    case "Completed":
      return "checkmark-done-circle-outline";
    case "Cancelled":
      return "close-circle-outline";
  }
};

// --- STATUS COLORS ---
const getStatusColor = (status: "Preparing" | "Ready" | "Completed" | "Cancelled") => {
  switch (status) {
    case "Preparing":
      return "#e67e22"; // animated orange
    case "Ready":
      return "#FFD700"; // gold shimmer
    case "Completed":
      return "#27ae60"; // luxurious green
    case "Cancelled":
      return "#8B0000"; // deep muted red
  }
};

// --- STYLES ---
const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1c1c1e",
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  orderNumberContainer: {
    backgroundColor: "rgba(255,215,0,0.08)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.25)",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFD700",
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 28,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  statusText: {
    color: "#1c1c1e",
    fontWeight: "800",
    fontSize: 16,
    textTransform: "capitalize",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});