import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

interface Item {
  _id?: string;
  name: string;
  price: number;
  quantity: number;
  newAddedAt?: string;
}

interface Props {
  items: Item[];
  totalPrice: number;
  maxHeight?: number;
}

export const OrderItemsList: React.FC<Props> = ({
  items,
  totalPrice,
  maxHeight = 220,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView style={{ maxHeight }} nestedScrollEnabled>
        {items.map((item) => (
          <View key={item._id || item.name} style={styles.itemRow}>
            <View style={styles.left}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.subRow}>
                <Text style={styles.itemDetails}>
                  ₹{item.price} × {item.quantity}
                </Text>
                {item.newAddedAt && (
                  <Text style={styles.newBadge}>NEW</Text>
                )}
              </View>
            </View>

            <Text style={styles.itemTotal}>
              ₹{(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.totalBar}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>₹{totalPrice.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: "rgba(18,18,18,0.9)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,215,0,0.15)",
  },

  left: {
    flex: 1,
    marginRight: 10,
  },

  subRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 3,
  },

  itemName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  itemDetails: {
    color: "#bbb",
    fontSize: 13,
  },

  newBadge: {
    backgroundColor: "#FFD700",
    color: "#111",
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    overflow: "hidden",
  },

  itemTotal: {
    color: "#FFD700",
    fontSize: 15,
    fontWeight: "600",
    minWidth: 70,
    textAlign: "right",
  },

  totalBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,215,0,0.2)",
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },

  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFD700",
    textShadowColor: "rgba(255,215,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
