import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

type OrderItem = {
  itemId?: string;
  name: string;
  price: number;
  quantity: number;
  newAddedAt?: string | Date;
};

type OrderItemsListProps = {
  items: OrderItem[];
  totalPrice: number;
  maxHeight?: number; // optional, scrollable area
};

export function OrderItemsList({ items, totalPrice, maxHeight = 120 }: OrderItemsListProps) {
  return (
    <View style={styles.container}>
      <ScrollView style={{ maxHeight }} nestedScrollEnabled>
        {items.map((item) => (
          <View key={item.itemId || item.name} style={styles.itemRow}>
            <View>
              <Text style={styles.itemName}>
                {item.name} {item.newAddedAt && <Text style={styles.newBadge}>New</Text>}
              </Text>
              <Text style={styles.itemDetails}>
                ₹{item.price} × {item.quantity}
              </Text>
            </View>
            <Text style={styles.itemTotal}>
              ₹{((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}
            </Text>

          </View>
        ))}
      </ScrollView>
      <Text style={styles.total}>Total: ₹{(totalPrice ?? 0).toFixed(2)}</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 4 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.05)",
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
  },
  itemTotal: { color: "#FFD700", fontWeight: "700", fontSize: 14 },
  newBadge: {
    color: "#fff",
    backgroundColor: "#FFD700",
    borderRadius: 6,
    paddingHorizontal: 4,
    fontSize: 10,
    marginLeft: 6,
  },
  itemName: { color: "#fff", fontWeight: "600" },
  itemDetails: { color: "#aaa", fontSize: 12 },
  total: { color: "#FFD700", fontWeight: "700", marginTop: 6, textAlign: "right" },
});
