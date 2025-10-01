import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

export function OrderHeader({ order, userRole, handleDeleteOrder }: any) {
  return (
    <View style={styles.container}>
      {/* Order Number */}
      <Text style={styles.orderNumber}>#{order.orderNumber}</Text>

      {/* Action Icons */}
      <View style={styles.iconGroup}>
        {userRole === "admin" && (
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => handleDeleteOrder(order._id)}
          >
            <Ionicons name="trash-outline" size={18} color="#FF5C5C" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "rgba(20,20,20,0.8)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,215,0,0.15)",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFD700",
    letterSpacing: 1.1,
    textShadowColor: "rgba(255,215,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  iconGroup: {
    flexDirection: "row",
    gap: 10,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,215,0,0.08)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
